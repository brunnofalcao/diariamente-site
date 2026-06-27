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

export function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--p-500)" }}>
      <Logomark size={26} />
      <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--n-0)", letterSpacing: "-0.01em" }}>
        Diariamente
      </span>
    </div>
  );
}

// Mockup do app — recriação fiel da tela HOJE em SVG/CSS (sem depender de print externo).
export function AppMockup() {
  return (
    <div
      aria-label="Tela HOJE do app Diariamente"
      style={{
        width: 248,
        margin: "0 auto",
        borderRadius: 38,
        border: "1px solid var(--border-strong)",
        background: "var(--s-1)",
        padding: 10,
        boxShadow: "0 30px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(39,189,190,.06)",
      }}
    >
      <div style={{ borderRadius: 30, background: "var(--s-0)", overflow: "hidden", padding: "18px 16px 16px" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--p-500)" }}>
          <Logomark size={20} />
          <div className="badge badge-gold" style={{ fontSize: 10, padding: "4px 9px" }}>🔥 7 dias</div>
        </div>
        {/* overline */}
        <div className="overline" style={{ marginTop: 22 }}>Provocação do dia · Dia 8</div>
        {/* provocação */}
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 21, lineHeight: 1.25, marginTop: 10, color: "var(--n-0)" }}>
          O que você está adiando que, no fundo, já sabe que precisa decidir?
        </p>
        {/* progresso */}
        <div style={{ marginTop: 22 }}>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "32%", borderRadius: 999, background: "linear-gradient(90deg, var(--p-400), var(--p-300))" }} />
          </div>
          <div className="caption" style={{ marginTop: 6 }}>8 de 363 · você não falhou nenhum dia</div>
        </div>
        {/* CTA */}
        <div style={{ marginTop: 16, background: "var(--p-500)", color: "var(--s-0)", borderRadius: 14, padding: "11px 0", textAlign: "center", fontWeight: 700, fontSize: 13 }}>
          Marcar como lido
        </div>
        <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "var(--n-400)" }}>
          Sua vez. O que você vai fazer com isso?
        </div>
      </div>
    </div>
  );
}
