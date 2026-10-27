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
                          vendas aparece só com `vitrine`
     ligada               as homes públicas são o site de vendas

   `vitrine`: as páginas /vendas, /es/vendas, /es-es/vendas,
   /pt-pt/vendas e /mundo/vendas (lib/mercado.ts, VENDAS_DO_MERCADO).
   Cada uma mostra o site de vendas do mercado como ele vai ao ar QUANDO
   A VENDA DELE ABRIR: a página inteira, com o bloco de oferta de venda
   (preço na moeda do mercado e o botão para o checkout de verdade),
   inclusive la, es, pt e rw, que seguem com vendaAberta: false no
   lançamento público (decisão do dono, 27/10/2026: "Eu quero acessar
   todas as paginas de vendas que temos."). Os links entre mercados ficam
   na vitrine.

   Fora da vitrine, com a venda do mercado fechada (vendaAberta: false):
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
  // Ligada a chave, a vitrine some: o middleware leva à home real e, se a
  // página chegar a renderizar, ela segue as regras públicas do mercado
  // (fechado continua sem venda).
  const naVitrine = vitrine && !SITE_LANCADO;
  if (!SITE_LANCADO && !naVitrine) {
    return <EmBreve lang={o.idioma} mercado={mercado} />;
  }
  if (!naVitrine && !o.vendaAberta && o.semVenda === "pagina") {
    return <EmBreve lang={o.idioma} mercado={mercado} />;
  }
  return <Home lang={o.idioma} mercado={mercado} momento={Date.now()} vitrine={naVitrine} />;
}
