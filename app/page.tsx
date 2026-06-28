import { SITE, PROVA, AUTORES } from "@/config";
import { Wordmark, AppMockup, Logomark, ImageSlot, OfficialLogo } from "@/components/Brand";
import { StickyCTA, RevealOnScroll } from "@/components/Sticky";
import { Oferta } from "@/components/Oferta";
import { FAQ } from "@/components/FAQ";

export default function Page() {
  return (
    <main>
      <RevealOnScroll />

      {/* ---------- TOP — logo oficial centralizada ---------- */}
      <nav className="topnav">
        <div className="wrap" style={{ display: "flex", justifyContent: "center", padding: "var(--sp4) 0" }}>
          <a href="/" aria-label="Diariamente" style={{ textDecoration: "none" }}>
            <OfficialLogo height={36} />
          </a>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section style={{ paddingTop: "var(--sp16)", paddingBottom: "var(--sp20)" }}>
        <div className="wrap">
          <div className="split">
            <div className="split-copy">
              <span className="badge badge-primary eyebrow">De Brunno Falcão &amp; Roberta Carbonari</span>
              <h1 className="display" style={{ margin: "var(--sp4) 0 var(--sp6)" }}>
                Você não falha por falta de vontade.{" "}
                <span className="teal">Falha por falta de constância.</span>
              </h1>
              <p className="lead" style={{ maxWidth: "48ch", marginBottom: "var(--sp8)" }}>
                Diariamente é o livro que virou um ritual diário no seu bolso: uma provocação
                por dia, por 365 dias — e um app feito pra você não largar no meio.
              </p>
              <div style={{ display: "flex", gap: "var(--sp4)", flexWrap: "wrap", alignItems: "center" }}>
                <a href="#oferta" className="btn btn-primary btn-lg">Quero começar hoje</a>
                <a href="#metodo" className="btn btn-ghost">Como funciona →</a>
              </div>
              <div className="caption" style={{ marginTop: "var(--sp6)" }}>
                Já são <span className="teal" style={{ fontWeight: 700 }}>{PROVA.leitores}</span> em jornada · acesso por e-mail
              </div>
            </div>

            <div className="split-media reveal">
              <AppMockup width={300} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BARRA DE PROVA / AUTORIDADE ---------- */}
      <section style={{ paddingTop: 0, paddingBottom: "var(--sp16)" }}>
        <div className="wrap">
          <div className="sf-glass reveal" style={{ padding: "var(--sp6)", display: "flex", flexWrap: "wrap", gap: "var(--sp5)", justifyContent: "center", alignItems: "center" }}>
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
        <div className="wrap-content">
          <span className="overline eyebrow">O ciclo que você conhece</span>
          <h2 className="display-md" style={{ marginBottom: "var(--sp6)" }}>Você já começou. Mais de uma vez.</h2>
          <div className="stack lead">
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

      {/* ---------- VIRADA / TRANSFORMAÇÃO (split com imagem) ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="split reverse">
            <div className="split-media">
              <ImageSlot
                tag="Lifestyle"
                label="Foto ambiente — livro aberto à meia-luz, café, mood premium"
                dims="recomendado 1200×1500px · vertical 4:5"
                shape="portrait"
              />
            </div>
            <div className="split-copy">
              <span className="overline eyebrow">Agora imagine o contrário</span>
              <p className="display-md" style={{ marginBottom: "var(--sp5)" }}>
                Chegar ao fim do ano sabendo que você não faltou com a pessoa mais importante: você mesmo.
              </p>
              <p className="lead">
                365 dias em que você parou, pensou, se moveu. Um de cada vez. Sem pressão,
                sem culpa de estar atrasado, sem recomeçar do zero toda segunda. Não é sobre
                virar outra pessoa amanhã. É sobre virar, <span className="teal">diariamente</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- MECANISMO ÚNICO ---------- */}
      <section className="reveal" id="metodo">
        <div className="wrap">
          <div className="center sec-head">
            <span className="overline eyebrow">Por que dessa vez funciona</span>
            <h2 className="display-md">O Método Diariamente</h2>
            <p className="lead sec-intro" style={{ maxWidth: "44ch", marginLeft: "auto", marginRight: "auto" }}>
              Construído em cima do ponto exato onde todo mundo desiste.
            </p>
          </div>

          <div className="grid cols-3">
            {[
              { n: "1", t: "Provocação", d: "Todo dia, uma só. Pequena pra não dar preguiça, forte pra mexer. Te tira do automático." },
              { n: "2", t: "Ofensiva", d: "O app transforma cada dia em sequência. E ninguém gosta de quebrar a própria corrente." },
              { n: "3", t: "Acúmulo", d: "Conquistas, ranking e calendário mostram que o pouco de todo dia virou muito." },
            ].map((step) => (
              <div key={step.n} className="sf-dark" style={{ padding: "var(--sp8)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--p-500)", marginBottom: "var(--sp5)" }}>
                  {step.n}
                </div>
                <div className="h2" style={{ marginBottom: "var(--sp2)" }}>{step.t}</div>
                <p className="muted">{step.d}</p>
              </div>
            ))}
          </div>

          <p className="center display-sm" style={{ marginTop: "var(--sp16)", maxWidth: "20ch", marginLeft: "auto", marginRight: "auto" }}>
            Não é motivação num dia. É constância em 365 — <span className="teal">com método</span>.
          </p>
        </div>
      </section>

      {/* ---------- TOUR DO APP (showcase com screenshots) ---------- */}
      <section className="reveal">
        <div className="wrap">
          <div className="center sec-head">
            <span className="overline eyebrow">O que tem dentro</span>
            <h2 className="display-md">Um app inteiro pra você não parar</h2>
          </div>

          {/* destaque: HOJE + DIAS em screenshots grandes */}
          <div className="split" style={{ marginBottom: "var(--sp16)" }}>
            <div className="split-media">
              <ImageSlot tag="Screenshot" label="Tela HOJE — provocação do dia" dims="1170×2532px · print real do app" shape="portrait" />
            </div>
            <div className="split-copy">
              <h3 className="display-sm" style={{ marginBottom: "var(--sp4)" }}>Tela HOJE</h3>
              <p className="lead">A provocação do dia, limpa e sem distração. Você lê, reflete, marca como lido — e a sua sequência avança. Nada compete pela sua atenção.</p>
            </div>
          </div>

          <div className="split reverse" style={{ marginBottom: "var(--sp16)" }}>
            <div className="split-media">
              <ImageSlot tag="Screenshot" label="Tela DIAS — calendário de constância" dims="1170×2532px · print real do app" shape="portrait" />
            </div>
            <div className="split-copy">
              <h3 className="display-sm" style={{ marginBottom: "var(--sp4)" }}>Tela DIAS</h3>
              <p className="lead">Seu calendário de constância. Você enxerga, dia após dia, que não falhou com você mesmo. O progresso deixa de ser abstrato e vira imagem.</p>
            </div>
          </div>

          {/* grid de features secundárias */}
          <div className="grid cols-3">
            {[
              { t: "Ofensiva", d: "Sua sequência viva, dia após dia. A corrente que você não vai querer quebrar." },
              { t: "Conquistas", d: "Cada marco reconhecido. O esforço acumulado vira troféu." },
              { t: "Ranking", d: "Você não caminha sozinho. Tem gente fazendo junto." },
              { t: "WhatsApp", d: "A provocação chega onde você já está. Zero esforço pra lembrar." },
              { t: "365 provocações", d: "Um ano inteiro de conteúdo. Uma jornada, não uma leitura." },
              { t: "Compartilhar", d: "Transforme uma provocação em story e leve sua reflexão adiante." },
            ].map((f) => (
              <div key={f.t} className="sf-dark" style={{ padding: "var(--sp6)" }}>
                <Logomark size={24} />
                <div className="h2" style={{ margin: "var(--sp3) 0 var(--sp2)" }}>{f.t}</div>
                <p className="body-sm muted">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PARA QUEM É / NÃO É ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="grid cols-2">
            <div className="sf-dark" style={{ padding: "var(--sp8)" }}>
              <span className="badge badge-primary eyebrow">É pra você se</span>
              <ul className="check-list" style={{ marginTop: "var(--sp4)" }}>
                <li>Já tentou e largou outros livros, journals ou apps</li>
                <li>Quer mudança real, mas precisa de um sistema que te segure</li>
                <li>Prefere consistência a surto de motivação</li>
              </ul>
            </div>
            <div className="sf-dark" style={{ padding: "var(--sp8)" }}>
              <span className="badge badge-dark eyebrow">Não é pra você se</span>
              <ul style={{ listStyle: "none", marginTop: "var(--sp4)" }}>
                {["Procura solução mágica da noite pro dia", "Não está disposto a 5 minutos por dia", "Quer só mais um PDF pra estante digital"].map((t) => (
                  <li key={t} className="muted" style={{ display: "flex", gap: "var(--sp3)", padding: "var(--sp2) 0" }}>
                    <span style={{ color: "var(--n-500)" }}>—</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- AUTORIDADE (fotos dos autores) ---------- */}
      <section className="reveal">
        <div className="wrap">
          <div className="center sec-head">
            <span className="overline eyebrow">Quem está por trás</span>
            <h2 className="display-md">Brunno Falcão &amp; Roberta Carbonari</h2>
          </div>

          <div className="grid cols-2">
            <div className="sf-dark" style={{ overflow: "hidden" }}>
              <ImageSlot tag="Foto autor" label="Brunno Falcão — retrato" dims="1000×1000px · quadrado" shape="square" style={{ borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)" }} />
              <div style={{ padding: "var(--sp6)" }}>
                <div className="h1">{AUTORES.brunno.nome}</div>
                <p className="body-sm muted" style={{ marginTop: "var(--sp3)" }}>{AUTORES.brunno.bio}</p>
              </div>
            </div>
            <div className="sf-dark" style={{ overflow: "hidden" }}>
              <ImageSlot tag="Foto autor" label="Roberta Carbonari — retrato" dims="1000×1000px · quadrado" shape="square" style={{ borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)" }} />
              <div style={{ padding: "var(--sp6)" }}>
                <div className="h1">{AUTORES.roberta.nome}</div>
                <p className="body-sm muted" style={{ marginTop: "var(--sp3)" }}>{AUTORES.roberta.bio}</p>
              </div>
            </div>
          </div>

          <p className="caption center" style={{ marginTop: "var(--sp8)" }}>
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
        <div className="wrap-content center">
          <p className="display" style={{ marginBottom: "var(--sp6)" }}>
            A transformação não vai acontecer num dia.
          </p>
          <p className="lead" style={{ marginBottom: "var(--sp8)" }}>
            Vai acontecer <span className="teal">diariamente</span> — se você começar hoje.
          </p>
          <a href="#oferta" className="btn btn-primary btn-lg">Quero começar agora →</a>
        </div>
      </section>

      {/* ---------- GEO / SOBRE (bloco factual p/ busca e IA) ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap-content">
          <div className="sf-glass" style={{ padding: "var(--sp8)" }}>
            <h2 className="overline eyebrow">Sobre o Diariamente</h2>
            <div className="stack body-sm muted">
              <p>
                <strong className="teal">O que é:</strong> o Diariamente é um produto de
                desenvolvimento pessoal criado por Brunno Falcão e Roberta Carbonari. Une um
                livro de provocações diárias a um aplicativo que entrega 365 provocações — uma
                para cada dia do ano — com sistema de constância (ofensiva), conquistas, ranking
                e lembrete diário no WhatsApp.
              </p>
              <p>
                <strong className="teal">Para quem é:</strong> pessoas que buscam crescimento
                pessoal e propósito e que já tentaram livros, journals ou apps de hábito, mas
                largaram no meio. O Diariamente foi desenhado para resolver a constância, não
                apenas entregar conteúdo.
              </p>
              <p>
                <strong className="teal">Como funciona:</strong> o método tem três passos —
                provocação (uma reflexão por dia), ofensiva (a sequência que mantém o hábito) e
                acúmulo (conquistas e progresso visível). O acesso ao app é enviado por e-mail
                após a confirmação.
              </p>
              <p>
                <strong className="teal">Planos:</strong> Digital (app, R$ 147) e Combo
                (livro físico + app, R$ 247). Garantia de 7 dias. Realização Science Play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- RODAPÉ ---------- */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "var(--sp16) 0 calc(var(--sp20) + 60px)" }}>
        <div className="wrap center stack">
          <div style={{ display: "flex", justifyContent: "center" }}><Wordmark /></div>
          <p className="caption" style={{ maxWidth: "40ch", margin: "var(--sp2) auto 0" }}>
            Diariamente é uma realização Science Play®. Uma provocação por dia, por 365 dias.
          </p>
          <div style={{ display: "flex", gap: "var(--sp5)", justifyContent: "center", flexWrap: "wrap", marginTop: "var(--sp4)" }}>
            <a className="caption" href="/termos" style={{ color: "var(--n-400)" }}>Termos de uso</a>
            <a className="caption" href="/privacidade" style={{ color: "var(--n-400)" }}>Política de privacidade</a>
            <a className="caption" href="mailto:contato@scienceplay.com" style={{ color: "var(--n-400)" }}>Suporte</a>
          </div>
          <p className="caption" style={{ color: "var(--n-600)", marginTop: "var(--sp4)" }}>
            © {new Date().getFullYear()} Science Play® · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>

      <StickyCTA />
    </main>
  );
}
