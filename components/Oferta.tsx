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
          <p className="lead sec-intro" style={{ maxWidth: "46ch", margin: "var(--sp4) auto 0" }}>
            Por menos de R$ 1 por dia, você troca a estante de livros não terminados por um
            sistema que te traz de volta todo dia. Não é mais um conteúdo. É o que faz o
            conteúdo virar constância.
          </p>
        </div>

        <div className="grid cols-2" style={{ alignItems: "stretch" }}>
          {PLANOS.map((p) => (
            <div
              key={p.id}
              className="sf-dark plano-card"
              style={{
                padding: "var(--sp8)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
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

              <h3 className="h2" style={{ marginTop: p.selo ? 8 : 0 }}>{p.nome}</h3>

              {/* âncora: livro avulso só no combo */}
              <div className="caption" style={{ marginTop: 6, minHeight: 18 }}>
                {p.destaque ? (
                  <>Livro avulso: <s>R$ {PRECO_ANCORA_LIVRO}</s> · aqui ele vem junto do app</>
                ) : (
                  <>Acesso completo ao app, por 1 ano inteiro</>
                )}
              </div>

              {/* preço: de/por (riscado + lançamento) */}
              <div className="preco-bloco">
                {p.precoDe && (
                  <span className="preco-de">de R$ {p.precoDe}</span>
                )}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <span className="muted" style={{ fontSize: 15 }}>por R$</span>
                  <span className="preco-num">{p.preco}</span>
                </div>
                {p.parcela && <div className="caption">{p.parcela}</div>}
                {p.perDia && <div className="caption teal" style={{ marginTop: 2, fontWeight: 600 }}>{p.perDia}</div>}
                {p.rodape && <div className="caption gold" style={{ marginTop: 4 }}>{p.rodape}</div>}
              </div>

              <ul className="check-list" style={{ margin: "var(--sp5) 0 var(--sp6)", flex: 1 }}>
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

        {/* frase de fechamento perto do carrinho */}
        <p className="oferta-frase center">
          O livro te provoca. O app te ajuda a voltar amanhã.
        </p>

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
