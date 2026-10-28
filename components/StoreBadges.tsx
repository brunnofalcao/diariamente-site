import { LOJAS_BADGES } from "@/config";
import { LOJAS_DO_LOCAL } from "@/lib/i18n";

/**
 * StoreBadges — badges das lojas.
 *
 * ESTRATÉGIA: o app é ENTREGA, não aquisição. Só quem paga recebe o
 * acesso. Por isso existem três modos:
 *
 *  - variant="prova"  → selo passivo, SEM link (não compete com o checkout).
 *                        Usado logo abaixo do botão de pagamento.
 *  - variant="link"   → badges OFICIAIS clicáveis (Apple / Google Play).
 *  - variant="botoes" → os dois botões das lojas desenhados no estilo do
 *                        site, com o texto no idioma da página (os badges
 *                        oficiais do Cloudinary só existem em inglês e
 *                        pt-BR). Usado no pós-pagamento e no /baixar.
 *
 * Os links vêm de LOJAS_DO_LOCAL (lib/i18n.ts), a fonte única: pt abre a
 * ficha da loja em português do Brasil, es em espanhol.
 *
 * Badges oficiais em SVG (Cloudinary). Como o site é dark mode, usamos a
 * versão BRANCA da Apple. A preta está em LOJAS_BADGES.appStoreClaro caso
 * um dia exista fundo claro.
 *
 * Sem "use client": não tem estado nem evento, e assim renderiza no
 * servidor (inclusive dentro das páginas de obrigado).
 */

// Ícones das lojas em SVG inline (nada baixado de terceiros).
export function AppleGlyph({ tamanho = 18 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.05 12.54c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.71-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.18-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.74 2.21 1.1-.05 1.52-.71 2.85-.71s1.71.71 2.88.69c1.19-.02 1.94-1.08 2.67-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.54zM14.88 5.6c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.32-.56.65-1.05 1.69-.92 2.69.98.08 1.98-.5 2.58-1.23z" />
    </svg>
  );
}

export function PlayGlyph({ tamanho = 16 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={Math.round(tamanho * 1.125)} viewBox="0 0 20 22" fill="none" aria-hidden="true" focusable="false">
      <path d="M1.4 1.1C1.15 1.38 1 1.8 1 2.36v17.28c0 .56.15.98.4 1.26l.07.06 9.7-9.68v-.23L1.47 1.05l-.07.05z" fill="currentColor" opacity=".7" />
      <path d="M14.4 14.53l-3.23-3.23v-.23l3.23-3.23.07.04 3.83 2.17c1.09.62 1.09 1.64 0 2.26l-3.83 2.18-.07.04z" fill="currentColor" />
      <path d="M14.47 14.49L11.17 11.19 1.4 20.96c.36.38.95.43 1.62.05l11.45-6.52z" fill="currentColor" opacity=".85" />
      <path d="M14.47 7.89L3.02 1.37C2.35.99 1.76 1.04 1.4 1.42l9.77 9.77 3.3-3.3z" fill="currentColor" opacity=".55" />
    </svg>
  );
}

// Rótulos acessíveis dos badges oficiais. As imagens são as mesmas nos dois
// idiomas (não há badge em espanhol no Cloudinary, ver o [TROCAR] em lib/i18n.ts).
const ROTULOS = {
  pt: {
    appStoreAria: "Baixe o Diariamente na App Store",
    appStoreAlt: "Baixe na App Store",
    googlePlay: "Disponível no Google Play",
    googlePlayAria: "Baixe o Diariamente no Google Play",
  },
  es: {
    appStoreAria: "Descarga Diariamente en App Store",
    appStoreAlt: "Descárgalo en App Store",
    googlePlay: "Disponible en Google Play",
    googlePlayAria: "Descarga Diariamente en Google Play",
  },
};

/** Textos dos botões desenhados (variant="botoes"), vindos da copy do local. */
export type RotulosDasLojas = {
  appStore: string;
  googlePlay: string;
  appStoreAria: string;
  googlePlayAria: string;
};

export function StoreBadges({
  variant = "link",
  align = "center",
  tema = "escuro",
  lang = "pt",
  rotulos,
}: {
  variant?: "link" | "prova" | "botoes";
  align?: "center" | "left";
  tema?: "escuro" | "claro";
  /** "es": rótulos em espanhol e a ficha em espanhol nas duas lojas. */
  lang?: "pt" | "es";
  /** Textos do variant="botoes". */
  rotulos?: RotulosDasLojas;
}) {
  const es = lang === "es";
  const lojas = LOJAS_DO_LOCAL[es ? "es" : "pt"];
  const rotulo = ROTULOS[es ? "es" : "pt"];

  // badge da Apple muda conforme o fundo
  const badgeApple =
    tema === "claro" ? LOJAS_BADGES.appStoreClaro : LOJAS_BADGES.appStoreEscuro;

  // Selo passivo de prova (sem link) — perto do carrinho
  if (variant === "prova") {
    return (
      <div className={`store-prova ${align === "left" ? "is-left" : ""}`}>
        <AppleGlyph />
        <span>Disponível para iPhone e Android</span>
        <PlayGlyph />
      </div>
    );
  }

  // Botões no estilo do site, com o texto do idioma da página
  if (variant === "botoes") {
    const r = rotulos ?? {
      appStore: rotulo.appStoreAlt,
      googlePlay: rotulo.googlePlay,
      appStoreAria: rotulo.appStoreAria,
      googlePlayAria: rotulo.googlePlayAria,
    };
    return (
      <div className={`pp-lojas ${align === "left" ? "is-left" : ""}`}>
        <a className="pp-loja" href={lojas.appStore} target="_blank" rel="noopener noreferrer" aria-label={r.appStoreAria}>
          <AppleGlyph tamanho={20} />
          <span>{r.appStore}</span>
        </a>
        <a className="pp-loja" href={lojas.googlePlay} target="_blank" rel="noopener noreferrer" aria-label={r.googlePlayAria}>
          <PlayGlyph tamanho={18} />
          <span>{r.googlePlay}</span>
        </a>
      </div>
    );
  }

  // Badges oficiais clicáveis
  return (
    <div className={`store-badges ${align === "left" ? "is-left" : ""}`}>
      <a
        className="store-oficial"
        href={lojas.appStore}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={rotulo.appStoreAria}
      >
        <img src={badgeApple} alt={rotulo.appStoreAlt} height={48} />
      </a>

      <a
        className="store-oficial store-oficial-play"
        href={lojas.googlePlay}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={rotulo.googlePlay}
      >
        <img src={LOJAS_BADGES.googlePlay} alt={rotulo.googlePlay} height={48} />
      </a>
    </div>
  );
}
