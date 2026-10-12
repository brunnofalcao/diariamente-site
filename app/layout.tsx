import type { Metadata } from "next";
import { SITE, PLANOS, PROVA, GARANTIA, LOJAS, LOGOS, EMPRESA } from "@/config";
import { Consentimento } from "@/components/Consentimento";
import "./globals.css";

/* =====================================================================
   FONTES
   ---------------------------------------------------------------------
   Carregadas SEM BLOQUEAR a renderização.

   Antes, o <link rel="stylesheet"> para o Google Fonts era um recurso
   bloqueante: o navegador não pintava nada até baixá-lo. Em conexão
   lenta isso vai direto para o LCP.

   A técnica abaixo pede a folha como `media="print"`, que o navegador
   trata como não-bloqueante, e a promove para `all` quando termina de
   carregar. O <noscript> cobre quem está sem JavaScript.

   MELHOR AINDA, quando alguém puder validar o build: trocar isto por
   `next/font/google`, que baixa as fontes no build e as serve do
   próprio domínio, eliminando as duas conexões externas (DNS, TLS) e
   o salto de layout. Não apliquei porque o ambiente onde compilo não
   tem acesso de rede ao Google Fonts, e eu não entrego o que não
   consigo buildar.
   ===================================================================== */

export const metadata: Metadata = {
  metadataBase: new URL(SITE.dominio),
  title: "Diariamente · uma prática diária de hábitos e bem-estar",
  // ~135 chars: o Google corta em ~155. A descrição longa segue no OG.
  description:
    "Uma prática diária de hábitos e bem-estar. Um texto por dia que provoca uma reflexão e termina numa ação possível ainda hoje. Interromper não significa abandonar.",
  keywords: [
    "Diariamente",
    "Brunno Falcão",
    "prática diária de hábitos",
    "app de hábito",
    "voltar a um hábito",
    "desenvolvimento profissional",
    "desenvolvimento de carreira",
    "constância",
    "hábito",
    "app de propósito",
    "Science Play",
  ],
  authors: [{ name: "Science Play" }],
  alternates: { canonical: SITE.dominio },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE.dominio,
    siteName: SITE.nome,
    title: "Diariamente · uma prática diária de hábitos e bem-estar",
    description: SITE.descricao,
  },
  twitter: {
    card: "summary_large_image",
    title: "Diariamente · um ritual diário na palma da sua mão",
    description: SITE.descricao,
  },
  robots: { index: true, follow: true },
};

// ----- JSON-LD: Product + Offers + FAQ + Organization (SEO + GEO) -----
function StructuredData() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Diariamente",
    description: SITE.descricao,
    brand: { "@type": "Brand", name: "Science Play" },
    image: SITE.dominio + SITE.ogImage,
    offers: PLANOS.map((p) => ({
      "@type": "Offer",
      name: p.nome,
      price: p.precoNumero,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: SITE.dominio,
    })),
  };

  // App nas lojas oficiais (ajuda SEO/GEO a entender que o app existe)
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Diariamente",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS, Android",
    description: SITE.descricao,
    publisher: { "@type": "Organization", name: "Science Play" },
    installUrl: [LOJAS.appStore, LOJAS.googlePlay],
    offers: {
      "@type": "Offer",
      price: PLANOS[0].precoNumero,
      priceCurrency: "BRL",
      url: SITE.dominio,
    },
  };

  // FAQ schema alinhado 1:1 com as perguntas VISÍVEIS (components/FAQ.tsx).
  // Google valida a consistência entre schema e conteúdo renderizado.
  // FONTE ÚNICA. O schema declarava 7 perguntas antigas ("É caro?"...)
  // enquanto a página mostrava 10 outras. Duas listas mantidas à mão
  // divergem sempre: o Google via um FAQ e o visitante via outro, com
  // risco de perder o rich result por inconsistência.
  // O FAQPage saiu daqui. Era declarado no layout raiz, global, em
  // português do Brasil, e por isso aparecia também em /pt-pt, /es e
  // /es-es. Agora cada página de venda declara o seu, com o dicionário
  // do próprio mercado (ver components/Home.tsx).

  // sameAs é o principal sinal de ENTIDADE para buscadores e IAs (GEO).
  // A ENTIDADE é o Diariamente, não a Science Play. A realizadora entra
  // como parentOrganization, que é a relação correta em schema.org.
  // Antes o sameAs apontava para as redes da Science Play: isso ensinava
  // ao buscador que a entidade desta página era a empresa, não o produto.
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.nome,
    url: SITE.dominio,
    logo: SITE.dominio + LOGOS.schemaLogo,
    email: EMPRESA.contatoEmail,
    sameAs: [
      "https://instagram.com/" + SITE.instagram,
      LOJAS.appStore,
      LOJAS.googlePlay,
    ],
    parentOrganization: {
      "@type": "Organization",
      name: EMPRESA.razaoSocial,
      url: EMPRESA.site,
    },
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    </>
  );
}

const FONTES =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fontes sem bloquear a renderização: a folha é pedida como
            media="print", que o navegador não trata como bloqueante, e
            promovida a "all" ao terminar. O noscript cobre quem está
            sem JavaScript. Ver a nota sobre next/font acima. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href={FONTES}
          media="print"
          // eslint-disable-next-line react/no-unknown-property
          onLoad={"this.media='all'" as unknown as undefined}
        />
        <noscript>
          <link rel="stylesheet" href={FONTES} />
        </noscript>
        <StructuredData />
      </head>
      <body>
        {/* GA4 e Pixel da Meta NÃO entram aqui direto: o Consentimento mostra
            o aviso de cookies e só monta o <Tracking /> depois do Aceitar.
            Recusar, ou não escolher, não carrega nada (política, seção 8). */}
        <Consentimento>{children}</Consentimento>
      </body>
    </html>
  );
}
