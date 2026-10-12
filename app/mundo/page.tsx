import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDoMercado } from "@/lib/seo";

/* =====================================================================
   /mundo · ROTA INTERNA do resto do mundo (mercado rw)
   ---------------------------------------------------------------------
   Nunca é endereço público. O middleware reescreve "/" para cá quando o
   visitante é de um país fora de BR, PT, ES e América Latina (ou escolheu
   rw): a barra continua mostrando "/". Quem pede /mundo direto volta para
   "/". É a página do Brasil com o bloco de oferta em dólar. rw abre junto
   com o Brasil (config/pricing.ts, vendaAberta: true), então o build de
   produção trava até o CHECKOUT_USD existir; com rw em vendaAberta:
   false, o bloco vira a lista de espera.

   Metadata igual à de "/": canonical "/", e o mesmo hreflang. Nada de
   noindex aqui: esta resposta é servida na URL "/", e um noindex
   escaparia para a home brasileira.
   ===================================================================== */

export const revalidate = 3600;

export const metadata = metadataDoMercado("br");

export default function PaginaMundo() {
  return <PaginaDoMercado mercado="rw" />;
}
