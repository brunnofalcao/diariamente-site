import { redirect } from "next/navigation";

// Rota antiga mantida por compatibilidade: redireciona para a nova.
export default function ObrigadoLegacy() {
  redirect("/obrigado-aprovado");
}
