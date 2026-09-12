import { SITE, PROVA, SCREENSHOTS, LIFESTYLE, PLANO_APP, ESTUDANTE, CONSELHO } from "@/config";
import { Logomark, ImageSlot, OfficialLogo } from "@/components/Brand";
import { HeroProvocacao } from "@/components/HeroProvocacao";
import { StickyCTA, RevealOnScroll } from "@/components/Sticky";
import { StoreBadges } from "@/components/StoreBadges";
import { Rodape } from "@/components/Rodape";
import { Oferta } from "@/components/Oferta";
import { FAQ } from "@/components/FAQ";

export default function Page() {
  return (
    <main>
      <RevealOnScroll />

      {/* ---------- TOP — logo oficial centralizada ---------- */}
      <nav className="topnav">
        <div className="wrap" style={{ display: "flex", justifyContent: "center", padding: "var(--sp2) 0", position: "relative" }}>
          <a href="/" aria-label="Diariamente" style={{ textDecoration: "none" }}>
            <OfficialLogo height={48} />
          </a>
          <a href="#oferta" className="btn btn-primary nav-cta">Quero começar</a>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section style={{ paddingTop: "var(--sp16)", paddingBottom: "var(--sp20)" }}>
        <div className="wrap">
          <div className="split">
            <div className="split-copy">
              {/* Nível 2 da hierarquia de mensagens: a TESE. Abre institucional
                  e aquisição. Nunca é substituída por linguagem genérica de
                  bem-estar (seção 03: as cinco formulações são fixas). */}
              <span className="badge badge-primary eyebrow">Uma prática diária de hábitos e bem-estar</span>
              <h1 className="display" style={{ margin: "var(--sp4) 0 var(--sp6)" }}>
                O mundo vende grandes recomeços.{" "}
                <span className="teal">Nós defendemos pequenos retornos.</span>
              </h1>
              <p className="lead" style={{ maxWidth: "48ch", marginBottom: "var(--sp8)" }}>
                Um texto por dia que provoca uma reflexão e termina numa ação possível
                ainda hoje. Três minutos. Quando você faltar, ele não cobra: ele te espera.
                Porque interromper não significa abandonar.
              </p>
              <div className="hero-ctas">
                <a href="#oferta" className="btn btn-primary btn-lg">Quero começar hoje</a>
                <a href="#metodo" className="btn btn-ghost">O ritual diário →</a>
              </div>
              <div className="caption" style={{ marginTop: "var(--sp6)" }}>
                Mais de <span className="teal" style={{ fontWeight: 700 }}>5.000 pessoas</span> já começaram · e hoje leram o mesmo texto que você
              </div>
            </div>

            <div className="split-media">
              <HeroProvocacao />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAIXA DE PROVA (mini-stats) ---------- */}
      <section style={{ paddingTop: 0, paddingBottom: "var(--sp16)" }}>
        <div className="wrap">
          <div className="stats-band reveal">
            <div className="stat">
              <div className="stat-num">365</div>
              <div className="stat-lbl">provocações, uma por dia</div>
            </div>
            <div className="stat-div" aria-hidden="true" />
            <div className="stat">
              <div className="stat-num">+5.000</div>
              <div className="stat-lbl">pessoas impactadas</div>
            </div>
            <div className="stat-div" aria-hidden="true" />
            <div className="stat">
              <div className="stat-num">7 dias</div>
              <div className="stat-lbl">de garantia incondicional</div>
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
            <p>Baixou o app. Prometeu que dessa vez ia até o fim. Parou na segunda semana.</p>
            <p>E no terceiro, quarto, quinto dia… a vida engoliu.</p>
            <p>
              O problema nunca foi você ser "sem disciplina". O problema é que ninguém te
              deu um sistema pra continuar. Só conteúdo. E conteúdo parado não transforma
              ninguém.
            </p>
            <p>
              O inimigo não é a falta de motivação. É o{" "}
              <span className="teal" style={{ fontWeight: 600 }}>abandono silencioso</span>.
              O Diariamente foi criado para o ponto exato onde você costuma parar.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- VIRADA / TRANSFORMAÇÃO (split com imagem) ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="split reverse">
            <div className="split-media">
              <div className="lifestyle-frame">
                <ImageSlot
                  tag="Lifestyle"
                  label="Foto ambiente, dia comum: mesa, caderno, café, luz natural"
                  dims="recomendado 1200×1500px · vertical 4:5"
                  shape="portrait"
                  src={LIFESTYLE || undefined}
                  alt="Mesa de um dia comum ao amanhecer, com caderno aberto e café"
                />
              </div>
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
            <h2 className="display-md">O ritual diário</h2>
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

          <div className="pratica-strip reveal">
            <span className="pratica-label">Na prática · 5 min por dia</span>
            <span className="chip">Abra a provocação</span>
            <span className="chip-seta" aria-hidden="true">→</span>
            <span className="chip">Reflita e registre</span>
            <span className="chip-seta" aria-hidden="true">→</span>
            <span className="chip">Transforme em ação</span>
          </div>

          <p className="center display-sm" style={{ marginTop: "var(--sp16)", maxWidth: "20ch", marginLeft: "auto", marginRight: "auto" }}>
            Não é motivação num dia. É constância em 365, <span className="teal">com método</span>.
          </p>
        </div>
      </section>

      {/* ---------- TOUR DO APP (showcase com screenshots) ---------- */}
      <section className="reveal">
        <div className="wrap">
          <div className="center sec-head">
            <span className="overline eyebrow">O que tem dentro</span>
            <h2 className="display-md">Construído para a volta, <span className="teal">não para a perfeição</span></h2>
          </div>

          {/* destaque: HOJE + DIAS em screenshots grandes */}
          <div className="split" style={{ marginBottom: "var(--sp16)" }}>
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela HOJE — provocação do dia" dims="1170×2532px · print real do app" shape="portrait" bare ratio="1170 / 2532" src={SCREENSHOTS.hoje || undefined} alt="Tela HOJE do app Diariamente" />
              </div>
            </div>
            <div className="split-copy">
              <h3 className="display-sm" style={{ marginBottom: "var(--sp4)" }}>Tela HOJE</h3>
              <p className="lead">A provocação do dia, limpa e sem distração. Você lê, reflete, registra o dia e acompanha sua jornada de constância. Nada compete pela sua atenção.</p>
            </div>
          </div>

          <div className="split reverse" style={{ marginBottom: "var(--sp16)" }}>
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela DIAS — calendário de constância" dims="1170×2532px · print real do app" shape="portrait" bare ratio="1170 / 2532" src={SCREENSHOTS.dias || undefined} alt="Tela DIAS do app Diariamente" />
              </div>
            </div>
            <div className="split-copy">
              <h3 className="display-sm" style={{ marginBottom: "var(--sp4)" }}>Tela DIAS</h3>
              <p className="lead">Você acompanha os dias lidos, visualiza sua evolução e percebe que o pouco de cada dia começa a formar uma jornada. O progresso deixa de ser abstrato e vira imagem.</p>
            </div>
          </div>

          {/* grid de features secundárias — 2 colunas compactas no mobile */}
          <div className="grid cols-3 feats">
            {[
              { t: "Ações", d: "A provocação não para na reflexão: você envia para Ações e transforma o insight do dia em tarefa concreta. É onde pensar vira fazer." },
              { t: "Contador de voltas", d: "O total de dias em que você voltou. Não conta dias seguidos e nunca zera: faltou um dia, a contagem continua de onde parou." },
              { t: "Conquistas", d: "Cada marco reconhecido. O esforço acumulado vira troféu." },
              { t: "A ausência aparece", d: "O dia em que você não veio fica visível, sem alarme e sem culpa. Está no meio da história, e a história continua depois dele." },
              { t: "Notificações por WhatsApp", d: "A provocação chega onde você já está. Zero esforço pra lembrar: o ritual te encontra." },
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
              <p className="lead">
                No Diariamente, cada dia termina com uma pergunta:
                <br />
                <span className="display-sm teal">"O que você vai fazer com isso?"</span>
              </p>
            </div>
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela AÇÕES — provocação vira tarefa concreta" dims="1170×2532px · print real do app" shape="portrait" bare ratio="1170 / 2532" src={SCREENSHOTS.acoes || undefined} alt="Tela AÇÕES do app Diariamente" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- UM DIA POR VEZ ---------- */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="split reverse">
            <div className="split-media media-glow reveal-media">
              <div className="drift-inner">
                <ImageSlot tag="Screenshot" label="Tela RITMO — constância, créditos e ciclo de desbloqueios" dims="1170×2532px · print real do app" shape="portrait" bare ratio="1170 / 2532" src={SCREENSHOTS.ritmo || undefined} alt="Tela RITMO do app Diariamente" />
              </div>
            </div>
            <div className="split-copy">
              <span className="overline eyebrow">A obrigação diária é nossa</span>
              <h2 className="display-md" style={{ marginBottom: "var(--sp5)" }}>
                Um dia por vez. <span className="teal">De propósito.</span>
              </h2>
              <p className="lead" style={{ marginBottom: "var(--sp4)" }}>
                Quando dá para consumir tudo de uma vez, o domingo de empolgação come o ano
                inteiro e a segunda-feira não sobra nada. O atalho parece liberdade, mas é
                onde a prática morre.
              </p>
              <p className="lead" style={{ marginBottom: "var(--sp4)" }}>
                Aqui você tem o dia de hoje. Inteiro, presente, sem pressa de terminar.
                <span className="teal live-word"> O Diariamente é diário. Você não precisa ser.</span>
              </p>
              <p className="lead">
                São 365 textos por ano, um para cada dia. No ano seguinte, na mesma data,
                um texto novo. <span className="teal">A prática não termina: ela recomeça.</span>
                Você não está comprando um catálogo para consumir. Está entrando numa rotina
                que continua enquanto você quiser voltar.
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
              Não é um app de motivação.
              <br />
              É um app de <span className="teal">constância</span>.
            </p>
            <p className="lead muted" style={{ maxWidth: "46ch", margin: "0 auto" }}>
              Motivação acaba na quinta-feira. Constância é o que sobra quando a vontade
              passa. É exatamente isso que o Diariamente foi feito pra sustentar.
            </p>
            <div style={{ marginTop: "var(--sp6)", display: "flex", flexDirection: "column", gap: "var(--sp2)", alignItems: "center" }}>
              <a href="#oferta" className="btn btn-primary">Quero começar hoje</a>
              <span className="caption">Garantia incondicional de 7 dias</span>
            </div>
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
                <li>Já tentou e largou outros apps de hábito ou journals</li>
                <li>Quer mudança real, mas precisa de um sistema que te segure</li>
                <li>Prefere consistência a surto de motivação</li>
              </ul>
            </div>
            <div className="sf-dark" style={{ padding: "var(--sp8)" }}>
              <span className="badge badge-dark eyebrow">Não é pra você se</span>
              <ul style={{ listStyle: "none", marginTop: "var(--sp4)" }}>
                {["Procura solução mágica da noite pro dia", "Não está disposto a 5 minutos por dia", "Quer só mais um PDF pra estante digital"].map((t) => (
                  <li key={t} className="muted" style={{ display: "flex", gap: "var(--sp3)", padding: "var(--sp2) 0" }}>
                    <span style={{ color: "var(--n-500)" }}>·</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- LEITURA SIMULTÂNEA ----------
           O conteúdo é chaveado por dia do ano na API: todo mundo lê o
           MESMO texto no mesmo dia. É o território "Quem começa junto"
           da seção 11, e estava sem uso na página. */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="junto">
            <div className="junto-seq" aria-hidden="true">
              <span className="seq grad">
                <i /><i /><i /><i /><i /><i /><i className="is-hoje" />
              </span>
            </div>
            <h2 className="t-title junto-h">
              Ninguém aqui está lendo sozinho.
            </h2>
            <p className="junto-d">
              Não existe trilha individual nem ritmo separado. O texto de hoje é o
              mesmo para todo mundo, no mesmo dia. Quem voltou depois de uma semana
              fora encontra exatamente o mesmo ponto de quem não faltou nenhum dia.
            </p>
            <p className="junto-f">Você não precisa alcançar ninguém. É só voltar.</p>
          </div>
        </div>
      </section>

      {/* ---------- MANIFESTO (seção 16 do brandbook) ----------
           Substitui a antiga seção de autoria. O brandbook credita
           procedência por conselho editorial, nunca por nome solto — e a
           marca fala em primeira pessoa do plural, não por trás de rostos.
           Literata, fundo S0, um único ponto de teal. */}
      <section className="reveal" id="manifesto">
        <div className="wrap">
          <div className="manifesto">
            <div className="manifesto-marca" aria-hidden="true">
              <Logomark size={34} />
            </div>

            <div className="manifesto-corpo">
              <p>
                A gente costuma esperar grandes sinais para mudar. Um novo ano.
                Uma nova fase. Um grande recomeço.
              </p>
              <p>
                Mas a vida não é construída só nos grandes momentos. Ela é
                construída naquilo <em>para que a gente volta</em>.
              </p>
              <p>
                No que você repete quando ninguém está olhando. Na ação pequena
                que você decide executar. No dia em que quase não foi, mas voltou.
              </p>
              <p className="manifesto-forte">
                Interromper não é abandonar. Perder um dia não é perder uma jornada.
              </p>
              <p>
                Não tudo hoje. Não perfeito. Não para provar nada a ninguém.
              </p>
              <p className="manifesto-fecho">Só hoje. E amanhã de novo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FRASES DE ATIVAÇÃO (seção 11: cinco territórios) ----------
           Cada card é uma frase-mãe de campanha. Todas derivam de volta,
           interrupção, repetição e acúmulo. Nenhuma celebra sequência
           consecutiva nem pune a quebra. */}
      <section className="reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="center sec-head">
            <span className="overline eyebrow">No que a gente acredita</span>
            <h2 className="display-md">Cinco frases que governam tudo aqui.</h2>
          </div>

          <div className="ativacao">
            {[
              { k: "Dia 1", f: "Hoje é o dia 1. De novo. E tudo bem.", d: "Recomeçar não é fracasso acumulado. É o mecanismo." },
              { k: "Voltas acumuladas", f: "Cada volta conta. Nenhuma zera.", d: "O número que cresce mesmo nas semanas em que você faltou." },
              { k: "Coragem", f: "Coragem não é impulso. É repetição.", d: "O que sustenta não é o dia em que deu vontade." },
              { k: "Junto", f: "Convide quem começa junto com você. E volte junto também.", d: "Começar acompanhado é fácil. Voltar acompanhado é raro." },
              { k: "Sem metas", f: "Esquece a meta. Escolhe o dia.", d: "Meta é promessa para o futuro. Dia é decisão para agora." },
            ].map((a) => (
              <div className="ativ-card" key={a.k}>
                <span className="overline teal">{a.k}</span>
                <p className="ativ-f">{a.f}</p>
                <p className="ativ-d">{a.d}</p>
              </div>
            ))}
          </div>
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
              { n: "4", t: "O acúmulo começa a aparecer", d: "O contador mostra quantas vezes você voltou. É o número que cresce mesmo nas semanas em que você faltou." },
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

          {/* lojas oficiais — prova de credibilidade (o app existe, é sério) */}
          <div className="lojas-bloco reveal">
            <p className="caption center" style={{ marginBottom: "var(--sp4)" }}>
              O app está nas lojas oficiais. Seu acesso chega por e-mail após a confirmação.
            </p>
            <StoreBadges variant="link" />
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
            Vai acontecer <span className="teal live-word">diariamente</span>, se você começar hoje.
          </p>
          <a href="#oferta" className="btn btn-primary btn-lg">Quero começar agora →</a>
        </div>
      </section>

      <Rodape />

      <StickyCTA />
    </main>
  );
}
