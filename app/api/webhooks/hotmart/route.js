/**
 * POST /api/webhooks/hotmart
 *
 * Esta rota e o que transforma um cupom ilimitado da Hotmart em cupom
 * de uso unico. Compra aprovada -> DELETE do cupom.
 * Sem ela, o codigo circula livremente ate expirar.
 *
 * O caminho do coupon_code no payload precisa ser confirmado no primeiro
 * disparo real. Por isso a busca e recursiva, e funciona em qualquer
 * estrutura que a Hotmart mandar.
 */

import { createClient } from '@supabase/supabase-js';
import { apagarCupom } from '@/lib/hotmart';

export const runtime = 'nodejs';

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

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

export async function POST(req) {
  try {
    const hottok = req.headers.get('x-hotmart-hottok');
    if (!hottok || hottok !== process.env.HOTMART_HOTTOK) {
      console.warn('[webhook hotmart] hottok invalido');
      return Response.json({ ok: false }, { status: 401 });
    }

    const payload = await req.json();
    const evento = payload.event || payload.data?.event;
    if (evento !== 'PURCHASE_APPROVED') {
      return Response.json({ ok: true, ignorado: evento });
    }

    const codigo = extrairCodigoCupom(payload);
    if (!codigo) return Response.json({ ok: true, cupom: null });

    const { data: cupom } = await db
      .from('cupons_estudante').select('*').eq('codigo', codigo).maybeSingle();

    if (!cupom) return Response.json({ ok: true, cupom: 'externo' });

    if (cupom.status !== 'ativo') {
      await db.from('log_estudante').insert({
        lead_id: cupom.lead_id, acao: 'cupom_reutilizado',
        detalhe: { codigo, status_anterior: cupom.status }, ator: 'hotmart',
      });
      return Response.json({ ok: true, aviso: 'cupom_ja_baixado' });
    }

    const transacao = payload.data?.purchase?.transaction ?? null;

    // Fecha do nosso lado ANTES de chamar a Hotmart.
    // Se o DELETE falhar, o cupom ja esta baixado aqui.
    await db.from('cupons_estudante').update({
      status: 'usado',
      usado_em: new Date().toISOString(),
      transacao_hotmart: transacao,
    }).eq('id', cupom.id);

    let apagado = false;
    try {
      if (cupom.hotmart_coupon_id) {
        await apagarCupom(cupom.hotmart_coupon_id);
        apagado = true;
      }
    } catch (e) {
      console.error('[webhook hotmart] DELETE falhou:', e.message);
      await db.from('cupons_estudante')
        .update({ delete_pendente: true }).eq('id', cupom.id);
    }

    await db.from('log_estudante').insert({
      lead_id: cupom.lead_id, acao: 'cupom_usado',
      detalhe: { codigo, transacao, apagado_na_hotmart: apagado }, ator: 'hotmart',
    });

    return Response.json({ ok: true, codigo, apagado });

  } catch (e) {
    console.error('[webhook hotmart]', e);
    // 200 evita retry infinito da Hotmart. O erro fica registrado no log.
    return Response.json({ ok: false, erro: e.message }, { status: 200 });
  }
}
