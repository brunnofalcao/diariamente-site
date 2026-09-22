import { createClient } from "@supabase/supabase-js";

/* =====================================================================
   POST /api/lista-espera
   ---------------------------------------------------------------------
   Grava o lead em DOIS destinos e responde OK se pelo menos um aceitar:

     Supabase   fonte da verdade, com o registro do consentimento
     RD Station para disparar a comunicação de abertura

   Por que "pelo menos um": a página pode ir ao ar antes de a tabela
   existir. Com o token do RD já configurado na Vercel (o fluxo de
   estudante usa o mesmo), o lead não se perde no primeiro dia. Se os
   dois falharem, devolve 500 e o formulário avisa a pessoa.

   Não reaproveita lib/rdstation.js de propósito: aquela função é do
   fluxo de estudante, com tags e campos de curso e instituição. Mexer
   nela arriscaria o fluxo que já funciona.

   >>> TABELA (rodar uma vez no Supabase) <<<

   create table public.lista_espera (
     id                 uuid primary key default gen_random_uuid(),
     criado_em          timestamptz not null default now(),
     nome               text not null,
     email              text not null unique,
     whatsapp           text not null,
     origem             text not null default 'em-breve',
     consent_versao     text not null,
     consent_aceito_em  timestamptz not null,
     consent_parceiros  boolean not null default false,
     ip_hash            text,
     user_agent         text,
     utm                jsonb,
     avisado_em         timestamptz
   );
   alter table public.lista_espera enable row level security;

   O e-mail é UNIQUE na coluna (e chega sempre em minúsculas): é o que
   permite o upsert, e impede duplicata. Quem se inscreve duas vezes não
   recebe dois avisos. Índice por expressão, como lower(email), NÃO
   serve de alvo para o upsert do Supabase. A coluna avisado_em serve para marcar
   quem já recebeu a comunicação de abertura.
   ===================================================================== */

export const dynamic = "force-dynamic";

const limpar = (v, max = 200) => String(v ?? "").trim().slice(0, max);

async function hashear(texto) {
  const dados = new TextEncoder().encode(texto + (process.env.HASH_SALT || "diariamente"));
  const buf = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function gravarSupabase(lead) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("supabase sem configuracao");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  // upsert por e-mail: reinscrição atualiza em vez de duplicar
  const { error } = await sb.from("lista_espera").upsert(lead, { onConflict: "email" });
  if (error) throw error;
}

async function enviarRD(lead) {
  const token = process.env.RD_STATION_TOKEN;
  if (!token) throw new Error("RD_STATION_TOKEN ausente");
  const payload = {
    event_type: "CONVERSION",
    event_family: "CDP",
    payload: {
      conversion_identifier: process.env.RD_CONVERSION_EM_BREVE || "diariamente-em-breve",
      name: lead.nome,
      email: lead.email,
      mobile_phone: `+${lead.whatsapp}`,
      // idioma-pt / idioma-es: na abertura, cada lista recebe a mensagem
      // no idioma em que se inscreveu, sem ninguém precisar adivinhar.
      tags: ["lista-espera", "em-breve", `idioma-${lead.idioma}`, ...(lead.consent_parceiros ? ["aceita-parceiros"] : [])],
      traffic_source: lead.utm?.utm_source,
      traffic_medium: lead.utm?.utm_medium,
      traffic_campaign: lead.utm?.utm_campaign,
    },
  };
  for (const [k, v] of Object.entries(payload.payload)) if (v == null || v === "") delete payload.payload[k];
  const r = await fetch(`https://api.rd.services/platform/conversions?api_key=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`RD [${r.status}]`);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, erro: "json" }, { status: 400 });
  }

  const nome = limpar(body.nome);
  const email = limpar(body.email).toLowerCase();
  const whatsapp = limpar(body.whatsapp, 20).replace(/\D/g, "");

  const erros = [];
  if (nome.split(/\s+/).filter(Boolean).length < 2) erros.push("nome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push("email");
  if (whatsapp.length < 8 || whatsapp.length > 18) erros.push("whatsapp");
  if (erros.length) return Response.json({ ok: false, erros }, { status: 400 });

  const c = body.consentimento ?? {};
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

  const lead = {
    nome,
    email,
    whatsapp,
    origem: "em-breve",
    consent_versao: limpar(c.versao, 32) || "desconhecida",
    consent_aceito_em: c.aceitoEm || new Date().toISOString(),
    consent_parceiros: Boolean(c.parceiros),
    ip_hash: ip ? await hashear(ip) : null,
    user_agent: limpar(req.headers.get("user-agent"), 300),
    utm: body.utm && typeof body.utm === "object" ? body.utm : null,
  };
  // idioma vai só para o RD (tag). Fora do objeto gravado no Supabase
  // para não exigir coluna nova na tabela.
  const idioma = c.idioma === "es" ? "es" : "pt";

  const [sb, rd] = await Promise.allSettled([gravarSupabase(lead), enviarRD({ ...lead, idioma })]);
  if (sb.status === "rejected") console.error("[lista-espera] supabase:", sb.reason?.message ?? sb.reason);
  if (rd.status === "rejected") console.error("[lista-espera] rd:", rd.reason?.message ?? rd.reason);

  if (sb.status === "fulfilled" || rd.status === "fulfilled") {
    return Response.json({ ok: true, supabase: sb.status === "fulfilled", rd: rd.status === "fulfilled" });
  }
  return Response.json({ ok: false, erro: "gravacao" }, { status: 500 });
}
