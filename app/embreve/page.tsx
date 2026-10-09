import { redirect } from "next/navigation";
import { comParametros } from "@/lib/rotas";

/* /embreve foi o endereço de trabalho do site de vendas enquanto a home
   era a lista de espera. Desde a virada, o site de vendas é a própria
   home: qualquer link que já tenha saído com /embreve cai em "/", e não
   sobra uma segunda cópia da página. */

// Renderizada a cada pedido, de propósito. Como página estática, o Next
// guarda o redirect como "307 sem Location" e só redireciona com
// JavaScript: robô, prévia de link e curl ficavam parados numa página
// vazia. Dinâmica, a resposta é um 307 de verdade, com Location.
export const dynamic = "force-dynamic";

type Props = { searchParams: Record<string, string | string[] | undefined> };

// Os parâmetros (utm, fbclid) vão junto: anúncio antigo não perde a origem.
export default function Page({ searchParams }: Props) {
  redirect(comParametros("/", searchParams));
}
