import type { Metadata } from "next";
import { Home } from "@/components/Home";
import { metadataPrivada } from "@/lib/seo";
import { SITE } from "@/config";

/* /es-es/embreve · prévia do site de vendas da ESPANHA (EUR).
   noindex, nofollow, fora do sitemap e fora das homes do middleware:
   abre igual de qualquer país. Endereço de trabalho do dono.

   Enquanto /es-es é a lista de espera (config/pricing.ts, es com
   vendaAberta: false e semVenda "pagina"), é AQUI que o texto de venda
   em espanhol e o bloco de 29,99 € ficam visíveis para revisão antes de
   abrir a Espanha (handoff, seção 9). Com a venda fechada, o botão não
   abre o pagamento (Home com `previa`).

   STANDBY (chave de lançamento desligada, config/lancamento.ts): este
   endereço leva a /vendas/es-es, o site em standby, como vai ao ar (o
   middleware decide, lib/mercado.ts, PREVIAS_ANTIGAS). Esta prévia volta
   a abrir quando a chave for ligada. */

export const metadata: Metadata = {
  ...metadataPrivada("vendas", "es"),
  // Canonical da própria prévia: o padrão de "vendas" em espanhol é
  // /es/embreve, que só redireciona para /es.
  alternates: { canonical: SITE.dominio + "/es-es/embreve" },
};

// Mesma cadência das homes: a hora do servidor entra como `momento`.
export const revalidate = 3600;

export default function VendasEs() {
  return <Home lang="es" mercado="es" momento={Date.now()} previa />;
}
