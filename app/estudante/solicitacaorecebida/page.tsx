import type { Metadata } from "next";
import { OfficialLogo } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Solicitação recebida — Diariamente",
  robots: { index: false, follow: false },
};

export default function SolicitacaoRecebida() {
  return (
    <main className="est">
      <div className="est-glow" aria-hidden="true" />

      <header className="est-header">
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <a href="/" aria-label="Diariamente">
            <OfficialLogo height={30} />
          </a>
        </div>
      </header>

      <section className="est-hero">
        <div className="wrap-narrow center">
          <span
            className="overline teal"
            style={{ display: "block", marginBottom: "var(--sp3)" }}
          >
            Solicitação recebida
          </span>
          <h1 className="est-titulo">Recebemos seus dados</h1>
          <p className="lead muted est-sub">
            Sua condição de estudante está confirmada. Em instantes você recebe no
            seu WhatsApp o link para concluir sua matrícula — com a condição já
            aplicada.
          </p>
          <p className="body-sm muted" style={{ marginTop: "var(--sp6)" }}>
            É só tocar no botão da mensagem. Fique de olho no seu WhatsApp.
          </p>
        </div>
      </section>
    </main>
  );
}
