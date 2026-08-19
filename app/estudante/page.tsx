import type { Metadata } from "next";
import { SITE, EMPRESA, PROVA, GARANTIA, SCREENSHOTS, ESTUDANTE } from "@/config";
import { OfficialLogo } from "@/components/Brand";
import { BlocoPreco } from "@/components/BlocoPreco";
import { EstudanteForm } from "@/components/EstudanteForm";
import { EstudanteSticky } from "@/components/EstudanteSticky";
import "./estudante.css";

/* =====================================================================
   /ESTUDANTE
   ---------------------------------------------------------------------
   Server Component. O único JS enviado ao browser é o formulário e a
   barra sticky. Tudo o mais é HTML e CSS: FAQ em <details>, acordeão sem
   JS, nenhuma biblioteca de animação.

   Art direction:
     desktop -> grid de duas colunas no hero, na oferta e no formulário,
                com trilho fixo ao lado do card (a página deixa de ser
                uma coluna estreita esticada numa tela de 27 polegadas)
     mobile  -> uma coluna, CSS isolado da rota, content-visibility nas
                seções abaixo da dobra, sticky de CTA que some quando o
                formulário aparece

   NADA de número inventado: prova vem de PROVA/GARANTIA no config.
   ===================================================================== */

const TITULO = "Diariamente para estudantes · condição exclusiva de graduação";
const DESCRICAO =
  "Uma provocação por dia durante toda a sua graduação, em qualquer curso. Condição exclusiva para estudantes: solicite seu código e receba no WhatsApp.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE.dominio}/estudante` },
  keywords: [
    "Diariamente estudante",
    "desconto estudante",
    "app de provocações diárias",
    "estudante de medicina",
    "estudante de nutrição",
    "constância na faculdade",
    "Brunno Falcão",
    "Roberta Carbonari",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE.dominio}/estudante`,
    siteName: SITE.nome,
    title: TITULO,
    description: DESCRICAO,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "Diariamente" }],
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO, images: [SITE.ogImage] },
  robots: { index: true, follow: true },
};

/* Cloudinary: formato e qualidade automáticos + largura sob medida.
   Corta peso do hero sem tocar no asset original. */
function cld(url: string, t: string): string {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${t}/`) : url;
}

/* ------------------------------ ícones ------------------------------ */
function IcSun() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function IcCheckSquare() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
function IcFlame() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22c4 0 7-2.7 7-6.6 0-3.8-2.6-5.6-4-8.4-.7 1.6-1.7 2.4-2.7 3.2C10.6 5.9 12 3.4 9.5 2c.3 3-1.4 4.2-2.8 5.9C5.5 9.4 5 11 5 12.9 5 17.2 8 22 12 22z" />
    </svg>
  );
}
function IcShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l8 3.5v5.8c0 5-3.4 9.3-8 10.7-4.6-1.4-8-5.7-8-10.7V5.5L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IcPhone() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18.5h2" />
    </svg>
  );
}
function IcClock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </svg>
  );
}

/* ------------------------------ conteúdo ------------------------------ */
const RECEBE = [
  {
    ic: <IcSun />,
    t: "Uma provocação por dia",
    d: "Curta e direta, feita para ser lida em dois minutos entre uma aula e outra. Uma por dia, sem antecipar, sem acumular.",
  },
  {
    ic: <IcCheckSquare />,
    t: "Reflexão que vira ação",
    d: "O menu Ações transforma o que você pensou em tarefa concreta do dia. Pensar é fácil. Registrar e fazer é onde a diferença aparece.",
  },
  {
    ic: <IcFlame />,
    t: "Constância medida",
    d: "Ofensiva, conquistas e ranking mostram sua sequência se construindo. Você vê o hábito existindo, não só a intenção.",
  },
];

const PASSOS = [
  {
    t: "Preencha seus dados de estudante",
    d: "Nome, WhatsApp, curso, instituição e previsão de conclusão. Leva cerca de um minuto.",
  },
  {
    t: "Receba seu código no WhatsApp",
    d: `Conferimos seus dados e, em até ${ESTUDANTE.esperaMinutos} minutos, o código chega no número que você informou. Ele é pessoal e vale ${ESTUDANTE.validadeHoras} horas.`,
  },
  {
    t: "Ative seu acesso",
    d: "Toque no botão da mensagem: a condição de estudante já entra aplicada no checkout. Comece pela provocação do Dia 1 hoje mesmo.",
  },
];

const FAQ = [
  {
    q: "Como funciona a validação?",
    a: "O próprio formulário é a validação. Preencha com os dados corretos: o código é vinculado ao seu CPF, é pessoal e não é transferível. Dado falso invalida a condição.",
  },
  {
    q: "Serve para qualquer curso?",
    a: "Sim. O Diariamente não é sobre conteúdo técnico de uma área, é sobre constância, decisão e responsabilidade pessoal. Vale para qualquer graduação.",
  },
  {
    q: "O código chega quando?",
    a: `Em até ${ESTUDANTE.esperaMinutos} minutos, no WhatsApp que você informar, depois da conferência dos seus dados. Ele é pessoal e vale por ${ESTUDANTE.validadeHoras} horas.`,
  },
  {
    q: "Não recebi o código. E agora?",
    a: `Confira se o número foi digitado com DDD e se o WhatsApp está ativo nele. Se ainda assim não chegar, escreva para ${EMPRESA.suporteEmail} com o nome e o número usados na solicitação.`,
  },
  {
    q: "E quando eu me formar?",
    a: "Seu acesso continua valendo normalmente até o fim do período contratado. A condição de estudante é para a entrada, não uma amarra ao diploma.",
  },
  {
    q: "Posso pedir mais de um código?",
    a: "Não. É um código por pessoa, e a regra é aplicada automaticamente. O código também não é transferível.",
  },
  {
    q: "E se eu não me adaptar?",
    a: GARANTIA.texto,
  },
  {
    q: "Só quero ler, não quero app.",
    a: "O livro físico Diariamente existe e é vendido à parte. O app é o que te faz voltar amanhã: ele lembra, registra e transforma cada provocação em ação.",
  },
];

/* Bloco de resumo estruturado: ajuda leitor apressado e mecanismo generativo
   a extrair os fatos da oferta sem depender de interpretação. */
const RESUMO: [string, string][] = [
  ["Produto", "Diariamente Club, aplicativo de provocações diárias"],
  ["Condição", "Exclusiva para estudantes de graduação"],
  ["Formato", "Aplicativo para iPhone e Android, uma provocação por dia"],
  ["Duração", "365 provocações, uma liberada a cada dia"],
  ["Entrega", "Código pessoal enviado por WhatsApp"],
  ["Público", "Estudantes de graduação de qualquer curso"],
  ["Autores", "Brunno Falcão e Roberta Carbonari"],
  ["Responsável", `${EMPRESA.marca}, ${EMPRESA.razaoSocial}`],
  ["Garantia", `${GARANTIA.dias} dias`],
];

export default function Estudante() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Diariamente", item: SITE.dominio },
      { "@type": "ListItem", position: 2, name: "Estudante", item: `${SITE.dominio}/estudante` },
    ],
  };

  const telaHoje = SCREENSHOTS.hoje;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <main className="ed">
        <div className="ed-glow" aria-hidden="true" />

        {/* ---------------------------- TOPBAR ---------------------------- */}
        <header className="ed-topbar">
          <div className="ed-wrap ed-topbar-row">
            <a href="/" className="ed-topbar-logo" aria-label="Voltar para a página inicial do Diariamente">
              <OfficialLogo height={26} />
            </a>
            <a href="#formulario" className="ed-topbar-cta">
              Solicitar minha condição
            </a>
          </div>
        </header>

        {/* ----------------------------- HERO ----------------------------- */}
        <section className="ed-hero">
          <div className="ed-wrap ed-hero-grid">
            <div className="ed-hero-copy">
              <span className="ed-eyebrow">
                <i />
                Estudante
              </span>

              <h1 className="ed-h1">
                O diploma vai ser igual pra turma inteira.
                <br />
                <em>A constância, não.</em>
              </h1>

              <p className="ed-lead">
                Vale pra qualquer curso. A diferença entre colegas de turma não aparece na
                prova, aparece nos anos seguintes, construída um dia de cada vez. O
                Diariamente é uma provocação por dia, 365 dias por ano, para você formar o
                hábito que a faculdade não ensina: voltar amanhã.
              </p>

              <div className="ed-actions">
                <a href="#formulario" className="ed-btn ed-btn-primary">
                  Solicitar minha condição
                </a>
                <a href="#como-funciona" className="ed-btn ed-btn-ghost">
                  Como funciona
                </a>
              </div>

              <div className="ed-trust">
                <span>
                  <IcClock /> Leva cerca de um minuto
                </span>
                <span>
                  <IcPhone /> Código enviado no WhatsApp
                </span>
                <span>
                  <IcShield /> Garantia de {GARANTIA.dias} dias
                </span>
              </div>
            </div>

            <div className="ed-hero-visual">
              <div className="ed-phone">
                <div className="ed-phone-shot">
                  <img
                    src={cld(telaHoje, "f_auto,q_auto,w_640")}
                    srcSet={`${cld(telaHoje, "f_auto,q_auto,w_360")} 360w, ${cld(telaHoje, "f_auto,q_auto,w_640")} 640w, ${cld(telaHoje, "f_auto,q_auto,w_900")} 900w`}
                    sizes="(min-width: 1024px) 300px, 74vw"
                    alt="Tela Hoje do aplicativo Diariamente, com a provocação do dia e o progresso da sequência"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <span className="ed-phone-tag">
                  Sua provocação de hoje. <b>Só a de hoje.</b>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------- BANDA DE PROVA ------------------------- */}
        <div className="ed-wrap">
          <div className="ed-band">
            <div className="ed-band-item">
              <div className="ed-band-n">365</div>
              <div className="ed-band-l">provocações, uma por dia</div>
            </div>
            <div className="ed-band-item">
              <div className="ed-band-n">{PROVA.leitores}</div>
              <div className="ed-band-l">já leram o Diariamente</div>
            </div>
            <div className="ed-band-item">
              <div className="ed-band-n">iOS · Android</div>
              <div className="ed-band-l">o mesmo acesso nos dois</div>
            </div>
          </div>
        </div>

        {/* ------------------------------ DOR ------------------------------ */}
        <section className="ed-sec ed-defer">
          <div className="ed-wrap ed-split">
            <div className="ed-reveal">
              <span className="ed-overline">A conta que ninguém faz na faculdade</span>
              <h2 className="ed-h2">
                Você e seu colega de turma vão receber <em>o mesmo diploma</em>.
              </h2>
              <p className="ed-sec-sub">
                Mesmas aulas, mesmos professores, mesma carga horária. Em cinco anos a
                distância entre vocês dois não vai ter sido criada por talento. Vai ter sido
                criada por repetição: quem manteve, quem largou, quem voltou no dia seguinte
                depois de falhar.
              </p>
            </div>

            <div className="ed-compare ed-reveal">
              <div className="ed-compare-card">
                <span className="ed-compare-k">Sem constância</span>
                <div className="ed-compare-t">Você começa em janeiro e para em fevereiro</div>
                <p className="ed-compare-d">
                  A intenção existe. O que falta é o sistema que te devolve pro lugar depois
                  do primeiro dia perdido.
                </p>
              </div>
              <div className="ed-compare-card is-on">
                <span className="ed-compare-k">Com o Diariamente</span>
                <div className="ed-compare-t">Você aparece cinco minutos por dia</div>
                <p className="ed-compare-d">
                  A provocação chega, você reflete, registra a ação e a sequência continua.
                  Falhou um dia? O app te chama de volta em vez de te cobrar perfeição.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------- O QUE RECEBE -------------------------- */}
        <section className="ed-sec ed-defer">
          <div className="ed-wrap">
            <div className="ed-sec-head is-center">
              <span className="ed-overline">O que você recebe</span>
              <h2 className="ed-h2">Três coisas simples, repetidas todos os dias.</h2>
            </div>

            <div className="ed-grid3">
              {RECEBE.map((item) => (
                <article className="ed-card ed-reveal" key={item.t}>
                  <div className="ed-card-ic">{item.ic}</div>
                  <h3 className="ed-card-t">{item.t}</h3>
                  <p className="ed-card-d">{item.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------- COMO FUNCIONA ------------------------- */}
        <section className="ed-sec ed-defer" id="como-funciona">
          <div className="ed-wrap">
            <div className="ed-sec-head is-center">
              <span className="ed-overline">Como funciona</span>
              <h2 className="ed-h2">Do formulário ao Dia 1, em três passos.</h2>
            </div>

            <ol className="ed-steps">
              {PASSOS.map((p, i) => (
                <li className="ed-step ed-reveal" key={p.t}>
                  <div className="ed-step-n" aria-hidden="true">
                    {i + 1}
                  </div>
                  <h3 className="ed-step-t">{p.t}</h3>
                  <p className="ed-step-d">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ----------------------------- OFERTA ----------------------------- */}
        <section className="ed-sec ed-defer" id="condicao">
          <div className="ed-wrap">
            <div className="ed-sec-head" style={{ marginBottom: "clamp(28px, 4vw, 44px)" }}>
              <span className="ed-overline">Condição de estudante</span>
              <h2 className="ed-h2">
                Uma condição que existe enquanto <em>você ainda está estudando</em>.
              </h2>
            </div>
            <div className="ed-reveal">
              <BlocoPreco />
            </div>
          </div>
        </section>

        {/* --------------------------- FORMULÁRIO --------------------------- */}
        <section className="ed-sec" id="formulario">
          <div className="ed-wrap ed-form-grid">
            <aside className="ed-rail">
              <div className="ed-rail-block">
                <div className="ed-rail-t">Por que pedimos esses dados</div>
                <p className="ed-rail-d">
                  Curso, instituição e semestre confirmam que você é estudante. O CPF garante
                  um código por pessoa. Nada além disso.
                </p>
              </div>
              <div className="ed-rail-block">
                <div className="ed-rail-t">O código vai só para o WhatsApp</div>
                <p className="ed-rail-d">
                  Ele não aparece nesta tela e não é enviado por e-mail. Vale por{" "}
                  {ESTUDANTE.validadeHoras} horas e é pessoal.
                </p>
              </div>
              <div className="ed-rail-block">
                <div className="ed-rail-t">Solicitar não é comprar</div>
                <p className="ed-rail-d">
                  Você recebe o código e decide depois, com calma. E se ativar o acesso, tem{" "}
                  {GARANTIA.dias} dias de garantia.
                </p>
              </div>
              <div className="ed-rail-block">
                <div className="ed-rail-t">Seus dados</div>
                <p className="ed-rail-d">
                  Tratados conforme a nossa <a href="/privacidade">Política de Privacidade</a>{" "}
                  e os <a href="/termos">Termos de Uso</a>.
                </p>
              </div>
            </aside>

            <EstudanteForm />
          </div>
        </section>

        {/* ------------------------------- FAQ ------------------------------- */}
        <section className="ed-sec ed-defer">
          <div className="ed-wrap ed-wrap-sm">
            <div className="ed-sec-head is-center">
              <span className="ed-overline">Perguntas frequentes</span>
              <h2 className="ed-h2">O que os estudantes perguntam antes.</h2>
            </div>

            <div className="ed-faq">
              {FAQ.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <div className="ed-faq-a">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- CTA FINAL ---------------------------- */}
        <section className="ed-sec-tight ed-defer">
          <div className="ed-wrap">
            <div className="ed-final ed-reveal">
              <h2 className="ed-final-h">Constância não espera a formatura.</h2>
              <p className="ed-final-d">
                Solicite sua condição de estudante, receba o código no WhatsApp e comece pela
                provocação de hoje. O primeiro dia é o único que depende só de você.
              </p>
              <div className="ed-actions">
                <a href="#formulario" className="ed-btn ed-btn-primary">
                  Solicitar minha condição
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------- RESUMO ESTRUTURADO (GEO) -------------------- */}
        <section className="ed-sec-tight ed-defer">
          <div className="ed-wrap ed-wrap-sm">
            <h2 className="ed-overline" style={{ textAlign: "center" }}>
              Em resumo
            </h2>
            <div className="ed-review" style={{ marginTop: 18 }}>
              {RESUMO.map(([k, v]) => (
                <div className="ed-review-l" key={k}>
                  <span className="ed-review-k">{k}</span>
                  <span className="ed-review-v">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------- RODAPÉ ----------------------------- */}
        <footer className="ed-footer">
          <div className="ed-wrap ed-footer-row">
            <p>
              © {new Date().getFullYear()} {EMPRESA.marca}® · {EMPRESA.razaoSocial} ·{" "}
              {SITE.dominio.replace("https://", "")}
            </p>
            <nav aria-label="Links institucionais">
              <a href="/">Página inicial</a>
              <a href="/termos">Termos</a>
              <a href="/privacidade">Privacidade</a>
              <a href={`mailto:${EMPRESA.suporteEmail}`}>Suporte</a>
            </nav>
          </div>
        </footer>

        <EstudanteSticky alvo="formulario" />
      </main>
    </>
  );
}
