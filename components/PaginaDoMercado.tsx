import { Home } from "@/components/Home";
import { EmBreve } from "@/components/EmBreve";
import { MERCADOS, type Mercado } from "@/config/pricing";

/* =====================================================================
   HOME DE UM MERCADO · uma página só para as cinco
   ---------------------------------------------------------------------
   "/" (br), "/pt-pt" (pt), "/es" (la), "/es-es" (es) e a rota interna do
   resto do mundo (rw, servida em "/") renderizam ESTE componente, com o
   mercado como parâmetro. Nenhuma cópia mantida à parte: idioma, preço,
   moeda, link e textos saem de config/pricing.ts e do dicionário.

   Com a venda do mercado fechada (vendaAberta: false):
     semVenda "bloco"   a página de vendas, com a lista de espera no
                        lugar do bloco de oferta (pt e rw)
     semVenda "pagina"  a home inteira é a lista de espera (la e es,
                        enquanto o acervo em espanhol não está revisado)

   `momento` é a hora do servidor no render. As homes se refazem a cada
   hora (revalidate), e é assim que o preço de lançamento sai sozinho no
   dia seguinte ao FIM_DO_LANCAMENTO.
   ===================================================================== */

export function PaginaDoMercado({ mercado }: { mercado: Mercado }) {
  const o = MERCADOS[mercado];
  if (!o.vendaAberta && o.semVenda === "pagina") {
    return <EmBreve lang={o.idioma} mercado={mercado} />;
  }
  return <Home lang={o.idioma} mercado={mercado} momento={Date.now()} />;
}
