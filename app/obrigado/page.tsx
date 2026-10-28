import { redirect } from "next/navigation";
import { comParametros } from "@/lib/rotas";

// Rota antiga mantida por compatibilidade: redireciona para a nova.
// Quem lê em espanhol nem chega aqui: o middleware já leva /obrigado
// direto para /es/gracias-aprobado (lib/obrigado.mjs, destinoDoObrigado),
// com os parâmetros.

// Renderizada a cada pedido, de propósito. Como página estática, o Next
// guarda o redirect como "307 sem Location" e só redireciona com
// JavaScript. Dinâmica, a resposta é um 307 de verdade, com Location.
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Os parâmetros da Hotmart (transaction, price...) vão junto: sem eles o
// PurchaseTracking da página nova perde o id da transação, que é o que
// evita o Meta contar a mesma venda duas vezes.
export default async function ObrigadoLegacy(props: Props) {
  const searchParams = await props.searchParams;
  redirect(comParametros("/obrigado-aprovado", searchParams));
}
