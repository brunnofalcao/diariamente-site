import type { Metadata } from "next";
import { SITE, EMPRESA } from "@/config";
import { OfficialLogo } from "@/components/Brand";
import { StoreBadges } from "@/components/StoreBadges";
import { PurchaseTracking } from "@/components/PurchaseTracking";

export const metadata: Metadata = {
  title: "Tudo certo, seu Diariamente está a caminho",
  description: "Confirmação do seu acesso ao Diariamente.",
  robots: { index: false, follow: false }, // página de obrigado não indexa
};

export default function Obrigado() {
  return (
    <main className="obg">
      {/* dispara Purchase no Meta/GA4 (backup do evento do Hotmart) */}
      <PurchaseTracking />

      {/* brilho sutil no topo, igual ao mood da página de vendas */}
      <div className="obg-glow" aria-hidden="true" />

      <header className="obg-header">
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <OfficialLogo height={30} />
        </div>
      </header>

      <section className="obg-hero">
        <div className="wrap-narrow center">
          {/* selo de confirmação */}
          <div className="obg-check">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <span className="overline teal" style={{ display: "block", marginBottom: "var(--sp3)" }}>
            Acesso confirmado
          </span>

          <h1 className="obg-titulo">
            Seu primeiro passo já
            <br />
            está te esperando.
          </h1>

          <p className="lead muted obg-sub">
            Em instantes você recebe o <span className="teal">e-mail de acesso</span> com tudo
            que precisa pra abrir o app e começar. Se não chegar em alguns minutos, confira
            o spam ou fale com a gente.
          </p>
        </div>
      </section>

      {/* ---------- PASSO 1: comece hoje ---------- */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card obg-card-destaque">
            <div className="obg-card-glow" aria-hidden="true" />
            <div className="obg-card-inner">
              <span className="badge badge-primary">Comece agora</span>
              <h2 className="obg-card-titulo">Faça a provocação do Dia 1 hoje</h2>
              <p className="body-sm muted" style={{ marginBottom: "var(--sp6)" }}>
                Sua constância começa no momento em que você marca o primeiro dia como lido.
                Não deixe pra amanhã o que pode começar agora.
              </p>
              <a href={SITE.appUrl} className="btn btn-primary btn-block obg-cta">
                Abrir o app
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PASSO 2: baixe nas lojas ---------- */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card">
            <div className="obg-card-inner">
              <span className="overline">Passo 2</span>
              <h2 className="obg-card-titulo">Baixe o app no seu celular</h2>
              <p className="body-sm muted" style={{ marginBottom: "var(--sp6)" }}>
                Entre com o mesmo e-mail da sua compra. O ritual funciona melhor no bolso,
                junto com o lembrete diário no WhatsApp.
              </p>
              <StoreBadges variant="link" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- O QUE ESPERAR ---------- */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-lista">
            {[
              {
                t: "O e-mail de acesso",
                d: "Chega logo após a confirmação, com o passo a passo pra entrar no app.",
              },
              {
                t: "O lembrete diário",
                d: "Todo dia, no WhatsApp. Você não precisa lembrar de nada, o ritual te encontra.",
              },
              {
                t: "Sua jornada de constância",
                d: "O calendário e a ofensiva mostram sua sequência se construindo, dia após dia.",
              },
            ].map((item, i) => (
              <div key={i} className="obg-item">
                <div className="obg-num">{i + 1}</div>
                <div>
                  <div className="h3" style={{ marginBottom: 3 }}>{item.t}</div>
                  <p className="body-sm muted">{item.d}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="obg-frase center">
            O livro te provoca. O app te ajuda a voltar amanhã.
          </p>

          <p className="caption center" style={{ marginTop: "var(--sp8)" }}>
            Precisa de ajuda?{" "}
            <a href={`mailto:${EMPRESA.suporteEmail}`} className="teal">
              {EMPRESA.suporteEmail}
            </a>
          </p>
        </div>
      </section>

      <footer className="obg-footer">
        <div className="wrap center">
          <p className="caption" style={{ color: "var(--n-600)" }}>
            © {new Date().getFullYear()} {EMPRESA.marca}® · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>
    </main>
  );
}
