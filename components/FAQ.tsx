"use client";

import { useState } from "react";
import { GARANTIA, PLANO_APP } from "@/config";

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

const PERGUNTAS: { q: string; a: string }[] = [
  {
    q: "Já baixei app de hábito antes. Parei na segunda semana.",
    a: "É o ponto exato onde o Diariamente foi construído. Ele não conta dias seguidos e não tem sequência para quebrar: conta quantas vezes você voltou, e esse número nunca zera. Faltar cinco dias não apaga as trinta voltas anteriores.",
  },
  {
    q: "E se eu perder um dia?",
    a: "O dia que você não veio fica visível, sem alarme e sem cobrança. Ele fica no meio da sua história, e a história continua depois dele. Interromper não significa abandonar.",
  },
  {
    q: "Não tenho tempo.",
    a: "São três minutos: um texto curto, uma reflexão e uma ação pequena que cabe no dia que você já tem. Não pede rotina nova, horário reservado nem disciplina que você ainda não construiu.",
  },
  {
    q: "O que exatamente eu recebo por dia?",
    a: "Um texto autoral, escrito para ser lido em poucos minutos. Ele provoca uma reflexão e termina numa ação possível ainda hoje. Você registra a ação e volta no dia seguinte.",
  },
  {
    q: "Isso é terapia ou tratamento?",
    a: "Não. O Diariamente é uma prática diária de hábitos e bem-estar. Não trata, não diagnostica e não substitui acompanhamento profissional. Se você precisa de cuidado clínico, procure um profissional de saúde.",
  },
  {
    q: "Funciona mesmo?",
    a: "O ritual é construído a partir de princípios consistentes com a ciência do comportamento e da formação de hábitos: repetir a mesma ação num contexto recorrente pode favorecer que ela se torne automática, e transformar intenção em plano concreto pode aumentar a probabilidade de agir. Não existe número mágico de dias, e ninguém pode prometer prazo.",
  },
  {
    q: "Posso ler tudo de uma vez?",
    a: "Não. Um texto por dia, sem antecipar e sem acumular. A obrigação diária é do Diariamente, não sua: ele aparece todo dia, você volta quando puder.",
  },
  {
    q: "Como recebo o acesso?",
    a: "Por e-mail, assim que o pagamento é confirmado. O app está disponível para iPhone e Android, com o mesmo acesso nos dois.",
  },
  {
    q: "E se não for pra mim?",
    a: GARANTIA.texto,
  },
  {
    q: "Quanto custa?",
    a: `R$ ${PLANO_APP.preco}, ${PLANO_APP.perDia} por um ano inteiro. E tem ${GARANTIA.dias} dias de garantia: se não for pra você, devolvemos.`,
  },
];

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
