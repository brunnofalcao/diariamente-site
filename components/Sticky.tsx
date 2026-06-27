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
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
