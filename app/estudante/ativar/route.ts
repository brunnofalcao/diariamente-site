import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkoutDoEstudante, faseDoEstudante, ofertaDoEstudante } from "@/config/pricing";
import { SITE_LANCADO } from "@/config/lancamento";

/* =====================================================================
   /estudante/ativar?cupom=TOKEN · ponte do botão do WhatsApp e do e-mail
   ---------------------------------------------------------------------
   Fluxo do estudante (decisão do dono, 28/10/2026): aprovado o pedido,
   o site grava um LINK PESSOAL (token aleatório em
   cupons_estudante.codigo, sem cupom na Hotmart: a API de cupons não
   aceita produto de assinatura), e o botão "Concluir inscrição" do modelo
   diariamente_estudante_aprovado_v2 aponta para cá:
     https://www.diariamente.app/estudante/ativar?cupom={{1}}
   (com www, o SITE.dominio do config.ts: sem www a Vercel responde 308.)
   O parâmetro se chama "cupom" porque é o que o modelo aprovado na Meta
   tem; o valor é o token. O modelo NÃO muda.

   Token conhecido: 302 para a OFERTA de estudante da fase vigente NA HORA
   DO CLIQUE (config/pricing.ts, checkoutDoEstudante): R$ 59,90 por ano
   nos 3 primeiros anos para quem assinar até 16/11/2026, R$ 79,90 depois.
   Quem foi aprovado no lançamento e abre o link depois de 16/11 cai na
   de R$ 79,90 (por isso o texto do lançamento diz "para quem assinar até
   16 de novembro"). O link não vence: expira_em é só o prazo de envio do
   WhatsApp pelo cron.

   O token vai junto no sck (PARAMETRO_RASTREIO): é aleatório, não é dado
   da pessoa, e a Hotmart o devolve no webhook da venda
   (data.purchase.origin.sck), onde o webhook do site o usa para marcar o
   link como usado. Sem ele, o webhook acha a pessoa pelo e-mail.

   Volta para /estudante (307), sem abrir checkout nenhum, quando:
     - a chave de lançamento está desligada (STANDBY: a /estudante é a da
       produção e nenhum endereço público abre o checkout do 7448309);
     - o token falta ou está fora do formato;
     - a fase vigente não tem o código da oferta (a /estudante, fechada,
       explica);
     - o token não existe no banco, foi revogado à mão (status
       "revogado" ou "cancelado") ou o banco não respondeu.
   ===================================================================== */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/** Status que o dono pode pôr à mão para desligar um link (fraude). */
const REVOGADOS = new Set(["revogado", "cancelado"]);

function banco() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !chave) return null;
  return createClient(url, chave, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  const token = (req.nextUrl.searchParams.get("cupom") || "").trim().toUpperCase();
  const voltar = () => NextResponse.redirect(new URL("/estudante", req.url), 307);
  if (!SITE_LANCADO || !/^[A-Z0-9_-]{1,25}$/.test(token)) return voltar();

  const agora = Date.now();
  const destino = checkoutDoEstudante(agora, token);
  if (!destino) return voltar();

  let linha: { id: string; lead_id: string | null; status: string | null } | null = null;
  const db = banco();
  if (!db) {
    console.error("[estudante/ativar] SUPABASE_URL ou SUPABASE_SERVICE_KEY ausente");
    return voltar();
  }
  try {
    const { data, error } = await db
      .from("cupons_estudante")
      .select("id, lead_id, status")
      .eq("codigo", token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    linha = data;
  } catch (e) {
    console.error("[estudante/ativar] consulta do token falhou:", e instanceof Error ? e.message : e);
    return voltar();
  }
  if (!linha || REVOGADOS.has(String(linha.status || ""))) return voltar();

  // Registro do clique (fase e oferta da hora): não bloqueia o redirecionamento.
  try {
    await db.from("log_estudante").insert({
      lead_id: linha.lead_id, acao: "link_aberto",
      detalhe: { codigo: token, fase: faseDoEstudante(agora), oferta: ofertaDoEstudante(agora), status: linha.status },
      ator: "sistema",
    });
  } catch {
    /* o log é conveniência */
  }

  return NextResponse.redirect(destino, 302);
}
