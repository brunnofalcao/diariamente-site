import { EmBreve } from "@/components/EmBreve";
import { metadataDoMercado } from "@/lib/seo";

/* /es-es · HOME DA ESPANHA · lista de espera.
   Mesmo motivo de /pt-pt: o middleware manda todo visitante espanhol
   para cá. A prévia de vendas em euro fica em /es-es/embreve. */

export const metadata = metadataDoMercado("es");

export default function PaginaEsEs() {
  return <EmBreve lang="es" />;
}
