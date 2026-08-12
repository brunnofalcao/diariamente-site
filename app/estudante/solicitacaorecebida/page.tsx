import type { Metadata } from "next";
import { EMPRESA, ESTUDANTE, GARANTIA } from "@/config";
import { OfficialLogo } from "@/components/Brand";
import "../estudante.css";

export const metadata: Metadata = {
  title: "Solicitação recebida · Diariamente",
  description: "Sua condição de estudante foi registrada. O código chega no seu WhatsApp.",
  robots: { index: false, follow: false },
};

function IcOk() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const DEPOIS = [
  {
    t: "O código chega no seu WhatsApp",
    d: `Ele é pessoal e vale por ${ESTUDANTE.validadeHoras} horas. Se não aparecer em alguns minutos, confira se o número informado está com WhatsApp ativo.`,
  },
  {
    t: "Aplique no campo de cupom",
    d: "Na tela de pagamento existe um campo de cupom de desconto. Cole o código ali e a condição de estudante entra no valor.",
  },
  {
    t: "Abra o app e comece pelo Dia 1",
    d: `Você recebe o e-mail de acesso logo depois da confirmação. E tem ${GARANTIA.dias} dias de garantia para sentir se é pra você.`,
  },
];

export default function SolicitacaoRecebida() {
  return (
    <main className="ed">
      <div className="ed-glow" aria-hidden="true" />

      <header className="ed-topbar">
        <div className="ed-wrap ed-topbar-row">
          <a href="/" className="ed-topbar-logo" aria-label="Voltar para a página inicial do Diariamente">
            <OfficialLogo height={26} />
          </a>
        </div>
      </header>

      <section className="ed-hero">
        <div className="ed-wrap">
          <div className="ed-ok">
            <div className="ed-ok-ic">
              <IcOk />
            </div>
            <span className="ed-overline">Solicitação recebida</span>
            <h1 className="ed-h1" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>
              Agora é com o seu WhatsApp.
            </h1>
            <p className="ed-lead" style={{ margin: "0 auto" }}>
              Sua condição de estudante está registrada. Em instantes você recebe o código no
              número que informou. Deixe esta aba aberta se quiser, mas não precisa esperar
              aqui.
            </p>
          </div>
        </div>
      </section>

      <section className="ed-sec-tight">
        <div className="ed-wrap ed-wrap-sm">
          <ol className="ed-steps" style={{ gridTemplateColumns: "1fr", marginTop: 0 }}>
            {DEPOIS.map((p, i) => (
              <li className="ed-step" key={p.t}>
                <div className="ed-step-n" aria-hidden="true">
                  {i + 1}
                </div>
                <h2 className="ed-step-t">{p.t}</h2>
                <p className="ed-step-d">{p.d}</p>
              </li>
            ))}
          </ol>

          <p className="ed-quote">Constância não espera a formatura.</p>
        </div>
      </section>

      <footer className="ed-footer">
        <div className="ed-wrap ed-footer-row">
          <p>
            © {new Date().getFullYear()} {EMPRESA.marca}® · {EMPRESA.razaoSocial}
          </p>
          <nav aria-label="Links institucionais">
            <a href="/">Página inicial</a>
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
            <a href={`mailto:${EMPRESA.suporteEmail}`}>Suporte</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
