import { Home } from "@/components/Home";
import { metadataPrivada } from "@/lib/seo";

/* /embreve · SITE DE VENDAS EM CONSTRUÇÃO · PORTUGUÊS
   noindex, nofollow, fora do sitemap. Endereço de trabalho, não de
   busca. Quem tiver o link acessa normalmente. */

export const metadata = metadataPrivada("vendas", "pt");

export default function Vendas() {
  return <Home lang="pt" />;
}
