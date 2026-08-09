"use client";

import Link from "next/link";

/**
 * CtaEstudante — bloco na home (acima do rodapé) levando pra /estudante.
 * Specs do comando: overline teal 11px, título serif 30px, corpo 15px cinza,
 * botão primário 52px radius 16 com texto #00201F.
 * Evento GA4 no clique: cta_estudante_click.
 */
export function CtaEstudante() {
  const track = () => {
    (window as any).gtag?.("event", "cta_estudante_click");
    (window as any).dataLayer?.push({ event: "cta_estudante_click" });
  };

  return (
    <section className="reveal">
      <div className="wrap-narrow">
        <div className="cta-est">
          <span className="overline" style={{ color: "#27BDBE", display: "block", marginBottom: "var(--sp3)" }}>
            Estudante de saúde
          </span>
          <h2 className="cta-est-titulo">
            Você ainda está na graduação.
            <br />
            É agora que a diferença se constrói.
          </h2>
          <p className="cta-est-corpo">
            Existe uma condição para quem ainda está na faculdade.
          </p>
          <Link href="/estudante" className="cta-est-btn" onClick={track}>
            Ver condição de estudante
          </Link>
        </div>
      </div>
    </section>
  );
}
