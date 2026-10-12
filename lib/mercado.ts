import type { Mercado } from "@/config/pricing";

/* =====================================================================
   PAÍS → MERCADO · e a decisão de rota das homes
   ---------------------------------------------------------------------
   Lista da seção 1 do handoff. Incluir um país é uma linha, AQUI e só
   aqui: o middleware, o formulário da lista de espera e os testes leem
   desta lista.

   O país vem do cabeçalho x-vercel-ip-country, injetado pela Vercel em
   todo deployment. Não há dependência nova nem custo por consulta.

   Este arquivo só importa TIPO (que some na compilação): os testes o
   carregam fora do Next (scripts/carregar-ts.js).
   ===================================================================== */

export const PAISES_LATAM = [
  "MX", "CO", "AR", "CL", "PE", "UY", "PY", "BO", "EC", "VE",
  "GT", "CR", "DO", "PA", "HN", "SV", "NI",
] as const;

export const MERCADOS_VALIDOS: readonly Mercado[] = ["br", "la", "es", "pt", "rw"];

/** Caminho da home de cada mercado. rw divide a "/" com o Brasil. */
export const HOME_DO_MERCADO: Record<Mercado, string> = {
  br: "/",
  rw: "/",          // mesma página do Brasil, bloco de oferta em dólar
  la: "/es",
  es: "/es-es",
  pt: "/pt-pt",
};

/** As quatro homes. Só elas decidem mercado. */
export const HOMES = ["/", "/es", "/es-es", "/pt-pt"] as const;

/**
 * Endereço INTERNO da "/" do resto do mundo. O visitante continua vendo
 * "/" na barra: o middleware reescreve, não redireciona. Quem pede este
 * caminho direto volta para "/".
 */
export const ROTA_INTERNA_RW = "/mundo";

/** Cookie da escolha de mercado: 180 dias, gravado pelo ?mercado=. */
export const COOKIE_MERCADO = "dm_market";
export const COOKIE_MERCADO_SEGUNDOS = 60 * 60 * 24 * 180;

/**
 * hreflang de cada home. Recíproco e com x-default no português do Brasil.
 * "es-419" é o que o handoff pede, mas 419 é código M.49 e a documentação
 * do Google aceita região só em ISO 3166-1 alfa-2: se ele ignorar essa
 * tag, "es" genérico segura /es no grupo. A Espanha cai em es-ES e
 * qualquer outro hispanofalante cai em es.
 */
export const HREFLANG: Record<string, string> = {
  "pt-BR": "/",
  "pt-PT": "/pt-pt",
  "es-ES": "/es-es",
  "es-419": "/es",
  es: "/es",
  "x-default": "/",
};

/**
 * Robôs e prévias de link: nunca redirecionados nem reescritos. Se o
 * Googlebot caísse em /es, a home brasileira poderia sair do índice; e o
 * card do WhatsApp precisa sair no idioma da URL compartilhada.
 *
 * Navegador interno de app é GENTE e NÃO entra: Instagram, Facebook,
 * LinkedIn ([LinkedInApp]), Pinterest ([Pinterest/iOS]), Telegram
 * (Telegram-Android), DuckDuckGo (DuckDuckGo/5) e Baidu (baiduboxapp).
 * Por isso nada de nome de empresa solto na lista: os robôs delas já caem
 * em "bot" (LinkedInBot, Pinterestbot, ".../bot.html", TelegramBot,
 * DuckDuckBot) ou em "spider" (Baiduspider).
 */
export const ROBOS =
  /bot\b|bot\/|crawl|spider|slurp|bingpreview|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|lighthouse|headless|google-|googleother|inspectiontool|embedly|vkshare|skypeuripreview|slack|discord|redditbot|yandex|applebot|petalbot|semrush|ahrefs|mj12|gptbot|chatgpt|claude|perplexity|bytespider|amazonbot|preview/i;

export function ehRobo(userAgent: string | null | undefined): boolean {
  return ROBOS.test(userAgent ?? "");
}

export function mercadoValido(v: string | null | undefined): Mercado | null {
  return v && (MERCADOS_VALIDOS as readonly string[]).includes(v) ? (v as Mercado) : null;
}

export function mercadoDoPais(pais: string | null | undefined): Mercado {
  if (!pais) return "br";
  const p = pais.toUpperCase();
  if (p === "BR") return "br";
  if (p === "PT") return "pt";
  if (p === "ES") return "es";
  if ((PAISES_LATAM as readonly string[]).includes(p)) return "la";
  return "rw";
}

/** Idioma preferido entre pt e es pelo Accept-Language (ordenado por q). */
export function idiomaDoNavegador(cabecalho: string | null | undefined): "pt" | "es" | null {
  if (!cabecalho) return null;
  const itens = cabecalho
    .split(",")
    .map((parte) => {
      const [tag, ...params] = parte.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q.split("=")[1]) : 1 };
    })
    .filter((i) => i.tag && !Number.isNaN(i.q))
    .sort((a, b) => b.q - a.q);
  for (const { tag } of itens) {
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("pt")) return "pt";
  }
  return null;
}

export type Pedido = {
  pathname: string;
  /** search da URL, com ou sem "?" */
  busca: string;
  userAgent: string | null;
  cookie: string | null | undefined;
  pais: string | null;
  idiomas: string | null;
};

export type Decisao =
  | { tipo: "seguir"; vary: boolean }
  | { tipo: "redirecionar"; destino: string; cookie?: Mercado; vary: boolean }
  | { tipo: "reescrever"; destino: string; vary: boolean };

/** Mantém utm, fbclid, gclid etc. ao redirecionar; tira só mercado e lang. */
function comBusca(destino: string, busca: URLSearchParams): string {
  const q = new URLSearchParams(busca);
  q.delete("mercado");
  q.delete("lang");
  const s = q.toString();
  return s ? `${destino}?${s}` : destino;
}

/**
 * A decisão inteira, sem depender do Next (o middleware só aplica).
 * Ordem:
 *   1. robô e prévia de link: sempre a página pedida
 *   2. ?mercado=xx (seletor do rodapé e PT | ES): grava o cookie e vai
 *      para a home daquele mercado; ?lang=pt|es antigo vira br|la
 *   3. o endereço interno do resto do mundo, pedido direto, volta para "/"
 *   4. só as homes decidem; página interna abre como foi pedida
 *   5. cookie dm_market vence o país do IP
 *   6. país do IP (x-vercel-ip-country)
 *   7. sem país (ambiente local): idioma do navegador, como antes
 * rw na "/" é REESCRITA para a rota interna: a URL continua "/".
 */
export function decidirRota(p: Pedido): Decisao {
  if (ehRobo(p.userAgent)) return { tipo: "seguir", vary: true };

  const busca = new URLSearchParams(p.busca.replace(/^\?/, ""));
  const legado = busca.get("lang");
  const pedido = mercadoValido(busca.get("mercado")) ?? (legado === "es" ? "la" : legado === "pt" ? "br" : null);
  if (pedido) {
    return { tipo: "redirecionar", destino: comBusca(HOME_DO_MERCADO[pedido], busca), cookie: pedido, vary: true };
  }

  if (p.pathname === ROTA_INTERNA_RW) {
    return { tipo: "redirecionar", destino: comBusca("/", busca), vary: true };
  }

  if (!(HOMES as readonly string[]).includes(p.pathname)) return { tipo: "seguir", vary: false };

  const mercado = mercadoValido(p.cookie) ?? (p.pais ? mercadoDoPais(p.pais) : null);
  if (mercado) {
    const destino = HOME_DO_MERCADO[mercado];
    if (mercado === "rw" && p.pathname === "/") {
      return { tipo: "reescrever", destino: ROTA_INTERNA_RW, vary: true };
    }
    if (destino === p.pathname) return { tipo: "seguir", vary: true };
    return { tipo: "redirecionar", destino: comBusca(destino, busca), vary: true };
  }

  if (p.pathname === "/" && idiomaDoNavegador(p.idiomas) === "es") {
    return { tipo: "redirecionar", destino: comBusca("/es", busca), vary: true };
  }
  return { tipo: "seguir", vary: true };
}
