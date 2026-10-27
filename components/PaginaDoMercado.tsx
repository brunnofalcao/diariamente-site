import { Home } from "@/components/Home";
import { EmBreve } from "@/components/EmBreve";
import { MERCADOS, type Mercado } from "@/config/pricing";
import { SITE_LANCADO } from "@/config/lancamento";

/* =====================================================================
   HOME DE UM MERCADO · uma página só para as cinco
   ---------------------------------------------------------------------
   "/" (br), "/pt-pt" (pt), "/es" (la), "/es-es" (es) e a rota interna do
   resto do mundo (rw, servida em "/") renderizam ESTE componente, com o
   mercado como parâmetro. Nenhuma cópia mantida à parte: idioma, preço,
   moeda, link e textos saem de config/pricing.ts e do dicionário.

   CHAVE DE LANÇAMENTO (config/lancamento.ts):
     desligada (standby)  as homes públicas mostram a lista de espera
                          ("Em breve"), como antes do lançamento; o site de
                          vendas aparece só com `vitrine`, em /vendas/*
     ligada               as homes públicas são o site de vendas

   `vitrine`: as páginas /vendas, /vendas/es, /vendas/es-es,
   /vendas/pt-pt e /vendas/mundo. Mostram o que a home do mercado vai
   mostrar no lançamento, e os links entre mercados ficam dentro de
   /vendas (lib/mercado.ts, VENDAS_DO_MERCADO).

   Com a venda do mercado fechada (vendaAberta: false):
     semVenda "bloco"   a página de vendas, com a lista de espera no
                        lugar do bloco de oferta (pt e rw)
     semVenda "pagina"  a home inteira é a lista de espera (la e es,
                        enquanto o acervo em espanhol não está revisado)

   `momento` é a hora do servidor no render. As homes se refazem a cada
   hora (revalidate), e é assim que o preço de lançamento sai sozinho no
   dia seguinte ao FIM_DO_LANCAMENTO.
   ===================================================================== */

export function PaginaDoMercado({ mercado, vitrine = false }: { mercado: Mercado; vitrine?: boolean }) {
  const o = MERCADOS[mercado];
  if (!SITE_LANCADO && !vitrine) {
    return <EmBreve lang={o.idioma} mercado={mercado} />;
  }
  if (!o.vendaAberta && o.semVenda === "pagina") {
    return <EmBreve lang={o.idioma} mercado={mercado} vitrine={vitrine} />;
  }
  return <Home lang={o.idioma} mercado={mercado} momento={Date.now()} vitrine={vitrine} />;
}
