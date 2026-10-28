/**
 * POST /api/estudante/solicitar
 *
 * Fluxo automatizado, sem revisao humana (decisao do dono, 28/10/2026:
 * estudante de qualquer curso, aprovado ao declarar o vinculo):
 *   valida -> checa CPF (1 CPF = 1 lead) -> grava o lead -> grava o LINK
 *   PESSOAL (token em cupons_estudante.codigo, sem cupom na Hotmart)
 *   -> RD Station (com o link em cf_link_estudante) -> e-mail pelo Resend
 *   (so com RESEND_API_KEY) -> WhatsApp AGENDADO (o cron manda)
 *
 * Por que sem cupom: a API de cupons da Hotmart nao aceita produto de
 * assinatura, e o 7448309 e assinatura. O preco de estudante e uma OFERTA
 * da Hotmart por fase (config/pricing.ts: ESTUDANTE_OFERTA_LANCAMENTO,
 * R$ 59,90 ate 16/11/2026; ESTUDANTE_OFERTA, R$ 79,90 depois), e o link
 * pessoal (/estudante/ativar?cupom=TOKEN) escolhe a oferta NA HORA do
 * clique. Detalhes em lib/estudante.js e docs/ESTUDANTE.md.
 *
 * FLUXO FECHADO (chave de lancamento ligada): a rota responde 503 ANTES
 * de ler o corpo ou tocar no banco quando
 *   - DM_ESTUDANTE_ABERTO nao e "1" (calculada no build pelo
 *     next.config.js, estadoDoEstudante em scripts/checar-precos.js: o
 *     modelo v2 do WhatsApp na Vercel), ou
 *   - a fase vigente nao tem o codigo da oferta de estudante
 *     (ofertaDoEstudante(agora) vazio: a virada de 16/11 e conferida aqui,
 *     a cada pedido).
 * Nenhum lead gravado, nenhum link criado, nenhuma mensagem agendada, e
 * o CPF nao fica preso pela regra "1 CPF = 1 lead" num pedido que o
 * estudante nao conseguiria pagar. A /estudante, fechada, nem mostra o
 * formulario; isto cobre pagina antiga em cache e POST direto.
 *
 * CPF QUE JA PEDIU (chave ligada). Uma mensagem so, neutra, para qualquer
 * CPF que ja tem inscricao no fluxo novo ou ja pagou (409): a resposta
 * nao diz se a pessoa pagou, e o teto por hora vem ANTES da consulta do
 * CPF. Excecao: o CPF que so tem cupom do fluxo antigo (o da main, com
 * hotmart_coupon_id, do produto antigo) nao usado ganha o link novo, no
 * MESMO lead (1 CPF = 1 lead continua), com os dados que acabou de
 * informar: o WhatsApp antigo levava um cupom que nao vale mais.
 *
 * NOME: so letras, espaco, hifen e apostrofo, ate 80 caracteres
 * (lib/nome.ts). A primeira palavra vai no "Ola, ..." do e-mail e do
 * WhatsApp; sem a regra, um nome em forma de endereco virava link com a
 * marca do Diariamente.
 *
 * STANDBY (DM_SITE_LANCADO vazio, config/lancamento.ts): a /estudante e
 * a da producao, com o formulario aberto, e esta rota faz o que a da main
 * faz: o cupom pessoal pela API da Hotmart (lib/hotmart.js, com o
 * STUDENT_DISCOUNT da Vercel), sem o 503. So vale em standby; com a
 * chave ligada, nada aqui chama a API de cupom.
 */

import { createClient } from '@supabase/supabase-js';
import { criarCupom, gerarCodigo, apagarCupom, offerIdsDoAmbiente } from '@/lib/hotmart';
import { enviarLeadRD } from '@/lib/rdstation';
import { gerarToken, linkPessoal, emailConfigurado, enviarEmailDeAprovacao } from '@/lib/estudante';
import { nomeLimpo, problemaDoNome } from '@/lib/nome';
import { ofertaDoEstudante, faseDoEstudante, precoEstudante, descontoEquivalenteDoEstudante } from '@/config/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Sem cache de fetch (ver app/api/cron/manutencao/route.js). Rota so com
// POST ja nao cacheia no Next 14, mas um GET acrescentado depois cacheia.
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const CURSOS = [
  'Medicina', 'Nutricao', 'Psicologia', 'Enfermagem',
  'Fisioterapia', 'Odontologia', 'Biomedicina', 'Farmacia', 'EducacaoFisica', 'Outro',
];

// Standby (o cupom da main): validade do cupom na Hotmart.
const VALIDADE_HORAS = 48;
// Fluxo novo: prazo para o cron mandar o WhatsApp (expira_em). O LINK nao
// vence: o /estudante/ativar aceita o token conhecido a qualquer tempo e
// decide a oferta pela data do clique. expira_em so encerra as tentativas
// de envio (o cron so manda enquanto expira_em nao passou).
const PRAZO_DE_ENVIO_HORAS = 30 * 24;
// Janela de conferencia antes do envio. O cron /api/cron/manutencao
// dispara o WhatsApp quando `enviar_em` vence. Espelha ESTUDANTE.esperaMinutos.
const ESPERA_MINUTOS = 5;
const TETO_POR_HORA = 100;   // freio contra emissao em massa

const soDigitos = s => String(s || '').replace(/\D/g, '');

/** Aceita qualquer subdominio: ufmg.br libera aluno.ufmg.br */
async function ehInstitucional(email) {
  const dominio = (email.split('@')[1] || '').toLowerCase();
  if (!dominio) return false;
  const { data } = await db
    .from('instituicoes_whitelist').select('dominio_raiz').eq('ativo', true);
  return (data || []).some(({ dominio_raiz }) =>
    dominio === dominio_raiz || dominio.endsWith(`.${dominio_raiz}`));
}

/** Validacao de CPF pelos digitos verificadores. Barra 000... e sequencias. */
function cpfValido(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const [fim, pos] of [[9, 10], [10, 11]]) {
    let soma = 0;
    for (let i = 0; i < fim; i++) soma += parseInt(cpf[i], 10) * (pos - i);
    let d = (soma * 10) % 11;
    if (d === 10) d = 0;
    if (d !== parseInt(cpf[fim], 10)) return false;
  }
  return true;
}

/** Resposta unica para CPF que ja tem inscricao no fluxo novo (ou ja
    pagou): nao diz se a pessoa pagou (dado ligado ao CPF, LGPD). */
const JA_INSCRITO = 'Este CPF ja fez a inscricao de estudante. Se nao recebeu o link, fale com suporte@scienceplay.com.';

/**
 * Fluxo novo: o que fazer com um CPF que ja tem lead.
 *   'inscrito'  ja tem link do fluxo novo, ou um cupom (de qualquer
 *               fluxo) ja usado: 409 com a mensagem neutra
 *   'novo_link' so tem cupom do fluxo antigo nao usado (ou nada): o mesmo
 *               lead ganha o link novo
 */
async function situacaoDoCpf(leadId) {
  const { data: link } = await db
    .from('cupons_estudante').select('id')
    .eq('lead_id', leadId).is('hotmart_coupon_id', null)
    .limit(1).maybeSingle();
  if (link) return 'inscrito';
  const { data: usado } = await db
    .from('cupons_estudante').select('id')
    .eq('lead_id', leadId).eq('status', 'usado')
    .limit(1).maybeSingle();
  if (usado) return 'inscrito';
  return 'novo_link';
}

/** O fluxo novo esta aberto agora? Configuracao do build e oferta da fase. */
function fechadoAgora() {
  if (process.env.DM_ESTUDANTE_ABERTO !== '1') return 'configuracao (DM_ESTUDANTE_ABERTO)';
  if (!ofertaDoEstudante(Date.now())) return `oferta de estudante da fase ${faseDoEstudante(Date.now())}`;
  return null;
}

export async function POST(req) {
  let lead = null;
  const lancado = process.env.DM_SITE_LANCADO === '1';

  if (lancado) {
    const falta = fechadoAgora();
    if (falta) {
      console.error(`[estudante] fluxo fechado agora (falta ${falta}); ver o aviso "Estudante FECHADO" no log do build`);
      return Response.json({
        ok: false,
        erros: ['Falta configuracao. A solicitacao da condicao de estudante abre em breve.'],
      }, { status: 503 });
    }
  }

  try {
    // Standby (o fluxo da main): o desconto do cupom vem da Vercel.
    let desconto = null;
    if (!lancado) {
      desconto = parseFloat(process.env.STUDENT_DISCOUNT);
      if (!(desconto > 0 && desconto < 0.99)) {
        console.error('[estudante] STUDENT_DISCOUNT ausente ou invalido');
        return Response.json({
          ok: false,
          erros: ['Falta configuracao. Tente novamente em instantes.'],
        }, { status: 503 });
      }
    }

    const body = await req.json();

    const nome = nomeLimpo(body.nome);
    const cpf = soDigitos(body.cpf);
    const whats = soDigitos(body.whatsapp);
    const email = String(body.email || '').trim().toLowerCase();
    const instituicao = String(body.instituicao || '').trim();
    const estado = String(body.estado || '').trim();
    const curso = String(body.curso || '').trim();
    const semestre = parseInt(body.semestre, 10) || null;
    const conclusaoRaw = body.previsao_conclusao || null;
    const conclusao = conclusaoRaw && /^\d{4}-\d{2}$/.test(conclusaoRaw) ? conclusaoRaw + '-01' : conclusaoRaw;

    // ---------- Validacao ----------
    const erros = [];
    const problemaNome = problemaDoNome(nome);
    if (problemaNome === 'curto') erros.push('Informe seu nome completo.');
    else if (problemaNome === 'caracteres') erros.push('Use so letras no nome, sem numeros nem simbolos.');
    else if (problemaNome === 'longo') erros.push('Nome muito longo: use ate 80 caracteres.');
    if (!cpfValido(cpf)) erros.push('CPF invalido.');
    if (whats.length < 12 || whats.length > 13) erros.push('WhatsApp com DDI e DDD. Ex: 5511999999999.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) erros.push('E-mail invalido.');
    if (instituicao.length < 2) erros.push('Informe sua instituicao.');
    if (!CURSOS.includes(curso)) erros.push('Selecione seu curso.');
    if (erros.length) return Response.json({ ok: false, erros }, { status: 400 });

    // ---------- Freio de emissao (antes da consulta do CPF) ----------
    const umaHora = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from('cupons_estudante')
      .select('id', { count: 'exact', head: true }).gte('criado_em', umaHora);

    if ((count ?? 0) >= TETO_POR_HORA) {
      await db.from('log_estudante').insert({
        acao: 'teto_horario_atingido',
        detalhe: { count, teto: TETO_POR_HORA }, ator: 'sistema',
      });
      return Response.json({
        ok: false,
        erros: ['Volume alto de solicitacoes agora. Tente novamente em alguns minutos.'],
      }, { status: 429 });
    }

    // ---------- 1 CPF = 1 lead ----------
    const { data: existente } = await db
      .from('leads_estudante').select('id').eq('cpf', cpf).maybeSingle();

    // Fluxo novo, CPF que so tem o cupom antigo: o mesmo lead ganha o link.
    let reaproveitado = false;

    if (existente) {
      if (lancado) {
        // O link nao vence: quem ja tem o seu e so abrir de novo a mensagem.
        // Uma resposta so (nao diz se pagou).
        if (await situacaoDoCpf(existente.id) === 'inscrito') {
          return Response.json({ ok: false, erros: [JA_INSCRITO] }, { status: 409 });
        }
        reaproveitado = true;
      } else {
        const { data: cupomAtivo } = await db
          .from('cupons_estudante')
          .select('codigo, status, expira_em')
          .eq('lead_id', existente.id).eq('status', 'ativo')
          .gt('expira_em', new Date().toISOString())
          .maybeSingle();

        return Response.json({
          ok: false,
          erros: [cupomAtivo
            ? 'Voce ja tem um codigo ativo. Confira seu WhatsApp.'
            : 'Este CPF ja solicitou o acesso estudante.'],
        }, { status: 409 });
      }
    }

    // ---------- Grava o lead (ou atualiza o do cupom antigo) ----------
    const institucional = await ehInstitucional(email);
    const url = new URL(req.url);
    const dadosDoLead = {
      nome, whatsapp: whats, email, instituicao, estado, curso,
      semestre, previsao_conclusao: conclusao,
      email_institucional: institucional,
      ip_origem: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: req.headers.get('user-agent'),
      utm: body.utm || Object.fromEntries(url.searchParams),
    };

    if (reaproveitado) {
      // Os dados de agora: o link vai para o WhatsApp e o e-mail que a
      // pessoa acabou de informar (a pagina diz isso). O lead e o mesmo.
      const { data: atualizado, error: erroAtualiza } = await db
        .from('leads_estudante')
        .update({ ...dadosDoLead, enviado_rd: false, rd_erro: null })
        .eq('id', existente.id)
        .select('*').single();
      if (erroAtualiza) throw new Error(`Lead nao atualizado: ${erroAtualiza.message}`);
      lead = atualizado;
    } else {
      const { data: criado, error: erroLead } = await db
        .from('leads_estudante')
        .insert({ cpf, ...dadosDoLead })
        .select('*').single();

      if (erroLead) throw new Error(`Lead nao gravado: ${erroLead.message}`);
      lead = criado;
    }

    const extrasRD = {};

    if (lancado) {
      // ---------- Link pessoal (sem cupom na Hotmart) ----------
      const agora = Date.now();
      const token = gerarToken();
      const fase = faseDoEstudante(agora);
      const { error: erroLink } = await db.from('cupons_estudante').insert({
        lead_id: lead.id,
        codigo: token,
        status: 'ativo',
        // Coluna do tempo do cupom. Aqui, so informativo: o desconto
        // equivalente da fase sobre o preco oficial (0.6004 no lancamento).
        // O preco cobrado e o da oferta da Hotmart.
        desconto: descontoEquivalenteDoEstudante(agora),
        expira_em: new Date(agora + PRAZO_DE_ENVIO_HORAS * 3600_000).toISOString(),
        enviar_em: new Date(agora + ESPERA_MINUTOS * 60_000).toISOString(),
      });
      if (erroLink) {
        // Sem o link gravado, o estudante nao teria o que abrir: libera o
        // CPF. O lead do cupom antigo (reaproveitado) ja existia: fica.
        if (!reaproveitado) {
          await db.from('leads_estudante').delete().eq('id', lead.id);
          lead = null;
        }
        throw new Error(`Link pessoal nao registrado: ${erroLink.message}`);
      }

      await db.from('log_estudante').insert({
        lead_id: lead.id, acao: 'link_emitido',
        detalhe: {
          codigo: token, fase, preco: precoEstudante(agora), oferta: ofertaDoEstudante(agora), curso, institucional,
          ...(reaproveitado ? { lead_do_cupom_antigo: true } : {}),
        },
        ator: 'sistema',
      });
      extrasRD.link = linkPessoal(token);

      // ---------- E-mail pelo Resend (so com RESEND_API_KEY; nao bloqueia) ----------
      if (emailConfigurado()) {
        try {
          const r = await enviarEmailDeAprovacao({ email, nome, token, agora });
          await db.from('log_estudante').insert({
            lead_id: lead.id, acao: 'email_enviado',
            detalhe: { codigo: token, fase: r.fase, resend_id: r.id }, ator: 'sistema',
          });
        } catch (e) {
          console.error('[estudante] e-mail pelo Resend falhou:', e.message);
          await db.from('log_estudante').insert({
            lead_id: lead.id, acao: 'email_falhou',
            detalhe: { codigo: token, erro: String(e.message).slice(0, 300) }, ator: 'sistema',
          });
        }
      }
    } else {
      // ---------- STANDBY: cupom na Hotmart, como a main ----------
      const offerIds = offerIdsDoAmbiente();

      let cupom;
      try {
        cupom = await criarCupom({
          codigo: gerarCodigo(), desconto, validadeHoras: VALIDADE_HORAS, offerIds,
        });
      } catch (e) {
        // Falha ao criar o cupom: remove o lead recem-gravado pra nao travar o CPF
        // (senao o "1 CPF = 1 lead" impediria nova tentativa apos erro passageiro).
        await db.from('leads_estudante').delete().eq('id', lead.id);
        lead = null;
        throw e;
      }

      const { error: erroCupom } = await db.from('cupons_estudante').insert({
        lead_id: lead.id,
        codigo: cupom.codigo,
        hotmart_coupon_id: cupom.hotmartCouponId,
        desconto,
        expira_em: cupom.expiraEm.toISOString(),
        enviar_em: new Date(Date.now() + ESPERA_MINUTOS * 60_000).toISOString(),
      });
      if (erroCupom) {
        // Cupom existe na Hotmart mas nao foi registrado aqui -> o webhook nunca o
        // apagaria (cupom orfao, ativo 48h). Apaga na hora e libera o lead.
        try { await apagarCupom(cupom.hotmartCouponId); } catch (_) {}
        await db.from('leads_estudante').delete().eq('id', lead.id);
        lead = null;
        throw new Error(`Cupom criado na Hotmart mas nao registrado: ${erroCupom.message}`);
      }

      await db.from('log_estudante').insert({
        lead_id: lead.id, acao: 'cupom_emitido',
        detalhe: { codigo: cupom.codigo, desconto, curso, institucional },
        ator: 'sistema',
      });
    }

    // ---------- RD Station (nao bloqueia) ----------
    try {
      await enviarLeadRD(lead, extrasRD);
      await db.from('leads_estudante').update({ enviado_rd: true }).eq('id', lead.id);
    } catch (e) {
      console.error('[estudante] RD falhou:', e.message);
      await db.from('leads_estudante').update({ rd_erro: e.message }).eq('id', lead.id);
    }

    // ---------- WhatsApp: AGENDADO, nao enviado aqui ----------
    // O envio sai do caminho da requisicao. Quem dispara e o cron
    // /api/cron/manutencao, quando `enviar_em` vence. Dois motivos:
    //   1) a janela de conferencia que o estudante ve na tela;
    //   2) se a Meta recusar o envio, o cron tenta de novo em vez de
    //      queimar o CPF com o link preso num log.

    return Response.json({
      ok: true,
      agendado: true,
      espera_minutos: ESPERA_MINUTOS,
    });

  } catch (e) {
    console.error('[estudante/solicitar]', e);
    if (lead?.id) {
      await db.from('log_estudante').insert({
        lead_id: lead.id, acao: 'falha_emissao',
        detalhe: { erro: e.message }, ator: 'sistema',
      });
    }
    return Response.json({
      ok: false,
      erros: ['Nao foi possivel concluir sua inscricao agora. Tente novamente em instantes.'],
    }, { status: 500 });
  }
}
