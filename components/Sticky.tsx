"use client";

import { useEffect, useState } from "react";
import { PLANOS } from "@/config";

// Sticky CTA aparece depois que o usuário rola além do hero.
export function StickyCTA() {
  const [show, setShow] = useState(false);
  const combo = PLANOS.find((p) => p.destaque) ?? PLANOS[0];

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToOffer = () => {
    document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth" });
    // slot de tracking: ClickCTA (sticky)
    (window as any).dataLayer?.push({ event: "ClickCTA", location: "sticky" });
  };

  return (
    <div className={`sticky-cta ${show ? "show" : ""}`}>
      <div className="wrap">
        <div className="row">
          <div className="price">
            <div className="caption" style={{ marginBottom: -2 }}>a partir de</div>
            <b className="teal">R$ {PLANOS[0].preco}</b>
          </div>
          <button className="btn btn-primary" onClick={goToOffer}>
            Quero começar hoje
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook simples de reveal on scroll (aplica .in nos elementos .reveal)
export function RevealOnScroll() {
  useEffect(() => {
    // marca que o JS está ativo — só então os .reveal começam ocultos (progressive enhancement)
    document.documentElement.classList.add("js");

    const els = Array.from(document.querySelectorAll(".reveal, .reveal-media, .media-glow"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));

    // rede de segurança: se algo não disparar em 2.5s, revela tudo
    const safety = setTimeout(() => {
      els.forEach((el) => el.classList.add("in"));
    }, 2500);

    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);
  return null;
}
