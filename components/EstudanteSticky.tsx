"use client";

import { useEffect, useState } from "react";

/**
 * EstudanteSticky — barra fixa de CTA no mobile.
 *
 * Regras de UX:
 *  - só aparece depois que o usuário passa do hero (evita cobrir a primeira dobra)
 *  - some quando o formulário entra em tela (não competir com o próprio botão)
 *  - some depois do rodapé
 *  - some no desktop (CSS)
 *
 * Também liga o reveal on scroll da rota (classe .ed-js no <html>).
 * Sem biblioteca, sem dependência: um IntersectionObserver e um listener passivo.
 */
export function EstudanteSticky({ alvo = "formulario" }: { alvo?: string }) {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("ed-js");

    // ---- reveal on scroll ----
    const alvos = Array.from(document.querySelectorAll(".ed-reveal"));
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    alvos.forEach((el) => io.observe(el));
    const rede = window.setTimeout(() => alvos.forEach((el) => el.classList.add("is-in")), 2200);

    // ---- visibilidade do formulário ----
    let formVisivel = false;
    const form = document.getElementById(alvo);
    const ioForm = form
      ? new IntersectionObserver(
          ([e]) => {
            formVisivel = e.isIntersecting;
            avaliar();
          },
          { threshold: 0.12 }
        )
      : null;
    ioForm?.observe(form as Element);

    // ---- scroll ----
    let ticking = false;
    const avaliar = () => {
      const passouHero = window.scrollY > 520;
      const chegouFim =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 220;
      setAtivo(passouHero && !formVisivel && !chegouFim);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        avaliar();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    avaliar();

    return () => {
      io.disconnect();
      ioForm?.disconnect();
      window.clearTimeout(rede);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [alvo]);

  const irParaForm = () => {
    document.getElementById(alvo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    (window as any).gtag?.("event", "click_cta", { location: "sticky_estudante" });
    (window as any).dataLayer?.push({ event: "ClickCTA", location: "sticky_estudante" });
  };

  return (
    <div className={`ed-sticky ${ativo ? "is-on" : ""}`} aria-hidden={!ativo}>
      <div className="ed-sticky-row">
        <div className="ed-sticky-txt">
          <div className="ed-sticky-k">Condição de estudante</div>
          <div className="ed-sticky-v">Leva um minuto. O código chega no WhatsApp.</div>
        </div>
        <button
          type="button"
          className="ed-btn ed-btn-primary"
          onClick={irParaForm}
          tabIndex={ativo ? 0 : -1}
        >
          Solicitar
        </button>
      </div>
    </div>
  );
}
