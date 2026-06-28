import { NextResponse } from "next/server";

// =====================================================================
// API: provocação do dia  (hero dinâmico — barra de busca)
// ---------------------------------------------------------------------
// SEGURANÇA: roda no SERVIDOR. A chave do Supabase nunca vai ao navegador.
// O front chama /api/provocacao-do-dia e recebe UMA provocação — nunca a lista.
//
// >>> COMO PLUGAR NO SUPABASE (passo a passo no fim do arquivo) <<<
//
// Variáveis de ambiente (Vercel → Settings → Environment Variables):
//   SUPABASE_URL          = https://SEU-PROJETO.supabase.co
//   SUPABASE_SERVICE_KEY  = (service_role key — só servidor)
//
// Mapeamento de tabela/colunas (têm defaults; ajuste se seus nomes diferem):
//   SUPABASE_TABLE        = conteudo        (a "aba de conteúdo")
//   COL_TITULO            = titulo          (a provocação está aqui, como título)
//   COL_DIA               = dia             (número do dia 1..365)
//   COL_AUTOR             = autor           (opcional)
//   COL_PUBLICA           = publica         (boolean — só expõe as marcadas true)
// =====================================================================

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

const TABLE = process.env.SUPABASE_TABLE || "conteudo";
const C_TITULO = process.env.COL_TITULO || "titulo";
const C_DIA = process.env.COL_DIA || "dia";
const C_AUTOR = process.env.COL_AUTOR || "autor";
const C_PUBLICA = process.env.COL_PUBLICA || "publica";

// Fallback teaser (marketing-safe — NÃO são as provocações reais do livro)
const TEASER = [
  { texto: "O que você está adiando que, no fundo, já sabe que precisa decidir?", autor: "Diariamente" },
  { texto: "Se hoje fosse a única chance de começar, você começaria — ou esperaria estar pronto?", autor: "Diariamente" },
  { texto: "O que você faria diferente se ninguém estivesse olhando o resultado?", autor: "Diariamente" },
  { texto: "Qual conversa você está evitando que mudaria o seu próximo ano?", autor: "Diariamente" },
  { texto: "O que te trouxe até aqui é o mesmo que vai te levar adiante?", autor: "Diariamente" },
  { texto: "Onde você está confundindo conforto com segurança?", autor: "Diariamente" },
  { texto: "O que você constrói quando ninguém te cobra nada?", autor: "Diariamente" },
];

// Dia do ano (1..365), determinístico — todos veem o mesmo no mesmo dia
function diaDoAno(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export const revalidate = 3600; // cache 1h

export async function GET() {
  const dia = ((diaDoAno(new Date()) - 1) % 365) + 1; // 1..365

  // Sem Supabase configurado → fallback teaser (rotaciona pela data)
  if (!SB_URL || !SB_KEY) {
    const t = TEASER[(dia - 1) % TEASER.length];
    return NextResponse.json({ dia, total: 365, fonte: "teaser", ...t });
  }

  try {
    // Busca só as públicas; seleciona título, dia e autor.
    const select = encodeURIComponent(`${C_TITULO},${C_DIA},${C_AUTOR}`);
    const endpoint =
      `${SB_URL}/rest/v1/${TABLE}` +
      `?select=${select}` +
      `&${C_PUBLICA}=eq.true` +
      `&order=${C_DIA}.asc`;

    const r = await fetch(endpoint, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!r.ok) throw new Error(`supabase ${r.status}`);

    const linhas: Record<string, unknown>[] = await r.json();
    if (!linhas?.length) throw new Error("sem provocações públicas");

    // Tenta casar o dia exato; se não houver, rotaciona entre as públicas.
    const doDia = linhas.find((l) => Number(l[C_DIA]) === dia);
    const escolhida = doDia ?? linhas[(dia - 1) % linhas.length];

    return NextResponse.json({
      dia,
      total: 365,
      fonte: "supabase",
      texto: String(escolhida[C_TITULO] ?? ""),
      autor: String(escolhida[C_AUTOR] ?? "Diariamente"),
    });
  } catch {
    // Qualquer falha → fallback teaser (o hero nunca quebra)
    const t = TEASER[(dia - 1) % TEASER.length];
    return NextResponse.json({ dia, total: 365, fonte: "teaser", ...t });
  }
}

// =====================================================================
// PASSO A PASSO PARA PLUGAR (faça quando for conectar):
//
// 1) No Supabase, garanta na sua tabela de conteúdo uma coluna boolean
//    de visibilidade pública. Se ainda não existir:
//
//      alter table conteudo add column if not exists publica boolean default false;
//
// 2) Marque como públicas APENAS 10-15 provocações "vitrine"
//    (NUNCA marque todas — as 365 são o produto pago):
//
//      update conteudo set publica = true where dia in (1,7,14,21,30,45,60,90,120,180);
//
// 3) (Recomendado) Restrinja o acesso anônimo só às públicas via RLS,
//    como defesa extra além da API server-side:
//
//      alter table conteudo enable row level security;
//      create policy "publicas_legiveis" on conteudo
//        for select using (publica = true);
//
// 4) No Vercel, defina as variáveis (Settings -> Environment Variables):
//      SUPABASE_URL          = https://SEU-PROJETO.supabase.co
//      SUPABASE_SERVICE_KEY  = (service_role key)
//    E, se seus nomes diferem dos defaults, ajuste também:
//      SUPABASE_TABLE, COL_TITULO, COL_DIA, COL_AUTOR, COL_PUBLICA
//
// 5) Redeploy. Pronto: o hero passa a puxar do Supabase automaticamente.
//    Teste em /api/provocacao-do-dia — o campo "fonte" dirá "supabase".
//    Se algo falhar, cai sozinho no teaser (campo "fonte":"teaser").
// =====================================================================
