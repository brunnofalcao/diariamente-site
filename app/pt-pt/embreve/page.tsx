import { Home } from "@/components/Home";
import { metadataPrivada } from "@/lib/seo";

/* /pt-pt/embreve · prévia do site de vendas de PORTUGAL (EUR).
   noindex, nofollow, fora do sitemap. Endereço de trabalho. */

export const metadata = metadataPrivada("vendas", "pt");

export default function VendasPt() {
  return <Home lang="pt" mercado="pt" />;
}
