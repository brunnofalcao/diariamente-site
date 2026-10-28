import { BaixarApp, metadataDoBaixar } from "@/components/BaixarApp";

// Local pt-pt. No celular, o middleware já mandou para a loja (302); aqui chega o computador.
// Regras: lib/obrigado.mjs (destinoDoBaixar) e docs/POS-PAGAMENTO.md.

// Lê o user-agent (o celular que chegar aqui vê o botão da loja dele).
export const dynamic = "force-dynamic";

export const metadata = metadataDoBaixar("pt-pt");

export default function Baixar() {
  return <BaixarApp local="pt-pt" />;
}
