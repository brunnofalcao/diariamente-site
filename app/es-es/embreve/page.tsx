import { Home } from "@/components/Home";
import { metadataPrivada } from "@/lib/seo";

/* /es-es/embreve · prévia do site de vendas da ESPANHA (EUR). */

export const metadata = metadataPrivada("vendas", "es");

export default function VendasEs() {
  return <Home lang="es" mercado="es" />;
}
