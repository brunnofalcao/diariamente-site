import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /es/vendas · SITE DA AMÉRICA LATINA EM STANDBY (mercado la)
   ---------------------------------------------------------------------
   A vitrine da América Latina: o site de vendas em espanhol, em dólar,
   como "/es" vai mostrar quando a chave de lançamento estiver ligada
   (config/lancamento.ts) e a venda de la aberta (config/pricing.ts). Na
   vitrine a venda já aparece aberta, com o preço, e o botão abre o
   checkout de verdade da Hotmart (CHECKOUT_USD), mesmo com la ainda em
   vendaAberta: false no lançamento público (decisão do dono,
   27/10/2026). O idioma vem primeiro no endereço; o antigo /vendas/es
   leva para cá (lib/mercado.ts, VITRINE_ANTIGA).

   noindex, fora do sitemap, sem hreflang. O <html lang> vira es-419 na
   hidratação (components/Home.tsx), como em "/es". Ligada a chave, o
   middleware redireciona este endereço para "/es".
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("la");

export default function VendasAmericaLatina() {
  return <PaginaDoMercado mercado="la" vitrine />;
}
