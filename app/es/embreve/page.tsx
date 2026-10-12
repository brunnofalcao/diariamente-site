import { redirect } from "next/navigation";
import { comParametros } from "@/lib/rotas";

/* /es/embreve mostrava o site de vendas em espanhol, com preço em real e
   o checkout brasileiro. Até o espanhol ter preço, checkout e lojas
   próprios, quem chega aqui vai para /es ("próximamente"). */

// Renderizada a cada pedido, de propósito. Como página estática, o Next
// guarda o redirect como "307 sem Location" e só redireciona com
// JavaScript: robô, prévia de link e curl ficavam parados numa página
// vazia. Dinâmica, a resposta é um 307 de verdade, com Location.
export const dynamic = "force-dynamic";

type Props = { searchParams: Record<string, string | string[] | undefined> };

// Os parâmetros (utm, fbclid) vão junto: anúncio antigo não perde a origem.
export default function Page({ searchParams }: Props) {
  redirect(comParametros("/es", searchParams));
}
