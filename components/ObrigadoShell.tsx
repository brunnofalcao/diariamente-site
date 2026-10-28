import type { CSSProperties } from "react";
import { ATENDIMENTO } from "@/config/atendimento";
import { TelaDaLoja } from "@/components/TelaDaLoja";
import {
  Final,
  Hero,
  InstalarApp,
  Inteiro,
  Moldura,
  Rico,
  SeloAprovado,
  SeloEspera,
  Trilha,
  textosDo,
} from "@/components/PosPagamento";
import { ATIVOS, dicionario } from "@/lib/i18n";
import { IDIOMA_DO_APP, orientacaoDoPagamento } from "@/lib/obrigado.mjs";
import type { Aparelho, Estado, Forma, Local } from "@/lib/pos-pagamento";

/* =====================================================================
   ObrigadoShell · as três páginas de obrigado, nos quatro locais
   ---------------------------------------------------------------------
   APROVADO: o app é o motivo principal, então a página leva direto a ele.
     selo que se desenha, trilha de 3 marcos (pagamento feito, instalar
     agora, senha a seguir), instalar pelo aparelho detectado (botão da
     loja certa no celular, QR code no computador), criar a senha com o
     chip do botão exato do app, o aviso do WhatsApp (sem prometer que
     chega), a tela real do app, "Não recebeu?" e o atendimento.
   AGUARDANDO PAGAMENTO e EM ANÁLISE: mesma moldura, em dourado, com o
     relógio, a trilha no passo 2 e o que fazer enquanto isso. Pix e
     boleto só no Brasil (lib/obrigado.mjs, orientacaoDoPagamento).

   Textos: lib/obrigado-textos.mjs. Regras de idioma, aparelho e forma de
   pagamento: lib/obrigado.mjs. A página (components/PaginaObrigado.tsx)
   decide local, aparelho e forma no servidor e entrega aqui; o Purchase
   fica lá, só na aprovada.
   ===================================================================== */

export function ObrigadoShell({
  estado,
  local,
  aparelho,
  forma = null,
}: {
  estado: Estado;
  local: Local;
  aparelho: Aparelho;
  forma?: Forma | null;
}) {
  if (estado === "aprovado") return <Aprovado local={local} aparelho={aparelho} />;
  if (estado === "aguardando-pagamento") return <AguardandoPagamento local={local} aparelho={aparelho} forma={forma} />;
  return <AguardandoAnalise local={local} aparelho={aparelho} />;
}

const atraso = (d: number) => ({ "--d": d }) as CSSProperties;

function Seta() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

function IconeWhatsApp() {
  // Balão de conversa com o fone, desenhado aqui (sem logo de terceiros baixado).
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M20.4 11.6a8.4 8.4 0 0 1-12.5 7.3L3.6 20.4l1.5-4.2a8.4 8.4 0 1 1 15.3-4.6z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
      <path
        d="M9.3 8.3c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.5.6c-.1.1-.2.3-.1.5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5-.1l.6-.6c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5v.5c0 .3-.1.7-.6.9-.6.3-1.5.4-2.6-.1-1.6-.7-2.9-2-3.7-3.6-.5-1.1-.4-2-.4-2.9z"
        fill="currentColor"
      />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="pp-ajuda-seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · PAGAMENTO APROVADO                                              */
/* ------------------------------------------------------------------ */
function Aprovado({ local, aparelho }: { local: Local; aparelho: Aparelho }) {
  const t = textosDo(local).aprovado;
  const lang = IDIOMA_DO_APP[local] as "pt" | "es";
  const tela = ATIVOS[lang].img.leitura;
  const alt = dicionario(lang, local === "pt-pt" ? "pt" : undefined).finAlt;
  return (
    <Moldura local={local} larga>
      <Hero selo={<SeloAprovado />} sobre={t.selo} titulo={t.titulo} sub={t.sub} />
      <Trilha t={t.trilha} atual={2} />

      <div className="pp-grade">
        {/* Passo 2: instalar o app, pelo aparelho */}
        <section className="pp-cartao is-destaque pp-surge" style={atraso(5)} id="passo-2" aria-labelledby="passo-2-titulo">
          <span className="pp-etiqueta">{t.app.selo}</span>
          <h2 id="passo-2-titulo" className="pp-cartao-titulo">{t.app.titulo}</h2>
          <InstalarApp local={local} aparelho={aparelho} />
          <a className="pp-ja" href="#passo-3">
            <span>{t.app.jaInstalado}</span>
            <Seta />
          </a>
        </section>

        {/* Passo 3: criar a senha no app */}
        <section className="pp-cartao pp-surge" style={atraso(6)} id="passo-3" aria-labelledby="passo-3-titulo">
          <span className="pp-etiqueta is-neutra">{t.senha.selo}</span>
          <h2 id="passo-3-titulo" className="pp-cartao-titulo">{t.senha.titulo}</h2>
          <ol className="pp-passos" role="list">
            {t.senha.passos.map((partes, i) => (
              <li key={i} className="pp-passo">
                <span className="pp-passo-num" aria-hidden="true">{i + 1}</span>
                <p className="pp-passo-texto"><Rico partes={partes} /></p>
              </li>
            ))}
          </ol>
        </section>

        {/* WhatsApp: o mesmo passo a passo, se o número veio certo no pagamento */}
        <section className="pp-cartao pp-whats pp-surge" style={atraso(7)} aria-labelledby="pp-whats-titulo">
          <div className="pp-whats-topo">
            <span className="pp-whats-icone"><IconeWhatsApp /></span>
            <span className="pp-etiqueta is-verde">{t.whatsapp.selo}</span>
          </div>
          <h2 id="pp-whats-titulo" className="pp-cartao-titulo">{t.whatsapp.titulo}</h2>
          <p className="pp-texto"><Inteiro texto={t.whatsapp.texto} /></p>
        </section>

        {/* O que te espera: a tela real do app (arte das lojas) */}
        <figure className="pp-espera pp-surge" style={atraso(8)}>
          <figcaption className="pp-espera-frase">{t.espera.texto}</figcaption>
          <div className="pp-espera-tela">
            <TelaDaLoja base={tela} alt={alt} sizes="(min-width: 960px) 240px, 212px" />
          </div>
        </figure>

        {/* Não recebeu? */}
        <details className="pp-ajuda pp-surge" style={atraso(9)}>
          <summary>
            <span>{t.naoRecebeu.titulo}</span>
            <Chevron />
          </summary>
          <div className="pp-ajuda-corpo">
            {t.naoRecebeu.itens.map((item, i) => (
              <div key={i} className="pp-ajuda-item">
                <h3 className="pp-ajuda-pergunta">{item.p}</h3>
                <p className="pp-ajuda-resposta"><Rico partes={item.r} assunto={ATENDIMENTO.assuntoSuporte} /></p>
              </div>
            ))}
          </div>
        </details>
      </div>

      <Final
        local={local}
        webAntes={t.webAntes}
        webLink={t.webLink}
        suporteAntes={t.suporteAntes}
        assunto={ATENDIMENTO.assuntoSuporte}
        frase={t.frase}
      />
    </Moldura>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · AGUARDANDO PAGAMENTO                                            */
/* ------------------------------------------------------------------ */
function AguardandoPagamento({ local, aparelho, forma }: { local: Local; aparelho: Aparelho; forma: Forma | null }) {
  const t = textosDo(local)["aguardando-pagamento"];
  // Pix e boleto só existem no Brasil (lista vazia nos outros locais). Com a
  // forma na URL, só a orientação dela; com outra forma, só a linha geral.
  const { formas, linha } = orientacaoDoPagamento(t.concluir.formas, forma);
  const mostrar = t.concluir.formas.filter((f) => formas.includes(f.id));
  return (
    <Moldura local={local} espera>
      <Hero selo={<SeloEspera />} sobre={t.selo} titulo={t.titulo} sub={t.sub} />
      <Trilha t={t.trilha} atual={2} />

      <div className="pp-pilha">
        <section className="pp-cartao is-ouro pp-surge" style={atraso(5)} aria-labelledby="pp-concluir-titulo">
          <span className="pp-etiqueta is-ouro">{t.concluir.selo}</span>
          <h2 id="pp-concluir-titulo" className="pp-cartao-titulo">{t.concluir.titulo}</h2>
          {mostrar.length > 0 && (
            <div className="pp-formas">
              {mostrar.map((f) => (
                <div key={f.id} className="pp-forma" data-forma={f.id}>
                  <p className="pp-forma-titulo">{f.titulo}</p>
                  <p className="pp-forma-texto"><Inteiro texto={f.texto} /></p>
                </div>
              ))}
            </div>
          )}
          <p className={`pp-texto${mostrar.length ? " pp-instrucoes" : ""}`} data-linha={linha}>
            <Inteiro texto={t.concluir[linha]} />
          </p>
          <p className="pp-texto pp-forte">{t.concluir.jaPagou}</p>
        </section>

        <section className="pp-cartao pp-surge" style={atraso(6)} aria-labelledby="pp-acesso-titulo">
          <span className="pp-etiqueta is-neutra">{t.acesso.selo}</span>
          <h2 id="pp-acesso-titulo" className="pp-cartao-titulo">{t.acesso.titulo}</h2>
          <p className="pp-texto"><Rico partes={t.acesso.texto} /></p>
        </section>

        <section className="pp-cartao pp-surge" style={atraso(7)} aria-labelledby="pp-app-titulo">
          <span className="pp-etiqueta">{t.app.selo}</span>
          <h2 id="pp-app-titulo" className="pp-cartao-titulo">{t.app.titulo}</h2>
          <p className="pp-texto"><Rico partes={t.app.texto} /></p>
          <InstalarApp local={local} aparelho={aparelho} />
        </section>
      </div>

      <Final
        local={local}
        webAntes={t.webAntes}
        webLink={t.webLink}
        suporteAntes={t.suporteAntes}
        assunto={ATENDIMENTO.assuntoAtendimento}
        frase={t.frase}
      />
    </Moldura>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · EM ANÁLISE                                                      */
/* ------------------------------------------------------------------ */
function AguardandoAnalise({ local, aparelho }: { local: Local; aparelho: Aparelho }) {
  const t = textosDo(local)["aguardando-analise"];
  return (
    <Moldura local={local} espera>
      <Hero selo={<SeloEspera />} sobre={t.selo} titulo={t.titulo} sub={t.sub} />
      <Trilha t={t.trilha} atual={2} />

      <div className="pp-pilha">
        <section className="pp-cartao is-ouro pp-surge" style={atraso(5)} aria-labelledby="pp-calma-titulo">
          <span className="pp-etiqueta is-ouro">{t.calma.selo}</span>
          <h2 id="pp-calma-titulo" className="pp-cartao-titulo">{t.calma.titulo}</h2>
          <p className="pp-texto"><Rico partes={t.calma.texto} /></p>
        </section>

        <section className="pp-cartao pp-surge" style={atraso(6)} aria-labelledby="pp-app-titulo">
          <span className="pp-etiqueta">{t.app.selo}</span>
          <h2 id="pp-app-titulo" className="pp-cartao-titulo">{t.app.titulo}</h2>
          <p className="pp-texto"><Rico partes={t.app.texto} /></p>
          <InstalarApp local={local} aparelho={aparelho} />
        </section>
      </div>

      <Final
        local={local}
        webAntes={t.webAntes}
        webLink={t.webLink}
        suporteAntes={t.suporteAntes}
        assunto={ATENDIMENTO.assuntoAtendimento}
        frase={t.frase}
      />
    </Moldura>
  );
}
