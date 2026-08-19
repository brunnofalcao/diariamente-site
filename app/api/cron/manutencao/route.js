/**
 * GET /api/cron/manutencao
 *
 * Rotina unica de manutencao do fluxo estudante. Roda de minuto em minuto
 * (Vercel Cron, ver vercel.json). Quatro tarefas independentes, cada uma
 * com try/catch proprio: se uma quebra, as outras seguem.
 *
 *   1. ENVIAR   codigos maduros (enviar_em vencido) pelo WhatsApp
 *   2. EXPIRAR  cupons vencidos que ainda constam como ativos
 *   3. RD       reprocessar leads que falharam no RD Station
 *   4. LIMPAR   apagar na Hotmart cupons marcados como delete_pendente
 *
 * Auth: a Vercel manda `Authorization: Bearer ${CRON_SECRET}` sozinha quando
 * a variavel CRON_SECRET existe. Para rodar na mao, use ?key=CRON_SECRET.
 */

import { createClient } from '@supabase/supabase-js';
import { apagarCupom } from '@/lib/hotmart';
import { enviarLeadRD } from '@/lib/rdstation';
import { whatsapp } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const LOTE_ENVIO = 40;   // teto por rodada, protege contra pico
const LOTE_RD = 20;
const MAX_TENTATIVAS = 5;

function autorizado(req) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const header = req.headers.get('authorization') || '';
  if (header === `Bearer ${segredo}`) return true;
  return new URL(req.url).searchParams.get('key') === segredo;
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

  for (const lead of leads || []) {
    try {
      await enviarLeadRD(lead);
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
