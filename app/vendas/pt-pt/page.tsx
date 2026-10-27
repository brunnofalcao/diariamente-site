import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /vendas/pt-pt · SITE DE PORTUGAL EM STANDBY (mercado pt)
   ---------------------------------------------------------------------
   O que "/pt-pt" vai mostrar quando a chave de lançamento for ligada
   (config/lancamento.ts): a página de vendas em pt-PT, com a lista de
   espera no lugar do bloco de oferta enquanto a venda de pt estiver
   fechada (config/pricing.ts, semVenda "bloco"). noindex, fora do
   sitemap, sem hreflang. Ligada a chave, o middleware redireciona este
   endereço para "/pt-pt".
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("pt");

export default function VendasPortugal() {
  return <PaginaDoMercado mercado="pt" vitrine />;
}
