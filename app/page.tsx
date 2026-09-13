import { Home } from "@/components/Home";
import { metadataDaPagina } from "@/lib/seo";

/* Raiz · PORTUGUÊS. Idioma prioritário e destino do x-default. */
export const metadata = metadataDaPagina("home", "pt");

export default function Page() {
  return <Home lang="pt" />;
}
