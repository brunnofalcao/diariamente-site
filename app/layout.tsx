import type { Metadata } from "next";
import { SITE, PLANOS, PROVA, GARANTIA } from "@/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.dominio),
  title: "Diariamente — uma provocação por dia, por 365 dias | Brunno Falcão e Roberta Carbonari",
  description: SITE.descricao,
  keywords: [
    "Diariamente",
    "Brunno Falcão",
    "Roberta Carbonari",
    "livro de provocações diárias",
    "desenvolvimento profissional",
    "desenvolvimento de carreira",
    "constância",
    "hábito",
    "app de propósito",
    "Science Play",
  ],
  authors: [{ name: "Brunno Falcão" }, { name: "Roberta Carbonari" }],
  alternates: { canonical: SITE.dominio },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE.dominio,
    siteName: SITE.nome,
    title: "Diariamente — um livro vivo, um ritual diário na palma da sua mão",
    description: SITE.descricao,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "Diariamente" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diariamente — um ritual diário na palma da sua mão",
    description: SITE.descricao,
    images: [SITE.ogImage],
  },
  robots: { index: true, follow: true },
  icons: { icon: SITE.ogImage },
};

// ----- JSON-LD: Product + Offers + FAQ + Organization (SEO + GEO) -----
function StructuredData() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Diariamente",
    description: SITE.descricao,
    brand: { "@type": "Brand", name: "Science Play" },
    image: SITE.ogImage,
    offers: PLANOS.map((p) => ({
      "@type": "Offer",
      name: p.nome,
      price: p.precoNumero,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: SITE.dominio,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "O que é o Diariamente?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "É o livro de Brunno Falcão e Roberta Carbonari transformado em um app de provocações diárias. São 365 provocações — uma para cada dia do ano — com sistema de ofensiva, conquistas, ranking e lembrete no WhatsApp, projetado para você manter a constância e não largar no meio.",
        },
      },
      {
        "@type": "Question",
        name: "Não tenho tempo. Quanto tempo leva por dia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Uma provocação por dia, cerca de 5 minutos. O app ainda te lembra no WhatsApp para a provocação te encontrar onde você já está.",
        },
      },
      {
        "@type": "Question",
        name: "Já comprei livros parecidos e larguei. Por que dessa vez seria diferente?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Porque o Diariamente foi construído no ponto exato onde as pessoas desistem. A ofensiva, as conquistas e o menu Ações existem para te ajudar a voltar no dia seguinte — não é só conteúdo, é um sistema de constância.",
        },
      },
      {
        "@type": "Question",
        name: "Posso ler todas as provocações de uma vez?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não, e isso é intencional. No app Diariamente você acessa uma provocação por dia, vivendo o dia vigente — diferente do livro físico, que permite ler tudo de uma vez e esquecer. Ao manter a constância e cumprir conquistas, você desbloqueia a possibilidade de adiantar dias.",
        },
      },
      {
        "@type": "Question",
        name: "Como recebo o acesso?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Você recebe o e-mail de acesso logo após a confirmação, com as instruções para abrir o app e começar a primeira provocação.",
        },
      },
      {
        "@type": "Question",
        name: "Existe garantia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: GARANTIA.texto,
        },
      },
    ],
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Science Play",
    url: SITE.dominio,
    logo: SITE.ogImage,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif&display=swap"
          rel="stylesheet"
        />
        <StructuredData />
      </head>
      <body>{children}</body>
    </html>
  );
}
