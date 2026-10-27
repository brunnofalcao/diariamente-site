import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /vendas/mundo · SITE DO RESTO DO MUNDO EM STANDBY (mercado rw)
   ---------------------------------------------------------------------
   O que a "/" vai mostrar, no lançamento, para quem é de fora do Brasil,
   de Portugal, da Espanha e da América Latina (o middleware reescreve "/"
   para /mundo): a página do Brasil com o bloco em dólar, ou a lista de
   espera no bloco enquanto rw estiver fechado (config/pricing.ts).
   noindex, fora do sitemap, sem hreflang. Ligada a chave de lançamento
   (config/lancamento.ts), o middleware redireciona este endereço para "/".
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("rw");

export default function VendasMundo() {
  return <PaginaDoMercado mercado="rw" vitrine />;
}
