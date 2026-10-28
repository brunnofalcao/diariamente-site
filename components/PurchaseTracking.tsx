"use client";

import { useEffect, useRef } from "react";
import { PLANO } from "@/config";
import { useConsentimento } from "@/components/Consentimento";
import { quandoPronto } from "@/lib/medicao";

/**
 * PurchaseTracking: dispara o evento de compra no Meta Pixel e GA4
 * quando a página de obrigado APROVADA carrega, SE houver aceite no aviso
 * de cookies. Só a aprovada o monta (components/PaginaObrigado.tsx): nas
 * de pagamento pendente e em análise a venda ainda não existe.
 *
 * IMPORTANTE: isto é um BACKUP do evento que o Hotmart envia via pixel/API.
 * O evento oficial e confiável é o do Hotmart (server-side, pega boleto/Pix
 * aprovado depois). Este aqui cobre o caso de o cliente cair aqui direto.
 *
 * MOEDA E VALOR DO MERCADO CERTO. Antes, sempre BRL. Agora a página
 * decide o mercado no servidor (lib/obrigado.mjs, mercadoDoObrigado: a
 * oferta ?off=, o cookie dm_mercado e o caminho) e entrega a moeda do
 * plano e o valor do pedido (lib/pos-pagamento.ts, valorDoPedido, a partir
 * de config/pricing.ts). O valor da URL (value, price...) só vale quando
 * dá para saber que está na mesma moeda: no Brasil, que só cobra em real
 * (a não ser que a URL diga outra moeda), e fora dele só se a URL disser a
 * moeda e ela for a do plano. A oferta em dólar da América Latina é paga
 * "na moeda local": um price em pesos lido como dólar inflaria o ROAS.
 *
 * Se o Hotmart mandar o id da transação na URL (?transaction=...), ele
 * vira o eventID (dedupe com o evento do Hotmart). Sem isso, o Meta pode
 * contar a mesma venda duas vezes.
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
  // Só com o "Aceitar" do aviso de cookies. Recusou ou ainda não escolheu:
  // nada sai. Se a pessoa aceitar aqui mesmo, na página de obrigado, o
  // evento sai nesse momento, uma vez só.
  const consentimento = useConsentimento();
  const enviado = useRef(false);

  useEffect(() => {
    if (consentimento !== "aceito" || enviado.current) return;
    enviado.current = true;

    const params = new URLSearchParams(window.location.search);
    // hottok NÃO entra: é o segredo do webhook da Hotmart. Usado como id de evento, ia
    // para o Meta Pixel, o GA4 e o dataLayer, e, por ser constante, fazia o Meta tratar
    // compras diferentes como a mesma.
    const transacao =
      params.get("transaction") ||
      params.get("transaction_id") ||
      undefined;

    const bruto =
      params.get("value") ||
      params.get("price") ||
      params.get("full_price") ||
      params.get("transaction_value");
    const lido = bruto ? Number(String(bruto).replace(",", ".")) : NaN;
    const moedaDaUrl = (params.get("currency") || params.get("currency_code") || "").trim().toUpperCase();
    const mesmaMoeda = moeda === "BRL" ? !moedaDaUrl || moedaDaUrl === "BRL" : moedaDaUrl === moeda;
    const total = mesmaMoeda && Number.isFinite(lido) && lido > 0 ? lido : valor;

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
