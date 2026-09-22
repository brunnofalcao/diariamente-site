import type { Metadata } from "next";
import { SITE } from "@/config";
import { EmBreve } from "@/components/EmBreve";

/* /em-breve · lista de espera.
   noindex de propósito: página de captura não deve disputar a busca com
   a página de vendas, e fica fora do mapa de rotas e do sitemap. É
   destino de campanha e de link direto, não de pesquisa orgânica. */

export const metadata: Metadata = {
  title: "Em breve · Diariamente",
  description: "Ainda não é hoje. Mas está perto. Deixe seu contato e avisamos no dia em que abrir.",
  alternates: { canonical: `${SITE.dominio}/em-breve` },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE.dominio}/em-breve`,
    siteName: SITE.nome,
    title: "Ainda não é hoje. Mas está perto.",
    description: "Deixe seu contato e avisamos no dia em que o Diariamente abrir.",
  },
};

export default function Page() {
  return <EmBreve />;
}
