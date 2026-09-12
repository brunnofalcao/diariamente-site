import type { Metadata } from "next";
import { SITE, PLANOS, PROVA, GARANTIA, LOJAS, LOGOS, EMPRESA } from "@/config";
import { Tracking } from "@/components/Tracking";
import "./globals.css";

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
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "É caro?", acceptedAnswer: { "@type": "Answer", text: "Dá menos de R$ 1 por dia por um ano inteiro de provocação diária, com um sistema feito pra você realmente usar. E tem 7 dias de garantia: se não for pra você, devolvemos." } },
      { "@type": "Question", name: "Não tenho tempo. Quanto tempo leva por dia?", acceptedAnswer: { "@type": "Answer", text: "Três minutos: um texto curto, uma reflexão e uma ação pequena que cabe no dia que você já tem. O app te lembra no horário que você escolher." } },
      { "@type": "Question", name: "Já baixei app de hábito antes e parei. Por que dessa vez seria diferente?", acceptedAnswer: { "@type": "Answer", text: "O Diariamente foi construído no ponto onde você largou antes. O contador conta as voltas, não os dias seguidos: ele nunca zera. Faltar não apaga o que você já construiu." } },
      { "@type": "Question", name: "Será que funciona pra mim?", acceptedAnswer: { "@type": "Answer", text: "Funciona pra quem aparece 5 minutos por dia. O resto o sistema apoia: o lembrete no WhatsApp, o progresso visível e a ação concreta de cada dia." } },
      { "@type": "Question", name: "Posso ler todas as provocações de uma vez?", acceptedAnswer: { "@type": "Answer", text: "Não, e isso é de propósito. No app você vive o dia de hoje, um por vez. Quando quiser adiantar, sua própria constância destrava o próximo dia." } },
      { "@type": "Question", name: "Como recebo o acesso?", acceptedAnswer: { "@type": "Answer", text: "Por e-mail, logo após a confirmação. Você abre o app e já faz a provocação do dia 1." } },
      { "@type": "Question", name: "E se eu não gostar? Existe garantia?", acceptedAnswer: { "@type": "Answer", text: GARANTIA.texto } },
    ],
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&display=swap"
          rel="stylesheet"
        />
        <StructuredData />
      </head>
      <body>
        <Tracking />
        {children}
      </body>
    </html>
  );
}
