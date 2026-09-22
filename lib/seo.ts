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
    pt: { title: "Termos de Uso · Diariamente", description: "Termos de uso do Diariamente." },
    es: { title: "Condiciones de Uso · Diariamente", description: "Condiciones de uso de Diariamente." },
  },
  privacidade: {
    pt: { title: "Política de Privacidade · Diariamente", description: "Como tratamos seus dados." },
    es: { title: "Política de Privacidad · Diariamente", description: "Cómo tratamos tus datos." },
  },
};

export function metadataDaPagina(chave: Chave, lang: Lang): Metadata {
  const { title, description } = TEXTOS[chave][lang];
  const par = parDeIdiomas(chave);
  const abs = (p: string) => SITE.dominio + (p === "/" ? "" : p);

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
      locale: lang === "pt" ? "pt_BR" : "es_ES",
      alternateLocale: lang === "pt" ? "es_ES" : "pt_BR",
      url: abs(par[lang]),
      siteName: SITE.nome,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
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
