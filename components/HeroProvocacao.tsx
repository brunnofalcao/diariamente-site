"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/config";

type Prov = { dia: number; total: number; texto: string; autor: string; dataExtenso?: string; diaSemana?: string };

// Hero dinâmico: a provocação do dia é digitada (typewriter) e fica fixa.
// v3 (mobile-first):
//  1. a digitação só começa quando o card ENTRA NA VIEWPORT — no mobile ele
//     fica abaixo da dobra e o usuário chegava com a animação já terminada;
//  2. botão "Compartilhar" (Web Share API; fallback copia o link): a
//     provocação do dia vira mídia orgânica, com UTM próprio pra medir.
export function HeroProvocacao() {
  const [prov, setProv] = useState<Prov | null>(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const startedRef = useRef(false);
  const frameRef = useRef<HTMLDivElement | null>(null);

  // 1) busca a provocação do dia (API protegida; cai em teaser se preciso)
  useEffect(() => {
    let alive = true;
    fetch("/api/provocacao-do-dia")
      .then((r) => r.json())
      .then((d: Prov) => {
        if (alive) setProv(d);
      })
      .catch(() => {
        if (alive)
          setProv({
            dia: 1,
            total: 365,
            texto: "O que você está adiando que, no fundo, já sabe que precisa decidir?",
            autor: "Diariamente",
          });
      });
    return () => {
      alive = false;
    };
  }, []);

  // 2) espera o card aparecer na tela pra começar a digitar
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    const safety = window.setTimeout(() => setVisivel(true), 6000);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  // 3) efeito de digitação (respeita prefers-reduced-motion)
  useEffect(() => {
    if (!prov || !visivel || startedRef.current) return;
    startedRef.current = true;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setTyped(prov.texto);
      setDone(true);
      return;
    }

    const full = prov.texto;
    let i = 0;
    const tick = () => {
      i++;
      setTyped(full.slice(0, i));
      if (i < full.length) {
        const delay = 28 + (full[i - 1] === "," || full[i - 1] === "." ? 220 : Math.random() * 26);
        window.setTimeout(tick, delay);
      } else {
        setDone(true);
      }
    };
    const startDelay = window.setTimeout(tick, 650);
    return () => window.clearTimeout(startDelay);
  }, [prov, visivel]);

  // 4) compartilhar (Web Share API no mobile; desktop copia o link)
  const compartilhar = async () => {
    const texto = prov
      ? '"' + prov.texto + '" — provocação de hoje no Diariamente.'
      : "Diariamente: uma provocação por dia, por 365 dias.";
    const url = SITE.dominio + "/?utm_source=share&utm_medium=organic&utm_campaign=provocacao_do_dia";
    (window as any).gtag?.("event", "share", { method: "provocacao_hero" });
    (window as any).dataLayer?.push({ event: "share_provocacao" });
    try {
      if (navigator.share) {
        await navigator.share({ title: "Diariamente", text: texto, url });
      } else {
        await navigator.clipboard.writeText(texto + " " + url);
        setCopiado(true);
        window.setTimeout(() => setCopiado(false), 2200);
      }
    } catch {
      /* usuário cancelou o share — segue o jogo */
    }
  };

  const diaLabel = prov ? `Dia ${prov.dia} de ${prov.total}` : "Dia · de 365";

  return (
    <div className="hero-search reveal">
      <div className="hs-frame media-glow" ref={frameRef}>
        {/* topo: wordmark + selo de constância, igual ao app */}
        <div className="hs-head">
          <span className="hs-wordmark">
            DIARIA<span className="hs-word-thin">MENTE</span>
          </span>
          <span className="hs-streak" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4-2 5-2 8a4 4 0 008 0c0-1-1-2-1-3 2 1 3 3 3 6a8 8 0 11-16 0c0-5 5-7 8-11z"/></svg>
            {prov ? prov.dia : "·"}
          </span>
        </div>

        {/* data por extenso — muda todo dia (igual ao app: "28 junho · Domingo") */}
        <div className="hs-data">
          <span className="hs-data-dia">{prov?.dataExtenso ?? "Hoje"}</span>
          {prov?.diaSemana && <span className="hs-data-semana">{prov.diaSemana}</span>}
        </div>

        {/* rótulo provocação do dia */}
        <div className="hs-meta">
          <span className="hs-eyebrow">Provocação do dia</span>
          <span className="hs-day">{diaLabel}</span>
        </div>

        {/* "barra de busca" onde a provocação é digitada */}
        <div className="hs-bar" role="img" aria-label={prov ? prov.texto : "Carregando provocação do dia"}>
          <svg className="hs-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hs-text">
            {typed}
            <span className={`hs-caret ${done ? "blink" : ""}`} aria-hidden="true" />
          </span>
        </div>

        {/* rodapé: autor + microcopy + compartilhar */}
        <div className="hs-foot">
          {done && prov?.autor && <span className="hs-autor">{prov.autor}</span>}
          <span className="hs-sub">Sua vez. O que você vai fazer com isso?</span>
          <div>
            <button type="button" className="hs-share" onClick={compartilhar} aria-label="Compartilhar a provocação do dia">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              {copiado ? "Link copiado!" : "Compartilhar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
