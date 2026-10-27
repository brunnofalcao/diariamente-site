import { redirect } from "next/navigation";
import { comParametros } from "@/lib/rotas";
import { SITE_LANCADO } from "@/config/lancamento";

/* /es/embreve mostrava o site de vendas em espanhol, com preço em real e
   o checkout brasileiro.
   STANDBY (chave de lançamento desligada, config/lancamento.ts): leva ao
   site em standby da América Latina, /vendas/es (o middleware decide,
   lib/mercado.ts, PREVIAS_ANTIGAS; esta página repete a regra).
   LANÇADO: até o espanhol ter preço, checkout e lojas próprios, quem
   chega aqui vai para /es ("próximamente"). */

// Renderizada a cada pedido, de propósito. Como página estática, o Next
// guarda o redirect como "307 sem Location" e só redireciona com
// JavaScript: robô, prévia de link e curl ficavam parados numa página
// vazia. Dinâmica, a resposta é um 307 de verdade, com Location.
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Os parâmetros (utm, fbclid) vão junto: anúncio antigo não perde a origem.
export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  redirect(comParametros(SITE_LANCADO ? "/es" : "/vendas/es", searchParams));
}
