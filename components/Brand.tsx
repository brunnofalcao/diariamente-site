/* =====================================================================
   MARCA · Brandbook 5.0
   ---------------------------------------------------------------------
   Símbolo: sete cápsulas em oito posições. A das 6h fica VAZIA — é a
   abertura, o dia em que a pessoa não veio. O vão está no passado, e a
   história continuou depois dele. É o desenho literal de "interromper
   não é abandonar".

   Construção normativa (seção 17):
     grade 100x100, centro (50,50)
     oito posições a 45°, a de 6h vazia
     cápsula do raio 22 ao 40 (comprimento 18), espessura 9, ponta redonda
     hoje às 12h, opacidade 100%, SEMPRE no topo
     gradação horária a partir de 1h30: 30 · 40 · 50 · 60 · 75 · 90 · 100%

   PROIBIDO: girar, pulsar em loop, usar como indicador de carregamento,
   fechar a abertura, acrescentar a oitava cápsula, aplicar sombra,
   contorno, brilho, gradiente ou 3D.

   O escrito é Literata Regular, caixa baixa, tracking -1%. Nunca em
   caixa alta (em versal a palavra soa a ordem) e nunca com destaque em
   "mente". Instrument Serif foi aposentada nesta versão.
   ===================================================================== */

const CAPSULAS: { d: string; o: number }[] = [
  { d: "M50 28 V10", o: 1 },                 // 12h · hoje
  { d: "M65.6 34.4 L78.3 21.7", o: 0.3 },    // 1h30
  { d: "M72 50 H90", o: 0.4 },               // 3h
  { d: "M65.6 65.6 L78.3 78.3", o: 0.5 },    // 4h30
  /* 6h — A ABERTURA. Não preencher. */
  { d: "M34.4 65.6 L21.7 78.3", o: 0.6 },    // 7h30
  { d: "M28 50 H10", o: 0.75 },              // 9h
  { d: "M34.4 34.4 L21.7 21.7", o: 0.9 },    // 10h30
];

/**
 * Simbolo — isotipo isolado. Perfis, favicon, marca d'água e qualquer
 * aplicação abaixo do tamanho mínimo do lockup. Mínimo 16px.
 *
 * `tom`:
 *   "teal"   sobre fundo escuro ou claro (padrão)
 *   "escuro" sobre teal — sobre teal as opacidades mínimas sobem para 45%
 *   "branco" mono, sobre fotografia escura
 */
export function Simbolo({
  size = 28,
  tom = "teal",
  title,
}: {
  size?: number;
  tom?: "teal" | "escuro" | "branco";
  title?: string;
}) {
  const cor = tom === "teal" ? "#27BDBE" : tom === "escuro" ? "#131918" : "#FFFFFF";
  const piso = tom === "escuro" ? 0.45 : 0; // regra do brandbook para fundo teal

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: "block", flex: "0 0 auto" }}
    >
      {title && <title>{title}</title>}
      <g fill="none" stroke={cor} strokeWidth="9" strokeLinecap="round">
        {CAPSULAS.map((c) => (
          <path key={c.d} d={c.d} opacity={Math.max(c.o, piso)} />
        ))}
      </g>
    </svg>
  );
}

/** Escrito isolado. Só em texto corrido institucional e assinatura de e-mail. */
export function Escrito({
  size = 22,
  tom = "branco",
}: {
  size?: number;
  tom?: "branco" | "escuro";
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
        fontSize: size,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color: tom === "branco" ? "#fff" : "#131918",
        textTransform: "lowercase",
      }}
    >
      diariamente
    </span>
  );
}

/**
 * Lockup horizontal — uso preferencial.
 * símbolo = 1,2x o corpo do texto · espaço = 0,3x a altura do símbolo.
 */
export function LockupHorizontal({
  altura = 26,
  tom = "escuro-fundo",
}: {
  /** altura do símbolo em px. Mínimo 24 no lockup horizontal. */
  altura?: number;
  /** "escuro-fundo" = sobre S0 · "claro-fundo" = sobre branco · "teal-fundo" = sobre P500 */
  tom?: "escuro-fundo" | "claro-fundo" | "teal-fundo";
}) {
  const simbolo = tom === "teal-fundo" ? "escuro" : "teal";
  const escrito = tom === "escuro-fundo" ? "branco" : "escuro";
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: altura * 0.3, lineHeight: 0 }}
    >
      <Simbolo size={altura} tom={simbolo} />
      <Escrito size={altura / 1.2} tom={escrito} />
    </span>
  );
}

/**
 * Lockup vertical — formatos quadrados e verticais.
 * símbolo = 2,5x o corpo do texto · espaço = 0,15x a altura do símbolo.
 */
export function LockupVertical({
  altura = 44,
  tom = "escuro-fundo",
}: {
  altura?: number;
  tom?: "escuro-fundo" | "claro-fundo" | "teal-fundo";
}) {
  const simbolo = tom === "teal-fundo" ? "escuro" : "teal";
  const escrito = tom === "escuro-fundo" ? "branco" : "escuro";
  return (
    <span
      style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center",
        gap: altura * 0.15, lineHeight: 0,
      }}
    >
      <Simbolo size={altura} tom={simbolo} />
      <Escrito size={altura / 2.5} tom={escrito} />
    </span>
  );
}

/* --- compatibilidade: nomes antigos seguem funcionando durante a migração --- */
export function Logomark({ size = 28 }: { size?: number }) {
  return <Simbolo size={size} />;
}
export function Wordmark({ size = 22 }: { size?: number }) {
  return <Escrito size={size} />;
}
export function OfficialLogo({ height = 26 }: { height?: number }) {
  return <LockupHorizontal altura={height} />;
}
export function FooterLogo({ height = 44 }: { height?: number }) {
  return <LockupVertical altura={height} />;
}

export function InstagramLink({ handle }: { handle: string }) {
  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        textDecoration: "none", color: "var(--p-500)", fontSize: 14, fontWeight: 600,
        marginTop: "var(--sp3)",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
      @{handle}
    </a>
  );
}

/**
 * ImageSlot — marcação visual de onde entra um asset real.
 * Para publicar a imagem real: passe `src` (e `alt`). Sem src, mostra o placeholder marcado.
 * shape: "wide" | "portrait" | "square" | "tall" | "" (default ~240px)
 */
/* ---------------------------------------------------------------------
   Cloudinary: formato e qualidade automáticos + largura sob medida.
   Sem isto, os PNG originais somam cerca de 29 MB na home — 7 MB por
   print. Com 90% do tráfego em celular, isso é o LCP e o plano de dados
   da pessoa. A rota /estudante já fazia certo; a home não.
   --------------------------------------------------------------------- */
function cld(url: string, t: string): string {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${t}/`) : url;
}

function setDeLarguras(url: string, larguras: number[]): string {
  return larguras.map((w) => `${cld(url, `f_auto,q_auto,w_${w}`)} ${w}w`).join(", ");
}

export function ImageSlot({
  tag,
  label,
  dims,
  shape = "",
  src,
  alt = "",
  bare = false,
  ratio = "1170 / 2532",
  sizes,
  style,
}: {
  tag: string;
  label: string;
  dims?: string;
  shape?: "wide" | "portrait" | "square" | "tall" | "";
  src?: string;
  alt?: string;
  bare?: boolean;
  /** Proporção reservada no modo bare (largura / altura). Evita salto de layout. */
  ratio?: string;
  /** Dica de largura para o browser escolher no srcset. */
  sizes?: string;
  style?: React.CSSProperties;
}) {
  if (src) {
    // bare = mockup já vem com fundo/glow próprios: exibe inteiro, sem moldura nem corte
    //
    // O wrapper existe por um motivo só: RESERVAR ESPAÇO antes de a imagem
    // carregar. Sem ele a img nasce com 0px de altura, e quando o arquivo chega
    // ela empurra tudo o que vem depois pra baixo. Numa página com 4 prints, isso
    // desloca a seção de oferta em alguns milhares de pixels e quebra qualquer
    // âncora que aponte pra baixo (#oferta, #faq).
    //
    // object-fit: contain garante que, se a proporção real do asset for diferente
    // de `ratio`, a imagem nunca distorce: no máximo sobra fundo escuro.
    if (bare) {
      return (
        <div style={{ width: "100%", aspectRatio: ratio, ...style }}>
          <img
            src={cld(src, "f_auto,q_auto,w_560")}
            srcSet={setDeLarguras(src, [320, 560, 840])}
            sizes={sizes ?? "(min-width: 900px) 420px, 88vw"}
            alt={alt}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
      );
    }
    return (
      <div className={`img-slot ${shape} has-img`} style={{ border: "1px solid var(--border)", ...style }}>
        <img
          className="img-real"
          src={cld(src, "f_auto,q_auto,w_840")}
          srcSet={setDeLarguras(src, [480, 840, 1200])}
          sizes={sizes ?? "(min-width: 900px) 640px, 92vw"}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
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
          <div className="badge badge-gold" style={{ fontSize: 11, padding: "5px 10px" }}>🔥 47 dias</div>
        </div>
        <div className="overline" style={{ marginTop: 24, fontSize: 11 }}>Provocação do dia · Dia 47</div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 23, lineHeight: 1.25, marginTop: 11, color: "var(--n-0)" }}>
          O que você está adiando que, no fundo, já sabe que precisa decidir?
        </p>
        <div style={{ marginTop: 24 }}>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "13%", borderRadius: 999, background: "linear-gradient(90deg,var(--p-400),var(--p-300))" }} />
          </div>
          <div className="caption" style={{ marginTop: 7 }}>47 de 365 · você não falhou nenhum dia</div>
        </div>
        <div style={{ marginTop: 18, background: "var(--p-500)", color: "var(--s-0)", borderRadius: 15, padding: "12px 0", textAlign: "center", fontWeight: 700, fontSize: 14 }}>
          Voltei hoje
        </div>
        <div style={{ marginTop: 9, textAlign: "center", fontSize: 12, color: "var(--n-400)" }}>
          Sua vez. O que você vai fazer com isso?
        </div>
      </div>
    </div>
  );
}
