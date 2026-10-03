import { createClient } from "@supabase/supabase-js";

/* =====================================================================
   POST /api/lista-espera
   ---------------------------------------------------------------------
   Grava o lead em DOIS destinos:

     Supabase   fonte da verdade, com o registro do consentimento
     RD Station para disparar a comunicação de abertura

   QUEM JÁ ESTÁ NA LISTA NÃO É TOCADO. A rota é pública: qualquer um
   pode mandar o e-mail de outra pessoa com nome e WhatsApp inventados.
   Por isso a gravação é um insert que IGNORA o e-mail repetido (nada é
   sobrescrito no banco) e, quando o e-mail já existia, o RD também não
   recebe nada (uma conversão nova trocaria nome e telefone do contato
   lá). A resposta é a mesma nos dois casos, para a rota não servir de
   consulta de "este e-mail está inscrito?".

   Supabase primeiro, RD depois, e o RD só quando:
     a) o e-mail é novo na tabela; ou
     b) o Supabase falhou (tabela ainda não criada, fora do ar). Aqui o
        RD é a rede de segurança para o lead não se perder. Enquanto a
        tabela não existir, TODO envio cai neste caso, e o RD continua
        sujeito à troca de dados descrita acima: rodar o SQL resolve.

   Os campos que vêm do navegador são saneados (caractere de controle,
   data inválida ou longe da hora do servidor, utm fora da lista) para
   que um envio malicioso não
   consiga derrubar a gravação no banco de propósito e, assim, forçar o
   caminho (b).

   Se os dois falharem, devolve 500 e o formulário avisa a pessoa.

   Não reaproveita lib/rdstation.js de propósito: aquela função é do
   fluxo de estudante, com tags e campos de curso e instituição. Mexer
   nela arriscaria o fluxo que já funciona.

   >>> TABELA: sql/2026-10-03-lista-espera.sql (com rollback ao lado) <<<

   O e-mail é UNIQUE na coluna (e chega sempre em minúsculas): é o alvo
   do "ignora repetido" e impede duplicata. Quem se inscreve duas vezes
   não recebe dois avisos. Índice por expressão, como lower(email), NÃO
   serve de alvo para o on_conflict do Supabase. A coluna avisado_em
   serve para marcar quem já recebeu a comunicação de abertura.
   ===================================================================== */

export const dynamic = "force-dynamic";

// Troca caracteres de controle por espaço (o \u0000 faz o Postgres
// recusar a linha inteira) e tira metades soltas de emoji (UTF-16
// inválido) antes de aparar e cortar no tamanho. O corte pode partir um
// emoji ao meio, por isso a limpeza de metades soltas roda de novo.
const SOLTOS = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
const limpar = (v, max = 200) =>
  String(v ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(SOLTOS, "")
    .replace(/ {2,}/g, " ")
    .trim()
    .slice(0, max)
    .replace(SOLTOS, "");

const CHAVES_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

/** Só as cinco utm conhecidas, como texto curto. Qualquer outra coisa some. */
function limparUtm(utm) {
  if (!utm || typeof utm !== "object" || Array.isArray(utm)) return null;
  const out = {};
  for (const k of CHAVES_UTM) {
    const v = limpar(utm[k], 200);
    if (v) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Data do aceite enviada pelo navegador. Só vale se cair perto da hora do
 * servidor (até 1 dia antes, até 5 minutos depois); fora disso, vale a do
 * servidor. Não basta ser "data válida" para o JavaScript: "0000-01-01",
 * "+010000-01-01" e anos negativos passam no new Date(), mas o Postgres
 * recusa (conferido com pg_input_is_valid). A gravação cairia, e o envio
 * iria direto ao RD, que é justamente o caminho que a limpeza fecha.
 */
const UM_DIA_MS = 24 * 60 * 60 * 1000;
const CINCO_MIN_MS = 5 * 60 * 1000;
function dataDoAceite(v) {
  const agora = Date.now();
  const t = typeof v === "string" ? new Date(v).getTime() : NaN;
  const plausivel = Number.isFinite(t) && t >= agora - UM_DIA_MS && t <= agora + CINCO_MIN_MS;
  return new Date(plausivel ? t : agora).toISOString();
}

async function hashear(texto) {
  const dados = new TextEncoder().encode(texto + (process.env.HASH_SALT || "diariamente"));
  const buf = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Insere o lead se o e-mail ainda não está na lista. Nunca altera quem já
 * está lá (on conflict do nothing). Devolve true quando a linha é nova.
 */
async function gravarSupabase(lead) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("supabase sem configuracao");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("lista_espera")
    .upsert(lead, { onConflict: "email", ignoreDuplicates: true })
    .select("id");
  if (error) throw error;
  // Com ignoreDuplicates, o e-mail repetido não volta na resposta.
  return Array.isArray(data) && data.length > 0;
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
  if (!body || typeof body !== "object") {
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

  const c = body.consentimento && typeof body.consentimento === "object" ? body.consentimento : {};
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

  const lead = {
    nome,
    email,
    whatsapp,
    origem: "em-breve",
    consent_versao: limpar(c.versao, 32) || "desconhecida",
    consent_aceito_em: dataDoAceite(c.aceitoEm),
    consent_parceiros: Boolean(c.parceiros),
    ip_hash: ip ? await hashear(ip) : null,
    user_agent: limpar(req.headers.get("user-agent"), 300),
    utm: limparUtm(body.utm),
  };
  // idioma vai só para o RD (tag). Fora do objeto gravado no Supabase
  // para não exigir coluna nova na tabela.
  const idioma = c.idioma === "es" ? "es" : "pt";

  let gravouNoBanco = false;
  let novo = false;
  try {
    novo = await gravarSupabase(lead);
    gravouNoBanco = true;
  } catch (e) {
    console.error("[lista-espera] supabase:", e?.message ?? e);
  }

  // E-mail que já estava na lista: nada muda em lugar nenhum.
  if (gravouNoBanco && !novo) return Response.json({ ok: true });

  let foiProRD = false;
  try {
    await enviarRD({ ...lead, idioma });
    foiProRD = true;
  } catch (e) {
    console.error("[lista-espera] rd:", e?.message ?? e);
  }

  // Mesma resposta para todo sucesso: não conta o que deu certo onde.
  if (gravouNoBanco || foiProRD) return Response.json({ ok: true });
  return Response.json({ ok: false, erro: "gravacao" }, { status: 500 });
}
