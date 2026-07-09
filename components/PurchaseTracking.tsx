"use client";

import { useEffect } from "react";
import { PLANO } from "@/config";

/**
 * PurchaseTracking — dispara o evento de compra no Meta Pixel e GA4
 * quando a página de obrigado carrega.
 *
 * IMPORTANTE: isto é um BACKUP do evento que o Hotmart envia via pixel/API.
 * O evento oficial e confiável é o do Hotmart (server-side, pega boleto/Pix
 * aprovado depois). Este aqui cobre o caso de o cliente cair aqui direto.
 *
 * Se o Hotmart mandar parâmetros na URL (ex: ?transaction_id=...), usamos
 * pra deduplicar. Sem isso, o Meta pode contar a mesma venda duas vezes.
 */
export function PurchaseTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Hotmart costuma mandar identificadores; usamos como event_id (dedupe)
    const transacao =
      params.get("transaction") ||
      params.get("transaction_id") ||
      params.get("hottok") ||
      undefined;

    const valor = PLANO.precoNumero;

    // Meta Pixel
    (window as any).fbq?.(
      "track",
      "Purchase",
      { currency: "BRL", value: valor, content_name: PLANO.nome },
      transacao ? { eventID: transacao } : undefined
    );

    // GA4
    (window as any).gtag?.("event", "purchase", {
      currency: "BRL",
      value: valor,
      transaction_id: transacao,
      items: [{ item_name: PLANO.nome, price: valor, quantity: 1 }],
    });

    // dataLayer (caso use GTM no futuro)
    (window as any).dataLayer?.push({
      event: "Purchase",
      plano: PLANO.id,
      valor,
      transacao,
    });
  }, []);

  return null;
}
