"use client";

import { LockupHorizontal } from "@/components/Brand";
import { ListaEsperaForm } from "@/components/ListaEsperaForm";
import { SeletorMercado } from "@/components/SeletorMercado";
import type { Lang } from "@/lib/i18n";
import { HOME_DO_MERCADO } from "@/lib/mercado";
import type { Mercado } from "@/config/pricing";
import { EMPRESA } from "@/config";

/* =====================================================================
   EM BREVE · lista de espera
   ---------------------------------------------------------------------
   Tom de voz (Brandbook 5.0): direto sem ser frio, acolhedor sem ser
   genérico. Por isso esta página NÃO tem:
     - contagem regressiva       urgência artificial é proibida
     - "vagas limitadas"         escassez fabricada, idem
     - "garanta já o seu"        linguagem de compra, idem
     - "a gente"                 vetado em copy formal da marca

   O formulário é o mesmo do bloco de oferta dos mercados sem venda
   (components/ListaEsperaForm.tsx): nome, e-mail e WhatsApp, com o
   mercado e o idioma da página. Consentimento e parceiros, idem.

   Hoje é a home de /es (América Latina) e /es-es (Espanha) enquanto o
   acervo em espanhol não está revisado (config/pricing.ts, semVenda).
   ===================================================================== */

const T = {
  pt: {
    over: "Em breve",
    h1a: "Ainda não é hoje.",
    h1b: "Mas está perto.",
    lead: "O Diariamente está sendo preparado com o mesmo cuidado que ele vai pedir de você: um passo de cada vez. Deixe seu contato e avisamos no dia em que abrir.",
    vem: [
      { t: "Um texto por dia", d: "Curto, para ler em três minutos." },
      { t: "Uma ação possível", d: "Que cabe no dia que você já tem." },
      { t: "Sem cobrança", d: "Quando você faltar, ele te espera." },
    ],
    rodape: "Uma prática diária de hábitos e bem-estar.",
  },
  es: {
    over: "Próximamente",
    h1a: "Todavía no es hoy.",
    h1b: "Pero está cerca.",
    lead: "Diariamente se está preparando con el mismo cuidado que te va a pedir a ti: un paso a la vez. Déjanos tu contacto y te avisamos el día que abra.",
    vem: [
      { t: "Un texto por día", d: "Breve, para leer en tres minutos." },
      { t: "Una acción posible", d: "Que cabe en el día que ya tienes." },
      { t: "Sin reclamos", d: "Cuando faltes, te espera." },
    ],
    rodape: "Una práctica diaria de hábitos y bienestar.",
  },
};

export function EmBreve({ lang = "pt", mercado }: { lang?: Lang; mercado?: Mercado }) {
  const t = T[lang];
  const mkt: Mercado = mercado ?? (lang === "es" ? "la" : "br");

  return (
    <main className="eb">
      <div className="eb-glow" aria-hidden="true" />

      <header className="eb-top">
        <a href={HOME_DO_MERCADO[mkt]} aria-label="Diariamente">
          <LockupHorizontal altura={26} />
        </a>
      </header>

      <section className="eb-wrap">
        <span className="eb-over">{t.over}</span>

        <h1 className="eb-h1">
          {t.h1a}
          <br />
          <span>{t.h1b}</span>
        </h1>

        <p className="eb-lead">
          {t.lead}
        </p>

        <ul className="eb-vem">
          {t.vem.map((v) => (
            <li key={v.t}>
              <b>{v.t}</b>
              <span>{v.d}</span>
            </li>
          ))}
        </ul>

        <ListaEsperaForm mercado={mkt} origem="em-breve" />
      </section>

      <footer className="eb-foot">
        <span className="eb-seq" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i className="hoje" />
        </span>
        <p>{t.rodape}</p>
        {/* Rodapé de todas as páginas: só a assinatura (decisão do dono,
            12/10/2026). Os dados da titular ficam nos Termos e na Política. */}
        <p>{EMPRESA.assinatura}</p>
        <SeletorMercado atual={mkt} titulo="País" linha />
      </footer>
    </main>
  );
}
