import { redirect } from "next/navigation";
import { comParametros } from "@/lib/rotas";
import { HOME_DO_MERCADO, VENDAS_DO_MERCADO } from "@/lib/mercado";
import { SITE_LANCADO } from "@/config/lancamento";

/* /embreve foi o endereço de trabalho do site de vendas enquanto a home
   era a lista de espera.
   STANDBY (chave de lançamento desligada, config/lancamento.ts): leva ao
   site de vendas em standby, a vitrine do Brasil (/vendas). Quem decide
   é o middleware (lib/mercado.ts, PREVIAS_ANTIGAS); esta página repete a
   regra, com os endereços de lib/mercado.ts.
   LANÇADO: o site de vendas é a própria home, e qualquer link que já
   tenha saído com /embreve cai em "/", sem uma segunda cópia da página. */

// Renderizada a cada pedido, de propósito. Como página estática, o Next
// guarda o redirect como "307 sem Location" e só redireciona com
// JavaScript: robô, prévia de link e curl ficavam parados numa página
// vazia. Dinâmica, a resposta é um 307 de verdade, com Location.
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Os parâmetros (utm, fbclid) vão junto: anúncio antigo não perde a origem.
export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  redirect(comParametros(SITE_LANCADO ? HOME_DO_MERCADO.br : VENDAS_DO_MERCADO.br, searchParams));
}
