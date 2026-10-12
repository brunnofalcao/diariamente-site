import { EmBreve } from "@/components/EmBreve";
import { metadataDoMercado } from "@/lib/seo";

/* =====================================================================
   /pt-pt · HOME DE PORTUGAL · lista de espera
   ---------------------------------------------------------------------
   Esta é home PÚBLICA. Enquanto o site estiver oculto, ela mostra a
   lista de espera, igual a "/" e "/es". O middleware manda todo
   visitante de Portugal para cá: se renderizasse o site de vendas, ele
   estaria no ar para o país inteiro.

   A prévia do site de vendas com a oferta em euro vive em
   /pt-pt/embreve, com noindex.

   NA VIRADA, troque as duas linhas por:
     import { Home } from "@/components/Home";
     export default function PaginaPt() { return <Home lang="pt" mercado="pt" />; }
   ===================================================================== */

export const metadata = metadataDoMercado("pt");

export default function PaginaPt() {
  return <EmBreve lang="pt" />;
}
