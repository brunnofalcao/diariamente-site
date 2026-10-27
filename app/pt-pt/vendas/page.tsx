import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /pt-pt/vendas · SITE DE PORTUGAL EM STANDBY (mercado pt)
   ---------------------------------------------------------------------
   A vitrine de Portugal: a página de vendas em pt-PT, em euro, como
   "/pt-pt" vai mostrar quando a chave de lançamento estiver ligada
   (config/lancamento.ts) e a venda de pt aberta (config/pricing.ts). Na
   vitrine o bloco de oferta já aparece com o preço, e o botão abre o
   checkout de verdade da Hotmart (CHECKOUT_EUR_PT), mesmo com pt ainda
   em vendaAberta: false no lançamento público (decisão do dono,
   27/10/2026). O antigo /vendas/pt-pt leva para cá (lib/mercado.ts,
   VITRINE_ANTIGA).

   noindex, fora do sitemap, sem hreflang. O <html lang> vira pt-PT na
   hidratação (components/Home.tsx). Ligada a chave, o middleware
   redireciona este endereço para "/pt-pt".
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("pt");

export default function VendasPortugal() {
  return <PaginaDoMercado mercado="pt" vitrine />;
}
