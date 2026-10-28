import { BaixarApp, metadataDoBaixar } from "@/components/BaixarApp";

// Local es-es. No celular, o middleware já mandou para a loja (302); aqui chega o computador.
// Regras: lib/obrigado.mjs (destinoDoBaixar) e docs/POS-PAGAMENTO.md.

// Lê o user-agent (o celular que chegar aqui vê o botão da loja dele).
export const dynamic = "force-dynamic";

export const metadata = metadataDoBaixar("es-es");

export default function Baixar() {
  return <BaixarApp local="es-es" />;
}
