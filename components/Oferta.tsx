"use client";

import { PLANO, GARANTIA, ESCASSEZ } from "@/config";

// Anexa as UTMs da URL atual ao link de checkout (preserva origem do tráfego).
function buildCheckoutUrl(base: string): string {
  if (typeof window === "undefined") return base;
  const here = new URLSearchParams(window.location.search);
  const utms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const carry = utms.filter((k) => here.get(k)).map((k) => `${k}=${encodeURIComponent(here.get(k)!)}`);
  if (!carry.length) return base;
  return base + (base.includes("?") ? "&" : "?") + carry.join("&");
}

export function Oferta() {
  const onCheckout = () => {
    // GA4 (via dataLayer/gtag) + Meta Pixel — evento de início de checkout
    (window as any).dataLayer?.push({ event: "InitiateCheckout", plano: PLANO.id });
    (window as any).gtag?.("event", "begin_checkout", {
      currency: "BRL",
      value: PLANO.precoNumero,
      items: [{ item_name: PLANO.nome, price: PLANO.precoNumero }],
    });
    (window as any).fbq?.("track", "InitiateCheckout", {
      currency: "BRL",
      value: PLANO.precoNumero,
      content_name: PLANO.nome,
    });
    const url = PLANO.checkoutUrl;
    if (url.startsWith("[")) {
      alert("Checkout em configuração. Em breve disponível.");
      return;
    }
    window.location.href = buildCheckoutUrl(url);
  };

  return (
    <section id="oferta">
      <div className="wrap-narrow">
        <div className="center sec-head">
          <h2 className="display-md">Comece sua constância hoje</h2>
          <p className="lead sec-intro" style={{ maxWidth: "44ch", margin: "var(--sp4) auto 0" }}>
            Um ano inteiro de provocação diária, com o sistema que te traz de volta
            todo dia. Não é mais um conteúdo. É o que faz o conteúdo virar constância.
          </p>
        </div>

        {/* ---------- CARRINHO ÚNICO ---------- */}
        <div className="cart-card">
          <div className="cart-glow" aria-hidden="true" />

          <div className="cart-inner">
            {ESCASSEZ.ativa && (
              <span className="badge badge-gold cart-selo">{ESCASSEZ.selo}</span>
            )}

            <div className="cart-head">
              <span className="overline teal">Acesso anual</span>
              <h3 className="cart-nome">{PLANO.nome}</h3>
            </div>

            {/* preço */}
            <div className="cart-preco">
              <div className="cart-parcela">
                <span className="cart-x">12x</span>
                <span className="cart-valor">R$ 30</span>
                <span className="cart-cents">,72</span>
              </div>
              <div className="cart-vista">{PLANO.precoVista}</div>
              <div className="cart-perdia">{PLANO.perDia}</div>
            </div>

            <div className="cart-div" aria-hidden="true" />

            <ul className="check-list cart-list">
              {PLANO.inclui.map((item, i) => (
                <li key={i} className="body-sm">{item}</li>
              ))}
            </ul>

            <button className="btn btn-primary btn-block cart-cta" onClick={onCheckout}>
              {PLANO.ctaLabel}
            </button>

            <div className="cart-trust">
              <span>🔒 Pagamento seguro</span>
              <span>·</span>
              <span>Acesso por e-mail</span>
              <span>·</span>
              <span>Garantia {GARANTIA.dias} dias</span>
            </div>
          </div>

          {/* rodapé do card */}
          <div className="cart-rodape">{PLANO.rodape}</div>
        </div>

        {/* Garantia */}
        <div className="sf-glass" style={{ padding: "var(--sp5)", marginTop: "var(--sp6)", display: "flex", gap: "var(--sp4)", alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 auto", fontSize: 22 }}>🛡️</div>
          <div>
            <div className="h3" style={{ marginBottom: 4 }}>Garantia de {GARANTIA.dias} dias</div>
            <p className="body-sm muted">{GARANTIA.texto}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
