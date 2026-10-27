import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDoMercado } from "@/lib/seo";

/* =====================================================================
   /es-es · HOME DA ESPANHA (mercado es, plano em euro)
   ---------------------------------------------------------------------
   A mesma página de /es, com o mercado es. Enquanto o plano EUR e o
   acervo em espanhol revisado não existirem, mostra a lista de espera
   em espanhol. Para abrir a venda: config/pricing.ts, mercado es,
   vendaAberta: true. Para revisar a página de vendas antes disso:
   /es-es/embreve (prévia noindex, com a chave de lançamento ligada).
   Em standby (config/lancamento.ts), é a lista de espera de qualquer
   jeito; o que vai ao ar: /es-es/vendas.
   ===================================================================== */

export const revalidate = 3600;

export const metadata = metadataDoMercado("es");

export default function PaginaEsEs() {
  return <PaginaDoMercado mercado="es" />;
}
