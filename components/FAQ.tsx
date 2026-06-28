"use client";

import { useState } from "react";
import { GARANTIA } from "@/config";

const FAQ_ITEMS = [
  {
    q: "É caro?",
    a: "É menos de R$ 13 por mês por um ano inteiro de provocação diária — com um sistema feito pra você realmente usar, não esquecer numa estante digital.",
  },
  {
    q: "Não tenho tempo.",
    a: "É uma provocação por dia, cerca de 5 minutos. O app inclusive te lembra no WhatsApp. A questão nunca foi tempo — foi constância.",
  },
  {
    q: "Já comprei livros assim e larguei.",
    a: "Exatamente por isso o Diariamente tem ofensiva, conquistas e ranking. Ele foi construído no ponto onde você largou antes — pra manter a sua sequência viva.",
  },
  {
    q: "Será que funciona pra mim?",
    a: "Funciona pra quem aparece 5 minutos por dia. O resto o sistema segura: a sequência, o lembrete, o progresso visível.",
  },
  {
    q: "Já tenho o livro físico.",
    a: "O app é a versão que te faz usar o livro: te lembra, marca seu progresso e mantém sua sequência. Se quiser só o app, o plano Digital atende.",
  },
  {
    q: "Como recebo o acesso?",
    a: "Por e-mail, logo após a confirmação. Você abre o app e já faz a provocação do dia 1 — sua ofensiva começa na hora.",
  },
  {
    q: "E se eu não gostar?",
    a: GARANTIA.texto,
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq">
      <div className="wrap-content">
        <div className="center">
          <span className="overline eyebrow">Perguntas frequentes</span>
          <h2 className="display-md sec-title">Ainda em dúvida? Respondido.</h2>
        </div>

        <div className="stack" style={{ marginTop: "var(--sp8)" }}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="sf-dark" style={{ overflow: "hidden", borderRadius: "var(--r-2xl)" }}>
                <button
                  onClick={() => {
                    setOpen(isOpen ? null : i);
                    (window as any).dataLayer?.push({ event: "FAQClick", pergunta: item.q });
                  }}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: "var(--sp4)", padding: "var(--sp5)", background: "transparent", border: "none",
                    color: "var(--n-0)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
                  }}
                >
                  <span className="h3">{item.q}</span>
                  <span className="teal" style={{ flex: "0 0 auto", fontSize: 22, transition: "transform .25s", transform: isOpen ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <div style={{ maxHeight: isOpen ? 240 : 0, transition: "max-height .3s var(--ease)", overflow: "hidden" }}>
                  <p className="body-sm muted" style={{ padding: "0 var(--sp5) var(--sp5)" }}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
