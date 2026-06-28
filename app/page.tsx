import { SITE, PROVA, AUTORES, SCREENSHOTS } from "@/config";
import { AppMockup, Logomark, ImageSlot, OfficialLogo, FooterLogo, InstagramLink } from "@/components/Brand";
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
            <OfficialLogo height={72} />
          </a>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section style={{ paddingTop: "var(--sp16)", paddingBottom: "var(--sp20)" }}>
        <div className="wrap">
          <div className="split">
            <div className="split-copy">
              <span className="overline eyebrow" style={{ display: "block" }}>Provocações diárias para se desenvolver profissionalmente</span>
              <span className="badge badge-primary eyebrow">De Brunno Falcão &amp; Roberta Carbonari</span>
              <h1 className="display" style={{ margin: "var(--sp4) 0 var(--sp6)" }}>
                Você não falha por falta de vontade.{" "}
                <span className="teal">Falha por falta de constância.</span>
              </h1>
              <p className="lead" style={{ maxWidth: "48ch", marginBottom: "var(--sp8)" }}>
                Diariamente é o livro que virou um ritual diário no seu bolso: uma provocação
                por dia, por 365 dias, com um app criado pra te ajudar a voltar amanhã,
                depois de amanhã e no dia seguinte.
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
              <div className="float-slow">
                <AppMockup width={300} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BARRA DE PROVA / AUTORIDADE ---------- */}
      <section style={{ paddingTop: 0, paddingBottom: "var(--sp16)" }}>
        <div className="wrap">
          <div className="sf-glass reveal" style={{ padding: "var(--sp6)", textAlign: "center" }}>
            <span className="caption" style={{ display: "block", marginBottom: "var(--sp3)" }}>
              Uma realização Science Play, com mais de {PROVA.leitores} em jornada:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp3)", justifyContent: "center" }}>
              <span className="badge badge-dark">Science Play®</span>
              <span className="badge badge-dark">Brunno Falcão</span>
              <span className="badge badge-dark">Roberta Carbonari</span>
            </div>
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
            <p className="teal" style={{ fontWeight: 600 }}>
              O inimigo não é a falta de motivação. É o abandono silencioso. O Diariamente
              foi criado para o ponto exato onde você costuma parar.
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
                virar outra pessoa amanhã. É sobre virar, <span className="teal live-word">diariamente</span>.
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
              { n: "2", t: "Constância", d: "Cada dia registrado fortalece sua sequência e mostra, visualmente, que você está construindo algo maior." },
              { n: "3", t: "Ação", d: "A provocação não morre na reflexão: vira tarefa concreta no menu Ações. Pensar vira fazer." },
            ].map((step) => (
              <div key={step.n} className="sf-dark lift" style={{ padding: "var(--sp8)" }}>
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
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela HOJE — provocação do dia" dims="1170×2532px · print real do app" shape="portrait" bare src={SCREENSHOTS.hoje || undefined} alt="Tela HOJE do app Diariamente" />
              </div>
            </div>
            <div className="split-copy">
              <h3 className="display-sm" style={{ marginBottom: "var(--sp4)" }}>Tela HOJE</h3>
              <p className="lead">A provocação do dia, limpa e sem distração. Você lê, reflete, registra o dia — e acompanha sua jornada de constância. Nada compete pela sua atenção.</p>
            </div>
          </div>

          <div className="split reverse" style={{ marginBottom: "var(--sp16)" }}>
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela DIAS — calendário de constância" dims="1170×2532px · print real do app" shape="portrait" bare src={SCREENSHOTS.dias || undefined} alt="Tela DIAS do app Diariamente" />
              </div>
            </div>
            <div className="split-copy">
              <h3 className="display-sm" style={{ marginBottom: "var(--sp4)" }}>Tela DIAS</h3>
              <p className="lead">Você acompanha os dias lidos, visualiza sua evolução e percebe que o pouco de cada dia começa a formar uma jornada. O progresso deixa de ser abstrato e vira imagem.</p>
            </div>
          </div>

          {/* grid de features secundárias */}
          <div className="grid cols-3">
            {[
              { t: "Ações", d: "A provocação não para na reflexão: você envia para Ações e transforma o insight do dia em tarefa concreta. É onde pensar vira fazer." },
              { t: "Ofensiva", d: "Sua sequência de dias, construída um por vez. Cada registro fortalece o ritmo que você está criando." },
              { t: "Conquistas", d: "Cada marco reconhecido. O esforço acumulado vira troféu." },
              { t: "Ranking", d: "Você não caminha sozinho. Tem gente fazendo junto." },
              { t: "Notificações por WhatsApp", d: "A provocação chega onde você já está. Zero esforço pra lembrar — o ritual te encontra." },
              { t: "Compartilhar", d: "Transforme uma provocação em story e leve sua reflexão adiante." },
            ].map((f) => (
              <div key={f.t} className="sf-dark lift" style={{ padding: "var(--sp6)" }}>
                <Logomark size={24} />
                <div className="h2" style={{ margin: "var(--sp3) 0 var(--sp2)" }}>{f.t}</div>
                <p className="body-sm muted">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- AÇÕES (seção dedicada — grande alavanca) ---------- */}
      <section className="reveal">
        <div className="wrap">
          <div className="split">
            <div className="split-copy">
              <span className="overline eyebrow">Onde pensar vira fazer</span>
              <h2 className="display-md" style={{ marginBottom: "var(--sp5)" }}>
                Não termina na leitura.
              </h2>
              <p className="lead" style={{ marginBottom: "var(--sp5)" }}>
                Todo dia, depois da provocação, você transforma o insight em uma ação prática.
                Porque reflexão sem movimento vira só pensamento bonito.
              </p>
              <p className="lead" style={{ color: "var(--n-0)" }}>
                No Diariamente, cada dia termina com uma pergunta:
                <br />
                <span className="display-sm teal">"O que você vai fazer com isso?"</span>
              </p>
            </div>
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela AÇÕES — provocação vira tarefa concreta" dims="1170×2532px · print real do app" shape="portrait" bare src={SCREENSHOTS.acoes || undefined} alt="Tela AÇÕES do app Diariamente" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- COMO VOCÊ USA EM 5 MINUTOS ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="center sec-head">
            <span className="overline eyebrow">Cabe na sua rotina</span>
            <h2 className="display-md">Como você usa em 5 minutos</h2>
            <p className="lead sec-intro" style={{ maxWidth: "42ch", margin: "var(--sp4) auto 0" }}>
              Você não precisa mudar tudo hoje. Só precisa voltar amanhã.
            </p>
          </div>
          <div className="grid cols-3">
            {[
              { n: "1", t: "Abra a provocação do dia", d: "Uma só, na tela HOJE. Leitura rápida, pensada pra caber em qualquer manhã." },
              { n: "2", t: "Reflita e registre", d: "Marque o dia e deixe a provocação trabalhar em você ao longo do dia." },
              { n: "3", t: "Transforme em ação", d: "Envie pro menu Ações e escolha um passo concreto. Pequeno, possível, seu." },
            ].map((s) => (
              <div key={s.n} className="sf-dark lift" style={{ padding: "var(--sp8)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--p-500)", marginBottom: "var(--sp4)" }}>
                  {s.n}
                </div>
                <div className="h2" style={{ marginBottom: "var(--sp2)" }}>{s.t}</div>
                <p className="body-sm muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- UM DIA POR VEZ (diferencial vs livro) ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="split reverse">
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela RITMO — constância, créditos e ciclo de desbloqueios" dims="1170×2532px · print real do app" shape="portrait" bare src={SCREENSHOTS.ritmo || undefined} alt="Tela RITMO do app Diariamente" />
              </div>
            </div>
            <div className="split-copy">
              <span className="overline eyebrow">O que o livro não faz por você</span>
              <h2 className="display-md" style={{ marginBottom: "var(--sp5)" }}>
                Um dia por vez. <span className="teal">De propósito.</span>
              </h2>
              <p className="lead" style={{ marginBottom: "var(--sp4)" }}>
                No livro, nada te impede de devorar os 365 num domingo de empolgação — e
                esquecer todos na segunda. O atalho parece liberdade, mas é exatamente onde a
                transformação morre.
              </p>
              <p className="lead" style={{ marginBottom: "var(--sp4)" }}>
                No app é diferente: você tem o dia de hoje. Inteiro, presente, sem pressa de
                terminar. Como deveria ser um ritual que se chama <span className="teal live-word">Diariamente</span>.
              </p>
              <p className="lead" style={{ color: "var(--n-0)" }}>
                E quando bater aquela vontade de adiantar? Você acumula créditos mantendo a
                constância e cumprindo conquistas — e usa pra destravar o próximo dia. Você não
                compra o direito de pular: você <span className="teal">conquista</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- NÃO É APP DE MOTIVAÇÃO ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap-content">
          <div className="sf-dark" style={{ padding: "var(--sp10) var(--sp8)", textAlign: "center" }}>
            <p className="display-sm" style={{ marginBottom: "var(--sp4)" }}>
              Não é um app de motivação. É um app de <span className="teal">constância</span>.
            </p>
            <p className="lead muted" style={{ maxWidth: "46ch", margin: "0 auto" }}>
              Motivação acaba na quinta-feira. Constância é o que sobra quando a vontade
              passa — e é exatamente isso que o Diariamente foi feito pra sustentar.
            </p>
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
                <InstagramLink handle={AUTORES.brunno.instagram} />
                <p className="body-sm muted" style={{ marginTop: "var(--sp3)" }}>{AUTORES.brunno.bio}</p>
              </div>
            </div>
            <div className="sf-dark" style={{ overflow: "hidden" }}>
              <ImageSlot tag="Foto autor" label="Roberta Carbonari — retrato" dims="1000×1000px · quadrado" shape="square" style={{ borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)" }} />
              <div style={{ padding: "var(--sp6)" }}>
                <div className="h1">{AUTORES.roberta.nome}</div>
                <InstagramLink handle={AUTORES.roberta.instagram} />
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

      {/* ---------- O QUE ACONTECE DEPOIS DA COMPRA ---------- */}
      <section className="reveal">
        <div className="wrap-content">
          <div className="center sec-head">
            <span className="overline eyebrow">Sem mistério</span>
            <h2 className="display-md">O que acontece depois</h2>
          </div>
          <div className="stack">
            {[
              { n: "1", t: "Você recebe o e-mail de acesso", d: "Logo após a confirmação, com o passo a passo pra abrir o app." },
              { n: "2", t: "Faz a provocação do Dia 1", d: "Sua jornada começa no momento em que você registra o primeiro dia." },
              { n: "3", t: "O ritual te encontra todo dia", d: "Lembrete diário no WhatsApp pra você não depender da memória." },
              { n: "4", t: "No combo, o livro chega na sua casa", d: "Com código de rastreio assim que for postado." },
            ].map((s) => (
              <div key={s.n} className="sf-glass" style={{ padding: "var(--sp5)", display: "flex", gap: "var(--sp4)", alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 36px", height: 36, borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--p-500)" }}>
                  {s.n}
                </div>
                <div>
                  <div className="h3" style={{ marginBottom: 2 }}>{s.t}</div>
                  <p className="body-sm muted">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <FAQ />

      {/* ---------- CTA FINAL ---------- */}
      <section className="reveal">
        <div className="wrap-content center">
          <p className="display" style={{ marginBottom: "var(--sp6)" }}>
            A transformação não vai acontecer num dia.
          </p>
          <p className="lead" style={{ marginBottom: "var(--sp8)" }}>
            Vai acontecer <span className="teal live-word">diariamente</span> — se você começar hoje.
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
                desenvolvimento profissional criado por Brunno Falcão e Roberta Carbonari. Une um
                livro de provocações diárias a um aplicativo que entrega 365 provocações — uma
                para cada dia do ano — com sistema de constância (ofensiva), conquistas, ranking
                e lembrete diário no WhatsApp.
              </p>
              <p>
                <strong className="teal">Para quem é:</strong> profissionais de qualquer carreira
                que querem evoluir de forma consistente e que já tentaram livros, journals ou apps
                de hábito, mas largaram no meio. O Diariamente foi desenhado para resolver a
                constância, não apenas entregar conteúdo.
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
        <div className="wrap center">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--sp12)" }}>
            <FooterLogo height={64} />
          </div>

          <p className="caption" style={{ maxWidth: "42ch", margin: "0 auto" }}>
            Diariamente é uma realização Science Play®. Provocações diárias para se desenvolver
            profissionalmente — uma por dia, por 365 dias.
          </p>

          {/* navegação legal */}
          <div style={{ display: "flex", gap: "var(--sp5)", justifyContent: "center", flexWrap: "wrap", marginTop: "var(--sp6)" }}>
            <a className="caption" href="/termos" style={{ color: "var(--n-400)" }}>Termos de uso</a>
            <a className="caption" href="/privacidade" style={{ color: "var(--n-400)" }}>Política de privacidade</a>
            <a className="caption" href="mailto:contato@scienceplay.com" style={{ color: "var(--n-400)" }}>Suporte</a>
          </div>

          {/* social Science Play (sutil) */}
          <div style={{ display: "flex", gap: "var(--sp4)", justifyContent: "center", flexWrap: "wrap", marginTop: "var(--sp5)" }}>
            <a className="caption" href="https://www.scienceplay.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--n-500)" }}>scienceplay.com</a>
            <span style={{ color: "var(--n-700)" }}>·</span>
            <a className="caption" href="https://instagram.com/scienceplay" target="_blank" rel="noopener noreferrer" style={{ color: "var(--n-500)" }}>Instagram @scienceplay</a>
            <span style={{ color: "var(--n-700)" }}>·</span>
            <a className="caption" href="https://linkedin.com/in/scienceplay" target="_blank" rel="noopener noreferrer" style={{ color: "var(--n-500)" }}>LinkedIn /scienceplay</a>
          </div>

          {/* dados da empresa (sutil) */}
          <p className="caption" style={{ color: "var(--n-600)", marginTop: "var(--sp8)", lineHeight: 1.7 }}>
            Science Play Cursos LTDA · CNPJ 33.612.911/0001-29<br />
            © {new Date().getFullYear()} Science Play® · {SITE.dominio.replace("https://", "")}
          </p>
        </div>
      </footer>

      <StickyCTA />
    </main>
  );
}
