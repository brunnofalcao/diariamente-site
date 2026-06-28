import { NextResponse } from "next/server";

// =====================================================================
// API: provocação do dia  (hero dinâmico — barra de busca)
// ---------------------------------------------------------------------
// Mostra a pergunta do DIA REAL (1..365) conforme a data de acesso.
// Roda no servidor; o front só recebe UMA pergunta (a do dia).
//
// >>> SCHEMA REAL (tabela `provocacoes`) <<<
//   dia_ano  int   -> dia do ano 1..365  (qual pergunta mostrar hoje)
//   pergunta text  -> a provocação
//   autor_dia text -> "roberta" | "brunno"  (assinatura)
//   dia, mes int   -> data de referência (disponíveis se precisar)
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

// autor_dia (slug) -> nome de exibição
const AUTOR_NOME: Record<string, string> = {
  brunno: "Brunno Falcão",
  roberta: "Roberta Carbonari",
};

// Fallback teaser (marketing-safe — NÃO são as provocações reais do livro)
const TEASER = [
  { texto: "O que você está adiando que, no fundo, já sabe que precisa decidir?", autor: "Diariamente" },
  { texto: "Se hoje fosse a única chance de começar, você começaria, ou esperaria estar pronto?", autor: "Diariamente" },
  { texto: "O que você faria diferente se ninguém estivesse olhando o resultado?", autor: "Diariamente" },
  { texto: "Qual conversa você está evitando que mudaria o seu próximo ano?", autor: "Diariamente" },
  { texto: "O que te trouxe até aqui é o mesmo que vai te levar adiante?", autor: "Diariamente" },
  { texto: "Onde você está confundindo conforto com segurança?", autor: "Diariamente" },
  { texto: "O que você constrói quando ninguém te cobra nada?", autor: "Diariamente" },
];

// Mês e dia atuais no fuso de Brasília (America/Sao_Paulo),
// independente do fuso do servidor (Vercel roda em UTC).
function mesDiaBR(): { mes: number; dia: number; diaAno: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(new Date()).split("-").map(Number);
  const start = Date.UTC(y, 0, 0);
  const hoje = Date.UTC(y, m - 1, d);
  return { mes: m, dia: d, diaAno: Math.floor((hoje - start) / 86_400_000) };
}

export const dynamic = "force-dynamic"; // recalcula a cada request
export const revalidate = 0;

export async function GET() {
  const { mes, dia, diaAno } = mesDiaBR();

  // Sem Supabase configurado → fallback teaser (com diagnóstico claro)
  if (!SB_URL || !SB_KEY) {
    const t = TEASER[(diaAno - 1) % TEASER.length];
    const faltando = [
      !SB_URL ? "SUPABASE_URL" : null,
      !SB_KEY ? "SUPABASE_SERVICE_KEY" : null,
    ].filter(Boolean);
    return NextResponse.json({
      dia: diaAno,
      total: 365,
      fonte: "teaser",
      motivo: `variavel(eis) de ambiente ausente(s) no Vercel: ${faltando.join(", ")}`,
      ...t,
    });
  }

  try {
    // Busca a pergunta de hoje por MÊS + DIA (imune a qualquer offset de dia_ano)
    const select = encodeURIComponent(`${C_PERGUNTA},${C_AUTOR_DIA},dia_ano`);
    const endpoint =
      `${SB_URL}/rest/v1/${TABLE}` +
      `?select=${select}` +
      `&${C_MES}=eq.${mes}` +
      `&${C_DIA}=eq.${dia}` +
      `&limit=1`;

    const r = await fetch(endpoint, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`supabase ${r.status}`);

    const linhas: Record<string, unknown>[] = await r.json();
    if (!linhas?.length) {
      const t = TEASER[(diaAno - 1) % TEASER.length];
      return NextResponse.json({ dia: diaAno, total: 365, fonte: "teaser", motivo: `nenhuma linha com ${C_MES}=${mes} e ${C_DIA}=${dia}`, ...t });
    }

    const row = linhas[0];
    const slug = String(row[C_AUTOR_DIA] ?? "").toLowerCase().trim();
    const autor = AUTOR_NOME[slug] || "Diariamente";
    // usa o dia_ano do banco (numeração oficial do produto), com fallback no calculado
    const diaLabel = Number(row["dia_ano"]) || diaAno;

    return NextResponse.json({
      dia: diaLabel,
      total: 365,
      fonte: "supabase",
      texto: String(row[C_PERGUNTA] ?? ""),
      autor,
    });
  } catch (e) {
    const t = TEASER[(diaAno - 1) % TEASER.length];
    return NextResponse.json({ dia: diaAno, total: 365, fonte: "teaser", motivo: String(e), ...t });
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
//    assinada por Brunno Falcão / Roberta Carbonari (via autor_dia).
//    Teste em /api/provocacao-do-dia — campo "fonte" dirá "supabase".
//    Se algo falhar, cai sozinho no teaser (nunca quebra).
// =====================================================================
