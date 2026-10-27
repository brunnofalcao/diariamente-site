import { Fragment } from "react";
import { EMPRESA } from "@/config";

/* =====================================================================
   CNPJs do grupo Science Play, sem quebra no meio do número
   ---------------------------------------------------------------------
   Em 320px o navegador partia um CNPJ depois do hífen ("...0001-" numa
   linha, os dois dígitos finais na outra). Cada número, e na linha de
   identificação cada "(CNPJ ...)", vai num span com white-space: nowrap.
   Nenhum caractere é trocado (nada de hífen não separável): o texto
   copiado precisa ser igual ao do cartão CNPJ.

   O texto visível é o mesmo das funções do config.ts (rodapeDoGrupo e
   identificacaoDoGrupo), que continuam lá como referência do teste.
   Razão social e CNPJ vêm SÓ de EMPRESA.grupo.
   ===================================================================== */

type Idioma = "pt" | "es";

const naoQuebra = { whiteSpace: "nowrap" } as const;

/** Junta itens como "a, b e c" (pt) ou "a, b y c" (es). */
function EmLista({ itens, lang }: { itens: React.ReactNode[]; lang: Idioma }) {
  const ultimo = itens.length - 1;
  return (
    <>
      {itens.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && (i === ultimo ? (lang === "es" ? " y " : " e ") : ", ")}
          {item}
        </Fragment>
      ))}
    </>
  );
}

/** "a, b e c": só os números, cada um inteiro na mesma linha. */
export function CnpjsDoGrupo({ lang = "pt" }: { lang?: Idioma }) {
  return (
    <EmLista
      lang={lang}
      itens={EMPRESA.grupo.map((e) => <span key={e.cnpj} style={naoQuebra}>{e.cnpj}</span>)}
    />
  );
}

/** Rodapé curto: "Science Play® · grupo Science Play · CNPJs a, b e c". */
export function RodapeDoGrupo({ lang = "pt" }: { lang?: Idioma }) {
  return (
    <>
      {EMPRESA.marca}® · grupo {EMPRESA.marca} · CNPJs <CnpjsDoGrupo lang={lang} />
    </>
  );
}

/** A linha de identificação aprovada, uma vez nos Termos e na Política. */
export function IdentificacaoDoGrupo({ lang = "pt" }: { lang?: Idioma }) {
  const empresas = (
    <EmLista
      lang={lang}
      itens={EMPRESA.grupo.map((e) => (
        <Fragment key={e.cnpj}>
          {e.razaoSocial} <span style={naoQuebra}>(CNPJ {e.cnpj})</span>
        </Fragment>
      ))}
    />
  );
  return lang === "es" ? (
    <>Diariamente es un producto {EMPRESA.marca}®, operado por las empresas del grupo {EMPRESA.marca}: {empresas}.</>
  ) : (
    <>O Diariamente é um produto {EMPRESA.marca}®, operado pelas empresas do grupo {EMPRESA.marca}: {empresas}.</>
  );
}
