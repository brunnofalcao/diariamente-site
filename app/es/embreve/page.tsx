import { Home } from "@/components/Home";
import { metadataPrivada } from "@/lib/seo";

/* /es/embreve · SITE DE VENDAS EM CONSTRUÇÃO · ESPANHOL */

export const metadata = metadataPrivada("vendas", "es");

export default function VentasEs() {
  return <Home lang="es" />;
}
