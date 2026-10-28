import { BaixarApp, metadataDoBaixar } from "@/components/BaixarApp";

// Espanhol da América Latina: o QR code das páginas em espanhol abre aqui.
// No celular, o middleware já mandou para a loja em espanhol (302); aqui
// chega o computador. Regras: lib/obrigado.mjs (destinoDoBaixar) e
// docs/POS-PAGAMENTO.md.

// Lê o user-agent (o celular que chegar aqui vê o botão da loja dele).
export const dynamic = "force-dynamic";

export const metadata = metadataDoBaixar("es");

export default function Descargar() {
  return <BaixarApp local="es" />;
}
