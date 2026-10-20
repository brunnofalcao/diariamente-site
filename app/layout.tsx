import type { Metadata } from "next";
import { SITE, LOJAS, LOGOS, EMPRESA } from "@/config";
import { Consentimento } from "@/components/Consentimento";
import "./globals.css";

/* =====================================================================
   FONTES
   ---------------------------------------------------------------------
   Folha do Google Fonts carregada do jeito comum (<link rel="stylesheet">).

   Houve uma tentativa de carregar sem bloquear (media="print" promovido
   a "all" no onLoad). No App Router isso NÃO funciona: o React não
   escreve onLoad no HTML do servidor, então a folha ficava em "print"
   para sempre e Literata e Inter nunca chegavam à tela (conferido no
   HTML do build em 12/10/2026: media="print" e nenhum onload).

   O caminho certo para tirar o bloqueio é `next/font/google`, que serve
   as fontes do próprio domínio. Ele exige trocar os nomes "Literata" e
   "Inter" escritos nos estilos pelas variáveis --f-serif e --f-sans
   (globals.css já as espera); fica para uma entrega própria, validada
   no build da Vercel.
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

// ----- JSON-LD: MobileApplication + Organization (SEO + GEO) -----
// Product com Offer (preço e moeda) e FAQPage saíram daqui: o layout raiz
// é global e não conhece o mercado, então mandava R$ para /pt-pt, /es e
// /es-es. Cada home declara os seus, com o mercado da página
// (components/Home.tsx, a partir de config/pricing.ts).
function StructuredData() {
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
    // Só a marca: o app é global, e a razão social fica nos Termos e na
    // Política (decisão do dono, 12/10/2026).
    parentOrganization: {
      "@type": "Organization",
      name: EMPRESA.marca,
      url: EMPRESA.site,
    },
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    </>
  );
}

const FONTES =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTES} />
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
