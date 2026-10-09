import { Home } from "@/components/Home";
import { metadataDaPagina } from "@/lib/seo";

/* =====================================================================
   HOME · PORTUGUÊS · site de vendas
   ---------------------------------------------------------------------
   Virada de lançamento: "/" deixou de ser a lista de espera e passou a
   mostrar o site de vendas. O que mudou junto, e precisa continuar
   coerente se alguém voltar atrás:

   1. lib/seo.ts, bloco home/pt: título e descrição de venda (sem isso o
      Google e a prévia de link continuam dizendo "em breve").
   2. components/Home.tsx: o seletor PT | ES aponta para "/" e "/es".
   3. app/embreve e app/es/embreve: só redirecionam para "/" e "/es",
      para não sobrar cópia da home nem venda em espanhol com preço em real.

   app/es/page.tsx continua "próximamente" de propósito: o espanhol ainda
   não tem preço, checkout nem lojas próprios.

   Para voltar à lista de espera: reverter o commit da virada (ou, na
   Vercel, Instant Rollback para o deploy anterior).
   ===================================================================== */

export const metadata = metadataDaPagina("home", "pt");

export default function Page() {
  return <Home lang="pt" />;
}
