"use client";

import { useEffect, useState } from "react";
import { PLANO } from "@/config";

/* =====================================================================
   Âncoras da página de venda
   ---------------------------------------------------------------------
   Problema que isto resolve:

   As imagens da home (prints do app) carregam com loading="lazy". Antes
   de o arquivo chegar, cada uma ocupa a altura reservada pelo layout. Se
   alguma ainda não tiver espaço reservado, ou se uma fonte trocar no meio
   do caminho, a posição de #oferta muda DEPOIS que o scroll já começou.
   O browser não re-mira: ele termina na coordenada calculada no clique.
   Resultado: o usuário clica no CTA da primeira dobra e para na seção
   anterior, "Quem está por trás".

   rolarPara() faz três coisas:
     1. promove a eager todas as imagens acima do alvo, para que expandam
        agora e não no meio da viagem
     2. rola até o alvo, descontando a altura da topnav sticky
     3. re-mira por até 2,5s enquanto a coordenada do alvo ainda estiver
        mudando, e desiste na hora se o usuário tocar na rolagem
   ===================================================================== */

function alturaNav(): number {
  const nav = document.querySelector<HTMLElement>(".topnav");
  if (!nav) return 0;
  const fixa = getComputedStyle(nav).position;
  if (fixa !== "sticky" && fixa !== "fixed") return 0;
  return nav.offsetHeight + 12;
}

export function rolarPara(id: string, offsetExtra = 0): void {
  const alvo = document.getElementById(id);
  if (!alvo) return;

  const topoAlvo = alvo.getBoundingClientRect().top + window.scrollY;

  // 1. tudo que está acima do alvo carrega AGORA
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    if (img.getBoundingClientRect().top + window.scrollY < topoAlvo) {
      img.loading = "eager";
      try {
        (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "high";
      } catch {
        /* navegador antigo: segue sem prioridade */
      }
    }
  });

  const destino = () =>
    Math.max(0, alvo.getBoundingClientRect().top + window.scrollY - alturaNav() - offsetExtra);

  let cancelado = false;
  const cancelar = () => {
    cancelado = true;
  };
  window.addEventListener("wheel", cancelar, { passive: true, once: true });
  window.addEventListener("touchstart", cancelar, { passive: true, once: true });
  window.addEventListener("keydown", cancelar, { once: true });

  let mira = destino();
  window.scrollTo({ top: mira, behavior: "smooth" });

  // 2. re-mira enquanto o layout ainda se acomoda
  const inicio = performance.now();
  const tick = () => {
    if (cancelado) return;
    const atual = destino();
    if (Math.abs(atual - mira) > 2) {
      mira = atual;
      window.scrollTo({ top: mira, behavior: "smooth" });
    }
    if (performance.now() - inicio < 2500) requestAnimationFrame(tick);
    else {
      window.removeEventListener("wheel", cancelar);
      window.removeEventListener("touchstart", cancelar);
      window.removeEventListener("keydown", cancelar);
    }
  };
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------
// Sticky CTA: aparece depois que o usuário rola além do hero.
// ---------------------------------------------------------------------
export function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToOffer = () => {
    rolarPara("oferta");
    (window as any).dataLayer?.push({ event: "ClickCTA", location: "sticky" });
    (window as any).gtag?.("event", "click_cta", { location: "sticky" });
  };

  return (
    <div className={`sticky-cta ${show ? "show" : ""}`}>
      <div className="wrap">
        <div className="row">
          <div className="price">
            <div className="caption" style={{ marginBottom: -2 }}>
              {PLANO.precoDe ? <s>R$ {PLANO.precoDe}</s> : "à vista"}
            </div>
            <b className="teal">R$ {PLANO.preco}</b>
          </div>
          <button className="btn btn-primary" onClick={goToOffer}>
            Quero começar hoje
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Reveal on scroll + interceptação das âncoras internas da página.
// Já está montado na home, então a correção das âncoras entra sem exigir
// nenhuma linha nova em app/page.tsx.
// ---------------------------------------------------------------------
export function RevealOnScroll() {
  useEffect(() => {
    // marca que o JS está ativo — só então os .reveal começam ocultos
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

    // ---- âncoras internas ----
    const onClick = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0) return;
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

      const alvoDom = ev.target as HTMLElement | null;
      const link = alvoDom?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link || link.target === "_blank") return;

      const id = (link.getAttribute("href") || "").slice(1);
      if (!id || !document.getElementById(id)) return;

      ev.preventDefault();
      rolarPara(id);
      history.replaceState(null, "", `#${id}`);
      (window as any).dataLayer?.push({ event: "ClickCTA", location: `ancora_${id}` });
      (window as any).gtag?.("event", "click_cta", { location: `ancora_${id}` });
    };
    document.addEventListener("click", onClick);

    // ---- chegada com hash na URL (ex: /#oferta vindo de anúncio) ----
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      const t = setTimeout(() => rolarPara(hash), 120);
      return () => {
        clearTimeout(t);
        io.disconnect();
        clearTimeout(safety);
        document.removeEventListener("click", onClick);
      };
    }

    return () => {
      io.disconnect();
      clearTimeout(safety);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
