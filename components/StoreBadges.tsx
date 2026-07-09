"use client";

import { LOJAS } from "@/config";

/**
 * StoreBadges — badges das lojas.
 *
 * IMPORTANTE (estratégia): o app é ENTREGA, não aquisição.
 * Só quem compra recebe o e-mail de acesso. Por isso:
 *  - variant="prova"   → selo passivo, sem link (não compete com o checkout)
 *  - variant="link"    → badges clicáveis (rodapé, pós-compra)
 */

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.71-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.18-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.74 2.21 1.1-.05 1.52-.71 2.85-.71s1.71.71 2.88.69c1.19-.02 1.94-1.08 2.67-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.54zM14.88 5.6c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.32-.56.65-1.05 1.69-.92 2.69.98.08 1.98-.5 2.58-1.23z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 20 22" fill="none" aria-hidden="true">
      <path d="M1.4 1.1C1.15 1.38 1 1.8 1 2.36v17.28c0 .56.15.98.4 1.26l.07.06 9.7-9.68v-.23L1.47 1.05l-.07.05z" fill="currentColor" opacity=".7" />
      <path d="M14.4 14.53l-3.23-3.23v-.23l3.23-3.23.07.04 3.83 2.17c1.09.62 1.09 1.64 0 2.26l-3.83 2.18-.07.04z" fill="currentColor" />
      <path d="M14.47 14.49L11.17 11.19 1.4 20.96c.36.38.95.43 1.62.05l11.45-6.52z" fill="currentColor" opacity=".85" />
      <path d="M14.47 7.89L3.02 1.37C2.35.99 1.76 1.04 1.4 1.42l9.77 9.77 3.3-3.3z" fill="currentColor" opacity=".55" />
    </svg>
  );
}

export function StoreBadges({
  variant = "link",
  align = "center",
}: {
  variant?: "link" | "prova";
  align?: "center" | "left";
}) {
  const ios = LOJAS.appStore;
  const android = LOJAS.googlePlay;
  const pronto = (u: string) => u && !u.startsWith("[");

  // Selo passivo de prova (sem link) — usado perto do carrinho
  if (variant === "prova") {
    return (
      <div className={`store-prova ${align === "left" ? "is-left" : ""}`}>
        <AppleIcon />
        <span>Disponível para iPhone e Android</span>
        <PlayIcon />
      </div>
    );
  }

  return (
    <div className={`store-badges ${align === "left" ? "is-left" : ""}`}>
      {pronto(ios) ? (
        <a className="store-badge" href={ios} target="_blank" rel="noopener noreferrer">
          <AppleIcon />
          <span>
            <small>Baixe na</small>
            <strong>App Store</strong>
          </span>
        </a>
      ) : (
        <span className="store-badge is-off" aria-disabled="true">
          <AppleIcon />
          <span>
            <small>Em breve na</small>
            <strong>App Store</strong>
          </span>
        </span>
      )}

      {pronto(android) ? (
        <a className="store-badge" href={android} target="_blank" rel="noopener noreferrer">
          <PlayIcon />
          <span>
            <small>Disponível no</small>
            <strong>Google Play</strong>
          </span>
        </a>
      ) : (
        <span className="store-badge is-off" aria-disabled="true">
          <PlayIcon />
          <span>
            <small>Em breve no</small>
            <strong>Google Play</strong>
          </span>
        </span>
      )}
    </div>
  );
}
