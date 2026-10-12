import { NextResponse, type NextRequest } from "next/server";
import { MERCADOS, linkComCupom, pendente } from "@/config/pricing";

/* =====================================================================
   /estudante/ativar?cupom=CODIGO · ponte do botão do WhatsApp
   ---------------------------------------------------------------------
   Fluxo do estudante (o original, retomado em 12/10/2026): aprovado o
   estudante, o site cria o cupom PESSOAL dele pela API da Hotmart
   (app/api/estudante/solicitar), o WhatsApp manda só o código, e o
   botão do modelo v2 aponta para cá:
     https://diariamente.app/estudante/ativar?cupom={{1}}

   Esta rota confere o formato do código e abre a OFERTA OFICIAL do
   Brasil (CHECKOUT_BRL de config/pricing.ts, off=fhrttdh8, R$ 149,90)
   com offDiscount=<cupom>: o checkout já abre com o desconto. O webhook
   do site apaga o cupom na aprovação do pagamento (uso único). Trocar
   de oferta é editar o config, nunca o modelo da Meta. O nome do modelo
   que sai mora em WA_TEMPLATE_ESTUDANTE (lib/whatsapp.js).

   Nunca a oferta de lançamento: o cupom do estudante incide sobre o
   preço cheio, como a /estudante anuncia.

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
