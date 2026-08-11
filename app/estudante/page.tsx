import type { Metadata } from "next";
import { SITE, EMPRESA } from "@/config";
import { OfficialLogo } from "@/components/Brand";
import { BlocoPreco } from "@/components/BlocoPreco";
import { EstudanteForm } from "@/components/EstudanteForm";

export const metadata: Metadata = {
  title: "Diariamente para estudantes",
  description:
    "Uma provocação por dia durante toda a sua graduação, em qualquer curso. Condição exclusiva para estudantes.",
  openGraph: {
    title: "Diariamente para estudantes",
    description:
      "Uma provocação por dia durante toda a sua graduação, em qualquer curso. Condição exclusiva para estudantes.",
    images: [{ url: SITE.ogImage }],
  },
};

export default function Estudante() {
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

      {/* ---------- HERO ---------- */}
      <section className="est-hero">
        <div className="wrap-narrow center">
          <span className="overline teal" style={{ display: "block", marginBottom: "var(--sp3)" }}>
            Estudante
          </span>
          <h1 className="est-titulo">
            O diploma vai ser igual
            <br />
            pra turma inteira.
            <br />
            A constância, não.
          </h1>
          <p className="lead muted est-sub">
            Vale pra qualquer curso. A diferença entre colegas de turma não aparece na
            prova. Aparece nos anos seguintes, construída um dia de cada vez. O
            Diariamente é uma provocação por dia, 365 dias por ano, pra você se
            desenvolver pessoal e profissionalmente formando o hábito que a faculdade
            não ensina: voltar amanhã.
          </p>
        </div>
      </section>

      {/* ---------- O QUE VOCÊ RECEBE ---------- */}
      <section className="est-sec">
        <div className="wrap-narrow">
          <div className="est-lista">
            {[
              {
                t: "Uma provocação por dia",
                d: "Curta, direta, feita pra ser lida em dois minutos entre uma aula e outra.",
              },
              {
                t: "Reflexão que vira ação",
                d: "O menu Ações transforma o que você pensou em tarefa concreta do dia.",
              },
              {
                t: "Constância medida",
                d: "Ofensiva, conquistas e ranking mostram sua sequência se construindo.",
              },
            ].map((item, i) => (
              <div key={i} className="est-item">
                <div className="est-num">{i + 1}</div>
                <div>
                  <div className="h3" style={{ marginBottom: 3 }}>{item.t}</div>
                  <p className="body-sm muted">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONDIÇÃO (preço pendente) ---------- */}
      <section className="est-sec">
        <div className="wrap-narrow">
          <BlocoPreco />
        </div>
      </section>

      {/* ---------- FORMULÁRIO ---------- */}
      <section className="est-sec" id="formulario">
        <div className="wrap-narrow">
          <EstudanteForm />
        </div>
      </section>

      {/* ---------- COMO FUNCIONA ---------- */}
      <section className="est-sec">
        <div className="wrap-narrow">
          <h2 className="est-h2 center">Como funciona</h2>
          <div className="est-lista" style={{ marginTop: "var(--sp6)" }}>
            {[
              {
                t: "Preencha com seus dados de estudante",
                d: "Nome, curso, instituição e previsão de conclusão. Leva um minuto.",
              },
              {
                t: "Receba seu código no WhatsApp",
                d: "Um código exclusivo, pessoal e com validade, enviado direto no seu WhatsApp.",
              },
              {
                t: "Ative seu acesso",
                d: "Use o código na tela de pagamento e comece a provocação do Dia 1 hoje.",
              },
            ].map((item, i) => (
              <div key={i} className="est-item">
                <div className="est-num">{i + 1}</div>
                <div>
                  <div className="h3" style={{ marginBottom: 3 }}>{item.t}</div>
                  <p className="body-sm muted">{item.d}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="est-frase center">
            Constância não espera a formatura.
          </p>
        </div>
      </section>

      <footer className="est-footer">
        <div className="wrap center">
          <p className="caption" style={{ color: "var(--n-600)" }}>
            © {new Date().getFullYear()} {EMPRESA.marca}® · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>
    </main>
  );
}
