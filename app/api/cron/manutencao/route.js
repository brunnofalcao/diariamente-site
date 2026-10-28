/**
 * GET /api/cron/manutencao
 *
 * Rotina unica de manutencao do fluxo estudante. Roda de minuto em minuto
 * (Vercel Cron, ver vercel.json). Quatro tarefas independentes, cada uma
 * com try/catch proprio: se uma quebra, as outras seguem.
 *
 *   1. ENVIAR   links (ou, em standby, cupons) maduros (enviar_em
 *               vencido) pelo WhatsApp: o botao do modelo leva o codigo
 *   2. EXPIRAR  linhas vencidas que ainda constam como ativas (no fluxo
 *               novo, expira_em e so o prazo de envio: o link pessoal
 *               continua abrindo a oferta, ver app/estudante/ativar)
 *   3. RD       reprocessar leads que falharam no RD Station (com o link
 *               pessoal em cf_link_estudante, com a chave ligada)
 *   4. LIMPAR   apagar na Hotmart cupons da main (standby) marcados como
 *               delete_pendente; o link do fluxo novo nao tem cupom
 *
 * Auth: a Vercel manda `Authorization: Bearer ${CRON_SECRET}` sozinha quando
 * a variavel CRON_SECRET existe. So o cabecalho vale: segredo na URL
 * (?key=) fica gravado em log de acesso, historico e proxy, e por isso
 * deixou de ser aceito. Comparacao em tempo constante (lib/seguranca.js).
 * Para rodar na mao:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://diariamente.app/api/cron/manutencao
 */

import { createClient } from '@supabase/supabase-js';
import { apagarCupom } from '@/lib/hotmart';
import { enviarLeadRD } from '@/lib/rdstation';
import { linkPessoal } from '@/lib/estudante';
import { whatsapp } from '@/lib/whatsapp';
import { segredoConfere } from '@/lib/seguranca';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/* SEM CACHE DE FETCH (Data Cache do Next 14)
 * `dynamic = 'force-dynamic'` sozinho NAO desliga o cache do fetch numa rota
 * so com GET: o Next 14.2 deixa a rota com revalidate=false e todo fetch sem
 * opcao de cache entra em "auto cache" por 1 ano (patch-fetch.js). As
 * consultas com data na URL escapavam porque a chave muda a cada minuto; a
 * da limpeza tem URL fixa e passou a ser respondida pelo cache, sem chegar
 * ao banco. As duas linhas abaixo valem para todo fetch feito durante a
 * rota, inclusive os da Hotmart, do WhatsApp e do RD em lib/.
 * No Next 16 (sem cacheComponents) o fetch sem opcao ja nao entra no cache
 * durante o pedido; as linhas continuam validas e ficam como defesa. Se um
 * dia ligarem cacheComponents: a documentacao do Next 16 tira dynamic,
 * revalidate e fetchCache nesse modo, entao trocar a trava antes de ligar. */
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Segunda trava, no proprio cliente: mesmo que alguem apague as linhas
// acima, as consultas ao banco continuam sem cache.
const semCache = (input, init) => fetch(input, { ...init, cache: 'no-store' });

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false }, global: { fetch: semCache } }
);

const LOTE_ENVIO = 40;   // teto por rodada, protege contra pico
const LOTE_RD = 20;
const MAX_TENTATIVAS = 5;

function autorizado(req) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const header = req.headers.get('authorization') || '';
  return segredoConfere(header, `Bearer ${segredo}`);
}

/* ------------------------------------------------------------------ */
/* 1. ENVIAR os codigos que ja passaram da janela de conferencia       */
/* ------------------------------------------------------------------ */
async function enviarCodigos() {
  const agora = new Date().toISOString();

  const { data: pendentes, error } = await db
    .from('cupons_estudante')
    .select('id, codigo, lead_id, whatsapp_tentativas, leads_estudante(nome, whatsapp)')
    .is('whatsapp_enviado_em', null)
    .eq('status', 'ativo')
    .lte('enviar_em', agora)
    .gt('expira_em', agora)
    .lt('whatsapp_tentativas', MAX_TENTATIVAS)
    .order('enviar_em', { ascending: true })
    .limit(LOTE_ENVIO);

  if (error) throw new Error(`busca de pendentes: ${error.message}`);

  let enviados = 0, falhas = 0;

  for (const c of pendentes || []) {
    const lead = c.leads_estudante;
    if (!lead?.whatsapp) {
      await db.from('cupons_estudante')
        .update({ whatsapp_tentativas: MAX_TENTATIVAS, whatsapp_erro: 'lead sem whatsapp' })
        .eq('id', c.id);
      falhas++;
      continue;
    }

    try {
      await whatsapp.aprovado(lead.whatsapp, String(lead.nome).split(' ')[0], c.codigo);

      await db.from('cupons_estudante')
        .update({ whatsapp_enviado_em: new Date().toISOString(), whatsapp_erro: null })
        .eq('id', c.id);

      await db.from('log_estudante').insert({
        lead_id: c.lead_id, acao: 'whatsapp_enviado',
        detalhe: { codigo: c.codigo, tentativa: (c.whatsapp_tentativas || 0) + 1 },
        ator: 'cron',
      });

      enviados++;
    } catch (e) {
      const tentativa = (c.whatsapp_tentativas || 0) + 1;

      await db.from('cupons_estudante')
        .update({ whatsapp_tentativas: tentativa, whatsapp_erro: String(e.message).slice(0, 500) })
        .eq('id', c.id);

      // So vira incidente quando esgota. Antes disso e ruido de rede.
      if (tentativa >= MAX_TENTATIVAS) {
        await db.from('log_estudante').insert({
          lead_id: c.lead_id, acao: 'whatsapp_desistiu',
          detalhe: { codigo: c.codigo, erro: e.message, tentativas: tentativa },
          ator: 'cron',
        });
      }

      falhas++;
    }
  }

  return { enviados, falhas, na_fila: (pendentes || []).length };
}

/* ------------------------------------------------------------------ */
/* 2. EXPIRAR cupons vencidos                                          */
/* ------------------------------------------------------------------ */
async function expirarCupons() {
  const { data, error } = await db
    .from('cupons_estudante')
    .update({ status: 'expirado' })
    .eq('status', 'ativo')
    .lt('expira_em', new Date().toISOString())
    .select('id');

  if (error) throw new Error(`expiracao: ${error.message}`);
  return { expirados: (data || []).length };
}

/* ------------------------------------------------------------------ */
/* 3. RD Station: reprocessar quem falhou                              */
/* ------------------------------------------------------------------ */
async function reprocessarRD() {
  const desde = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();

  const { data: leads, error } = await db
    .from('leads_estudante')
    .select('*')
    .eq('enviado_rd', false)
    .gte('criado_em', desde)
    .order('criado_em', { ascending: true })
    .limit(LOTE_RD);

  if (error) throw new Error(`busca de leads RD: ${error.message}`);

  let ok = 0, erro = 0;

  const lancado = process.env.DM_SITE_LANCADO === '1';

  for (const lead of leads || []) {
    try {
      // Com a chave ligada, o link pessoal vai junto (cf_link_estudante).
      const extras = {};
      if (lancado) {
        const { data: link } = await db.from('cupons_estudante')
          .select('codigo').eq('lead_id', lead.id).is('hotmart_coupon_id', null)
          .order('criado_em', { ascending: false }).limit(1).maybeSingle();
        if (link?.codigo) extras.link = linkPessoal(link.codigo);
      }
      await enviarLeadRD(lead, extras);
      await db.from('leads_estudante')
        .update({ enviado_rd: true, rd_erro: null }).eq('id', lead.id);
      ok++;
    } catch (e) {
      await db.from('leads_estudante')
        .update({ rd_erro: String(e.message).slice(0, 500) }).eq('id', lead.id);
      erro++;
    }
  }

  return { reenviados: ok, ainda_com_erro: erro };
}

/* ------------------------------------------------------------------ */
/* 4. LIMPAR cupons orfaos na Hotmart                                  */
/* ------------------------------------------------------------------ */
async function limparHotmart() {
  const { data: pendentes, error } = await db
    .from('cupons_estudante')
    .select('id, hotmart_coupon_id, codigo, lead_id')
    .eq('delete_pendente', true)
    .not('hotmart_coupon_id', 'is', null)
    .limit(20);

  if (error) throw new Error(`busca de delete_pendente: ${error.message}`);

  let apagados = 0, falhas = 0;

  for (const c of pendentes || []) {
    try {
      await apagarCupom(c.hotmart_coupon_id);
      await db.from('cupons_estudante')
        .update({ delete_pendente: false }).eq('id', c.id);
      await db.from('log_estudante').insert({
        lead_id: c.lead_id, acao: 'cupom_apagado_retroativo',
        detalhe: { codigo: c.codigo }, ator: 'cron',
      });
      apagados++;
    } catch (_) {
      falhas++;  // fica pendente e tenta na proxima rodada
    }
  }

  return { apagados, falhas };
}

/* ------------------------------------------------------------------ */

export async function GET(req) {
  if (!autorizado(req)) {
    return Response.json({ ok: false, erro: 'nao autorizado' }, { status: 401 });
  }

  const resultado = {};
  const erros = [];

  for (const [nome, tarefa] of [
    ['envio', enviarCodigos],
    ['expiracao', expirarCupons],
    ['rd', reprocessarRD],
    ['limpeza', limparHotmart],
  ]) {
    try {
      resultado[nome] = await tarefa();
    } catch (e) {
      resultado[nome] = { erro: e.message };
      erros.push(`${nome}: ${e.message}`);
      console.error(`[cron/manutencao] ${nome}:`, e);
    }
  }

  // 200 sempre: a Vercel nao precisa reagendar, o proximo minuto ja vem.
  return Response.json({ ok: erros.length === 0, resultado, erros });
}
