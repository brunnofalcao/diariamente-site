import { NextResponse, type NextRequest } from "next/server";
import { MERCADOS, linkComCupom, pendente } from "@/config/pricing";

/* =====================================================================
   /estudante/ativar?cupom=CODIGO · ponte do botão do WhatsApp
   ---------------------------------------------------------------------
   O botão do template diariamente_estudante_aprovado é uma URL dinâmica
   cuja base mora no painel da Meta. Hoje ela aponta direto para o link
   antigo da Hotmart (L107085210M), e cada troca de plano exigiria editar
   e reaprovar o template.

   Com a base do template apontando para cá
   (https://diariamente.app/estudante/ativar?cupom={{1}}), o link do
   checkout passa a nascer de config/pricing.ts (CHECKOUT_BRL, produto
   7448309) com o cupom no mesmo parâmetro offDiscount: trocar de plano é
   editar o config, nunca o template. Enquanto o template não mudar,
   nada muda para o estudante (lib/whatsapp.js segue mandando só o código).

   Sem o link preenchido, ou com código fora do formato, volta para
   /estudante em vez de abrir um checkout quebrado.
   ===================================================================== */

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const cupom = (req.nextUrl.searchParams.get("cupom") || "").trim().toUpperCase();
  const base = MERCADOS.br.checkout;
  if (!/^[A-Z0-9_-]{1,25}$/.test(cupom) || pendente(base)) {
    return NextResponse.redirect(new URL("/estudante", req.url), 307);
  }
  return NextResponse.redirect(linkComCupom(base, cupom), 307);
}
