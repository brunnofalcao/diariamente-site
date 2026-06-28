"use client";

// Logomark — livro aberto estilizado (brandbook 06). currentColor herda do contexto.
export function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 12v26" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M24 12C24 12 18 7 8 8v25c10-1 16 4 16 4" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 12C24 12 30 7 40 8v25c-10-1-16 4-16 4" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--p-500)" }}>
      <Logomark size={size + 4} />
      <span style={{ fontFamily: "var(--font-serif)", fontSize: size, color: "var(--n-0)", letterSpacing: "-0.01em" }}>
        Diariamente
      </span>
    </div>
  );
}

/**
 * ImageSlot — marcação visual de onde entra um asset real.
 * Para publicar a imagem real: passe `src` (e `alt`). Sem src, mostra o placeholder marcado.
 * shape: "wide" | "portrait" | "square" | "tall" | "" (default ~240px)
 */
export function ImageSlot({
  tag,
  label,
  dims,
  shape = "",
  src,
  alt = "",
  style,
}: {
  tag: string;
  label: string;
  dims?: string;
  shape?: "wide" | "portrait" | "square" | "tall" | "";
  src?: string;
  alt?: string;
  style?: React.CSSProperties;
}) {
  if (src) {
    return (
      <div className={`img-slot ${shape}`} style={{ border: "1px solid var(--border)", ...style }}>
        <img className="img-real" src={src} alt={alt} loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`img-slot ${shape}`} style={style}>
      <div className="slot-inner">
        <span className="slot-tag">{tag}</span>
        <div className="slot-label">{label}</div>
        {dims && <div className="slot-dims">{dims}</div>}
      </div>
    </div>
  );
}

// Mockup do app (réplica da tela HOJE em CSS). scale ajusta pro hero desktop.
export function AppMockup({ width = 264 }: { width?: number }) {
  return (
    <div
      aria-label="Tela HOJE do app Diariamente"
      style={{
        width, margin: "0 auto", borderRadius: 42,
        border: "1px solid var(--border-strong)", background: "var(--s-1)", padding: 11,
        boxShadow: "0 40px 100px rgba(0,0,0,.55), 0 0 0 1px rgba(39,189,190,.06)",
      }}
    >
      <div style={{ borderRadius: 32, background: "var(--s-0)", overflow: "hidden", padding: "20px 18px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--p-500)" }}>
          <Logomark size={22} />
          <div className="badge badge-gold" style={{ fontSize: 11, padding: "5px 10px" }}>🔥 7 dias</div>
        </div>
        <div className="overline" style={{ marginTop: 24, fontSize: 11 }}>Provocação do dia · Dia 8</div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 23, lineHeight: 1.25, marginTop: 11, color: "var(--n-0)" }}>
          O que você está adiando que, no fundo, já sabe que precisa decidir?
        </p>
        <div style={{ marginTop: 24 }}>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "32%", borderRadius: 999, background: "linear-gradient(90deg,var(--p-400),var(--p-300))" }} />
          </div>
          <div className="caption" style={{ marginTop: 7 }}>8 de 363 · você não falhou nenhum dia</div>
        </div>
        <div style={{ marginTop: 18, background: "var(--p-500)", color: "var(--s-0)", borderRadius: 15, padding: "12px 0", textAlign: "center", fontWeight: 700, fontSize: 14 }}>
          Marcar como lido
        </div>
        <div style={{ marginTop: 9, textAlign: "center", fontSize: 12, color: "var(--n-400)" }}>
          Sua vez. O que você vai fazer com isso?
        </div>
      </div>
    </div>
  );
}
