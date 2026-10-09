/* =====================================================================
   EVENTOS DE MEDIÇÃO (GA4 e Pixel da Meta)
   ---------------------------------------------------------------------
   As duas ferramentas só existem na página depois do Aceitar no aviso de
   cookies (components/Consentimento.tsx). Sem aceite, window.fbq e
   window.gtag não existem e nenhum evento sai.
   ===================================================================== */

type Ferramenta = (...args: unknown[]) => void;

/**
 * Chama `fn` assim que window[nome] existir, tentando por uns 5 segundos.
 * Cobre a corrida entre a montagem das ferramentas (logo depois do aceite)
 * e a do componente que dispara o evento. Se nunca existir (recusou, ou
 * bloqueador de anúncio), não faz nada.
 */
export function quandoPronto(nome: "fbq" | "gtag", fn: (f: Ferramenta) => void, tentativas = 20): void {
  if (typeof window === "undefined") return;
  const f = (window as unknown as Record<string, unknown>)[nome];
  if (typeof f === "function") {
    fn(f as Ferramenta);
    return;
  }
  if (tentativas <= 0) return;
  setTimeout(() => quandoPronto(nome, fn, tentativas - 1), 250);
}
