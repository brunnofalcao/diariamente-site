import { notFound } from "next/navigation";
import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDoMercado } from "@/lib/seo";
import { SITE_LANCADO } from "@/config/lancamento";

/* =====================================================================
   /mundo · ROTA INTERNA do resto do mundo (mercado rw)
   ---------------------------------------------------------------------
   Nunca é endereço público. O middleware reescreve "/" para cá quando o
   visitante é de um país fora de BR, PT, ES e América Latina (ou escolheu
   rw): a barra continua mostrando "/". Quem pede /mundo direto volta para
   "/". É a página do Brasil com o bloco de oferta em dólar (US$ 29,99,
   mesma oferta da América Latina). Hoje rw está FECHADO até o dono
   confirmar a abertura (config/pricing.ts, vendaAberta: false): o bloco
   vira a lista de espera. Aberto, o botão leva ao CHECKOUT_USD.

   Metadata igual à de "/": canonical "/", e o mesmo hreflang. Nada de
   noindex aqui: esta resposta é servida na URL "/", e um noindex
   escaparia para a home brasileira.

   STANDBY (chave de lançamento desligada, config/lancamento.ts): não há
   reescrita e /mundo responde 404, como antes do lançamento. O que vai
   ao ar para o resto do mundo pode ser visto em /mundo/vendas (rota
   irmã, app/mundo/vendas/page.tsx: o 404 daqui não a alcança).
   ===================================================================== */

export const revalidate = 3600;

export const metadata = metadataDoMercado("br");

export default function PaginaMundo() {
  if (!SITE_LANCADO) notFound();
  return <PaginaDoMercado mercado="rw" />;
}
