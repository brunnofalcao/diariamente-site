import { SITE, PROVA, AUTORES } from "@/config";
import { Wordmark, AppMockup, Logomark } from "@/components/Brand";
import { StickyCTA, RevealOnScroll } from "@/components/Sticky";
import { Oferta } from "@/components/Oferta";
import { FAQ } from "@/components/FAQ";

export default function Page() {
  return (
    <main>
      <RevealOnScroll />

      {/* ---------- HERO ---------- */}
      <header style={{ paddingTop: "var(--sp6)" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <Wordmark />
        </div>
      </header>

      <section style={{ paddingTop: "var(--sp10)", paddingBottom: "var(--sp12)" }}>
        <div className="wrap center">
          <span className="badge badge-primary eyebrow">
            De Brunno Falcão & Roberta Carbonari
          </span>
          <h1 className="display" style={{ margin: "var(--sp4) 0 var(--sp4)" }}>
            Você não falha por falta de vontade.<br />
            <span className="teal">Falha por falta de constância.</span>
          </h1>
          <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto var(--sp6)" }}>
            Diariamente é o livro que virou um ritual diário no seu bolso: uma provocação
            por dia, por 363 dias — e um app feito pra você não largar no meio.
          </p>

          <div style={{ maxWidth: 360, margin: "0 auto" }}>
            <a href="#oferta" className="btn btn-primary">Quero começar hoje</a>
          </div>
          <div className="caption" style={{ marginTop: "var(--sp4)" }}>
            Já são <span className="teal" style={{ fontWeight: 700 }}>{PROVA.leitores}</span> em jornada · acesso por e-mail
          </div>

          <div style={{ marginTop: "var(--sp10)" }}>
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ---------- BARRA DE PROVA / AUTORIDADE ---------- */}
      <section style={{ paddingTop: 0, paddingBottom: "var(--sp12)" }}>
        <div className="wrap">
          <div className="sf-glass reveal" style={{ padding: "var(--sp5)", display: "flex", flexWrap: "wrap", gap: "var(--sp4)", justifyContent: "center", alignItems: "center" }}>
            <span className="caption">Construído por quem vive de transformar pessoas:</span>
            <span className="badge badge-dark">Science Play®</span>
            <span className="badge badge-dark">Forbes Portugal</span>
            <span className="badge badge-dark">Medicina S/A</span>
            <span className="badge badge-dark">O Fit Feed</span>
          </div>
        </div>
      </section>

      {/* ---------- DOR ---------- */}
      <section className="reveal">
        <div className="wrap">
          <span className="overline eyebrow">O ciclo que você conhece</span>
          <h2 className="display-md sec-title">Você já começou. Mais de uma vez.</h2>
          <div className="stack" style={{ color: "var(--n-300)" }}>
            <p>Comprou o livro. Baixou o app. Prometeu que dessa vez ia até o fim.</p>
            <p>E no terceiro, quarto, quinto dia… a vida engoliu.</p>
            <p style={{ color: "var(--n-0)" }}>
              O problema nunca foi você ser "sem disciplina". O problema é que ninguém te
              deu um sistema pra continuar. Só conteúdo. E conteúdo parado não transforma
              ninguém.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- VIRADA / TRANSFORMAÇÃO ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sf-dark" style={{ padding: "var(--sp8) var(--sp6)" }}>
            <span className="overline eyebrow">Agora imagine o contrário</span>
            <p className="display-md" style={{ marginBottom: "var(--sp4)" }}>
              Chegar ao fim do ano sabendo que você não faltou com a pessoa mais importante: você mesmo.
            </p>
            <p className="muted">
              363 dias em que você parou, pensou, se moveu. Um de cada vez. Sem pressão,
              sem culpa de estar atrasado, sem recomeçar do zero toda segunda. Não é sobre
              virar outra pessoa amanhã. É sobre virar, <span className="teal">diariamente</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- MECANISMO ÚNICO ---------- */}
      <section className="reveal">
        <div className="wrap">
          <div className="center">
            <span className="overline eyebrow">Por que dessa vez funciona</span>
            <h2 className="display-md sec-title">O Método Diariamente</h2>
            <p className="muted" style={{ maxWidth: "40ch", margin: "0 auto var(--sp8)" }}>
              Construído em cima do ponto exato onde todo mundo desiste.
            </p>
          </div>

          <div className="stack">
            {[
              { n: "1", t: "Provocação", d: "Todo dia, uma só. Pequena pra não dar preguiça, forte pra mexer. Te tira do automático." },
              { n: "2", t: "Ofensiva", d: "O app transforma cada dia em sequência. E ninguém gosta de quebrar a própria corrente." },
              { n: "3", t: "Acúmulo", d: "Conquistas, ranking e calendário mostram que o pouco de todo dia virou muito." },
            ].map((step) => (
              <div key={step.n} className="sf-dark" style={{ padding: "var(--sp5)", display: "flex", gap: "var(--sp4)", alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 44px", height: 44, borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--p-500)" }}>
                  {step.n}
                </div>
                <div>
                  <div className="h3" style={{ marginBottom: 2 }}>{step.t}</div>
                  <p className="body-sm muted">{step.d}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="center display-md" style={{ marginTop: "var(--sp10)", fontSize: "clamp(20px,5.5vw,26px)" }}>
            Não é motivação num dia.<br />É constância em 363 — <span className="teal">com método</span>.
          </p>
        </div>
      </section>

      {/* ---------- TOUR DO APP ---------- */}
      <section className="reveal">
        <div className="wrap">
          <span className="overline eyebrow">O que tem dentro</span>
          <h2 className="display-md sec-title">Um app inteiro pra você não parar</h2>
          <div className="grid-2" style={{ marginTop: "var(--sp6)" }}>
            {[
              { t: "Tela HOJE", d: "A provocação do dia, limpa e sem distração. Marque como lido e siga." },
              { t: "Tela DIAS", d: "Seu calendário de constância. Você enxerga que não falhou com você." },
              { t: "Ofensiva", d: "Sua sequência viva, dia após dia. A corrente que você não vai querer quebrar." },
              { t: "Conquistas", d: "Cada marco reconhecido. O esforço acumulado vira troféu." },
              { t: "Ranking", d: "Você não caminha sozinho. Tem gente fazendo junto." },
              { t: "WhatsApp", d: "A provocação chega onde você já está. Zero esforço pra lembrar." },
            ].map((f) => (
              <div key={f.t} className="sf-dark" style={{ padding: "var(--sp5)" }}>
                <Logomark size={22} />
                <div className="h3" style={{ margin: "var(--sp3) 0 4px" }}>{f.t}</div>
                <p className="body-sm muted">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PARA QUEM É / NÃO É ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap stack">
          <div className="sf-dark" style={{ padding: "var(--sp6)" }}>
            <span className="badge badge-primary eyebrow">É pra você se</span>
            <ul className="check-list" style={{ marginTop: "var(--sp3)" }}>
              <li className="body-sm">Já tentou e largou outros livros, journals ou apps</li>
              <li className="body-sm">Quer mudança real, mas precisa de um sistema que te segure</li>
              <li className="body-sm">Prefere consistência a surto de motivação</li>
            </ul>
          </div>
          <div className="sf-dark" style={{ padding: "var(--sp6)" }}>
            <span className="badge badge-dark eyebrow">Não é pra você se</span>
            <ul style={{ listStyle: "none", marginTop: "var(--sp3)" }}>
              {["Procura solução mágica da noite pro dia", "Não está disposto a 5 minutos por dia", "Quer só mais um PDF pra estante digital"].map((t) => (
                <li key={t} className="body-sm muted" style={{ display: "flex", gap: "var(--sp3)", padding: "var(--sp2) 0" }}>
                  <span style={{ color: "var(--n-500)" }}>—</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- AUTORIDADE ---------- */}
      <section className="reveal">
        <div className="wrap">
          <span className="overline eyebrow">Quem está por trás</span>
          <h2 className="display-md sec-title">Brunno Falcão & Roberta Carbonari</h2>
          <div className="stack" style={{ marginTop: "var(--sp6)" }}>
            <div className="sf-glass" style={{ padding: "var(--sp5)" }}>
              <div className="h3">{AUTORES.brunno.nome}</div>
              <p className="body-sm muted" style={{ marginTop: 6 }}>{AUTORES.brunno.bio}</p>
            </div>
            <div className="sf-glass" style={{ padding: "var(--sp5)" }}>
              <div className="h3">{AUTORES.roberta.nome}</div>
              <p className="body-sm muted" style={{ marginTop: 6 }}>{AUTORES.roberta.bio}</p>
            </div>
          </div>
          <p className="caption" style={{ marginTop: "var(--sp5)" }}>
            Juntos, transformaram um livro num ritual diário que {PROVA.leitores} carregam no bolso.
          </p>
        </div>
      </section>

      {/* ---------- OFERTA ---------- */}
      <Oferta />

      {/* ---------- FAQ ---------- */}
      <FAQ />

      {/* ---------- CTA FINAL ---------- */}
      <section className="reveal">
        <div className="wrap center">
          <p className="display" style={{ fontSize: "clamp(26px,7vw,38px)", marginBottom: "var(--sp4)" }}>
            A transformação não vai<br />acontecer num dia.
          </p>
          <p className="muted" style={{ marginBottom: "var(--sp6)" }}>
            Vai acontecer <span className="teal">diariamente</span> — se você começar hoje.
          </p>
          <div style={{ maxWidth: 360, margin: "0 auto" }}>
            <a href="#oferta" className="btn btn-primary">Quero começar agora →</a>
          </div>
        </div>
      </section>

      {/* ---------- RODAPÉ ---------- */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "var(--sp10) 0 calc(var(--sp16) + 60px)" }}>
        <div className="wrap center stack">
          <div style={{ display: "flex", justifyContent: "center" }}><Wordmark /></div>
          <p className="caption" style={{ maxWidth: "40ch", margin: "0 auto" }}>
            Diariamente é uma realização Science Play®. Uma provocação por dia, por 363 dias.
          </p>
          <div style={{ display: "flex", gap: "var(--sp4)", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="caption" href="/termos" style={{ color: "var(--n-400)" }}>Termos de uso</a>
            <a className="caption" href="/privacidade" style={{ color: "var(--n-400)" }}>Política de privacidade</a>
            <a className="caption" href="mailto:suporte@diariamente.club" style={{ color: "var(--n-400)" }}>Suporte</a>
          </div>
          <p className="caption" style={{ color: "var(--n-600)" }}>
            © {new Date().getFullYear()} Science Play® · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>

      <StickyCTA />
    </main>
  );
}
