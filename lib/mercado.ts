import type { Mercado } from "@/config/pricing";

/* =====================================================================
   PAÍS → MERCADO
   ---------------------------------------------------------------------
   Lista da seção 1 do handoff. Incluir um país é uma linha.

   O país vem do cabeçalho x-vercel-ip-country, injetado pela Vercel em
   todo deployment. Não há dependência nova nem custo por consulta.
   ===================================================================== */

export const PAISES_LATAM = [
  "MX", "CO", "AR", "CL", "PE", "UY", "PY", "BO", "EC", "VE",
  "GT", "CR", "DO", "PA", "HN", "SV", "NI",
] as const;

/** Caminho da home de cada mercado. rw divide a rota com br. */
export const HOME_DO_MERCADO: Record<Mercado, string> = {
  br: "/",
  rw: "/",          // mesma página do Brasil, bloco de oferta em dólar
  la: "/es",
  es: "/es-es",
  pt: "/pt-pt",
};

/** Mercado de cada home, para a rota saber o que renderizar. */
export const MERCADO_DA_HOME: Record<string, Mercado> = {
  "/": "br",
  "/es": "la",
  "/es-es": "es",
  "/pt-pt": "pt",
};

export function mercadoDoPais(pais: string | null | undefined): Mercado {
  if (!pais) return "br";
  const p = pais.toUpperCase();
  if (p === "BR") return "br";
  if (p === "PT") return "pt";
  if (p === "ES") return "es";
  if ((PAISES_LATAM as readonly string[]).includes(p)) return "la";
  return "rw";
}

/** hreflang de cada home. Recíproco e com x-default no português do Brasil. */
export const HREFLANG: Record<string, string> = {
  "pt-BR": "/",
  "pt-PT": "/pt-pt",
  "es-ES": "/es-es",
  "es-419": "/es",
  "x-default": "/",
};
