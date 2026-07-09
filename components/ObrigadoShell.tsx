import { SITE, EMPRESA } from "@/config";
import { OfficialLogo } from "@/components/Brand";
import { StoreBadges } from "@/components/StoreBadges";

type Estado = "aprovado" | "aguardando-pagamento" | "aguardando-analise";

/**
 * ObrigadoShell — layout compartilhado das 3 páginas de obrigado.
 * Cada estado tem sua própria mensagem, cor de selo e próximo passo.
 * O design é o mesmo da página de vendas (dark, teal, serifado).
 */
export function ObrigadoShell({ estado }: { estado: Estado }) {
  const aprovado = estado === "aprovado";

  const conteudo = {
    aprovado: {
      selo: "teal",
      eyebrow: "Acesso confirmado",
      titulo: (
        <>
          Seu primeiro passo já
          <br />
          está te esperando.
        </>
      ),
      sub: (
        <>
          Em instantes você recebe o <span className="teal">e-mail de acesso</span> com tudo
          que precisa pra abrir o app e começar. Se não chegar em alguns minutos, confira
          o spam ou fale com a gente.
        </>
      ),
    },
    "aguardando-pagamento": {
      selo: "gold",
      eyebrow: "Quase lá",
      titulo: (
        <>
          Falta só a confirmação
          <br />
          do pagamento.
        </>
      ),
      sub: (
        <>
          Assim que o pagamento for compensado, você recebe o{" "}
          <span className="teal">e-mail de acesso</span> automaticamente. Pix costuma levar
          minutos. Boleto pode levar até 3 dias úteis.
        </>
      ),
    },
    "aguardando-analise": {
      selo: "gold",
      eyebrow: "Em análise",
      titulo: (
        <>
          Seu pagamento está
          <br />
          sendo analisado.
        </>
      ),
      sub: (
        <>
          A operadora do cartão está confirmando a transação. Assim que for aprovada, você
          recebe o <span className="teal">e-mail de acesso</span>. Isso costuma levar poucos
          minutos, mas pode demorar algumas horas.
        </>
      ),
    },
  }[estado];

  return (
    <main className="obg">
      <div className="obg-glow" aria-hidden="true" />

      <header className="obg-header">
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <OfficialLogo height={30} />
        </div>
      </header>

      <section className="obg-hero">
        <div className="wrap-narrow center">
          {/* selo: check (aprovado) ou relógio (aguardando) */}
          <div className={`obg-check ${aprovado ? "" : "is-wait"}`}>
            {aprovado ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            )}
          </div>

          <span
            className={`overline ${aprovado ? "teal" : "gold"}`}
            style={{ display: "block", marginBottom: "var(--sp3)" }}
          >
            {conteudo.eyebrow}
          </span>

          <h1 className="obg-titulo">{conteudo.titulo}</h1>

          <p className="lead muted obg-sub">{conteudo.sub}</p>
        </div>
      </section>

      {/* ---------- APROVADO: comece agora + lojas ---------- */}
      {aprovado ? (
        <>
          <section className="obg-sec">
            <div className="wrap-narrow">
              <div className="obg-card obg-card-destaque">
                <div className="obg-card-glow" aria-hidden="true" />
                <div className="obg-card-inner">
                  <span className="badge badge-primary">Comece agora</span>
                  <h2 className="obg-card-titulo">Faça a provocação do Dia 1 hoje</h2>
                  <p className="body-sm muted" style={{ marginBottom: "var(--sp6)" }}>
                    Sua constância começa no momento em que você marca o primeiro dia como
                    lido. Não deixe pra amanhã o que pode começar agora.
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

          <section className="obg-sec">
            <div className="wrap-narrow">
              <div className="obg-card">
                <div className="obg-card-inner">
                  <span className="overline">Passo 2</span>
                  <h2 className="obg-card-titulo">Baixe o app no seu celular</h2>
                  <p className="body-sm muted" style={{ marginBottom: "var(--sp6)" }}>
                    Entre com o mesmo e-mail da sua compra. O ritual funciona melhor no
                    bolso, junto com o lembrete diário no WhatsApp.
                  </p>
                  <StoreBadges variant="link" />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* ---------- AGUARDANDO: o que acontece agora ---------- */
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
                  entrar com o e-mail da compra.
                </p>
                <div style={{ marginTop: "var(--sp6)" }}>
                  <StoreBadges variant="link" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- O QUE ESPERAR ---------- */}
      <section className="obg-sec">
        <div className="wrap-narrow">
          <div className="obg-lista">
            {(aprovado
              ? [
                  { t: "O e-mail de acesso", d: "Chega logo após a confirmação, com o passo a passo pra entrar no app." },
                  { t: "O lembrete diário", d: "Todo dia, no WhatsApp. Você não precisa lembrar de nada, o ritual te encontra." },
                  { t: "Sua jornada de constância", d: "O calendário e a ofensiva mostram sua sequência se construindo, dia após dia." },
                ]
              : [
                  { t: "A confirmação do pagamento", d: "Você recebe um aviso assim que for compensado. Não precisa ficar conferindo." },
                  { t: "O e-mail de acesso", d: "Chega automaticamente na sequência, com o passo a passo pra entrar no app." },
                  { t: "Sua jornada começa", d: "Você faz a provocação do Dia 1 e a constância começa a se construir." },
                ]
            ).map((item, i) => (
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
