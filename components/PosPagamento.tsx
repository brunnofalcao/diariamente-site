import { Fragment, type CSSProperties, type ReactNode } from "react";
import { SITE, EMPRESA } from "@/config";
import { ATENDIMENTO, linkDoAtendimento } from "@/config/atendimento";
import { OfficialLogo } from "@/components/Brand";
import { AppleGlyph, PlayGlyph, StoreBadges } from "@/components/StoreBadges";
import { LOJAS_DO_LOCAL } from "@/lib/i18n";
import { BOTAO_DO_APP, IDIOMA_DO_APP, LANG_HTML, PREFIXO, TEXTOS } from "@/lib/obrigado.mjs";
import type { Aparelho, Local, Rico as TextoRico, TextosDoLocal } from "@/lib/pos-pagamento";
import "./pos-pagamento.css";

/* =====================================================================
   PÓS-PAGAMENTO · peças comuns
   ---------------------------------------------------------------------
   Usadas pelas três páginas de obrigado (components/ObrigadoShell.tsx) e
   pelo /baixar (components/BaixarApp.tsx). Nenhum texto do cliente mora
   aqui: tudo vem de lib/obrigado-textos.mjs, onde o teste confere as
   regras da marca nos quatro locais. Estilo em pos-pagamento.css.
   ===================================================================== */

/** Os textos de um local, com a forma conferida pelo TypeScript. */
export function textosDo(local: Local): TextosDoLocal {
  return (TEXTOS as unknown as Record<Local, TextosDoLocal>)[local];
}

/* ------------------------------ moldura ------------------------------ */

export function Moldura({
  local,
  espera = false,
  larga = false,
  children,
}: {
  local: Local;
  /** Tom dourado (pagamento pendente e em análise). */
  espera?: boolean;
  /** Abre a segunda coluna no computador (aprovada e /baixar). */
  larga?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={`pp${espera ? " is-espera" : ""}`} lang={LANG_HTML[local]}>
      <div className="pp-brilho" aria-hidden="true" />
      <header className="pp-topo">
        <OfficialLogo height={30} />
      </header>
      <div className={`pp-moldura${larga ? " is-larga" : ""}`}>{children}</div>
      <footer className="pp-rodape">
        <div className="pp-moldura">
          © {new Date().getFullYear()} {EMPRESA.marca}® · {SITE.dominioVisivel}
        </div>
      </footer>
    </main>
  );
}

/* ------------------------------- selos ------------------------------- */

// Opacidades dos raios, como os do sol da marca (public/icon.svg).
const RAIOS = [1, 0.62, 0.67, 0.73, 0.78, 0.86, 0.95, 0.7];

/** Check que se desenha, com uma onda e os raios do sol da marca. */
export function SeloAprovado() {
  return (
    <div className="pp-selo" aria-hidden="true">
      <svg viewBox="0 0 120 120" focusable="false">
        <g className="pp-selo-raios" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
          {RAIOS.map((o, i) => (
            <line
              key={i}
              x1="60" y1="19" x2="60" y2="8"
              pathLength={1}
              opacity={o}
              transform={`rotate(${i * 45} 60 60)`}
              style={{ "--i": i } as CSSProperties}
            />
          ))}
        </g>
        <circle className="pp-selo-onda" cx="60" cy="60" r="34" />
        <circle className="pp-selo-disco" cx="60" cy="60" r="34" />
        <polyline
          className="pp-selo-check"
          points="45 61 55.5 71.5 76 50"
          fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          pathLength={1}
        />
      </svg>
    </div>
  );
}

/** Relógio: o ponteiro dá uma volta e para. */
export function SeloEspera() {
  return (
    <div className="pp-selo is-espera" aria-hidden="true">
      <svg viewBox="0 0 120 120" focusable="false">
        <circle className="pp-selo-onda" cx="60" cy="60" r="34" />
        <circle className="pp-selo-disco" cx="60" cy="60" r="34" />
        <circle cx="60" cy="60" r="17" fill="none" stroke="currentColor" strokeWidth="4" />
        <line x1="60" y1="60" x2="60" y2="51" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line className="pp-selo-ponteiro" x1="60" y1="60" x2="67" y2="64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ------------------------------- texto ------------------------------- */

/** Palavra com hífen (e-mail, Boas-vindas) não quebra no hífen. */
export function Inteiro({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\S+-\S+)/).map((parte, i) =>
        i % 2 ? (
          <span key={i} className="pp-inteiro">{parte}</span>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        )
      )}
    </>
  );
}

const ROTULOS_DO_APP = new Set<string>(Object.values(BOTAO_DO_APP));

/**
 * O "chip": o rótulo EXATO do botão da tela de login do app, desenhado
 * como ele aparece lá (texto teal num recorte escuro), com um ponto de
 * toque. Não é botão aqui: mostra onde tocar no app.
 */
export function ChipDoApp({ rotulo }: { rotulo: string }) {
  return (
    <span className="pp-chip">
      <span className="pp-chip-toque" aria-hidden="true" />
      <span>{rotulo}</span>
    </span>
  );
}

/**
 * Texto rico da copy: negrito ({ b }), o chip quando o negrito é o
 * rótulo do botão do app, e o e-mail do atendimento ({ atendimento }).
 */
export function Rico({ partes, assunto = ATENDIMENTO.assuntoSuporte }: { partes: TextoRico; assunto?: string }) {
  // A pontuação logo depois do chip ("... Ativar conta.") vai junto com ele,
  // para o ponto nunca cair sozinho na linha de baixo.
  const colado = (i: number) => {
    const p = partes[i];
    if (typeof p !== "string") return "";
    return p.match(/^[.,;:!?]+/)?.[0] ?? "";
  };
  return (
    <>
      {partes.map((p, i) => {
        if (typeof p === "string") {
          const anterior = partes[i - 1];
          const depoisDoChip = anterior && typeof anterior !== "string" && "b" in anterior && ROTULOS_DO_APP.has(anterior.b);
          const texto = depoisDoChip ? p.slice(colado(i).length) : p;
          return texto ? <Inteiro key={i} texto={texto} /> : null;
        }
        if ("b" in p) {
          if (ROTULOS_DO_APP.has(p.b)) {
            return (
              <span key={i} className="pp-chip-grupo">
                <ChipDoApp rotulo={p.b} />
                {colado(i + 1)}
              </span>
            );
          }
          return <strong key={i} className="pp-forte"><Inteiro texto={p.b} /></strong>;
        }
        return (
          <a key={i} href={linkDoAtendimento(assunto)}>
            {ATENDIMENTO.email}
          </a>
        );
      })}
    </>
  );
}

/* -------------------------------- hero -------------------------------- */

export function Hero({
  selo,
  sobre,
  titulo,
  sub,
}: {
  selo: ReactNode;
  sobre: string;
  titulo: readonly string[];
  sub: string;
}) {
  return (
    <section className="pp-hero">
      {selo}
      <p className="pp-sobre pp-surge" style={{ "--d": 1 } as CSSProperties}>{sobre}</p>
      <h1 className="pp-titulo pp-surge" style={{ "--d": 2 } as CSSProperties}>
        {titulo.map((linha, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            <Inteiro texto={linha} />
          </Fragment>
        ))}
      </h1>
      <p className="pp-sub pp-surge" style={{ "--d": 3 } as CSSProperties}>{sub}</p>
    </section>
  );
}

/* ------------------------------- trilha ------------------------------- */

/**
 * Os três marcos da jornada. `atual` é o marco de agora (2 na aprovada e
 * nas pendentes): os de antes estão feitos, os depois vêm a seguir.
 * Lista ordenada com aria-current="step" no marco atual; o estado de cada
 * marco também está escrito (Feito, Agora, A seguir), não só na cor.
 */
export function Trilha({
  t,
  atual,
}: {
  t: { rotulo: string; resumo: string; passos: readonly string[]; feito: string; agora: string; depois: string };
  atual: number;
}) {
  return (
    <section className="pp-trilha pp-surge" style={{ "--d": 4 } as CSSProperties} aria-labelledby="pp-trilha-rotulo">
      <div className="pp-trilha-topo">
        <h2 id="pp-trilha-rotulo" className="pp-trilha-rotulo">{t.rotulo}</h2>
        <span className="pp-trilha-resumo">{t.resumo}</span>
      </div>
      <ol className="pp-marcos" role="list">
        {t.passos.map((nome, i) => {
          const n = i + 1;
          const estado = n < atual ? "feito" : n === atual ? "agora" : "depois";
          return (
            <li key={i} className={`pp-marco is-${estado}`} aria-current={estado === "agora" ? "step" : undefined}>
              <span className="pp-no" aria-hidden="true">
                {estado === "feito" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  n
                )}
              </span>
              <span className="pp-marco-nome">{nome}</span>
              <span className="pp-marco-status">{t[estado]}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------------------------- instalar o app ---------------------------- */

function Seta() {
  return (
    <svg className="pp-btn-seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

/** Caminho do QR code do /baixar do local (public/qr, gerado uma vez). */
export function qrDoLocal(local: Local): string {
  return `/qr/baixar-${local}.svg`;
}

/**
 * Instalar o app, pelo aparelho detectado no servidor (user-agent):
 *   ios         botão grande da App Store e "Usa Android?" discreto
 *   android     o inverso
 *   computador  QR code (abre o /baixar do idioma no celular) e as duas lojas
 * Os links abrem em outra aba: a página com os próximos passos continua aqui.
 */
export function InstalarApp({
  local,
  aparelho,
  computador,
}: {
  local: Local;
  aparelho: Aparelho;
  /** Textos do QR code no computador, quando a página tem os seus (o /baixar). */
  computador?: { titulo: string; texto: string; lojasAntes: string };
}) {
  const t = textosDo(local).lojas;
  const lojas = LOJAS_DO_LOCAL[local];
  const rotulos = { appStore: t.appStore, googlePlay: t.googlePlay, appStoreAria: t.appStoreAria, googlePlayAria: t.googlePlayAria };

  if (aparelho === "computador") {
    const q = computador ?? t.computador;
    return (
      <div className="pp-instalar" data-aparelho="computador">
        <div className="pp-qr">
          <div className="pp-qr-codigo">
            <img src={qrDoLocal(local)} alt={t.qrAlt} width={148} height={148} />
          </div>
          <div>
            <p className="pp-qr-titulo">{q.titulo}</p>
            <p className="pp-qr-texto">{q.texto}</p>
          </div>
        </div>
        <p className="pp-lojas-antes">{q.lojasAntes}</p>
        <StoreBadges variant="botoes" local={local} rotulos={rotulos} />
      </div>
    );
  }

  const ios = aparelho === "ios";
  const c = ios ? t.iphone : t.android;
  const principal = ios ? lojas.appStore : lojas.googlePlay;
  const outra = ios ? lojas.googlePlay : lojas.appStore;
  const idNota = `pp-nota-${aparelho}`;
  return (
    <div className="pp-instalar" data-aparelho={aparelho}>
      <a className="pp-btn" href={principal} target="_blank" rel="noopener noreferrer" aria-describedby={idNota}>
        <span className="pp-btn-icone">{ios ? <AppleGlyph tamanho={22} /> : <PlayGlyph tamanho={19} />}</span>
        <span className="pp-btn-rotulo">{c.botao}</span>
        <Seta />
      </a>
      <p className="pp-nota" id={idNota}>{c.nota}</p>
      <p className="pp-outro">
        <span>{c.outroAntes}</span>
        <a href={outra} target="_blank" rel="noopener noreferrer">{c.outroLink}</a>
      </p>
    </div>
  );
}

/* ------------------------------- final ------------------------------- */

/** Versão web do app. O app só tem pt-BR e es: os locais em espanhol abrem com ?lang=es. */
export function linkDaVersaoWeb(local: Local): string {
  return IDIOMA_DO_APP[local] === "es" ? `${SITE.appUrl}/?lang=es` : SITE.appUrl;
}

export function Final({
  local,
  webAntes,
  webLink,
  suporteAntes,
  assunto,
  frase,
}: {
  local: Local;
  webAntes: string;
  webLink: string;
  suporteAntes?: string;
  assunto?: string;
  frase: string;
}) {
  return (
    <div className="pp-final">
      <p>
        {webAntes}{" "}
        <a className="pp-link" href={linkDaVersaoWeb(local)}>{webLink}</a>
      </p>
      {suporteAntes && assunto && (
        <p>
          {suporteAntes}{" "}
          <a href={linkDoAtendimento(assunto)}>{ATENDIMENTO.email}</a>.
        </p>
      )}
      <p className="pp-frase">{frase}</p>
    </div>
  );
}

/** Endereço absoluto do /baixar do local (o que o QR code abre). */
export function urlDoBaixar(local: Local): string {
  return `${SITE.dominio}${PREFIXO[local]}/baixar`;
}
