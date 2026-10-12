import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDoMercado } from "@/lib/seo";

/* =====================================================================
   /pt-pt · HOME DE PORTUGAL (mercado pt, plano em euro)
   ---------------------------------------------------------------------
   A mesma página de "/", com o dicionário pt-PT e o mercado pt. Enquanto
   o plano EUR não existir na Hotmart, o bloco de oferta é a lista de
   espera de Portugal, sem preço. Para abrir a venda: em
   config/pricing.ts, mercado pt, vendaAberta: true (a trava do build
   exige o link do plano EUR). Para revisar o bloco de 29,99 € antes
   disso: /pt-pt/embreve (prévia noindex).
   ===================================================================== */

export const revalidate = 3600;

export const metadata = metadataDoMercado("pt");

export default function PaginaPt() {
  return <PaginaDoMercado mercado="pt" />;
}
