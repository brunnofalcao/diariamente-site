import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /es-es/vendas · SITE DA ESPANHA EM STANDBY (mercado es)
   ---------------------------------------------------------------------
   A vitrine da Espanha: o site de vendas em espanhol, em euro, como
   "/es-es" vai mostrar quando a chave de lançamento estiver ligada
   (config/lancamento.ts) e a venda de es aberta (config/pricing.ts). Na
   vitrine a venda já aparece aberta, com o preço, e o botão abre o
   checkout de verdade da Hotmart (CHECKOUT_EUR_ES), mesmo com es ainda
   em vendaAberta: false no lançamento público (decisão do dono,
   27/10/2026). O antigo /vendas/es-es leva para cá (lib/mercado.ts,
   VITRINE_ANTIGA).

   noindex, fora do sitemap, sem hreflang. O <html lang> vira es-ES na
   hidratação (components/Home.tsx). Ligada a chave, o middleware
   redireciona este endereço para "/es-es".
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("es");

export default function VendasEspanha() {
  return <PaginaDoMercado mercado="es" vitrine />;
}
