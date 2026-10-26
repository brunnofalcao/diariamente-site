import { redirect } from "next/navigation";
import { paraObrigadoAprovado } from "@/lib/obrigado.mjs";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Rota antiga mantida por compatibilidade: redireciona para a nova, com a
// mesma query string. Sem ela, ?lang=es e o transaction (que o
// PurchaseTracking usa como eventID) se perdiam no caminho.
export default async function ObrigadoLegacy(props: Props) {
  redirect(paraObrigadoAprovado(await props.searchParams));
}
