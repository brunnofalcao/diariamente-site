import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDoMercado } from "@/lib/seo";

/* =====================================================================
   /es · HOME DA AMÉRICA LATINA (mercado la, plano em dólar)
   ---------------------------------------------------------------------
   Enquanto o plano USD não existir e o acervo em espanhol não estiver
   revisado (handoff, seção 9), mostra a lista de espera em espanhol,
   como antes da virada. Para abrir a venda: em config/pricing.ts,
   mercado la, vendaAberta: true (a trava do build exige o link do plano).
   Em standby (chave de lançamento desligada, config/lancamento.ts), é a
   lista de espera de qualquer jeito; o que vai ao ar: /vendas/es.
   ===================================================================== */

export const revalidate = 3600;

export const metadata = metadataDoMercado("la");

export default function PaginaEs() {
  return <PaginaDoMercado mercado="la" />;
}
