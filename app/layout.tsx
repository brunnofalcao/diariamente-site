import type { Metadata } from "next";
import { SITE, PLANOS, PROVA, GARANTIA, LOJAS, LOGOS, AUTORES, EMPRESA } from "@/config";
import { Tracking } from "@/components/Tracking";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.dominio),
  title: "Diariamente · uma provocação por dia, por 365 dias",
  // ~135 chars: o Google corta em ~155. A descrição longa segue no OG.
  description:
    "O livro de Brunno Falcão e Roberta Carbonari que virou app: 365 provocações, uma por dia, com lembrete no WhatsApp e 7 dias de garantia.",
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
    title: "Diariamente · um livro vivo, um ritual diário na palma da sua mão",
    description: SITE.descricao,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "Diariamente — uma provocação por dia, por 365 dias" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diariamente · um ritual diário na palma da sua mão",
    description: SITE.descricao,
    images: [SITE.ogImage],
  },
  robots: { index: true, follow: true },
  icons: { icon: LOGOS.favicon },
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
      { "@type": "Question", name: "Não tenho tempo. Quanto tempo leva por dia?", acceptedAnswer: { "@type": "Answer", text: "É uma provocação por dia, cerca de 5 minutos. O app inclusive te lembra no WhatsApp. A questão nunca foi tempo: foi constância." } },
      { "@type": "Question", name: "Já comprei livros assim e larguei. Por que dessa vez seria diferente?", acceptedAnswer: { "@type": "Answer", text: "O Diariamente foi construído no ponto onde você largou antes. Ofensiva, conquistas e Ações existem pra te ajudar a voltar no dia seguinte, não pra te cobrar perfeição." } },
      { "@type": "Question", name: "Será que funciona pra mim?", acceptedAnswer: { "@type": "Answer", text: "Funciona pra quem aparece 5 minutos por dia. O resto o sistema apoia: o lembrete no WhatsApp, o progresso visível e a ação concreta de cada dia." } },
      { "@type": "Question", name: "Quero só o livro impresso.", acceptedAnswer: { "@type": "Answer", text: "O livro físico Diariamente é vendido à parte em https://sun.eduzz.com/2038359. E quando quiser transformar a leitura em ritual diário, o app te espera." } },
      { "@type": "Question", name: "Já tenho o livro físico. O que o app acrescenta?", acceptedAnswer: { "@type": "Answer", text: "O app é a versão que te faz usar o livro: te lembra, registra seu progresso e transforma cada provocação em ação. O Diariamente Club é o acesso ao app, com as 365 provocações e todo o sistema de constância." } },
      { "@type": "Question", name: "Posso ler todas as provocações de uma vez?", acceptedAnswer: { "@type": "Answer", text: "Não, e isso é de propósito. No app você vive o dia de hoje, um por vez. Quando quiser adiantar, sua própria constância destrava o próximo dia." } },
      { "@type": "Question", name: "Como recebo o acesso?", acceptedAnswer: { "@type": "Answer", text: "Por e-mail, logo após a confirmação. Você abre o app e já faz a provocação do dia 1." } },
      { "@type": "Question", name: "E se eu não gostar? Existe garantia?", acceptedAnswer: { "@type": "Answer", text: GARANTIA.texto } },
    ],
  };

  // sameAs é o principal sinal de ENTIDADE para buscadores e IAs (GEO).
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Science Play",
    url: EMPRESA.site,
    logo: LOGOS.horizontal,
    sameAs: [
      EMPRESA.site,
      "https://instagram.com/" + EMPRESA.instagram,
      "https://linkedin.com/in/" + EMPRESA.linkedin,
    ],
  };

  const pessoasSchema = [AUTORES.brunno, AUTORES.roberta].map((a) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.nome,
    description: a.bio,
    image: a.foto,
    sameAs: ["https://instagram.com/" + a.instagram],
    affiliation: { "@type": "Organization", name: "Science Play" },
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pessoasSchema) }} />
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
      <body>
        <Tracking />
        {children}
      </body>
    </html>
  );
}
