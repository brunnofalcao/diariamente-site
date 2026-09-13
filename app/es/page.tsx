import { Home } from "@/components/Home";
import { metadataDaPagina } from "@/lib/seo";

/* /es · ESPANHOL. Site próprio, com ativos independentes. */
export const metadata = metadataDaPagina("home", "es");

export default function PaginaEs() {
  return <Home lang="es" />;
}
