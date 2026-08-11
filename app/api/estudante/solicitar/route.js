/**
 * POST /api/estudante/solicitar
 *
 * Fluxo automatizado, sem revisao humana:
 *   valida -> checa CPF -> cria cupom na Hotmart -> grava
 *   -> envia ao RD Station -> dispara WhatsApp
 *
 * Ordem intencional: o cupom e criado ANTES do RD e do WhatsApp.
 * Se RD ou WhatsApp falharem, o cupom existe e volta na resposta,
 * entao a tela consegue mostrar o codigo mesmo assim.
 */

import { createClient } from '@supabase/supabase-js';
import { criarCupom, gerarCodigo, apagarCupom } from '@/lib/hotmart';
import { enviarLeadRD } from '@/lib/rdstation';
import { whatsapp } from '@/lib/whatsapp';

export const runtime = 'nodejs';

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const CURSOS = [
  'Medicina', 'Nutricao', 'Psicologia', 'Enfermagem',
  'Fisioterapia', 'Odontologia', 'Biomedicina', 'Farmacia', 'EducacaoFisica', 'Outro',
];

const VALIDADE_HORAS = 48;
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

export async function POST(req) {
  let lead = null;

  try {
    const desconto = parseFloat(process.env.STUDENT_DISCOUNT);
    if (!(desconto > 0 && desconto < 0.99)) {
      console.error('[estudante] STUDENT_DISCOUNT ausente ou invalido');
      return Response.json({
        ok: false,
        erros: ['Falta configuracao. Tente novamente em instantes.'],
      }, { status: 503 });
    }

    const body = await req.json();

    const nome = String(body.nome || '').trim();
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
    if (nome.split(' ').filter(Boolean).length < 2) erros.push('Informe seu nome completo.');
    if (!cpfValido(cpf)) erros.push('CPF invalido.');
    if (whats.length < 12 || whats.length > 13) erros.push('WhatsApp com DDI e DDD. Ex: 5511999999999.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) erros.push('E-mail invalido.');
    if (instituicao.length < 2) erros.push('Informe sua instituicao.');
    if (!CURSOS.includes(curso)) erros.push('Selecione seu curso.');
    if (erros.length) return Response.json({ ok: false, erros }, { status: 400 });

    // ---------- 1 CPF = 1 lead ----------
    const { data: existente } = await db
      .from('leads_estudante').select('id').eq('cpf', cpf).maybeSingle();

    if (existente) {
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

    // ---------- Freio de emissao ----------
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

    // ---------- Grava o lead ----------
    const institucional = await ehInstitucional(email);
    const url = new URL(req.url);

    const { data: criado, error: erroLead } = await db
      .from('leads_estudante')
      .insert({
        nome, cpf, whatsapp: whats, email, instituicao, estado, curso,
        semestre, previsao_conclusao: conclusao,
        email_institucional: institucional,
        ip_origem: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
        user_agent: req.headers.get('user-agent'),
        utm: body.utm || Object.fromEntries(url.searchParams),
      })
      .select('*').single();

    if (erroLead) throw new Error(`Lead nao gravado: ${erroLead.message}`);
    lead = criado;

    // ---------- Cupom na Hotmart ----------
    const offerIds = process.env.HOTMART_OFFER_IDS
      ? process.env.HOTMART_OFFER_IDS.split(',').map(n => parseInt(n.trim(), 10))
      : undefined;

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

    // ---------- RD Station (nao bloqueia) ----------
    try {
      await enviarLeadRD(lead);
      await db.from('leads_estudante').update({ enviado_rd: true }).eq('id', lead.id);
    } catch (e) {
      console.error('[estudante] RD falhou:', e.message);
      await db.from('leads_estudante').update({ rd_erro: e.message }).eq('id', lead.id);
    }

    // ---------- WhatsApp (nao bloqueia) ----------
    let whatsEnviado = false;
    try {
      await whatsapp.aprovado(
        whats, nome.split(' ')[0], cupom.codigo, process.env.HOTMART_CHECKOUT_URL
      );
      whatsEnviado = true;
    } catch (e) {
      console.error('[estudante] WhatsApp falhou:', e.message);
      await db.from('log_estudante').insert({
        lead_id: lead.id, acao: 'whatsapp_falhou',
        detalhe: { erro: e.message }, ator: 'sistema',
      });
    }

    // O codigo NAO volta na resposta: entrega e so por WhatsApp (mensagem de
    // utilidade). A tela so precisa saber que deu certo.
    return Response.json({
      ok: true,
      whatsapp_enviado: whatsEnviado,
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
      erros: ['Nao foi possivel gerar seu codigo agora. Tente novamente em instantes.'],
    }, { status: 500 });
  }
}
