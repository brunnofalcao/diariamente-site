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
import { orientacaoDoPagamento } from "@/lib/obrigado.mjs";
import type { Aparelho, Estado, Forma, Local } from "@/lib/pos-pagamento";
import type { Mercado } from "@/config/pricing";

/* =====================================================================
   ObrigadoShell · as três páginas de obrigado, em pt e em es
   ---------------------------------------------------------------------
   APROVADO: o app é o motivo principal, então a página leva direto a ele.
     No celular, em uma coluna, nesta ordem: selo e título curtos, o
     cartão de instalar (o botão da loja certa aparece SEM rolar no
     iPhone de verdade, onde o Safari deixa uns 390 x 664 de tela), a
     trilha de 3 marcos, criar a senha com o chip do botão exato do app,
     o aviso do WhatsApp (sem prometer que chega) com o "Não recebeu?"
     logo abaixo, e a tela real do app.
     No computador (960 px ou mais), duas colunas: à esquerda o selo, o
     título e a trilha; à direita o cartão de instalar com o QR code, na
     primeira dobra (1280 x 800). Embaixo, a senha, o WhatsApp e o "Não
     recebeu?" à esquerda e a tela do app à direita.
   AGUARDANDO PAGAMENTO e EM ANÁLISE: mesma moldura, em dourado, com o
     relógio, a trilha no passo 2 e o que fazer enquanto isso. Pix e
     boleto só para o mercado br (lib/obrigado.mjs,
     orientacaoDoPagamento): quem lê em português e paga em dólar ou euro
     vê a linha geral.

   Textos: lib/obrigado-textos.mjs. Regras de idioma, mercado, aparelho e
   forma de pagamento: lib/obrigado.mjs. A página
   (components/PaginaObrigado.tsx) decide local, aparelho, mercado e
   forma no servidor e entrega aqui; o Purchase fica lá, só na aprovada.
   ===================================================================== */

export function ObrigadoShell({
  estado,
  local,
  aparelho,
  forma = null,
  mercado,
}: {
  estado: Estado;
  local: Local;
  aparelho: Aparelho;
  forma?: Forma | null;
  /** Mercado do pedido (lib/obrigado.mjs, mercadoDoObrigado). */
  mercado: Mercado;
}) {
  if (estado === "aprovado") return <Aprovado local={local} aparelho={aparelho} />;
  if (estado === "aguardando-pagamento") {
    return <AguardandoPagamento local={local} aparelho={aparelho} forma={forma} mercado={mercado} />;
  }
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
  return (
    <Moldura local={local} larga>
      {/* A ordem do HTML é a do celular (e a do leitor de tela); no
          computador, a grade de pos-pagamento.css põe cada bloco na sua
          área (.pp-aprovado). */}
      <div className="pp-aprovado">
        <Hero classe="pp-area-hero" selo={<SeloAprovado />} sobre={t.selo} titulo={t.titulo} sub={t.sub} />

        {/* Passo 2: instalar o app, pelo aparelho */}
        <section className="pp-cartao is-destaque pp-surge pp-area-instalar" style={atraso(4)} id="passo-2" aria-labelledby="passo-2-titulo">
          <span className="pp-etiqueta">{t.app.selo}</span>
          <h2 id="passo-2-titulo" className="pp-cartao-titulo">{t.app.titulo}</h2>
          <InstalarApp local={local} aparelho={aparelho} versaoWeb={{ antes: t.webAquiAntes, link: t.webLink }} />
          <a className="pp-ja" href="#passo-3">
            <span>{t.app.jaInstalado}</span>
            <Seta />
          </a>
        </section>

        <Trilha classe="pp-area-trilha" t={t.trilha} atual={2} />

        {/* Passo 3: criar a senha no app */}
        <section className="pp-cartao pp-surge pp-area-senha" style={atraso(6)} id="passo-3" aria-labelledby="passo-3-titulo">
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

        {/* WhatsApp: o mesmo passo a passo, se o número veio certo no
            pagamento. O "Não recebeu?" vem colado, logo abaixo. */}
        <div className="pp-whats-bloco pp-area-whats">
          <section className="pp-cartao pp-whats pp-surge" style={atraso(7)} aria-labelledby="pp-whats-titulo">
            <div className="pp-whats-topo">
              <span className="pp-whats-icone"><IconeWhatsApp /></span>
              <span className="pp-etiqueta is-verde">{t.whatsapp.selo}</span>
            </div>
            <h2 id="pp-whats-titulo" className="pp-cartao-titulo">{t.whatsapp.titulo}</h2>
            <p className="pp-texto"><Inteiro texto={t.whatsapp.texto} /></p>
          </section>

          <details className="pp-ajuda pp-surge" style={atraso(8)}>
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

        {/* O que te espera: a tela real do app (arte das lojas). Sem
            legenda: a arte já traz o próprio título, e dois títulos
            seguidos diziam a mesma coisa. */}
        <figure className="pp-espera pp-surge pp-area-espera" style={atraso(9)}>
          <TelaDaLoja base={ATIVOS[local].img.leitura} alt={dicionario(local).finAlt} sizes="(min-width: 960px) 300px, 220px" />
        </figure>
      </div>

      <Final
        local={local}
        webAntes={t.webAntes}
        webLink={t.webLink}
        semWeb={aparelho === "computador"}
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
function AguardandoPagamento({
  local,
  aparelho,
  forma,
  mercado,
}: {
  local: Local;
  aparelho: Aparelho;
  forma: Forma | null;
  mercado: Mercado;
}) {
  const t = textosDo(local)["aguardando-pagamento"];
  // Pix e boleto só existem no mercado br: quem lê em português e paga em
  // dólar (mundo) ou euro (Portugal) vê a linha geral. Com a forma na URL,
  // só a orientação dela; com outra forma, só a linha geral.
  const doPedido: typeof t.concluir.formas = mercado === "br" ? t.concluir.formas : [];
  const { formas, linha } = orientacaoDoPagamento(doPedido, forma);
  const mostrar = doPedido.filter((f) => formas.includes(f.id));
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
