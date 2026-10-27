import type { Metadata } from "next";
import { SITE } from "@/config";
import type { Lang } from "@/lib/i18n";
import { parDeIdiomas, type Chave } from "@/lib/rotas";
import { HREFLANG } from "@/lib/mercado";

/* =====================================================================
   METADATA POR PÁGINA E IDIOMA
   ---------------------------------------------------------------------
   Três coisas precisam estar certas ao mesmo tempo, ou o Google escolhe
   uma versão e descarta a outra:

   1. CANONICAL próprio     cada rota aponta para si mesma
   2. HREFLANG recíproco    pt-BR ↔ es, mais x-default no português;
                            nas homes, o grupo das quatro (hreflangDe)
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
    // Desde a virada, "/" é o site de vendas: título e descrição são os de
    // venda (os mesmos do app/layout.tsx). O bloco es continua "próximamente"
    // porque /es continua sendo a lista de espera.
    pt: {
      title: "Diariamente · uma prática diária de hábitos e bem-estar",
      description:
        "Uma prática diária de hábitos e bem-estar. Um texto por dia que provoca uma reflexão e termina numa ação possível ainda hoje. Interromper não significa abandonar.",
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

/** Endereço absoluto no domínio do config. "/" vira o domínio sem barra. */
export function urlAbsoluta(caminho: string): string {
  return SITE.dominio + (caminho === "/" ? "" : caminho);
}

/* ---------------------------------------------------------------------
   HREFLANG DE UMA PÁGINA · fonte única do <head> e do sitemap
   As quatro homes ("/", "/es", "/pt-pt", "/es-es") formam um grupo só e
   declaram as mesmas linhas de lib/mercado.ts (HREFLANG). Se "/" não apontar
   para "/pt-pt" e "/pt-pt" não apontar de volta, o Google descarta o
   par. As outras páginas formam o par pt-BR ↔ es de lib/rotas.ts.
   --------------------------------------------------------------------- */
const CHAVES_DE_HOME: Chave[] = ["home", "homePt", "homeEs"];

export function hreflangDe(chave: Chave): Record<string, string> {
  if (CHAVES_DE_HOME.includes(chave)) {
    const grupo: Record<string, string> = {};
    for (const [tag, caminho] of Object.entries(HREFLANG)) grupo[tag] = urlAbsoluta(caminho);
    return grupo;
  }
  const par = parDeIdiomas(chave);
  return { "pt-BR": urlAbsoluta(par.pt), es: urlAbsoluta(par.es), "x-default": urlAbsoluta(par.pt) };
}

export function metadataDaPagina(chave: Chave, lang: Lang): Metadata {
  const { title, description } = TEXTOS[chave][lang];
  const par = parDeIdiomas(chave);
  const abs = urlAbsoluta;
  const imagem = IMAGEM_DA_PREVIA[lang];

  return {
    title,
    description,
    alternates: {
      canonical: abs(par[lang]),
      languages: hreflangDe(chave),
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
 * Metadata de página PRIVADA: noindex, nofollow, canonical próprio e sem
 * hreflang. Usado nas prévias do dono (/pt-pt/embreve e /es-es/embreve,
 * com a chave de lançamento ligada). Canonical apontando para "/" aqui
 * faria o Google tratar a home como cópia da prévia. O site de vendas em
 * standby (/vendas/*) usa metadataDaVitrine, logo abaixo.
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
   entre as QUATRO: pt-BR, pt-PT, es-ES, es e x-default no Brasil
   (lib/mercado.ts, HREFLANG, lido por hreflangDe).

   A reciprocidade é o que mais quebra na prática: se uma delas não
   apontar de volta, o Google descarta o grupo inteiro e passa a tratar
   as páginas como concorrentes pelo mesmo conteúdo.

   rw (resto do mundo) NÃO tem URL própria: divide a "/" com o Brasil e
   troca só o bloco de oferta. Por isso não entra no hreflang, e a rota
   interna dele usa a metadata do Brasil.

   Título e descrição seguem o que a home mostra: página de vendas, ou
   "próximamente" quando o mercado ainda é só a lista de espera
   (config/pricing.ts, vendaAberta e semVenda). Em standby (chave de
   lançamento desligada, config/lancamento.ts), toda home é a lista de
   espera e usa o texto de espera; o do Brasil é o da produção antes do
   lançamento ("Diariamente · em breve").
   ===================================================================== */

import { HOME_DO_MERCADO, VENDAS_DO_MERCADO } from "@/lib/mercado";
import { MERCADOS, type Mercado } from "@/config/pricing";
import { SITE_LANCADO } from "@/config/lancamento";

type MercadoComHome = Exclude<Mercado, "rw">;

const TEXTOS_DO_MERCADO: Record<MercadoComHome, { venda: Texto; espera: Texto }> = {
  br: {
    venda: TEXTOS.home.pt,
    // Título e descrição de "/" na produção antes do lançamento (lista de espera).
    espera: {
      title: "Diariamente · em breve",
      description:
        "Uma prática diária de hábitos e bem-estar. Ainda não é hoje, mas está perto. Deixe seu contato e avisamos no dia em que abrir.",
    },
  },
  pt: {
    venda: { title: "Diariamente · uma prática diária de hábitos e bem-estar", description: "Uma provocação por dia que termina numa ação possível ainda hoje. Porque interromper não significa abandonar." },
    espera: { title: "Diariamente · em breve em Portugal", description: "Uma prática diária de hábitos e bem-estar. Ainda não é hoje, mas está perto. Deixa o teu contacto e avisamos no dia em que abrir." },
  },
  es: {
    venda: { title: "Diariamente · una práctica diaria de hábitos y bienestar", description: "Una provocación por día que termina en una acción posible hoy mismo. Porque interrumpir no significa abandonar." },
    espera: TEXTOS.home.es,
  },
  la: {
    venda: { title: "Diariamente · una práctica diaria de hábitos y bienestar", description: "Una provocación por día que termina en una acción posible hoy mismo. Porque interrumpir no significa abandonar." },
    espera: TEXTOS.home.es,
  },
};

const OG_LOCALE: Record<MercadoComHome, string> = { br: "pt_BR", pt: "pt_PT", es: "es_ES", la: "es_LA" };

export function metadataDoMercado(mercado: MercadoComHome, lancado: boolean = SITE_LANCADO): Metadata {
  const o = MERCADOS[mercado];
  const lang: Lang = o.idioma;
  const mostraVenda = lancado && (o.vendaAberta || o.semVenda === "bloco");
  const { title, description } = TEXTOS_DO_MERCADO[mercado][mostraVenda ? "venda" : "espera"];
  const proprio = urlAbsoluta(HOME_DO_MERCADO[mercado]);
  const imagem = IMAGEM_DA_PREVIA[lang];
  // O grupo das quatro homes: o mesmo em todas elas e no sitemap.
  const languages = hreflangDe("home");

  return {
    title,
    description,
    alternates: { canonical: proprio, languages },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[mercado],
      alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== OG_LOCALE[mercado]),
      url: proprio,
      siteName: SITE.nome,
      title,
      description,
      images: [imagem],
    },
    twitter: { card: "summary_large_image", title, description, images: [imagem] },
    robots: { index: true, follow: true },
  };
}

/* =====================================================================
   SITE DE VENDAS EM STANDBY · /vendas, /vendas/es, /vendas/es-es,
   /vendas/pt-pt e /vendas/mundo
   ---------------------------------------------------------------------
   Título e descrição que a home do mercado vai ter no lançamento, e:
     - noindex, nofollow: endereço de trabalho, não de busca;
     - canonical para si mesma e SEM hreflang. O layout raiz declara
       canonical "/" e o Next mescla isso nas páginas filhas: sem esta
       linha, /vendas diria ao Google que é cópia da home pública.
   Nenhuma página pública aponta para /vendas (sitemap, hreflang e
   canonical vêm de lib/rotas.ts e de HREFLANG, sem /vendas).
   ===================================================================== */
export function metadataDaVitrine(mercado: Mercado): Metadata {
  const doLancamento = metadataDoMercado(mercado === "rw" ? "br" : mercado, true);
  return {
    title: doLancamento.title,
    description: doLancamento.description,
    alternates: { canonical: urlAbsoluta(VENDAS_DO_MERCADO[mercado]) },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}
