import type { Lang } from "@/lib/i18n";

/* =====================================================================
   MAPA DE ROTAS POR IDIOMA
   ---------------------------------------------------------------------
   Fonte única dos caminhos. Nenhum arquivo escreve "/es/estudiantes" na
   mão: todos chamam `caminho("estudante", lang)`.

   Por que isso importa: com dois idiomas, cada link escrito à mão é um
   lugar onde a versão espanhola pode apontar para a página portuguesa
   sem ninguém perceber. O usuário troca de idioma no meio da navegação
   e nem nota — mas o Google nota, e trata como conteúdo duplicado.

   Slug traduzido, e não `/es/estudante`, porque é o que a Apple, o
   Airbnb e o Spotify fazem: a URL faz parte do conteúdo. Um espanhol
   lendo `/es/condicionesdeuso` entende antes de abrir.
   ===================================================================== */

export type Chave =
  | "home"
  | "homePt"
  | "homeEs"
  | "vendas"
  | "estudante"
  | "sobre"
  | "termos"
  | "privacidade";

const SLUGS: Record<Chave, Record<Lang, string>> = {
  home:        { pt: "/",              es: "/es" },
  // Homes por MERCADO. Idioma não decide moeda (pt tem BRL e EUR, es tem
  // USD e EUR), então cada mercado com preço próprio tem URL própria.
  homePt:      { pt: "/pt-pt",         es: "/pt-pt" },
  homeEs:      { pt: "/es-es",         es: "/es-es" },
  // Site de vendas em STANDBY, a vitrine (chave de lançamento desligada,
  // config/lancamento.ts): /vendas e /es/vendas, mais /es-es/vendas,
  // /pt-pt/vendas e /mundo/vendas (lib/mercado.ts, VENDAS_DO_MERCADO),
  // com o idioma na frente, como /es/estudiantes. Privado: noindex e fora
  // do sitemap. Ligada a chave, redirecionam para a home real do mercado.
  // As prévias antigas (/embreve, /es/embreve, /pt-pt/embreve,
  // /es-es/embreve) levam para cá em standby; ligada a chave, /embreve e
  // /es/embreve vão para "/" e "/es", e as duas de pt-pt e es-es voltam a
  // ser as prévias do dono (PR #3).
  vendas:      { pt: "/vendas",        es: "/es/vendas" },
  estudante:   { pt: "/estudante",     es: "/es/estudiantes" },
  sobre:       { pt: "/sobre",         es: "/es/acerca-de" },
  termos:      { pt: "/termos",        es: "/es/condicionesdeuso" },
  privacidade: { pt: "/privacidade",   es: "/es/privacidad" },
};

/** Caminho de uma página no idioma pedido. */
export function caminho(chave: Chave, lang: Lang): string {
  return SLUGS[chave][lang];
}

/** As duas versões de uma mesma página, para hreflang e para o seletor. */
export function parDeIdiomas(chave: Chave): Record<Lang, string> {
  return SLUGS[chave];
}

/** Todas as chaves. */
export const CHAVES = Object.keys(SLUGS) as Chave[];

/** Chaves privadas: noindex e fora do sitemap. */
export const PRIVADAS: Chave[] = ["vendas"];

/** Dado um caminho, descobre chave e idioma. Usado pelo seletor. */
export function identificar(pathname: string): { chave: Chave; lang: Lang } {
  const limpo = pathname.replace(/\/+$/, "") || "/";
  for (const chave of CHAVES) {
    for (const lang of ["pt", "es"] as Lang[]) {
      if (SLUGS[chave][lang] === limpo) return { chave, lang };
    }
  }
  return { chave: "home", lang: limpo.startsWith("/es") ? "es" : "pt" };
}

/**
 * Destino de redirecionamento mantendo os parâmetros da URL original
 * (utm_*, fbclid, gclid...). Anúncio ou link antigo que apontava para
 * /embreve continua chegando com a origem do tráfego intacta.
 */
export function comParametros(
  destino: string,
  parametros: Record<string, string | string[] | undefined> = {}
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(parametros)) {
    if (Array.isArray(v)) v.forEach((x) => q.append(k, x));
    else if (v !== undefined) q.append(k, v);
  }
  const s = q.toString();
  return s ? `${destino}?${s}` : destino;
}
