import { PaginaDoMercado } from "@/components/PaginaDoMercado";
import { metadataDoMercado } from "@/lib/seo";

/* =====================================================================
   "/" · HOME DO BRASIL · site de vendas
   ---------------------------------------------------------------------
   STANDBY (chave de lançamento desligada, config/lancamento.ts): "/"
   mostra a lista de espera ("Em breve"), como antes do lançamento, e o
   site de vendas fica em /vendas (app/vendas/page.tsx).

   Com a chave ligada, "/" é o site de vendas. Preço, oferta de
   lançamento e link do checkout saem de config/pricing.ts (mercado br).

   Visitante de fora do Brasil, de Portugal, da Espanha e da América
   Latina: o middleware reescreve "/" para /mundo (mesma página, bloco em
   dólar), sem mudar a URL. Portugal, Espanha e América Latina vão para
   as suas homes (/pt-pt, /es-es, /es).

   Para voltar à lista de espera: desligar a chave (tirar DM_SITE_LANCADO
   da Vercel e fazer um novo deploy) ou, na Vercel, Instant Rollback para o
   deploy anterior.
   ===================================================================== */

// A página se refaz a cada hora: é o que tira o preço de lançamento no
// dia seguinte ao FIM_DO_LANCAMENTO, sem depender de novo deploy.
export const revalidate = 3600;

export const metadata = metadataDoMercado("br");

export default function Page() {
  return <PaginaDoMercado mercado="br" />;
}
