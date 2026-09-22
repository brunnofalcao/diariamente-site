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
  | "vendas"
  | "estudante"
  | "sobre"
  | "termos"
  | "privacidade";

const SLUGS: Record<Chave, Record<Lang, string>> = {
  home:        { pt: "/",              es: "/es" },
  // Site de vendas em construção. Fora do sitemap e com noindex até o
  // lançamento: é endereço de trabalho, não de busca. Na virada, basta
  // trocar o que as rotas "/" e "/es" renderizam.
  vendas:      { pt: "/embreve",       es: "/es/embreve" },
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
