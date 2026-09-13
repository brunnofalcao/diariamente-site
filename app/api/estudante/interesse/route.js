import { createClient } from "@supabase/supabase-js";

/* =====================================================================
   POST /api/estudante/interesse
   ---------------------------------------------------------------------
   Registra interesse na condição de estudante FORA do Brasil.
   NÃO emite cupom: emitir exige oferta em moeda local, que não existe.

   Por que rota separada de /api/estudante/solicitar: aquela valida CPF
   com dígito verificador e devolve 400 para qualquer outro documento.
   Reaproveitá-la significaria afrouxar a validação do fluxo brasileiro,
   que é justamente o que garante um código por pessoa.

   >>> ANTES DE USAR, CRIAR A TABELA <<<

   create table public.estudante_interesse (
     id            uuid primary key default gen_random_uuid(),
     criado_em     timestamptz not null default now(),
     nome          text not null,
     email         text not null,
     telefone      text,
     pais          text not null,
     instituicao   text not null,
     curso         text,
     idioma        text not null default 'es',
     -- consentimento: separado por finalidade, com prova
     consent_versao      text not null,
     consent_aceito_em   timestamptz not null,
     consent_origem      text not null,
     consent_marketing   boolean not null default false,
     consent_parceiros   boolean not null default false,
     -- prova adicional exigida na prática por autoridade de controle
     ip_hash       text,
     user_agent    text,
     utm           jsonb
   );
   create index on public.estudante_interesse (email);
   alter table public.estudante_interesse enable row level security;

   O IP é gravado em HASH, não em claro: serve como prova de origem do
   consentimento sem armazenar dado identificável desnecessário, o que
   atende à minimização (RGPD art. 5(1)(c) e LGPD art. 6º, III).
   ===================================================================== */

export const dynamic = "force-dynamic";

const TABELA = process.env.SUPABASE_TABELA_INTERESSE || "estudante_interesse";

function limpar(v, max = 200) {
  return String(v ?? "").trim().slice(0, max);
}

async function hashear(texto) {
  const dados = new TextEncoder().encode(texto + (process.env.HASH_SALT || "diariamente"));
  const buf = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, erro: "configuracao" }, { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, erro: "json" }, { status: 400 });
  }

  const nome = limpar(body.nome);
  const email = limpar(body.email).toLowerCase();
  const pais = limpar(body.pais, 80);
  const instituicao = limpar(body.instituicao);

  const erros = [];
  if (nome.split(/\s+/).filter(Boolean).length < 2) erros.push("nome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push("email");
  if (!pais) erros.push("pais");
  if (instituicao.length < 2) erros.push("instituicao");
  if (erros.length) return Response.json({ ok: false, erros }, { status: 400 });

  const c = body.consentimento ?? {};
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await sb.from(TABELA).insert({
      nome,
      email,
      telefone: limpar(body.telefone, 32),
      pais,
      instituicao,
      curso: limpar(body.curso, 120),
      idioma: limpar(c.idioma, 8) || "es",
      consent_versao: limpar(c.versao, 32),
      consent_aceito_em: c.aceitoEm || new Date().toISOString(),
      consent_origem: limpar(c.origem, 64),
      consent_marketing: Boolean(c.marketingProprio),
      consent_parceiros: Boolean(c.parceiros),
      ip_hash: ip ? await hashear(ip) : null,
      user_agent: limpar(req.headers.get("user-agent"), 300),
      utm: body.utm ?? null,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[interesse] falha ao gravar:", e?.message ?? e);
    return Response.json({ ok: false, erro: "gravacao" }, { status: 500 });
  }
}
