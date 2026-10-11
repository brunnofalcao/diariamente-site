import type { Metadata } from "next";
import { SITE } from "@/config";
import type { Lang } from "@/lib/i18n";
import { parDeIdiomas, type Chave } from "@/lib/rotas";

/* =====================================================================
   METADATA POR PÁGINA E IDIOMA
   ---------------------------------------------------------------------
   Três coisas precisam estar certas ao mesmo tempo, ou o Google escolhe
   uma versão e descarta a outra:

   1. CANONICAL próprio     cada rota aponta para si mesma
   2. HREFLANG recíproco    pt-BR ↔ es, mais x-default no português
   3. <html lang>           correto por rota

   A reciprocidade é o que mais quebra na prática: se A aponta para B e
   B não aponta de volta, o Google descarta o par inteiro.

   x-default vai sempre para a versão portuguesa: é o idioma prioritário
   do produto, e é para onde mandamos quem não é nem um nem outro.
   ===================================================================== */

export const HTML_LANG: Record<Lang, string> = { pt: "pt-BR", es: "es" };

type Texto = { title: string; description: string };

const TEXTOS: Record<Chave, Record<Lang, Texto>> = {
  home: {
    pt: {
      title: "Diariamente · em breve",
      description:
        "Uma prática diária de hábitos e bem-estar. Ainda não é hoje, mas está perto. Deixe seu contato e avisamos no dia em que abrir.",
    },
    es: {
      title: "Diariamente · próximamente",
      description:
        "Una práctica diaria de hábitos y bienestar. Todavía no es hoy, pero está cerca. Déjanos tu contacto y te avisamos el día que abra.",
    },
  },
  homePt: {
    pt: { title: "Diariamente · uma prática diária de hábitos e bem-estar", description: "Uma provocação por dia que termina numa ação possível ainda hoje. Porque interromper não significa abandonar." },
    es: { title: "Diariamente · uma prática diária de hábitos e bem-estar", description: "Uma provocação por dia que termina numa ação possível ainda hoje." },
  },
  homeEs: {
    pt: { title: "Diariamente · una práctica diaria de hábitos y bienestar", description: "Una provocación por día que termina en una acción posible hoy mismo." },
    es: { title: "Diariamente · una práctica diaria de hábitos y bienestar", description: "Una provocación por día que termina en una acción posible hoy mismo. Porque interrumpir no significa abandonar." },
  },
  vendas: {
    pt: { title: "Diariamente · uma prática diária de hábitos e bem-estar", description: "Página de vendas em construção." },
    es: { title: "Diariamente · una práctica diaria de hábitos y bienestar", description: "Página de ventas en construcción." },
  },
  estudante: {
    pt: {
      title: "Diariamente para estudantes · condição exclusiva de graduação",
      description:
        "O mesmo acesso da turma toda, pelo preço de quem ainda estuda. Solicite seu código e receba no WhatsApp.",
    },
    es: {
      title: "Diariamente para estudiantes · condición de grado",
      description:
        "El mismo acceso, al precio de quien todavía estudia. Conoce la condición para estudiantes de Diariamente.",
    },
  },
  sobre: {
    pt: {
      title: "Informações gerais · Diariamente",
      description:
        "O que é o Diariamente, para quem é, como funciona, o que não é e como funciona o acesso.",
    },
    es: {
      title: "Información general · Diariamente",
      description:
        "Qué es Diariamente, para quién es, cómo funciona, qué no es y cómo funciona el acceso.",
    },
  },
  termos: {
    pt: { title: "Termos de Uso · Diariamente", description: "Condições de acesso, licença de uso, pagamento, garantia de 7 dias e direito de arrependimento do Diariamente, prática diária de hábitos e bem-estar." },
    es: { title: "Condiciones de Uso · Diariamente", description: "Condiciones de acceso, licencia de uso, pago, garantía de 7 días y derecho de desistimiento de Diariamente, práctica diaria de hábitos y bienestar." },
  },
  privacidade: {
    pt: { title: "Política de Privacidade · Diariamente", description: "Quais dados tratamos, com que base legal, com quem compartilhamos, por quanto tempo guardamos e como exercer seus direitos, pela LGPD e pelo RGPD." },
    es: { title: "Política de Privacidad · Diariamente", description: "Qué datos tratamos, con qué base jurídica, con quién los compartimos, cuánto los conservamos y cómo ejercer tus derechos, según la LGPD y el RGPD." },
  },
};

/* ---------------------------------------------------------------------
   IMAGEM DA PRÉVIA POR IDIOMA
   As imagens moram em app/opengraph-image.png (português) e em
   app/es/opengraph-image.tsx (espanhol). O Next só as coloca sozinho em
   "/" e "/es": nas outras páginas, o `openGraph` declarado aqui SUBSTITUI
   o do segmento de cima, imagem inclusive, e /sobre, /es/acerca-de etc.
   saíam sem imagem nenhuma. Por isso a imagem vai explícita, no idioma
   da página. O texto alternativo é o mesmo dos arquivos.
   Endereço fixo, sem o código que o Next acrescenta: se a imagem mudar
   um dia, acrescentar ?v=2 aqui para Facebook e WhatsApp buscarem de novo.
   --------------------------------------------------------------------- */
const IMAGEM_DA_PREVIA: Record<Lang, { url: string; width: number; height: number; alt: string }> = {
  pt: {
    url: "/opengraph-image.png",
    width: 1200,
    height: 630,
    alt: "diariamente · uma prática diária de hábitos e bem-estar",
  },
  es: {
    url: "/es/opengraph-image",
    width: 1200,
    height: 630,
    alt: "diariamente · una práctica diaria de hábitos y bienestar",
  },
};

export function metadataDaPagina(chave: Chave, lang: Lang): Metadata {
  const { title, description } = TEXTOS[chave][lang];
  const par = parDeIdiomas(chave);
  const abs = (p: string) => SITE.dominio + (p === "/" ? "" : p);
  const imagem = IMAGEM_DA_PREVIA[lang];

  return {
    title,
    description,
    alternates: {
      canonical: abs(par[lang]),
      languages: {
        "pt-BR": abs(par.pt),
        es: abs(par.es),
        "x-default": abs(par.pt),
      },
    },
    openGraph: {
      type: "website",
      // es_LA, e não es_ES: o público do espanhol é a América Latina, e é o
      // código que o Facebook usa para o espanhol latino-americano.
      locale: lang === "pt" ? "pt_BR" : "es_LA",
      alternateLocale: lang === "pt" ? "es_LA" : "pt_BR",
      url: abs(par[lang]),
      siteName: SITE.nome,
      title,
      description,
      images: [imagem],
    },
    twitter: { card: "summary_large_image", title, description, images: [imagem] },
    robots: { index: true, follow: true },
  };
}

/**
 * Metadata de página PRIVADA: noindex, nofollow, sem canonical e sem
 * hreflang. Usado no site de vendas enquanto ele é estruturado em
 * /embreve. Canonical apontando para "/" aqui faria o Google tratar a
 * home "em breve" como cópia do site de vendas.
 */
export function metadataPrivada(chave: Chave, lang: Lang): Metadata {
  const { title, description } = TEXTOS[chave][lang];
  const proprio = SITE.dominio + parDeIdiomas(chave)[lang];
  return {
    title,
    description,
    // O layout raiz declara canonical "/" e hreflang para a home. Next
    // mescla metadata do layout nas páginas filhas, então SEM esta linha
    // /embreve herdaria canonical "/" e diria ao Google que a home é
    // cópia do site de vendas. Sobrescrever `alternates` inteiro zera
    // também o hreflang herdado.
    alternates: { canonical: proprio },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

/* =====================================================================
   METADATA POR MERCADO
   ---------------------------------------------------------------------
   Quatro homes, cada uma com canonical próprio e hreflang recíproco
   entre as QUATRO: pt-BR, pt-PT, es-ES, es-419 e x-default no Brasil.

   A reciprocidade é o que mais quebra na prática: se uma delas não
   apontar de volta, o Google descarta o grupo inteiro e passa a tratar
   as páginas como concorrentes pelo mesmo conteúdo.

   rw (resto do mundo) NÃO tem URL própria: divide a "/" com o Brasil e
   troca só o bloco de oferta. Por isso não entra no hreflang.
   ===================================================================== */

import { HREFLANG } from "@/lib/mercado";
import type { Mercado } from "@/config/pricing";

const CHAVE_DO_MERCADO: Record<"br" | "pt" | "es" | "la", Chave> = {
  br: "home", pt: "homePt", es: "homeEs", la: "home",
};

export function metadataDoMercado(mercado: Exclude<Mercado, "rw">): Metadata {
  const lang: Lang = mercado === "es" || mercado === "la" ? "es" : "pt";
  const chave = CHAVE_DO_MERCADO[mercado];
  const { title, description } = TEXTOS[chave][lang];
  const abs = (p: string) => SITE.dominio + (p === "/" ? "" : p);
  const proprio = abs(
    mercado === "br" ? "/" : mercado === "la" ? "/es" : mercado === "pt" ? "/pt-pt" : "/es-es"
  );

  const languages: Record<string, string> = {};
  for (const [tag, caminho] of Object.entries(HREFLANG)) languages[tag] = abs(caminho);

  return {
    title,
    description,
    alternates: { canonical: proprio, languages },
    openGraph: {
      type: "website",
      locale: lang === "pt" ? "pt_BR" : "es_ES",
      url: proprio,
      siteName: SITE.nome,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}
