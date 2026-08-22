import type { Metadata } from "next";
import { ObrigadoShell } from "@/components/ObrigadoShell";
import { PurchaseTracking } from "@/components/PurchaseTracking";

export const metadata: Metadata = {
  title: "Tudo certo, seu Diariamente está a caminho",
  description: "Confirmação do seu acesso ao Diariamente.",
  robots: { index: false, follow: false },
};

export default function ObrigadoAprovado() {
  return (
    <>
      {/* Purchase dispara SÓ aqui. Nas telas de boleto/Pix pendente e de
          análise a venda ainda não existe: disparar lá inflaria o pixel. */}
      <PurchaseTracking />
      <ObrigadoShell estado="aprovado" />
    </>
  );
}
