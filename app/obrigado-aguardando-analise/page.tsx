import type { Metadata } from "next";
import { ObrigadoShell } from "@/components/ObrigadoShell";

export const metadata: Metadata = {
  title: "Pagamento em análise",
  description: "Seu pagamento do Diariamente está sendo analisado.",
  robots: { index: false, follow: false },
};

export default function ObrigadoAguardandoAnalise() {
  return <ObrigadoShell estado="aguardando-analise" />;
}
