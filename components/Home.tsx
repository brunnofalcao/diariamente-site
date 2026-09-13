"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, TEASER, ATIVOS, cld, type Lang, type Dict } from "@/lib/i18n";
import { caminho } from "@/lib/rotas";

/* ─────────────────────────────────────────────────────────────
   Home · Diariamente (redesign v3, padrão internacional PT/ES)
   Tokens Brandbook 5.0. Estilos inline + um bloco de media
   queries (nada depende de globals.css).
   ───────────────────────────────────────────────────────────── */

const C = {
  s0: "#0A0E0E", s1: "#111616", s2: "#181D1D",
  line: "rgba(255,255,255,.07)",
  text: "#fff", n300: "#AAB2B2", n400: "#8A9494", n200: "#CDD2D2",
  p500: "#27BDBE", p400: "#3DCBCC", p300: "#5DD8D8", onAccent: "#131918",
  absence: "#106667", ret: "#F5B731",
  serif: "'Literata',Georgia,serif",
};

const CSS = `
:root{color-scheme:dark}
#dm-root a{color:${C.p500}}#dm-root a:hover{color:${C.p400}}
#dm-root :where(a,button,summary):focus-visible{outline:2px solid ${C.p300};outline-offset:2px}
#dm-root summary{list-style:none}#dm-root summary::-webkit-details-marker{display:none}
@keyframes dm-caret{0%,50%{opacity:1}50.01%,100%{opacity:0}}
@keyframes dm-glow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:.95;transform:scale(1.07)}}
@media (prefers-reduced-motion:reduce){#dm-root *{transition:none!important;animation:none!important}}
[data-desk]{display:none}[data-menu]{display:none}[data-menu] a{white-space:nowrap}
[data-navrow]{justify-content:center}
[data-navright]{position:absolute;right:clamp(16px,3vw,24px);top:50%;transform:translateY(-50%)}
@media (min-width:1040px){[data-menu]{display:flex}}
@media (min-width:900px){[data-desk]{display:flex}[data-sticky]{display:none}[data-navrow]{justify-content:space-between}[data-navright]{position:static;transform:none}}
[data-hero]{display:grid;gap:40px;grid-template-columns:minmax(0,1fr);text-align:center}
[data-hero] [data-ctas]{justify-content:center}
[data-hero] [data-lead],[data-hero] [data-h1]{margin-left:auto;margin-right:auto}
/* O card subia 48px e cobria a linha de prova logo acima ("+5.000 pessoas
   ja comecaram - Garantia de 7 dias"). A sobreposicao era proposital para
   dar profundidade, mas comia texto. Agora encosta sem cobrir. */
[data-hscard]{margin:0 auto;position:relative;z-index:2;width:100%;max-width:430px}
[data-hero]{gap:28px}
@media (min-width:900px){[data-hero]{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:center;text-align:left}[data-hero] [data-ctas]{justify-content:flex-start}[data-hero] [data-lead],[data-hero] [data-h1]{margin-left:0}[data-hero] [data-badges]{justify-content:flex-start}[data-phone]{width:300px;margin:0 0 0 auto}[data-hscard]{margin:0;max-width:430px}}
[data-trust]{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}

@media (min-width:1040px){[data-trust]{gap:10px}}
[data-ctas]{display:flex;flex-direction:column;align-items:stretch;gap:12px}
@media (min-width:560px){[data-ctas]{flex-direction:row;align-items:center;gap:14px}}
[data-strip]{display:grid;gap:16px;grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:900px){[data-strip]{grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}}
[data-split]{display:grid;gap:32px;grid-template-columns:minmax(0,1fr)}
@media (min-width:900px){[data-split]{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:72px;align-items:center}}
[data-steps]{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
@media (min-width:768px){[data-steps]{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}}
[data-tour]{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 20px 12px;margin:0 -20px;scrollbar-width:none}
[data-tour]::-webkit-scrollbar{display:none}
[data-tour]>*{flex:0 0 min(70vw,260px);scroll-snap-align:center}
@media (min-width:900px){[data-tour]{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;overflow:visible;padding:0;margin:0}[data-tour]>*{flex:none}}
[data-cols2]{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
@media (min-width:768px){[data-cols2]{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}
[data-price]{display:grid;gap:24px;grid-template-areas:"card" "value";grid-template-columns:minmax(0,1fr)}
[data-price]>[data-area=card]{grid-area:card;min-width:0}
[data-price]>[data-area=value]{grid-area:value;min-width:0}
@media (min-width:1000px){[data-price]{grid-template-areas:"value card";grid-template-columns:minmax(0,1fr) 440px;gap:56px;align-items:start}[data-price]>[data-area=card]{position:sticky;top:88px}}
[data-rpgrid]{display:grid;gap:28px}
@media (min-width:560px){[data-rpgrid]{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:940px){[data-rpgrid]{grid-template-columns:2fr 1fr 1fr 1fr;gap:24px}}
[data-faq] details[open]{border-color:rgba(39,189,190,.26)}
[data-faq] details[open] [data-chev]{transform:rotate(180deg)}
`;

const wrap: React.CSSProperties = { maxWidth: 1160, margin: "0 auto", padding: "0 clamp(20px,3vw,24px)" };
const sec: React.CSSProperties = { padding: "clamp(56px,8vw,104px) 0", borderTop: `1px solid ${C.line}` };
const eyebrow: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.p500, marginBottom: 14 };
const h2: React.CSSProperties = { fontFamily: C.serif, fontWeight: 400, fontSize: "clamp(28px,3.6vw,42px)", lineHeight: 1.12, letterSpacing: "-.012em", color: C.text, margin: 0, textWrap: "balance" as never };
const card: React.CSSProperties = { background: C.s1, border: `1px solid ${C.line}`, borderRadius: 16, padding: "clamp(20px,2.5vw,28px)", minWidth: 0 };
const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", height: 54, padding: "0 30px", borderRadius: 999, border: "none", background: C.p500, color: C.onAccent, fontSize: 16, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit", transition: "background .3s" };
const btnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 54, padding: "0 20px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,.16)", color: C.text, fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" };
const numChip: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, padding: "0 10px", borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", fontFamily: C.serif, fontSize: 15, color: C.p500 };
const iconCircle: React.CSSProperties = { flex: "0 0 40px", width: 40, height: 40, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.22)", color: C.p500 };
const rule: React.CSSProperties = { width: 1, height: 14, background: "rgba(255,255,255,.14)" };

function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: "block", flex: "0 0 auto" }}>
      <g fill="none" stroke={C.p500} strokeWidth={9} strokeLinecap="round">
        <path d="M50 28 V10" /><path d="M65.6 34.4 L78.3 21.7" opacity=".3" /><path d="M72 50 H90" opacity=".4" />
        <path d="M65.6 65.6 L78.3 78.3" opacity=".5" /><path d="M34.4 65.6 L21.7 78.3" opacity=".6" />
        <path d="M28 50 H10" opacity=".75" /><path d="M34.4 34.4 L21.7 21.7" opacity=".9" />
      </g>
    </svg>
  );
}

function Lockup({ size = 28, font = 23.3 }: { size?: number; font?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3, lineHeight: 0 }}>
      <Mark size={size} />
      <span style={{ fontFamily: C.serif, fontSize: font, letterSpacing: "-0.01em", lineHeight: 1, color: C.text }}>diariamente</span>
    </span>
  );
}

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.p500} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: 3 }}><path d="M20 6L9 17l-5-5" /></svg>
);
const Dash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7777" strokeWidth={2} strokeLinecap="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: 3 }}><path d="M6 12h12" /></svg>
);
const Shield = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l8 3.5v5.8c0 5-3.4 9.3-8 10.7-4.6-1.4-8-5.7-8-10.7V5.5L12 2z" /><path d="M9 12l2 2 4-4" /></svg>
);

function Img({ src, alt, widths, sizes, priority }: { src: string; alt: string; widths: number[]; sizes: string; priority?: boolean }) {
  return (
    <img
      src={cld(src, `f_auto,q_auto,w_${widths[1] ?? widths[0]}`)}
      srcSet={widths.map((w) => `${cld(src, `f_auto,q_auto,w_${w}`)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      // eslint-disable-next-line @next/next/no-img-element
      decoding="async"
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
    />
  );
}

/**
 * Home — corpo compartilhado pelas duas rotas.
 *
 * O idioma NAO e mais estado de cliente: vem por prop, decidido pela
 * ROTA. `/` renderiza pt, `/es` renderiza es. Isso e o que permite ter
 * dois sites de verdade: cada um com suas imagens, seus links de loja e
 * seu checkout, trocaveis de forma independente (ver ATIVOS no i18n).
 *
 * Tambem e o que torna o conteudo indexavel nos dois idiomas. Com o
 * seletor em useState, o Google via apenas portugues: a versao espanhola
 * so existia depois de um clique, e clique nenhum robo da.
 */
export function Home({ lang }: { lang: Lang }) {
  // Grava a escolha explicita. O middleware so decide por Accept-Language
  // quando este cookie NAO existe: escolha do usuario sempre vence deteccao.
  // O <html lang> vive no layout raiz, que e servidor e nao conhece a
  // rota. Sincronizamos aqui: leitor de tela e buscador precisam do
  // idioma certo no elemento raiz, nao so num div interno.
  useEffect(() => {
    document.documentElement.lang = lang === "es" ? "es" : "pt-BR";
  }, [lang]);

  const fixarIdioma = (l: Lang) => () => {
    document.cookie = `dm_lang=${l};path=/;max-age=31536000;samesite=lax`;
  };

  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [sticky, setSticky] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = I18N[lang] as unknown as Dict;
  // Imagens e links do idioma corrente. Trocar a foto ou a loja do site
  // espanhol nao encosta no portugues.
  const IMG = ATIVOS[lang].img;
  const LINKS = ATIVOS[lang].links;

  const now = new Date();
  const dia = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);

  // ------------------------------------------------------------------
  // TEXTO DO DIA — fonte da verdade
  // ------------------------------------------------------------------
  // Antes: o hero exibia TEASER[lang][(dia-1) % 7], um array de sete
  // frases de marketing rotativas, AO LADO da data real e do "Dia N de
  // 365". Resultado: em 13/09 a pagina mostrava "Dia 256 de 365" com um
  // texto que nao era o do dia 256. A rota /api/provocacao-do-dia existia
  // e ninguem a chamava; o HeroProvocacao.tsx, que chamava, estava orfao.
  //
  // Agora o texto vem da API (Supabase). O teaser continua como ponte
  // visual ate a resposta chegar, mas a data e a numeracao SO aparecem
  // quando `ehDoDia` for verdadeiro. Melhor mostrar menos do que mostrar
  // errado com cara de certo.
  const [prov, setProv] = useState<{ texto: string; dia: number; ehDoDia: boolean } | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/provocacao-do-dia", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        if (d?.ehDoDia && d?.texto) {
          setProv({ texto: String(d.texto), dia: Number(d.dia) || dia, ehDoDia: true });
        } else {
          // Falha silenciosa nunca mais: o motivo vai para o console.
          console.warn("[diariamente] texto do dia indisponivel:", d?.motivo ?? "sem motivo");
          setProv({ texto: TEASER[lang][(dia - 1) % TEASER[lang].length], dia, ehDoDia: false });
        }
      })
      .catch((e) => {
        if (!vivo) return;
        console.warn("[diariamente] falha ao buscar o texto do dia:", e);
        setProv({ texto: TEASER[lang][(dia - 1) % TEASER[lang].length], dia, ehDoDia: false });
      });
    return () => { vivo = false; };
  }, [lang, dia]);

  const texto = prov?.texto ?? TEASER[lang][(dia - 1) % TEASER[lang].length];
  const ehDoDia = prov?.ehDoDia ?? false;
  const mes = new Intl.DateTimeFormat(t.locale, { month: "long" }).format(now);
  const semana = new Intl.DateTimeFormat(t.locale, { weekday: "long" }).format(now).replace("-feira", "");
  const dataExtenso = lang === "es" ? `${now.getDate()} de ${mes}` : `${now.getDate()} ${mes}`;

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setTyped(""); setDone(false);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setTyped(texto); setDone(true); return; }
    let i = 0;
    const tick = () => {
      i++; setTyped(texto.slice(0, i));
      if (i < texto.length) timer.current = setTimeout(tick, 28 + (/[,.?]/.test(texto[i - 1]) ? 220 : Math.random() * 26));
      else setDone(true);
    };
    timer.current = setTimeout(tick, 650);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [texto]);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector("[data-herocta]");
      const of = document.getElementById("preco");
      const fora = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      let vis = false;
      if (of) { const r = of.getBoundingClientRect(); vis = r.top < window.innerHeight * 0.8 && r.bottom > 120; }
      setSticky(fora && !vis);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const share = async () => {
    const txt = `\u201C${texto}\u201D \u2014 Diariamente.`;
    const url = "https://diariamente.app/?utm_source=share&utm_medium=organic&utm_campaign=provocacao_do_dia";
    try {
      if (navigator.share) await navigator.share({ title: "Diariamente", text: txt, url });
      else { await navigator.clipboard.writeText(`${txt} ${url}`); setCopiado(true); setTimeout(() => setCopiado(false), 2200); }
    } catch { /* cancelado */ }
  };

  const goToOffer = () => {
    const el = document.getElementById("preco");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
  };

  const langBtn = (on: boolean): React.CSSProperties => ({
    height: 26, padding: "0 10px", borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 12,
    fontWeight: 700, cursor: "pointer", letterSpacing: ".04em", transition: "background .2s",
    background: on ? C.p500 : "transparent", color: on ? C.onAccent : C.n300,
  });

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <div id="dm-root" lang={lang} style={{ background: C.s0, color: C.text, fontFamily: "Inter,system-ui,-apple-system,sans-serif", fontSize: 16, lineHeight: 1.6, overflowX: "clip" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* NAV */}
      <nav aria-label="Principal" style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,14,14,.84)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}` }}>
        <div data-navrow="1" style={{ ...wrap, height: 64, display: "flex", alignItems: "center", gap: 24, position: "relative" }}>
          <a href="#" aria-label="Diariamente" style={{ textDecoration: "none", flex: "0 0 auto" }}><Lockup /></a>
          <div data-menu="1" style={{ alignItems: "center", gap: 22, fontSize: 14, fontWeight: 500 }}>
            {[["#como-funciona", t.navHow], ["#app", t.navApp], ["#ciencia", t.navScience], ["#preco", t.navPrice], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} style={{ color: C.n300, textDecoration: "none" }}>{label}</a>
            ))}
          </div>
          <div data-navright="1" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Links de verdade, com href. Robo segue, usuario pode abrir em
                nova aba, e o navegador registra a escolha num cookie de um ano
                para o middleware nao redirecionar de novo na proxima visita. */}
            <div role="group" aria-label="Idioma / Idioma" style={{ display: "inline-flex", alignItems: "center", height: 32, padding: 2, borderRadius: 999, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)" }}>
              <a href={caminho("home", "pt")} hrefLang="pt-BR" onClick={fixarIdioma("pt")} aria-current={lang === "pt" ? "page" : undefined} style={{ ...langBtn(lang === "pt"), textDecoration: "none" }}>PT</a>
              <a href={caminho("home", "es")} hrefLang="es" onClick={fixarIdioma("es")} aria-current={lang === "es" ? "page" : undefined} style={{ ...langBtn(lang === "es"), textDecoration: "none" }}>ES</a>
            </div>
            <a href="#preco" data-desk="1" style={{ alignItems: "center", justifyContent: "center", height: 40, padding: "0 18px", borderRadius: 999, background: C.p500, color: C.onAccent, fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>{t.cta}</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "clamp(40px,6vw,72px) 0 clamp(40px,5vw,64px)" }}>
        <div style={wrap}>
          <div data-hero="1">
            <div style={{ minWidth: 0 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 30, padding: "4px 14px 4px 6px", borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", color: C.p300, fontSize: 12.5, fontWeight: 600, lineHeight: 1.35, textAlign: "left" }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999, background: C.p500, color: C.onAccent, fontSize: 11, fontWeight: 700, letterSpacing: ".04em" }}>{t.new}</span>
                {t.badge}
              </span>
              <h1 data-h1="1" style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "clamp(36px,5.2vw,62px)", lineHeight: 1.04, letterSpacing: "-.018em", marginTop: 22, maxWidth: "15ch", textWrap: "balance" as never }}>{t.h1}</h1>
              <p data-lead="1" style={{ fontSize: "clamp(17px,1.5vw,19px)", lineHeight: 1.6, color: C.n300, maxWidth: "50ch", marginTop: 20, textWrap: "pretty" as never }}>{t.lead}</p>
              <div data-ctas="1" style={{ marginTop: 32 }}>
                <a href="#preco" data-herocta="1" style={btnPrimary}>{t.cta}</a>
                <a href="#como-funciona" style={btnGhost}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>{t.cta2}
                </a>
              </div>
              <div data-badges="1" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px 18px", marginTop: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMG.appStore} alt="App Store" width={108} height={36} style={{ display: "block", height: 36, width: "auto", opacity: .92 }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMG.googlePlay} alt="Google Play" width={130} height={43} style={{ display: "block", height: 43, width: "auto", margin: "-3px 0 -3px -6px", opacity: .92 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.n400 }}>{t.proof}</span>
              </div>
            </div>

            <div data-visual="1" style={{ minWidth: 0, position: "relative" }}>
              <div data-hscard="1" style={{ background: C.s2, border: `1px solid ${C.line}`, borderRadius: 28, padding: 24, boxShadow: "0 30px 80px -30px rgba(0,0,0,.75),0 0 0 1px rgba(39,189,190,.05)", textAlign: "left" }}>
                <div aria-hidden="true" style={{ position: "absolute", inset: "2% 4%", zIndex: 0, background: "radial-gradient(ellipse 60% 55% at 50% 45%,rgba(39,189,190,.28),transparent 72%),radial-gradient(ellipse 80% 70% at 50% 60%,rgba(39,189,190,.10),transparent 75%)", filter: "blur(48px)", opacity: .85, pointerEvents: "none", animation: "dm-glow 6s cubic-bezier(.4,0,.2,1) infinite" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <Lockup size={20} font={16.7} />
                    <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: C.ret, background: "rgba(245,183,49,.10)", border: "1px solid rgba(245,183,49,.30)", borderRadius: 999, padding: "4px 11px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4-2 5-2 8a4 4 0 008 0c0-1-1-2-1-3 2 1 3 3 3 6a8 8 0 11-16 0c0-5 5-7 8-11z" /></svg>{prov?.dia ?? dia}
                    </span>
                  </div>
                  {/* Data so aparece quando o texto e comprovadamente o do dia. */}
                  {ehDoDia && (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                      <span style={{ fontFamily: C.serif, fontSize: 28, lineHeight: 1.1, letterSpacing: "-.01em", textTransform: "lowercase", whiteSpace: "nowrap" }}>{dataExtenso}</span>
                      <span style={{ fontSize: 13, color: C.n400, fontWeight: 500, textTransform: "capitalize", whiteSpace: "nowrap" }}>{semana}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", color: C.p500, whiteSpace: "nowrap" }}>{t.cardEyebrow}</span>
                    {ehDoDia && <span style={{ fontSize: 12, color: C.n400, fontWeight: 500, whiteSpace: "nowrap" }}>{t.dayOf.replace("{n}", String(prov?.dia ?? dia))}</span>}
                  </div>
                  <div role="img" aria-label={texto} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 16, padding: 20, minHeight: 150 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: C.p500, flex: "0 0 18px", marginTop: 6, opacity: .8 }}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    <span style={{ fontFamily: C.serif, fontSize: 22, lineHeight: 1.42, letterSpacing: "-.01em" }}>
                      {typed}
                      <span aria-hidden="true" style={{ display: "inline-block", width: 2, height: "1.02em", marginLeft: 3, background: C.p500, verticalAlign: -2, transform: "translateY(4px)", animation: done ? "dm-caret 1.1s steps(1) infinite" : undefined }} />
                    </span>
                  </div>
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 13, color: C.n400, fontStyle: "italic" }}>{t.cardSub}</span>
                    <div>
                      <button type="button" onClick={share} style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 12, padding: "9px 16px", borderRadius: 999, background: "rgba(39,189,190,.08)", border: "1px solid rgba(39,189,190,.30)", color: C.p400, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
                        {copiado ? t.copied : t.share}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROVA */}
      <section style={{ padding: "0 0 clamp(48px,6vw,72px)" }}>
        <div style={wrap}>
          <div data-strip="1" style={{ padding: "clamp(20px,3vw,28px) 0", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
            {[["+5.000", t.s1], ["365", t.s2], ["3 min", t.s3], [t.s4n, t.s4]].map(([n, l]) => (
              <div key={l} style={{ minWidth: 0 }}>
                <div style={{ fontFamily: C.serif, fontSize: "clamp(26px,3vw,34px)", lineHeight: 1 }}>{n}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: C.n400 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* FAIXA DE CONFIANÇA
              Antes: quatro blocos em CAIXA ALTA, mesmo peso, quebrando em
              duas linhas no celular. Caixa alta em quatro células vira
              ruído: o olho não sabe onde pousar e nada é lido.

              Agora: ícone + rótulo em caixa mista, um por selo, em pílulas
              com hairline. Mesma informação, lida em um passe. A caixa alta
              some porque o brandbook (§21) reserva versal para overline
              curto, não para bloco de texto. */}
          <div data-trust="1" style={{ marginTop: 22 }}>
            {[
              { ic: "selo", txt: t.tr1 },
              { ic: "cadeado", txt: t.tr2 },
              { ic: "celular", txt: "iPhone · Android" },
              { ic: "escudo", txt: t.tr4 },
            ].map(({ ic, txt }) => (
              <span
                key={txt}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 15px", borderRadius: 999,
                  border: `1px solid ${C.line}`, background: "rgba(255,255,255,.02)",
                  fontSize: 13, fontWeight: 500, color: C.n300, whiteSpace: "nowrap",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.p500} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto" }}>
                  {ic === "selo" && <><circle cx="12" cy="9" r="6" /><path d="M8.5 14.5L7 22l5-2.6L17 22l-1.5-7.5" /></>}
                  {ic === "cadeado" && <><rect x="4" y="10.5" width="16" height="10.5" rx="2.5" /><path d="M8 10.5V7a4 4 0 018 0v3.5" /></>}
                  {ic === "celular" && <><rect x="6.5" y="2.5" width="11" height="19" rx="3" /><path d="M11 18.5h2" /></>}
                  {ic === "escudo" && <><path d="M12 2.5l7.5 3.2v5.4c0 4.7-3.2 8.7-7.5 10-4.3-1.3-7.5-5.3-7.5-10V5.7L12 2.5z" /><path d="M9.3 12l2 2 3.6-3.7" /></>}
                </svg>
                {txt}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA + VIRADA */}
      <section style={sec}>
        <div style={wrap}>
          <div data-split="1">
            <div style={{ minWidth: 0 }}>
              <span style={eyebrow}>{t.pEyebrow}</span>
              <h2 style={{ ...h2, marginBottom: 20 }}>{t.pH2}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: C.serif, fontSize: "clamp(18px,1.7vw,20px)", lineHeight: 1.6, color: C.n200, maxWidth: "58ch" }}>
                <p style={{ margin: 0 }}>{t.p1}</p><p style={{ margin: 0 }}>{t.p2}</p><p style={{ margin: 0, color: C.text }}>{t.p3}</p>
              </div>
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.line}` }}>
                <span style={{ ...eyebrow, color: C.n400, marginBottom: 10 }}>{t.vEyebrow}</span>
                <p style={{ margin: 0, fontFamily: C.serif, fontSize: "clamp(20px,2.2vw,24px)", lineHeight: 1.35, maxWidth: "34ch", textWrap: "pretty" as never }}>{t.vText}</p>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}`, aspectRatio: "4/5", background: C.s1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(IMG.lifestyle, "f_auto,q_auto,w_900")} srcSet={[600, 900, 1200].map((w) => `${cld(IMG.lifestyle, `f_auto,q_auto,w_${w}`)} ${w}w`).join(", ")} sizes="(min-width:900px) 520px, 92vw" alt={t.photoAlt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ ...sec, scrollMarginTop: 64 }}>
        <div style={wrap}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto clamp(32px,4vw,48px)" }}>
            <span style={eyebrow}>{t.navHow}</span>
            <h2 style={h2}>{t.hH2}</h2>
            <p style={{ margin: "14px auto 0", fontSize: 16, color: C.n400, maxWidth: "46ch" }}>{t.hSub}</p>
          </div>
          <div data-steps="1">
            {t.steps.map(([title, desc], i) => (
              <div key={title} style={card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={numChip}>{i + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.n400 }}>~1 min</span>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 20, lineHeight: 1.2, letterSpacing: "-.02em", margin: "18px 0 8px" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.n400 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ ...card, background: C.s2, marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px 40px" }}>
            <div style={{ minWidth: 0, flex: "1 1 260px" }}>
              <span style={{ ...eyebrow, marginBottom: 10 }}>{t.cEyebrow}</span>
              <div style={{ fontFamily: C.serif, fontSize: "clamp(28px,3vw,36px)", lineHeight: 1.1, letterSpacing: "-.01em" }}>{t.cNum}</div>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: C.n400 }}>{t.cMeta}</div>
              <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.6, color: C.n300, maxWidth: "44ch" }}>{t.cP}</p>
            </div>
            <div style={{ minWidth: 0, flex: "1 1 320px" }}>
              <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {[.3, .36, .42, .48, .54, .6, .66, .72].map((o, i) => <i key={i} style={{ display: "block", width: 14, height: 6, borderRadius: 999, background: C.p500, opacity: o }} />)}
                <i style={{ display: "block", width: 14, height: 6, borderRadius: 999, background: C.absence }} />
                <i style={{ display: "block", width: 14, height: 6, borderRadius: 999, background: C.ret }} />
                <i style={{ display: "block", width: 14, height: 6, borderRadius: 999, background: C.p500, opacity: .86 }} />
                <i style={{ display: "block", width: 14, height: 6, borderRadius: 999, background: C.p500, opacity: .93 }} />
                <i style={{ display: "block", width: 28, height: 6, borderRadius: 999, background: C.p500 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 14, fontSize: 13, fontWeight: 500, color: C.n400 }}>
                {[[C.absence, t.cL1, 12], [C.ret, t.cL2, 12], [C.p500, t.cL3, 20]].map(([bg, label, w]) => (
                  <span key={String(label)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i aria-hidden="true" style={{ display: "block", width: w as number, height: 5, borderRadius: 999, background: bg as string }} />{label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O APP */}
      <section id="app" style={{ ...sec, scrollMarginTop: 64 }}>
        <div style={wrap}>
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto clamp(32px,4vw,48px)" }}>
            <span style={eyebrow}>{t.aEyebrow}</span>
            <h2 style={h2}>{t.aH2}</h2>
          </div>
          <div data-tour="1">
            {[[IMG.hoje, t.t1t, t.t1d], [IMG.dias, t.t2t, t.t2d], [IMG.acoes, t.t3t, t.t3d], [IMG.ritmo, t.t4t, t.t4d]].map(([src, title, desc]) => (
              <figure key={title} style={{ margin: 0, minWidth: 0 }}>
                <div style={{ width: "100%", aspectRatio: "1170/2532" }}>
                  <Img src={src} alt={title} widths={[360, 560, 800]} sizes="(min-width:900px) 250px, 70vw" />
                </div>
                <figcaption style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.3, letterSpacing: "-.01em" }}>{title}</div>
                  <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.55, color: C.n400 }}>{desc}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div data-split="1" style={{ marginTop: "clamp(40px,5vw,64px)", paddingTop: "clamp(32px,4vw,48px)", borderTop: `1px solid ${C.line}`, alignItems: "start" }}>
            <h3 style={{ ...h2, fontSize: "clamp(26px,3.4vw,38px)", minWidth: 0 }}>{t.oneH}</h3>
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 14, fontSize: 16, lineHeight: 1.6, color: C.n300 }}>
              <p style={{ margin: 0 }}>{t.oneP1}</p>
              <p style={{ margin: 0 }}>{t.oneP2} <strong style={{ color: C.text, fontWeight: 600 }}>{t.oneStrong}</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* BASE CIENTÍFICA */}
      <section id="ciencia" style={{ ...sec, scrollMarginTop: 64 }}>
        <div style={wrap}>
          <div data-split="1" style={{ alignItems: "start", marginBottom: "clamp(28px,4vw,40px)" }}>
            <div style={{ minWidth: 0 }}><span style={eyebrow}>{t.navScience}</span><h2 style={h2}>{t.scH2}</h2></div>
            <div style={{ minWidth: 0, fontSize: 16, lineHeight: 1.65, color: C.n300, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0 }}>{t.scP1}</p><p style={{ margin: 0, fontSize: 14, color: C.n400 }}>{t.scP2}</p>
            </div>
          </div>
          <div data-steps="1">
            {t.refs.map(([lvl, claim, ref]) => (
              <div key={claim} style={{ ...card, padding: 20 }}>
                <span style={{ display: "inline-flex", height: 22, alignItems: "center", padding: "0 9px", borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", color: C.p300, fontSize: 11, fontWeight: 700, letterSpacing: ".06em" }}>{lvl}</span>
                <p style={{ margin: "12px 0 6px", fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>{claim}</p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: C.n400 }}>{ref}</p>
              </div>
            ))}
          </div>
          <div style={{ ...card, background: C.s2, marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px 24px", padding: "18px clamp(20px,2.5vw,28px)" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.spT}</div>
              <div style={{ fontSize: 14, color: C.n400, lineHeight: 1.5 }}>{t.spD}</div>
            </div>
            <a href={caminho("sobre", lang)} style={{ fontSize: 14, fontWeight: 600, color: C.p500, textDecoration: "none", whiteSpace: "nowrap" }}>{t.spLink}</a>
          </div>
        </div>
      </section>

      {/* CRENÇA */}
      <section style={sec}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 clamp(20px,3vw,24px)", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}><Mark size={34} /></div>
          <p style={{ margin: 0, fontFamily: C.serif, fontSize: "clamp(26px,3.6vw,42px)", lineHeight: 1.2, letterSpacing: "-.012em", textWrap: "balance" as never }}>{t.belief}</p>
          <p style={{ margin: "22px auto 0", fontSize: 16, lineHeight: 1.6, color: C.n400, maxWidth: "54ch" }}>{t.beliefP}</p>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section style={{ padding: "0 0 clamp(56px,8vw,104px)" }}>
        <div style={wrap}>
          <div data-cols2="1">
            <div style={card}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 28, padding: "0 12px", borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", color: C.p300, fontSize: 12, fontWeight: 600 }}>{t.yesL}</span>
              <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {t.yes.map((y) => <li key={y} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 16, lineHeight: 1.5 }}><Check />{y}</li>)}
              </ul>
            </div>
            <div style={card}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 28, padding: "0 12px", borderRadius: 999, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", color: C.n300, fontSize: 12, fontWeight: 600 }}>{t.noL}</span>
              <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {t.no.map((n) => <li key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 16, lineHeight: 1.5, color: C.n300 }}><Dash />{n}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section id="preco" style={{ ...sec, scrollMarginTop: 64 }}>
        <div style={wrap}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto clamp(32px,4vw,48px)" }}>
            <span style={eyebrow}>{t.prEyebrow}</span>
            <h2 style={h2}>{t.prH2}</h2>
            <p style={{ margin: "14px auto 0", fontSize: 16, color: C.n400, maxWidth: "46ch" }}>{t.prSub}</p>
          </div>
          <div data-price="1">
            <div data-area="card">
              <div style={{ background: C.s2, border: "1px solid rgba(39,189,190,.32)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px clamp(20px,3vw,28px)", background: "rgba(39,189,190,.08)", borderBottom: "1px solid rgba(39,189,190,.2)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: C.p500 }}>{t.prCond}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 999, background: "rgba(245,183,49,.12)", border: "1px solid rgba(245,183,49,.3)", color: C.ret, fontSize: 12, fontWeight: 700 }}>30% OFF</span>
                </div>
                <div style={{ padding: "clamp(20px,3vw,28px)" }}>
                  <h3 style={{ fontFamily: C.serif, fontWeight: 400, fontSize: 26, lineHeight: 1.1, letterSpacing: "-.01em", margin: 0 }}>{t.prName}</h3>
                  <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, color: C.n400 }}><s>R$ 197</s></span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.p500 }}>{t.prSave}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                    <span style={{ fontFamily: C.serif, fontSize: "clamp(48px,5vw,56px)", lineHeight: 1, letterSpacing: "-.02em" }}>R$ 137</span>
                    <span style={{ fontFamily: C.serif, fontSize: 26, lineHeight: 1 }}>,90</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, color: C.n300 }}>{t.prTerms}</div>
                  <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", borderRadius: 999, background: C.s0, border: "1px solid rgba(255,255,255,.1)", fontSize: 13, fontWeight: 600 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.p500} strokeWidth={2.2} strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 1.9" /></svg>{t.prDay}
                  </div>
                  <a href={LINKS.checkout} target="_blank" rel="noopener noreferrer" style={{ ...btnPrimary, marginTop: 22, width: "100%" }}>{t.cta}</a>
                  <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, lineHeight: 1.45, color: C.n400 }}>{t.prNote}</p>
                  <ul style={{ listStyle: "none", margin: "18px 0 0", padding: "18px 0 0", borderTop: `1px solid ${C.line}`, display: "grid", gap: 10, fontSize: 14, color: C.n200 }}>
                    {[t.prT1, t.prT2, t.prT3].map((x) => (
                      <li key={x} style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ color: C.p500, display: "inline-flex" }}><Shield s={16} /></span>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div data-area="value">
              <span style={eyebrow}>{t.vaEyebrow}</span>
              <h3 style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "clamp(24px,2.6vw,32px)", lineHeight: 1.18, letterSpacing: "-.01em", margin: "0 0 24px", maxWidth: "26ch", textWrap: "balance" as never }}>{t.vaH3}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[[t.v1t, t.v1d], [t.v2t, t.v2d], [t.v3t, t.v3d], [t.v4t, t.v4d], [t.v5t, t.v5d], [t.v6t, t.v6d]].map(([title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 }}>
                    <span aria-hidden="true" style={iconCircle}><Check /></span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
                      <p style={{ margin: "4px 0 0", fontSize: 14.5, lineHeight: 1.55, color: C.n400 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 28, padding: 20, borderRadius: 16, background: C.s1, border: `1px solid ${C.line}` }}>
                <span aria-hidden="true" style={iconCircle}><Shield /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{t.gT}</div>
                  <p style={{ margin: "4px 0 0", fontSize: 14.5, lineHeight: 1.6, color: C.n400 }}>{t.gD}</p>
                </div>
              </div>
              <div style={{ ...card, marginTop: 16 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", borderRadius: 999, background: "rgba(39,189,190,.10)", border: "1px solid rgba(39,189,190,.25)", color: C.p300, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{t.stBadge}</span>
                <p style={{ margin: "12px 0 0", fontFamily: C.serif, fontSize: "clamp(20px,2vw,24px)", lineHeight: 1.3 }}>{t.stH}</p>
                <p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.55, color: C.n400 }}>{t.stD}</p>
                <a href={caminho("estudante", lang)} style={{ marginTop: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, padding: "0 22px", borderRadius: 999, border: `1.5px solid ${C.p500}`, color: C.p500, fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                  {t.stCta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIS */}
      <section style={sec}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 clamp(20px,3vw,24px)" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px,4vw,40px)" }}>
            <span style={eyebrow}>{t.afEyebrow}</span><h2 style={h2}>{t.afH2}</h2>
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {t.after.map(([title, desc], i) => (
              <li key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "18px 20px", borderRadius: 16, background: C.s1, border: `1px solid ${C.line}` }}>
                <span aria-hidden="true" style={{ ...numChip, flex: "0 0 32px", height: 32 }}>{i + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
                  <p style={{ margin: "3px 0 0", fontSize: 14, lineHeight: 1.55, color: C.n400 }}>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.line}`, textAlign: "center" }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: C.n400 }}>{t.afStores}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
              <a href={LINKS.appStore} target="_blank" rel="noopener noreferrer" aria-label="App Store" style={{ display: "inline-flex", borderRadius: 8, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.appStore} alt="App Store" width={144} height={48} style={{ display: "block", height: 48, width: "auto" }} />
              </a>
              <a href={LINKS.googlePlay} target="_blank" rel="noopener noreferrer" aria-label="Google Play" style={{ display: "inline-flex", borderRadius: 8, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.googlePlay} alt="Google Play" width={180} height={57} style={{ display: "block", height: 57, width: "auto", margin: "-4.5px 0 -4.5px -8px" }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ ...sec, scrollMarginTop: 64 }}>
        <div style={wrap}>
          <div data-split="1" style={{ alignItems: "start" }}>
            <div style={{ minWidth: 0 }}>
              <span style={eyebrow}>FAQ</span>
              <h2 style={{ ...h2, marginBottom: 14 }}>{t.fqH2}</h2>
              <p style={{ margin: 0, fontSize: 15, color: C.n400, maxWidth: "40ch" }}>
                {t.fqHelp} <a href={LINKS.suporte} style={{ textDecoration: "none" }}>suporte@scienceplay.com</a>.
              </p>
            </div>
            <div data-faq="1" style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              {t.faq.map(([q, a], i) => (
                <details key={q} open={i === 0} style={{ background: C.s1, border: `1px solid ${C.line}`, borderRadius: 16, transition: "border-color .3s" }}>
                  <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, minHeight: 56, padding: "14px 20px", cursor: "pointer", fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>
                    <span>{q}</span>
                    <svg data-chev="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.p500} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", transition: "transform .3s" }}><path d="M6 9l6 6 6-6" /></svg>
                  </summary>
                  <div style={{ padding: "0 20px 18px", fontSize: 15, lineHeight: 1.7, color: C.n300 }}>{a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ ...sec, padding: "clamp(56px,8vw,104px) 0 0" }}>
        <div style={wrap}>
          <div style={{ background: C.s1, border: `1px solid ${C.line}`, borderRadius: "16px 16px 0 0", padding: "clamp(40px,6vw,72px) clamp(20px,4vw,48px) 0", textAlign: "center", overflow: "hidden" }}>
            <p style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "clamp(30px,4.4vw,50px)", lineHeight: 1.08, letterSpacing: "-.015em", margin: "0 auto", maxWidth: "22ch", textWrap: "balance" as never }}>{t.fin}</p>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <a href={LINKS.checkout} target="_blank" rel="noopener noreferrer" style={btnPrimary}>{t.cta}</a>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.n400 }}>{t.finNote}</span>
            </div>
            <div style={{ width: "min(72vw,300px)", margin: "clamp(32px,4vw,48px) auto -22%", aspectRatio: "1170/2532" }}>
              <Img src={IMG.dias} alt="" widths={[400, 600]} sizes="(min-width:900px) 300px, 72vw" />
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "clamp(44px,6vw,64px) 0 calc(clamp(32px,4vw,48px) + 72px)" }}>
        <div style={wrap}>
          <div data-rpgrid="1">
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              <Lockup />
              <p style={{ margin: 0, fontFamily: C.serif, fontSize: 22, lineHeight: 1.2, color: C.p500 }}>{t.sign}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.n400, maxWidth: "38ch" }}>{t.ftTag}</p>
            </div>
            <nav aria-label={t.ftInst} style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.p500, marginBottom: 4 }}>{t.ftInst}</span>
              {[[caminho("sobre", lang), t.ftAbout], [caminho("termos", lang), t.ftTerms], [caminho("privacidade", lang), t.ftPriv]].map(([href, label]) => (
                <a key={href} href={href} style={{ fontSize: 15, color: C.n300, textDecoration: "none", minHeight: 28, display: "inline-flex", alignItems: "center" }}>{label}</a>
              ))}
            </nav>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.p500, marginBottom: 4 }}>{t.ftTalk}</span>
              <a href={LINKS.suporte} style={{ fontSize: 15, color: C.n300, textDecoration: "none", minHeight: 28, display: "inline-flex", alignItems: "center" }}>{t.ftSupport}</a>
              <a href={LINKS.contato} style={{ fontSize: 15, color: C.n300, textDecoration: "none", minHeight: 28, display: "inline-flex", alignItems: "center" }}>{t.ftContact}</a>
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: C.n300, textDecoration: "none", minHeight: 28, display: "inline-flex", alignItems: "center" }}>@diariamente.app</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.p500, marginBottom: 4 }}>{t.ftApp}</span>
              <a href={LINKS.appStore} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: C.n300, textDecoration: "none", minHeight: 28, display: "inline-flex", alignItems: "center" }}>App Store</a>
              <a href={LINKS.googlePlay} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: C.n300, textDecoration: "none", minHeight: 28, display: "inline-flex", alignItems: "center" }}>Google Play</a>
            </div>
          </div>
          <hr style={{ height: 1, border: 0, background: C.line, margin: "clamp(32px,5vw,44px) 0 20px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px 24px" }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.n400 }}>© 2026 Science Play® · Science Play Cursos LTDA · CNPJ 33.612.911/0001-29 · diariamente.app</p>
            <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {[.3, .4, .5, .6, .75, .9].map((o, i) => <i key={i} style={{ display: "block", width: 10, height: 4, borderRadius: 999, background: C.p500, opacity: o }} />)}
              <i style={{ display: "block", width: 22, height: 4, borderRadius: 999, background: C.p500 }} />
            </span>
          </div>
        </div>
      </footer>

      {/* STICKY CTA MOBILE */}
      <div data-sticky="1" aria-hidden={!sticky} style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, padding: "10px 0 calc(10px + env(safe-area-inset-bottom))", background: "rgba(10,14,14,.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: `1px solid ${C.line}`, transition: "transform .3s cubic-bezier(.16,1,.3,1)", transform: sticky ? "translateY(0)" : "translateY(110%)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: C.serif, fontSize: 20, lineHeight: 1 }}>
              <s style={{ fontSize: 13, color: C.n400, fontFamily: "Inter,system-ui,sans-serif", marginRight: 6 }}>R$ 197</s>R$ 137,90
            </div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500, color: C.n400, whiteSpace: "nowrap" }}>{t.stickyNote}</div>
          </div>
          <button type="button" tabIndex={sticky ? 0 : -1} onClick={goToOffer} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", height: 48, padding: "0 18px", borderRadius: 999, border: "none", background: C.p500, color: C.onAccent, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{t.cta}</button>
        </div>
      </div>
    </div>
  );
}
