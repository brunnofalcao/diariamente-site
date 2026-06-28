"use client";

import { PLANOS, PRECO_ANCORA_LIVRO, GARANTIA, ESCASSEZ } from "@/config";

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
  const onCheckout = (planoId: string, url: string) => {
    (window as any).dataLayer?.push({ event: "InitiateCheckout", plano: planoId });
    if (url.startsWith("[")) {
      // checkout ainda não configurado — evita botão morto
      alert("Checkout em configuração. Em breve disponível.");
      return;
    }
    window.location.href = buildCheckoutUrl(url);
  };

  return (
    <section id="oferta">
      <div className="wrap-narrow">
        <div className="center sec-head">
          {ESCASSEZ.ativa && (
            <span className="badge badge-gold eyebrow">{ESCASSEZ.selo}</span>
          )}
          <h2 className="display-md">Escolha como quer começar</h2>
          <p className="lead sec-intro" style={{ maxWidth: "44ch", margin: "var(--sp4) auto 0" }}>
            Você pode continuar comprando livros que param na página 20. Ou entrar numa
            jornada feita pra você ir até o último dia.
          </p>
        </div>

        <div className="grid cols-2" style={{ alignItems: "start" }}>
          {PLANOS.map((p) => (
            <div
              key={p.id}
              className="sf-dark"
              style={{
                padding: "var(--sp8)",
                position: "relative",
                borderColor: p.destaque ? "rgba(39,189,190,.35)" : "var(--border)",
                boxShadow: p.destaque ? "0 0 0 1px rgba(39,189,190,.15), 0 20px 60px rgba(0,0,0,.4)" : "none",
              }}
            >
              {p.selo && (
                <span
                  className="badge badge-primary"
                  style={{ position: "absolute", top: -12, left: "var(--sp6)" }}
                >
                  ★ {p.selo}
                </span>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: p.selo ? 8 : 0 }}>
                <h3 className="h2">{p.nome}</h3>
              </div>

              {/* âncora de valor: só no combo, mostra o livro avulso */}
              {p.destaque && (
                <div className="caption" style={{ marginTop: 6 }}>
                  Livro avulso: <s>R$ {PRECO_ANCORA_LIVRO}</s> · aqui ele vem junto do app
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, margin: "var(--sp4) 0 2px" }}>
                <span className="muted" style={{ fontSize: 15 }}>R$</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 44, lineHeight: 1, color: "var(--n-0)" }}>
                  {p.preco}
                </span>
              </div>
              {p.parcela && <div className="caption">{p.parcela}</div>}
              {p.rodape && <div className="caption gold" style={{ marginTop: 4 }}>{p.rodape}</div>}

              <ul className="check-list" style={{ margin: "var(--sp5) 0 var(--sp6)" }}>
                {p.inclui.map((item, i) => (
                  <li key={i} className="body-sm">{item}</li>
                ))}
              </ul>

              <button
                className={`btn btn-block ${p.destaque ? "btn-primary" : "btn-dark"}`}
                onClick={() => onCheckout(p.id, p.checkoutUrl)}
              >
                {p.ctaLabel}
              </button>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div className="sf-glass" style={{ padding: "var(--sp5)", marginTop: "var(--sp6)", display: "flex", gap: "var(--sp4)", alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 auto", fontSize: 22 }}>🛡️</div>
          <div>
            <div className="h3" style={{ marginBottom: 4 }}>Garantia de {GARANTIA.dias} dias</div>
            <p className="body-sm muted">{GARANTIA.texto}</p>
          </div>
        </div>

        <p className="caption center" style={{ marginTop: "var(--sp5)" }}>
          O acesso ao app é enviado por e-mail logo após a confirmação.
        </p>
      </div>
    </section>
  );
}
