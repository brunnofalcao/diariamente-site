import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /vendas/es · SITE DA AMÉRICA LATINA EM STANDBY (mercado la)
   ---------------------------------------------------------------------
   O que "/es" vai mostrar quando a chave de lançamento for ligada
   (config/lancamento.ts). Hoje, com a venda de la fechada e semVenda
   "pagina" (config/pricing.ts), é a lista de espera em espanhol, a mesma
   do lançamento. noindex, fora do sitemap, sem hreflang. Ligada a chave,
   o middleware redireciona este endereço para "/es".
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("la");

export default function VendasAmericaLatina() {
  return <PaginaDoMercado mercado="la" vitrine />;
}
