"use client";

import { useEffect, useRef, useState } from "react";

type Prov = { dia: number; total: number; texto: string; autor: string };

// Hero dinâmico: uma "barra de busca" onde a provocação do dia é digitada
// (efeito typewriter) e depois fica fixa na tela. Dia real (1..365) via API.
export function HeroProvocacao() {
  const [prov, setProv] = useState<Prov | null>(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

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

  // 2) efeito de digitação (respeita prefers-reduced-motion)
  useEffect(() => {
    if (!prov || startedRef.current) return;
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
        // velocidade levemente variável = mais humano
        const delay = 28 + (full[i - 1] === "," || full[i - 1] === "." ? 220 : Math.random() * 26);
        window.setTimeout(tick, delay);
      } else {
        setDone(true);
      }
    };
    const startDelay = window.setTimeout(tick, 650);
    return () => window.clearTimeout(startDelay);
  }, [prov]);

  const diaLabel = prov ? `Dia ${prov.dia} de ${prov.total}` : "Dia · de 365";

  return (
    <div className="hero-search reveal">
      <div className="hs-frame media-glow">
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

        {/* rodapé: autor + microcopy do app */}
        <div className="hs-foot">
          {done && prov?.autor && <span className="hs-autor">{prov.autor}</span>}
          <span className="hs-sub">Sua vez. O que você vai fazer com isso?</span>
        </div>
      </div>
    </div>
  );
}
