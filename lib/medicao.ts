/* =====================================================================
   EVENTOS DE MEDIÇÃO (GA4 e Pixel da Meta)
   ---------------------------------------------------------------------
   As duas ferramentas só existem na página depois do Aceitar no aviso de
   cookies (components/Consentimento.tsx). Sem aceite, window.fbq e
   window.gtag não existem e nenhum evento sai.
   ===================================================================== */

import { lerEscolha } from "@/lib/cookies";

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

/**
 * InitiateCheckout (Pixel) e begin_checkout (GA4) no clique dos botões que
 * abrem o checkout da Hotmart. Só com "Aceitar" gravado: sem aceite, sai
 * daqui sem chamar nada, mesmo que alguma coisa tenha criado um fbq.
 * Os botões abrem o checkout em outra aba, então a página continua viva
 * para o evento sair.
 */
export function registrarInicioDeCheckout(plano: { id: string; nome: string; precoNumero: number }): void {
  if (typeof window === "undefined" || lerEscolha() !== "aceito") return;
  const w = window as unknown as { fbq?: Ferramenta; gtag?: Ferramenta };
  w.fbq?.("track", "InitiateCheckout", {
    currency: "BRL",
    value: plano.precoNumero,
    content_name: plano.nome,
  });
  w.gtag?.("event", "begin_checkout", {
    currency: "BRL",
    value: plano.precoNumero,
    items: [{ item_id: plano.id, item_name: plano.nome, price: plano.precoNumero, quantity: 1 }],
  });
}
