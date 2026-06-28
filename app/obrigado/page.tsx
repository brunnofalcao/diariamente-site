import type { Metadata } from "next";
import { SITE, EMPRESA } from "@/config";
import { Wordmark, Logomark } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Tudo certo — seu Diariamente está a caminho",
  description: "Confirmação do seu acesso ao Diariamente.",
  robots: { index: false, follow: false }, // página de obrigado não indexa
};

export default function Obrigado() {
  return (
    <main>
      <header style={{ paddingTop: "var(--sp6)" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <Wordmark />
        </div>
      </header>

      <section style={{ paddingTop: "var(--sp12)" }}>
        <div className="wrap center">
          {/* selo de confirmação */}
          <div
            style={{
              width: 72, height: 72, margin: "0 auto var(--sp6)", borderRadius: 999,
              background: "rgba(76,175,80,.12)", border: "1px solid rgba(76,175,80,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <span className="overline eyebrow">Pronto</span>
          <h1 className="display" style={{ margin: "var(--sp3) 0 var(--sp4)" }}>
            Seu primeiro passo já<br />está te esperando.
          </h1>
          <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto var(--sp8)" }}>
            Em instantes você recebe o <span className="teal">e-mail de acesso</span> com tudo
            que precisa pra abrir o app e começar. Se não chegar em alguns minutos, confira
            o spam ou fale com a gente.
          </p>

          {/* próximo passo: ativação imediata */}
          <div className="sf-dark" style={{ padding: "var(--sp6)", textAlign: "left" }}>
            <span className="badge badge-primary eyebrow">Comece agora</span>
            <h2 className="h2" style={{ margin: "var(--sp3) 0 var(--sp3)" }}>
              Faça a provocação do Dia 1 hoje
            </h2>
            <p className="body-sm muted" style={{ marginBottom: "var(--sp5)" }}>
              Sua ofensiva começa no momento em que você marca o primeiro dia como lido.
              Não deixe pra amanhã o que pode iniciar uma sequência agora.
            </p>
            <a href={SITE.appUrl} className="btn btn-primary btn-block">
              <Logomark size={20} /> Abrir o app
            </a>
          </div>

          {/* o que esperar */}
          <div className="stack" style={{ marginTop: "var(--sp8)", textAlign: "left" }}>
            <div className="sf-glass" style={{ padding: "var(--sp5)" }}>
              <div className="h3" style={{ marginBottom: 4 }}>📧 Acesso ao app</div>
              <p className="body-sm muted">Chega por e-mail logo após a confirmação.</p>
            </div>
            <div className="sf-glass" style={{ padding: "var(--sp5)" }}>
              <div className="h3" style={{ marginBottom: 4 }}>📦 Livro físico (se você pegou o combo)</div>
              <p className="body-sm muted">
                Enviado para o endereço informado. Você recebe o código de rastreio assim
                que o envio for postado.
              </p>
            </div>
          </div>

          <p className="caption" style={{ marginTop: "var(--sp8)" }}>
            Precisa de ajuda? <a href={`mailto:${EMPRESA.suporteEmail}`} className="teal">{EMPRESA.suporteEmail}</a>
          </p>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", marginTop: "var(--sp12)", padding: "var(--sp10) 0" }}>
        <div className="wrap center">
          <p className="caption" style={{ color: "var(--n-600)" }}>
            © {new Date().getFullYear()} {EMPRESA.marca}® · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>
    </main>
  );
}
