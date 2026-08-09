"use client";

import { PLANOS, GARANTIA, ESCASSEZ, LANCAMENTO, LIVRO_AVULSO, type Plano } from "@/config";
import { StoreBadges } from "@/components/StoreBadges";

// Anexa as UTMs da URL atual ao link de checkout (preserva origem do tráfego).
function buildCheckoutUrl(base: string): string {
  if (typeof window === "undefined") return base;
  const here = new URLSearchParams(window.location.search);
  const utms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const carry = utms.filter((k) => here.get(k)).map((k) => `${k}=${encodeURIComponent(here.get(k)!)}`);
  if (!carry.length) return base;
  return base + (base.includes("?") ? "&" : "?") + carry.join("&");
}

function trackCheckout(plano: Plano) {
  (window as any).dataLayer?.push({ event: "InitiateCheckout", plano: plano.id });
  (window as any).gtag?.("event", "begin_checkout", {
    currency: "BRL",
    value: plano.precoNumero,
    items: [{ item_name: plano.nome, price: plano.precoNumero }],
  });
  (window as any).fbq?.("track", "InitiateCheckout", {
    currency: "BRL",
    value: plano.precoNumero,
    content_name: plano.nome,
  });
}

function CartCard({ plano }: { plano: Plano }) {
  const onCheckout = () => {
    trackCheckout(plano);
    const url = plano.checkoutUrl;
    if (url.startsWith("[")) {
      alert("Checkout em configuração. Em breve disponível.");
      return;
    }
    window.location.href = buildCheckoutUrl(url);
  };

  // "207,90" -> ["207", "90"]
  const [reais, centavos] = plano.preco.split(",");

  return (
    <div className={`cart-card${plano.destaque ? "" : " cart-card-alt"}`}>
      {plano.destaque && <div className="cart-glow" aria-hidden="true" />}

      <div className="cart-inner">
        {plano.destaque && ESCASSEZ.ativa && (
          <span className="badge badge-gold cart-selo">{ESCASSEZ.selo}</span>
        )}

        <div className="cart-head">
          <span className="overline teal">
            {plano.selo ?? "Acesso anual"}
          </span>
          <h3 className="cart-nome">{plano.nome}</h3>
        </div>

        {/* preço — âncora riscada + valor de lançamento */}
        <div className="cart-preco">
          {LANCAMENTO.ativa && plano.precoDe && (
            <div className="body-sm muted" style={{ marginBottom: 2 }}>
              <s>de R$ {plano.precoDe}</s>{" "}
              <span className="badge badge-gold" style={{ marginLeft: 6, verticalAlign: "middle" }}>
                {LANCAMENTO.selo}
              </span>
            </div>
          )}
          <div className="cart-parcela">
            <span className="cart-valor">R$ {reais}</span>
            {centavos && <span className="cart-cents">,{centavos}</span>}
          </div>
          <div className="cart-vista">à vista · ou em até 12x no checkout</div>
          <div className="cart-perdia">{plano.perDia}</div>
          {LANCAMENTO.ativa && plano.precoDe && (
            <div className="caption muted" style={{ marginTop: 4 }}>
              Condição {LANCAMENTO.prazoTexto}.
            </div>
          )}
        </div>

        <div className="cart-div" aria-hidden="true" />

        <ul className="check-list cart-list">
          {plano.inclui.map((item, i) => (
            <li key={i} className="body-sm">{item}</li>
          ))}
        </ul>

        <button className="btn btn-primary btn-block cart-cta" onClick={onCheckout}>
          {plano.ctaLabel}
        </button>

        {plano.nota && (
          <p className="caption center" style={{ marginTop: "var(--sp3)", color: "var(--n-400)" }}>
            {plano.nota}
          </p>
        )}

        <div className="cart-trust">
          <span>🔒 Pagamento seguro</span>
          <span>·</span>
          <span>Acesso por e-mail</span>
          <span>·</span>
          <span>Garantia {GARANTIA.dias} dias</span>
        </div>

        {plano.destaque && <StoreBadges variant="prova" />}
      </div>

      <div className="cart-rodape">{plano.rodape}</div>
    </div>
  );
}

export function Oferta() {
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

        {/* ---------- CARRINHOS (combo em destaque + app) ---------- */}
        <div style={{ display: "grid", gap: "var(--sp6)" }}>
          {PLANOS.map((p) => (
            <CartCard key={p.id} plano={p} />
          ))}
        </div>

        {/* ---------- BOX ESTUDANTE (leva à página própria, nova aba) ---------- */}
        <a
          href="/estudante"
          target="_blank"
          rel="noopener noreferrer"
          className="cart-estudante"
          onClick={() => {
            (window as any).gtag?.("event", "cta_estudante_click", { location: "oferta" });
            (window as any).dataLayer?.push({ event: "cta_estudante_click", location: "oferta" });
          }}
        >
          <div className="cart-estudante-txt">
            <span className="overline teal">Estudante</span>
            <p>
              Ainda está na graduação? Existe uma condição exclusiva pra quem estuda.
            </p>
          </div>
          <span className="cart-estudante-cta">
            Ver condição
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </a>

        {/* livro impresso avulso (discreto; nao dispersa do CTA principal) */}
        <p className="caption center" style={{ marginTop: "var(--sp4)" }}>
          Quer só o livro impresso?{" "}
          <a
            href={LIVRO_AVULSO}
            target="_blank"
            rel="noopener noreferrer"
            className="teal"
            onClick={() => {
              (window as any).gtag?.("event", "click_livro_avulso", { location: "oferta" });
              (window as any).dataLayer?.push({ event: "click_livro_avulso", location: "oferta" });
            }}
          >
            Ele está disponível aqui
          </a>
          .
        </p>

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
