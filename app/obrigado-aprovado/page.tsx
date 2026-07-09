import type { Metadata } from "next";
import { ObrigadoShell } from "@/components/ObrigadoShell";

export const metadata: Metadata = {
  title: "Tudo certo, seu Diariamente está a caminho",
  description: "Confirmação do seu acesso ao Diariamente.",
  robots: { index: false, follow: false },
};

export default function ObrigadoAprovado() {
  return <ObrigadoShell estado="aprovado" />;
}
