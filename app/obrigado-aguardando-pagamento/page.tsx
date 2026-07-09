import type { Metadata } from "next";
import { ObrigadoShell } from "@/components/ObrigadoShell";

export const metadata: Metadata = {
  title: "Aguardando confirmação do pagamento",
  description: "Seu pedido do Diariamente está aguardando pagamento.",
  robots: { index: false, follow: false },
};

export default function ObrigadoAguardandoPagamento() {
  return <ObrigadoShell estado="aguardando-pagamento" />;
}
