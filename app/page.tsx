import { EmBreve } from "@/components/EmBreve";
import { metadataDaPagina } from "@/lib/seo";

/* =====================================================================
   HOME · PORTUGUÊS · "em breve"
   ---------------------------------------------------------------------
   Enquanto o site de vendas é estruturado em /embreve, a home pública é
   a lista de espera.

   NA VIRADA DE LANÇAMENTO, troque as duas linhas abaixo por:

     import { Home } from "@/components/Home";
     export default function Page() { return <Home lang="pt" />; }

   e faça o mesmo em app/es/page.tsx. Nada mais precisa mudar.
   ===================================================================== */

export const metadata = metadataDaPagina("home", "pt");

export default function Page() {
  return <EmBreve lang="pt" />;
}
