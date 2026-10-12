import type { Metadata } from "next";
import { Home } from "@/components/Home";
import { metadataPrivada } from "@/lib/seo";
import { SITE } from "@/config";

/* /pt-pt/embreve · prévia do site de vendas de PORTUGAL (EUR).
   noindex, nofollow, fora do sitemap e fora das homes do middleware:
   abre igual de qualquer país. Endereço de trabalho do dono.

   Enquanto /pt-pt mostra a lista de espera no lugar do bloco de oferta
   (config/pricing.ts, pt com vendaAberta: false), é AQUI que o bloco de
   29,99 € fica visível para revisão antes de abrir Portugal. Com a venda
   fechada, o botão não abre o pagamento (Home com `previa`). */

export const metadata: Metadata = {
  ...metadataPrivada("vendas", "pt"),
  // Canonical da própria prévia: o padrão de "vendas" em português é
  // /embreve, que só redireciona para "/".
  alternates: { canonical: SITE.dominio + "/pt-pt/embreve" },
};

// Mesma cadência das homes: a hora do servidor entra como `momento`.
export const revalidate = 3600;

export default function VendasPt() {
  return <Home lang="pt" mercado="pt" momento={Date.now()} previa />;
}
