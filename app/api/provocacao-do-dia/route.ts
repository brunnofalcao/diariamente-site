import { NextResponse } from "next/server";
import { TEASER } from "@/lib/i18n";

// =====================================================================
// API: provocação do dia  (hero dinâmico — barra de busca)
// ---------------------------------------------------------------------
// Mostra a pergunta do DIA REAL (1..365) conforme a data de acesso.
// Roda no servidor; o front só recebe UMA pergunta (a do dia).
//
// >>> SCHEMA REAL (tabela `provocacoes`) <<<
//   dia_ano  int   -> dia do ano 1..365  (qual pergunta mostrar hoje)
//   pergunta text  -> a provocação
//   autor_dia text -> slug interno. NAO e exposto publicamente.
//   dia, mes int   -> data de referência (disponíveis se precisar)
//   lang     text  -> 'pt-BR' ou 'es'. Desde 03/10/2026 cada dia tem UMA
//                     linha em cada idioma (366 + 366).
//
// IDIOMA: `?lang=es` devolve a pergunta em espanhol. Sem parâmetro, ou com
// qualquer outro valor ('pt', 'pt-BR', lixo), devolve português. O valor
// nunca é repassado cru ao Supabase: só existem os dois literais abaixo.
// A resposta traz `lang` para o front conferir o que recebeu.
//
// Variáveis de ambiente (Vercel → Settings → Environment Variables):
//   SUPABASE_URL          = https://xycwmtsicuqjswfiohbc.supabase.co
//   SUPABASE_SERVICE_KEY  = (service_role key — NUNCA vai ao navegador)
//
// Mapeamento (defaults já batem com a base; só mude se renomear colunas):
//   SUPABASE_TABLE=provocacoes  COL_DIA_ANO=dia_ano
//   COL_PERGUNTA=pergunta       COL_AUTOR_DIA=autor_dia
// =====================================================================

const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TABLE = process.env.SUPABASE_TABLE || "provocacoes";
const C_MES = process.env.COL_MES || "mes";
const C_DIA = process.env.COL_DIA || "dia";
const C_PERGUNTA = process.env.COL_PERGUNTA || "pergunta";
const C_AUTOR_DIA = process.env.COL_AUTOR_DIA || "autor_dia";

// A autoria individual NAO e exposta publicamente. O brandbook credita a
// procedencia pelo conselho editorial, nunca por nome solto na interface.
// A assinatura publica e sempre a marca.
const ASSINATURA_PUBLICA = "Diariamente";

// Fallback teaser (marketing-safe — NAO sao os textos reais do produto).
//
// ATENCAO, e a causa de um bug real: quando o Supabase falha, este array
// entra no lugar do texto do dia e o hero continua exibindo data, dia do
// ano e tudo mais como se estivesse certo. O visitante ve "13 setembro ·
// Dia 256 de 365" com um texto que NAO e o do dia. A falha e invisivel.
//
// Por isso a resposta agora carrega `fonte` e `ok`, e o front deixa de
// exibir data e numeracao quando fonte !== "supabase". Melhor mostrar
// menos do que mostrar errado com cara de certo.
//
// Os textos vêm de lib/i18n (TEASER), a mesma lista que o front usa como
// ponte visual: servidor e navegador caem no MESMO texto, nos dois idiomas.
function teaser(lang: LangApi, diaAno: number): { texto: string; autor: string } {
  const lista = TEASER[lang === "es" ? "es" : "pt"];
  return { texto: lista[(diaAno - 1) % lista.length], autor: ASSINATURA_PUBLICA };
}

// Só estes dois valores chegam ao banco. Qualquer outra coisa vira pt-BR.
type LangApi = "pt-BR" | "es";
function idiomaPedido(valor: string | null): LangApi {
  return (valor ?? "").trim().toLowerCase() === "es" ? "es" : "pt-BR";
}

// Mês e dia atuais no fuso de Brasília (America/Sao_Paulo),
// independente do fuso do servidor (Vercel roda em UTC).
function dataBR(lang: LangApi): { mes: number; dia: number; diaAno: number; diaNum: number; mesNome: string; semana: string } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const [y, m, d] = fmt.format(now).split("-").map(Number);
  const start = Date.UTC(y, 0, 0);
  const hoje = Date.UTC(y, m - 1, d);

  // nomes no idioma pedido, sempre no fuso de Brasília (a data do produto)
  const mesNome = new Intl.DateTimeFormat(lang, { timeZone: "America/Sao_Paulo", month: "long" }).format(now);
  const semana = new Intl.DateTimeFormat(lang, { timeZone: "America/Sao_Paulo", weekday: "long" }).format(now);

  return {
    mes: m, dia: d,
    diaAno: Math.floor((hoje - start) / 86_400_000),
    diaNum: d,
    mesNome,
    semana,
  };
}

export const dynamic = "force-dynamic"; // recalcula a cada request
export const revalidate = 0;

export async function GET(req: Request) {
  const lang = idiomaPedido(new URL(req.url).searchParams.get("lang"));
  const { mes, dia, diaAno, diaNum, mesNome, semana } = dataBR(lang);
  // ex: "28 junho" | "28 de junio" (o mesmo formato que a Home usa)
  const dataExtenso = lang === "es" ? `${diaNum} de ${mesNome}` : `${diaNum} ${mesNome}`;
  const diaSemana = semana.charAt(0).toUpperCase() + semana.slice(1); // ex: "Domingo"

  // Sem Supabase configurado → fallback teaser (com diagnóstico claro)
  if (!SB_URL || !SB_KEY) {
    const t = teaser(lang, diaAno);
    const faltando = [
      !SB_URL ? "SUPABASE_URL" : null,
      !SB_KEY ? "SUPABASE_SERVICE_KEY" : null,
    ].filter(Boolean);
    return NextResponse.json({
      dia: diaAno,
      total: 365,
      lang,
      fonte: "teaser", ok: false, ehDoDia: false,
      motivo: `variavel(eis) de ambiente ausente(s) no Vercel: ${faltando.join(", ")}`,
      dataExtenso, diaSemana,
      ...t,
    });
  }

  try {
    // Busca a pergunta de hoje por MÊS + DIA + IDIOMA (imune a qualquer offset de dia_ano).
    // Sem o filtro de idioma o limit=1 pegava a linha que viesse primeiro, e
    // desde 03/10 o site em português passou a mostrar a pergunta em espanhol.
    const select = encodeURIComponent(`${C_PERGUNTA},${C_AUTOR_DIA},dia_ano`);
    const endpoint =
      `${SB_URL}/rest/v1/${TABLE}` +
      `?select=${select}` +
      `&${C_MES}=eq.${mes}` +
      `&${C_DIA}=eq.${dia}` +
      `&lang=eq.${encodeURIComponent(lang)}` +
      `&limit=1`;

    const r = await fetch(endpoint, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`supabase ${r.status}`);

    const linhas: Record<string, unknown>[] = await r.json();
    if (!linhas?.length) {
      const t = teaser(lang, diaAno);
      return NextResponse.json({ dia: diaAno, total: 365, lang, fonte: "teaser", ok: false, ehDoDia: false, motivo: `nenhuma linha com ${C_MES}=${mes}, ${C_DIA}=${dia} e lang=${lang}`, dataExtenso, diaSemana, ...t });
    }

    const row = linhas[0];
    const slug = String(row[C_AUTOR_DIA] ?? "").toLowerCase().trim();
    const autor = ASSINATURA_PUBLICA;
    // usa o dia_ano do banco (numeração oficial do produto), com fallback no calculado
    const diaLabel = Number(row["dia_ano"]) || diaAno;

    return NextResponse.json({
      dia: diaLabel,
      total: 365,
      lang,
      fonte: "supabase", ok: true, ehDoDia: true,
      texto: String(row[C_PERGUNTA] ?? ""),
      autor,
      dataExtenso, diaSemana,
    });
  } catch (e) {
    const t = teaser(lang, diaAno);
    return NextResponse.json({ dia: diaAno, total: 365, lang, fonte: "teaser", ok: false, ehDoDia: false, motivo: String(e), dataExtenso, diaSemana, ...t });
  }
}

// =====================================================================
// PASSO A PASSO PARA PLUGAR (faça quando for conectar):
//
// LEITURA NO SERVIDOR: a chave fica só no servidor; o navegador chama
// /api/provocacao-do-dia (sua própria rota) e nunca vê a chave nem as 365.
//
// 1) No Vercel (Settings → Environment Variables), defina (marque Sensitive):
//      SUPABASE_URL          = https://xycwmtsicuqjswfiohbc.supabase.co
//      SUPABASE_SERVICE_KEY  = (service_role key — Supabase → Settings → API)
//
// 2) NÃO precisa de RLS para isso funcionar (a service key já tem acesso e
//    nunca é exposta). Se quiser RLS por outras razões, tudo bem — a service
//    role ignora RLS por padrão.
//
// 3) Redeploy. O hero passa a mostrar a `pergunta` do dia real (dia_ano),
//    assinada pela marca. A autoria individual nunca e exposta.
//    Teste em /api/provocacao-do-dia — campo "fonte" dirá "supabase".
//    Se algo falhar, cai sozinho no teaser (nunca quebra).
// =====================================================================
