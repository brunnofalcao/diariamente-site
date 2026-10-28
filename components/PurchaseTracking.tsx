"use client";

import { useEffect, useRef } from "react";
import { PLANO } from "@/config";
import { useConsentimento } from "@/components/Consentimento";
import { quandoPronto } from "@/lib/medicao";
import { dadosDoPurchase } from "@/lib/obrigado.mjs";

/**
 * PurchaseTracking: dispara o evento Purchase no Meta Pixel e GA4
 * quando a página de obrigado APROVADA carrega, SÓ com a medição liberada
 * (components/Consentimento.tsx): com a chave de lançamento ligada, o
 * Aceitar no aviso de cookies; em standby, a página de obrigado também
 * lê a escolha gravada antes de montar qualquer coisa, e quem recusou
 * não manda nada. Só a aprovada o monta (components/PaginaObrigado.tsx):
 * nas de pagamento pendente e em análise a venda ainda não existe.
 *
 * IMPORTANTE: isto é um BACKUP do evento que o Hotmart envia via pixel/API.
 * O evento oficial e confiável é o do Hotmart (server-side, pega boleto/Pix
 * aprovado depois). Este aqui cobre o caso de o cliente cair aqui direto.
 *
 * MOEDA E VALOR DO MERCADO CERTO. Antes, sempre BRL. Agora a página
 * decide o mercado no servidor (lib/obrigado.mjs, mercadoDoObrigado: a
 * oferta ?off=, o cookie dm_mercado, o país e o idioma) e entrega a moeda do
 * plano e o valor do pedido (lib/pos-pagamento.ts, valorDoPedido, a partir
 * de config/pricing.ts). A conta do que sai (transação e total) é a
 * função pura dadosDoPurchase (lib/obrigado.mjs), testada com URLs de
 * verdade em testes/obrigado.test.mjs: o valor da URL só vale na mesma
 * moeda do plano, e a oferta em dólar da América Latina é paga "na moeda
 * local" (um price em pesos lido como dólar inflaria o ROAS).
 *
 * Se o Hotmart mandar o id da transação na URL (?transaction=...), ele
 * vira o eventID (dedupe com o evento do Hotmart). Sem isso, o Meta pode
 * contar a mesma venda duas vezes. hottok NUNCA entra: é o segredo do
 * webhook.
 */
export function PurchaseTracking({
  moeda = "BRL",
  valor,
}: {
  /** Moeda do plano do mercado (config/pricing.ts). */
  moeda?: "BRL" | "USD" | "EUR";
  /** Valor do pedido quando a URL não traz um confiável. */
  valor: number;
}) {
  // Só com a medição liberada ("aceito" no contexto). Recusou ou ainda não
  // escolheu: nada sai. Se a pessoa aceitar aqui mesmo, na página de
  // obrigado, o evento sai nesse momento, uma vez só.
  const consentimento = useConsentimento();
  const enviado = useRef(false);

  useEffect(() => {
    if (consentimento !== "aceito" || enviado.current) return;
    enviado.current = true;

    const { transacao, total } = dadosDoPurchase(new URLSearchParams(window.location.search), moeda, valor);

    // Meta Pixel
    quandoPronto("fbq", (fbq) =>
      fbq(
        "track",
        "Purchase",
        { currency: moeda, value: total, content_name: PLANO.nome },
        transacao ? { eventID: transacao } : undefined
      )
    );

    // GA4 e dataLayer (caso use GTM no futuro). O dataLayer nasce junto
    // com o gtag, no script de início do GA4.
    quandoPronto("gtag", (gtag) => {
      gtag("event", "purchase", {
        currency: moeda,
        value: total,
        transaction_id: transacao,
        items: [{ item_name: PLANO.nome, price: total, quantity: 1 }],
      });
      (window as any).dataLayer?.push({
        event: "Purchase",
        plano: PLANO.id,
        moeda,
        valor: total,
        transacao,
      });
    });
  }, [consentimento, moeda, valor]);

  return null;
}
