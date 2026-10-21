import { Fragment, type ReactNode } from "react";
import { SITE, EMPRESA } from "@/config";
import { ATENDIMENTO, linkDoAtendimento } from "@/config/atendimento";
import { OfficialLogo } from "@/components/Brand";
import { StoreBadges } from "@/components/StoreBadges";
import { TEXTOS } from "@/lib/obrigado.mjs";

type Estado = "aprovado" | "aguardando-pagamento" | "aguardando-analise";
type Idioma = "pt" | "es";
type Forma = "pix" | "boleto" | "outra" | null;
type Trecho = string | { b: string };

/**
 * ObrigadoShell — layout compartilhado das 3 páginas de obrigado.
 * Cada estado tem sua própria mensagem, cor de selo e próximo passo.
 * O design é o mesmo da página de vendas (dark, teal, serifado).
 *
 * Aprovado e aguardando pagamento seguem o roteiro do dono (20/10/2026)
 * e existem em pt e es: os textos ficam em lib/obrigado.mjs, onde o teste
 * confere as regras da marca. O idioma e a forma de pagamento vêm da
 * página (?lang=, Accept-Language e, se um dia vier, a forma na URL).
 *
 * Em análise fica como era, só em português. Nas três, o endereço de
 * atendimento sai de config/atendimento.ts.
 */
export function ObrigadoShell({
  estado,
  lang = "pt",
  forma = null,
}: {
  estado: Estado;
  lang?: Idioma;
  forma?: Forma;
}) {
  if (estado === "aprovado") return <Aprovado lang={lang} />;
  if (estado === "aguardando-pagamento") return <AguardandoPagamento lang={lang} forma={forma} />;
  return <AguardandoAnalise />;
}

/* ------------------------------------------------------------------ */
/* moldura comum: brilho, logo e rodapé                                */
/* ------------------------------------------------------------------ */
function Moldura({ lang, children }: { lang?: Idioma; children: ReactNode }) {
  return (
    <main className="obg" lang={lang === "es" ? "es" : undefined}>
      <div className="obg-glow" aria-hidden="true" />

      <header className="obg-header">
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <OfficialLogo height={30} />
        </div>
      </header>

      {children}

      <footer className="obg-footer">
        <div className="wrap center">
          <p className="caption" style={{ color: "var(--n-600)" }}>
            © {new Date().getFullYear()} {EMPRESA.marca}® · {SITE.dominioVisivel}
          </p>
        </div>
      </footer>
    </main>
  );
}

function SeloCheck() {
  return (
    <div className="obg-check">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

function SeloRelogio() {
  return (
    <div className="obg-check is-wait">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </div>
  );
}

/** Palavra com hífen (e-mail, Boas-vindas) não quebra no hífen. */
function Inteiro({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\S+-\S+)/).map((parte, i) =>
        i % 2 ? (
          <span key={i} className="obg-inteiro">{parte}</span>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        )
      )}
    </>
  );
}

/** Texto com trechos em negrito ({ b: "..." }). "e-mail" não quebra no hífen. */
function Rico({ partes }: { partes: readonly Trecho[] }) {
  return (
    <>
      {partes.map((p, i) =>
        typeof p === "string" ? (
          <Inteiro key={i} texto={p} />
        ) : (
          <strong key={i} className="obg-forte"><Inteiro texto={p.b} /></strong>
        )
      )}
    </>
  );
}

function Hero({
  selo,
  tom,
  eyebrow,
  titulo,
  sub,
}: {
  selo: ReactNode;
  tom: "teal" | "gold";
  eyebrow: string;
  titulo: readonly string[];
  sub: string;
}) {
  return (
    <section className="obg-hero">
      <div className="wrap-narrow center">
        {selo}
        <span className={`overline ${tom}`} style={{ display: "block", marginBottom: "var(--sp3)" }}>
          {eyebrow}
        </span>
        <h1 className="obg-titulo">
          {titulo.map((linha, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              <Inteiro texto={linha} />
            </Fragment>
          ))}
        </h1>
        <p className="lead muted obg-sub">{sub}</p>
      </div>
    </section>
  );
}

/** Versão web do app. No espanhol, o app já abre em espanhol. */
function LinkWeb({ lang, antes, rotulo }: { lang: Idioma; antes: string; rotulo: string }) {
  const href = lang === "es" ? `${SITE.appUrl}/?lang=es` : SITE.appUrl;
  return (
    <p className="body-sm muted obg-web">
      {antes}{" "}
      <a href={href} className="teal">
        {rotulo}
      </a>
    </p>
  );
}

function Atendimento({ antes, assunto }: { antes: string; assunto: string }) {
  return (
    <p className="body-sm muted center obg-atendimento">
      {antes}{" "}
      <a href={linkDoAtendimento(assunto)} className="teal">
        {ATENDIMENTO.email}
      </a>
      .
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · PAGAMENTO APROVADO                                              */
/* ------------------------------------------------------------------ */
function Aprovado({ lang }: { lang: Idioma }) {
  const t = TEXTOS.aprovado[lang];
  return (
    <Moldura lang={lang}>
      <Hero selo={<SeloCheck />} tom="teal" eyebrow={t.selo} titulo={t.titulo} sub={t.sub} />

      {/* Passo 1: o e-mail com os dados de acesso */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card obg-card-destaque">
            <div className="obg-card-glow" aria-hidden="true" />
            <div className="obg-card-inner">
              <span className="badge badge-primary">{t.passo1Selo}</span>
              <h2 className="obg-card-titulo"><Inteiro texto={t.passo1Titulo} /></h2>
              <p className="body-sm muted">
                <Rico partes={t.passo1Texto} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Passo 2: baixar o app (lojas e versão web) */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card">
            <div className="obg-card-inner">
              <span className="overline">{t.passo2Selo}</span>
              <h2 className="obg-card-titulo"><Inteiro texto={t.passo2Titulo} /></h2>
              <p className="body-sm muted" style={{ marginBottom: "var(--sp6)" }}>
                <Inteiro texto={t.passo2Texto} />
              </p>
              <StoreBadges variant="link" lang={lang} />
              <LinkWeb lang={lang} antes={t.webAntes} rotulo={t.webLink} />
            </div>
          </div>
        </div>
      </section>

      {/* O caminho que já funciona hoje, discreto: código no WhatsApp */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-atalho">
            <span className="overline obg-atalho-selo">{t.agoraSelo}</span>
            <p className="body-sm muted">
              <Rico partes={t.agoraTexto} />
            </p>
          </div>

          <p className="obg-frase center">{t.frase}</p>

          <Atendimento antes={t.suporteAntes} assunto={ATENDIMENTO.assuntoSuporte} />
        </div>
      </section>
    </Moldura>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · AGUARDANDO PAGAMENTO (Pix ou boleto)                            */
/* ------------------------------------------------------------------ */
function AguardandoPagamento({ lang, forma }: { lang: Idioma; forma: Forma }) {
  const t = TEXTOS["aguardando-pagamento"][lang];
  // Sem a forma na URL, as duas orientações. Com uma forma que não é Pix nem
  // boleto ("outra"), nenhuma das duas: só a linha das instruções no e-mail.
  const outra = forma === "outra";
  const mostraPix = !outra && forma !== "boleto";
  const mostraBoleto = !outra && forma !== "pix";
  return (
    <Moldura lang={lang}>
      <Hero selo={<SeloRelogio />} tom="gold" eyebrow={t.selo} titulo={t.titulo} sub={t.sub} />

      {/* Como concluir o pagamento */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card">
            <div className="obg-card-inner">
              <span className="badge badge-gold">{t.concluirSelo}</span>
              <h2 className="obg-card-titulo"><Inteiro texto={t.concluirTitulo} /></h2>
              {(mostraPix || mostraBoleto) && (
                <div className="obg-formas">
                  {mostraPix && (
                    <div className="obg-item" data-forma="pix">
                      <div>
                        <div className="h3" style={{ marginBottom: 3 }}>{t.pixTitulo}</div>
                        <p className="body-sm muted">{t.pixTexto}</p>
                      </div>
                    </div>
                  )}
                  {mostraBoleto && (
                    <div className="obg-item" data-forma="boleto">
                      <div>
                        <div className="h3" style={{ marginBottom: 3 }}>{t.boletoTitulo}</div>
                        <p className="body-sm muted">{t.boletoTexto}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {outra ? (
                <p className="body-sm muted" data-forma="outra">
                  <Inteiro texto={`${t.instrucoesSoEmail} ${t.jaPagou}`} />
                </p>
              ) : (
                <p className="body-sm muted" style={{ marginTop: "var(--sp5)" }}>
                  <Inteiro texto={`${t.instrucoes} ${t.jaPagou}`} />
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Acesso liberado depois da confirmação; acompanhar o e-mail */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card">
            <div className="obg-card-inner">
              <span className="overline">{t.emailSelo}</span>
              <h2 className="obg-card-titulo"><Inteiro texto={t.emailTitulo} /></h2>
              <p className="body-sm muted">
                <Rico partes={t.emailTexto} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Baixar o app enquanto espera */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card">
            <div className="obg-card-inner">
              <span className="overline">{t.appSelo}</span>
              <h2 className="obg-card-titulo"><Inteiro texto={t.appTitulo} /></h2>
              <p className="body-sm muted" style={{ marginBottom: "var(--sp6)" }}>
                <Inteiro texto={t.appTexto} />
              </p>
              <StoreBadges variant="link" lang={lang} />
              <LinkWeb lang={lang} antes={t.webAntes} rotulo={t.webLink} />
            </div>
          </div>
        </div>
      </section>

      <section className="obg-sec">
        <div className="wrap-narrow">
          <p className="obg-frase center">{t.frase}</p>
          <Atendimento antes={t.suporteAntes} assunto={ATENDIMENTO.assuntoAtendimento} />
        </div>
      </section>
    </Moldura>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · EM ANÁLISE (como era; só o atendimento e "e-mail da compra")    */
/* ------------------------------------------------------------------ */
function AguardandoAnalise() {
  return (
    <Moldura>
      <section className="obg-hero">
        <div className="wrap-narrow center">
          <SeloRelogio />

          <span className="overline gold" style={{ display: "block", marginBottom: "var(--sp3)" }}>
            Em análise
          </span>

          <h1 className="obg-titulo">
            Seu pagamento está
            <br />
            sendo analisado.
          </h1>

          <p className="lead muted obg-sub">
            A operadora do cartão está confirmando a transação. Assim que for aprovada, você
            recebe o <span className="teal">e-mail de acesso</span>. Isso costuma levar poucos
            minutos, mas pode demorar algumas horas.
          </p>
        </div>
      </section>

      {/* ---------- AGUARDANDO: o que acontece agora ---------- */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-card">
            <div className="obg-card-inner">
              <span className="badge badge-gold">Enquanto isso</span>
              <h2 className="obg-card-titulo">Você não precisa fazer nada</h2>
              <p className="body-sm muted" style={{ marginBottom: "var(--sp5)" }}>
                Assim que a confirmação chegar, disparamos seu e-mail de acesso
                automaticamente. Pode fechar esta página.
              </p>
              <p className="body-sm muted">
                Se preferir, já deixe o app instalado. Quando o acesso liberar, é só
                entrar com o e-mail usado no pagamento.
              </p>
              <div style={{ marginTop: "var(--sp6)" }}>
                <StoreBadges variant="link" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- O QUE ESPERAR ---------- */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-lista">
            {[
              { t: "A confirmação do pagamento", d: "Você recebe um aviso assim que for compensado. Não precisa ficar conferindo." },
              { t: "O e-mail de acesso", d: "Chega automaticamente na sequência, com o passo a passo pra entrar no app." },
              { t: "Sua jornada começa", d: "Você faz a provocação do Dia 1 e a constância começa a se construir." },
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
            Volte amanhã.
          </p>

          <p className="caption center" style={{ marginTop: "var(--sp8)" }}>
            Precisa de ajuda?{" "}
            <a href={linkDoAtendimento(ATENDIMENTO.assuntoAtendimento)} className="teal">
              {ATENDIMENTO.email}
            </a>
          </p>
        </div>
      </section>
    </Moldura>
  );
}
