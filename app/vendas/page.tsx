import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /vendas · SITE DE VENDAS DO BRASIL EM STANDBY (mercado br)
   ---------------------------------------------------------------------
   Decisão do dono (27/10/2026): o site de vendas fica em standby e é
   visto aqui, exatamente como vai ao ar quando a chave de lançamento for
   ligada (config/lancamento.ts): a mesma página de "/", com o mesmo
   preço, oferta, link e botões (config/pricing.ts, mercado br).

   noindex, nofollow, fora do sitemap e sem hreflang (metadataDaVitrine).
   Os links para outro mercado ficam dentro de /vendas. Ligada a chave, o
   middleware redireciona este endereço para "/".

   O botão abre o checkout de verdade da Hotmart: pagar por aqui antes do
   passo (a) do LEIA-ME (webhook do app) deixa a pessoa sem conta.
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("br");

export default function VendasBrasil() {
  return <PaginaDoMercado mercado="br" vitrine />;
}
