import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDaVitrine } from "@/lib/seo";

/* =====================================================================
   /mundo/vendas · SITE DO RESTO DO MUNDO EM STANDBY (mercado rw)
   ---------------------------------------------------------------------
   A vitrine do resto do mundo: o que a "/" vai mostrar, no lançamento,
   para quem é de fora do Brasil, de Portugal, da Espanha e da América
   Latina (o middleware reescreve "/" para /mundo): a página do Brasil
   com o bloco em dólar. Na vitrine o bloco já aparece com o preço, e o
   botão abre o checkout de verdade da Hotmart (CHECKOUT_USD), mesmo com
   rw ainda em vendaAberta: false no lançamento público (decisão do
   dono, 27/10/2026). O antigo /vendas/mundo leva para cá
   (lib/mercado.ts, VITRINE_ANTIGA).

   Rota irmã de app/mundo/page.tsx, que em standby responde 404: o
   notFound() de lá vale só para /mundo, não para /mundo/vendas.

   noindex, fora do sitemap, sem hreflang. O <html lang> fica pt-BR.
   Ligada a chave de lançamento (config/lancamento.ts), o middleware
   redireciona este endereço para "/".
   ===================================================================== */

// Mesma cadência das homes: o preço de lançamento sai sozinho no dia
// seguinte ao FIM_DO_LANCAMENTO, sem novo deploy.
export const revalidate = 3600;

export const metadata = metadataDaVitrine("rw");

export default function VendasMundo() {
  return <PaginaDoMercado mercado="rw" vitrine />;
}
