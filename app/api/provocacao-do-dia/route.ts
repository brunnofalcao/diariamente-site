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
//   NEXT_PUBLIC_SUPABASE_URL       = https://xycwmtsicuqjswfiohbc.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  = (anon/public key)
//
// Mapeamento (defaults já batem com a base; só mude se renomear colunas):
//   SUPABASE_TABLE=provocacoes  COL_DIA_ANO=dia_ano
//   COL_PERGUNTA=pergunta       COL_AUTOR_DIA=autor_dia
// =====================================================================

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TABLE = process.env.SUPABASE_TABLE || "provocacoes";
const C_DIA_ANO = process.env.COL_DIA_ANO || "dia_ano";
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

// Dia do ano (1..365), determinístico pela data
function diaDoAno(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export const revalidate = 3600; // cache 1h

export async function GET() {
  const dia = ((diaDoAno(new Date()) - 1) % 365) + 1; // 1..365

  // Sem Supabase configurado → fallback teaser
  if (!SB_URL || !SB_KEY) {
    const t = TEASER[(dia - 1) % TEASER.length];
    return NextResponse.json({ dia, total: 365, fonte: "teaser", ...t });
  }

  try {
    // Pega exatamente a pergunta de hoje (dia_ano = dia atual)
    const select = encodeURIComponent(`${C_PERGUNTA},${C_AUTOR_DIA},${C_DIA_ANO}`);
    const endpoint =
      `${SB_URL}/rest/v1/${TABLE}` +
      `?select=${select}` +
      `&${C_DIA_ANO}=eq.${dia}` +
      `&limit=1`;

    const r = await fetch(endpoint, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!r.ok) throw new Error(`supabase ${r.status}`);

    const linhas: Record<string, unknown>[] = await r.json();
    if (!linhas?.length) throw new Error("dia sem pergunta");

    const row = linhas[0];
    const slug = String(row[C_AUTOR_DIA] ?? "").toLowerCase().trim();
    const autor = AUTOR_NOME[slug] || "Diariamente";

    return NextResponse.json({
      dia,
      total: 365,
      fonte: "supabase",
      texto: String(row[C_PERGUNTA] ?? ""),
      autor,
    });
  } catch {
    const t = TEASER[(dia - 1) % TEASER.length];
    return NextResponse.json({ dia, total: 365, fonte: "teaser", ...t });
  }
}

// =====================================================================
// PASSO A PASSO PARA PLUGAR (faça quando for conectar):
//
// 1) No Vercel (Settings → Environment Variables), defina:
//      NEXT_PUBLIC_SUPABASE_URL       = https://xycwmtsicuqjswfiohbc.supabase.co
//      NEXT_PUBLIC_SUPABASE_ANON_KEY  = (anon/public key do projeto)
//
// 2) SEGURANÇA (anon key é pública): ligue RLS deixando a tabela
//    `provocacoes` apenas-leitura pública. No SQL Editor do Supabase:
//
//      alter table provocacoes enable row level security;
//      create policy "leitura_publica_provocacoes"
//        on provocacoes for select
//        to anon
//        using (true);
//
//    Isso permite SELECT (ler), mas bloqueia insert/update/delete pelo anon.
//
// 3) Redeploy. O hero passa a mostrar a `pergunta` do dia real,
//    assinada por Brunno Falcão / Roberta Carbonari (via autor_dia).
//    Teste em /api/provocacao-do-dia — campo "fonte" dirá "supabase".
//    Se algo falhar, cai sozinho no teaser (nunca quebra).
// =====================================================================
