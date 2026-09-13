"use client";

import { useState } from "react";
import { PERGUNTAS } from "@/lib/faq";

/* =====================================================================
   FAQ · Brandbook 5.0
   ---------------------------------------------------------------------
   Reescrito contra a matriz de claims (seção 14) e as três regras de tom
   (seção 08). Nenhuma resposta:
     - afirma o que o leitor sente ou por que ele falhou
     - transforma o convite em cobrança moral
     - reduz dificuldade real a falta de atitude

   Nenhuma menção a livro, a autoria individual ou a resultado clínico.
   Verbos restritos aos permitidos (seção 09): promover, apoiar, favorecer,
   construir, sustentar, manter, refletir, estimular, organizar, praticar,
   repetir, voltar.
   ===================================================================== */

export function FAQ() {
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <div className="faq">
      {PERGUNTAS.map((item, i) => (
        <div key={item.q} className={`faq-item ${aberta === i ? "open" : ""}`}>
          <button
            className="faq-q"
            onClick={() => setAberta(aberta === i ? null : i)}
            aria-expanded={aberta === i}
          >
            <span>{item.q}</span>
            <span className="faq-ic" aria-hidden="true" />
          </button>
          {aberta === i && <div className="faq-a">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}
