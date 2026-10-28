/**
 * POST /api/webhooks/hotmart
 *
 * Fecha o ciclo do estudante na venda aprovada (PURCHASE_APPROVED).
 *
 * FLUXO NOVO (chave de lancamento ligada, decisao do dono de 28/10/2026):
 * o estudante paga numa OFERTA de estudante (config/pricing.ts,
 * ESTUDANTE_OFERTA_LANCAMENTO e ESTUDANTE_OFERTA), aberta pelo link
 * pessoal (/estudante/ativar). Nada de cupom: esta rota NAO chama a API
 * de cupom para esses links. Ela marca o link como usado
 * (cupons_estudante.status = 'usado', usado_em, transacao_hotmart),
 * achando o pedido assim, so na venda de uma oferta de estudante:
 *   1. pelo token no sck (o /estudante/ativar o poe no checkout, e a
 *      Hotmart o devolve em data.purchase.origin.sck);
 *   2. pelo e-mail do comprador (data.buyer.email) igual ao do pedido,
 *      quando o sck nao vem (a pessoa abriu o checkout de outro jeito).
 * Venda de oferta de estudante sem pedido nenhum (link repassado, e-mail
 * diferente e sem sck) fica registrada em log_estudante
 * ('venda_estudante_sem_link', so transacao e oferta) para o dono ver.
 * Recorrencias (recurrence_number > 1) sao ignoradas: o link ja foi usado
 * na primeira.
 *
 * FLUXO DA MAIN (standby): cupom pessoal criado pela API da Hotmart. Para
 * esses, e so para eles (a linha tem hotmart_coupon_id), o codigo do
 * cupom na venda acha a linha e o cupom e apagado na Hotmart (uso unico),
 * como antes. O caminho do coupon_code no payload e procurado em
 * qualquer lugar (busca recursiva).
 *
 * Auth: cabecalho X-HOTMART-HOTTOK igual a HOTMART_HOTTOK, comparado em
 * tempo constante (lib/seguranca.js). Sem HOTMART_HOTTOK configurado, a
 * rota recusa tudo. Cadastro na Hotmart: o produto 7448309, evento de
 * compra aprovada, endereco COM www (docs/ESTUDANTE.md).
 */

import { createClient } from '@supabase/supabase-js';
import { apagarCupom } from '@/lib/hotmart';
import { segredoConfere } from '@/lib/seguranca';
import { ofertasDoEstudante } from '@/config/pricing';

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

/** O token do link pessoal (lib/estudante.js): o mesmo formato que o
    /estudante/ativar aceita. */
const FORMATO_DO_TOKEN = /^[A-Z0-9_-]{1,25}$/;

function extrairCodigoCupom(payload) {
  const chaves = ['coupon_code', 'couponCode', 'coupon'];
  let achado = null;
  (function varrer(no) {
    if (achado || !no || typeof no !== 'object') return;
    for (const [k, v] of Object.entries(no)) {
      if (chaves.includes(k) && typeof v === 'string' && v.trim()) { achado = v.trim(); return; }
      if (typeof v === 'object') varrer(v);
    }
  })(payload);
  return achado;
}

const texto = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');

/** Codigo da oferta da venda (data.purchase.offer.code, versao 2.0.0). */
function ofertaDaVenda(payload) {
  const compra = payload?.data?.purchase || payload?.purchase || {};
  return texto(compra.offer?.code) || texto(compra.offer_code) || '';
}

/** E-mail do comprador, minusculo (o pedido grava assim). */
function emailDaVenda(payload) {
  const d = payload?.data || payload || {};
  return (texto(d.buyer?.email) || texto(d.email)).toLowerCase();
}

/** Token do link pessoal no rastreio da venda (sck; src por garantia). */
function tokenDaVenda(payload) {
  const compra = payload?.data?.purchase || payload?.purchase || {};
  const origem = compra.origin || compra.tracking || {};
  for (const v of [origem.sck, origem.source_sck, origem.src, origem.source]) {
    const t = texto(v).toUpperCase();
    if (t && FORMATO_DO_TOKEN.test(t)) return t;
  }
  return '';
}

/** Recorrencia da assinatura (1 = primeira cobranca). */
function recorrencia(payload) {
  const compra = payload?.data?.purchase || payload?.purchase || {};
  const n = Number(compra.recurrence_number);
  return Number.isFinite(n) ? n : null;
}

/** Pedido do fluxo novo pelo e-mail: o link mais recente ainda nao usado. */
async function linkPeloEmail(email) {
  const { data: leads } = await db
    .from('leads_estudante').select('id').eq('email', email)
    .order('criado_em', { ascending: false }).limit(5);
  const ids = (leads || []).map((l) => l.id);
  if (!ids.length) return null;
  const { data } = await db
    .from('cupons_estudante').select('*')
    .in('lead_id', ids).is('hotmart_coupon_id', null).neq('status', 'usado')
    .order('criado_em', { ascending: false }).limit(1).maybeSingle();
  return data || null;
}

export async function POST(req) {
  try {
    const hottok = req.headers.get('x-hotmart-hottok') || '';
    if (!segredoConfere(hottok, process.env.HOTMART_HOTTOK)) {
      console.warn('[webhook hotmart] hottok invalido');
      return Response.json({ ok: false }, { status: 401 });
    }

    const payload = await req.json();
    const evento = payload.event || payload.data?.event;
    if (evento !== 'PURCHASE_APPROVED') {
      return Response.json({ ok: true, ignorado: evento });
    }

    const transacao = payload.data?.purchase?.transaction ?? null;
    const oferta = ofertaDaVenda(payload);
    const daOfertaDoEstudante = Boolean(oferta) && ofertasDoEstudante().includes(oferta);
    const rec = recorrencia(payload);
    if (daOfertaDoEstudante && rec !== null && rec > 1) {
      return Response.json({ ok: true, estudante: 'recorrencia' });
    }

    // ---------- 1 e 2: fluxo novo, so na venda da oferta de estudante ----------
    let linha = null;
    let via = null;
    if (daOfertaDoEstudante) {
      const token = tokenDaVenda(payload);
      if (token) {
        const { data } = await db.from('cupons_estudante').select('*').eq('codigo', token).maybeSingle();
        if (data) { linha = data; via = 'rastreio'; }
      }
      const email = emailDaVenda(payload);
      if (!linha && email) {
        linha = await linkPeloEmail(email);
        if (linha) via = 'email';
      }
    }

    // ---------- 3: cupom da main (standby), por codigo ----------
    const codigoCupom = extrairCodigoCupom(payload);
    if (!linha && codigoCupom) {
      const { data } = await db.from('cupons_estudante').select('*').eq('codigo', codigoCupom).maybeSingle();
      if (data) { linha = data; via = 'cupom'; }
    }

    if (!linha) {
      if (daOfertaDoEstudante) {
        await db.from('log_estudante').insert({
          lead_id: null, acao: 'venda_estudante_sem_link',
          detalhe: { transacao, oferta }, ator: 'hotmart',
        });
        return Response.json({ ok: true, estudante: 'sem_link' });
      }
      return Response.json({ ok: true, cupom: codigoCupom ? 'externo' : null });
    }

    const codigo = linha.codigo;
    if (linha.status === 'usado') {
      await db.from('log_estudante').insert({
        lead_id: linha.lead_id, acao: 'cupom_reutilizado',
        detalhe: { codigo, via, transacao, status_anterior: linha.status }, ator: 'hotmart',
      });
      return Response.json({ ok: true, aviso: 'ja_usado' });
    }

    // Fecha do nosso lado ANTES de qualquer chamada externa.
    await db.from('cupons_estudante').update({
      status: 'usado',
      usado_em: new Date().toISOString(),
      transacao_hotmart: transacao,
    }).eq('id', linha.id);

    // So o cupom da main existe na Hotmart. O link do fluxo novo nao tem
    // hotmart_coupon_id, e nada aqui chama a API de cupom para ele.
    let apagado = false;
    if (via === 'cupom' && linha.hotmart_coupon_id) {
      try {
        await apagarCupom(linha.hotmart_coupon_id);
        apagado = true;
      } catch (e) {
        console.error('[webhook hotmart] DELETE falhou:', e.message);
        await db.from('cupons_estudante')
          .update({ delete_pendente: true }).eq('id', linha.id);
      }
    }

    await db.from('log_estudante').insert({
      lead_id: linha.lead_id,
      acao: via === 'cupom' ? 'cupom_usado' : 'link_usado',
      detalhe: { codigo, via, transacao, oferta: oferta || null, apagado_na_hotmart: apagado },
      ator: 'hotmart',
    });

    return Response.json({ ok: true, codigo, via, apagado });

  } catch (e) {
    console.error('[webhook hotmart]', e);
    // 200 evita retry infinito da Hotmart. O erro fica registrado no log.
    return Response.json({ ok: false, erro: e.message }, { status: 200 });
  }
}
