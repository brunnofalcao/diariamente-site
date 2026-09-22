import { EmBreve } from "@/components/EmBreve";
import { metadataDaPagina } from "@/lib/seo";

/* HOME · ESPANHOL · "próximamente"
   Precisa espelhar a home portuguesa: o middleware manda todo navegador
   em espanhol para cá. Se esta rota mostrasse o site de vendas, ele
   estaria público para todo o público hispânico. */

export const metadata = metadataDaPagina("home", "es");

export default function PaginaEs() {
  return <EmBreve lang="es" />;
}
