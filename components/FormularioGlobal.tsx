"use client";

import { useState } from "react";
import { OPCOES, VERSAO_CONSENTIMENTO, type ChaveConsentimento } from "@/lib/consentimento";
import { caminho } from "@/lib/rotas";
import type { Lang } from "@/lib/i18n";

/**
 * FormularioGlobal — registro de interesse na condição de estudante
 * fora do Brasil (Espanha e América Latina).
 *
 * DIFERENÇAS PARA O FORMULÁRIO BRASILEIRO, E O PORQUÊ DE CADA UMA
 *
 *   CPF          removido. Não existe fora do Brasil, e a API atual
 *                rejeita com 400 qualquer coisa que não passe no dígito
 *                verificador. Um documento não é necessário aqui porque
 *                isto não emite cupom: registra interesse.
 *
 *   UF           virou país + instituição em texto livre. Listar as
 *                divisões administrativas de vinte países é inviável e
 *                desnecessário.
 *
 *   telefone     DDI livre, em campo separado. O formulário brasileiro
 *                concatena "55" no código.
 *
 *   consentimento  duas caixas SEPARADAS e DESMARCADAS, conforme
 *                  lib/consentimento.ts. Nenhuma bloqueia o envio.
 *
 * O QUE É GRAVADO JUNTO DO ACEITE, e por que importa: versão do texto,
 * data em UTC, origem e idioma. O RGPD art. 7º(1) coloca o ônus da
 * prova no responsável — sem esses quatro campos não há como demonstrar
 * a QUE a pessoa consentiu, e o consentimento vira indefensável.
 */

const T = {
  es: {
    titulo: "Regístrate para la condición internacional",
    intro:
      "Todavía no emitimos el código fuera de Brasil: la validación usa documentos e instituciones brasileñas y el cobro es en reales. Déjanos tus datos y te avisamos en cuanto esté disponible en tu país.",
    nome: "Nombre completo",
    email: "Correo electrónico",
    ddi: "Código de país",
    telefone: "Teléfono",
    pais: "País donde estudias",
    instituicao: "Institución educativa",
    curso: "Carrera",
    selecione: "Selecciona",
    enviar: "Registrar mi interés",
    enviando: "Un instante",
    okTitulo: "Registro recibido.",
    okTexto:
      "Te escribiremos en cuanto la condición esté disponible en tu país. Mientras tanto, el acceso completo sigue disponible.",
    erroCampos: "Revisa los campos marcados.",
    erroEnvio: "No pudimos registrar ahora. Inténtalo de nuevo en unos minutos.",
    naoObrigatorio: "Opcional. No condiciona tu registro.",
    politica: "Política de Privacidad",
    legal:
      "Tratamos estos datos para registrar tu interés y avisarte, con base en tus medidas precontractuales. Puedes ejercer tus derechos en cualquier momento escribiendo a nuestro contacto de privacidad.",
  },
  pt: {
    titulo: "Cadastre-se para a condição internacional",
    intro:
      "Ainda não emitimos o código fora do Brasil. Deixe seus dados e avisamos assim que estiver disponível no seu país.",
    nome: "Nome completo",
    email: "E-mail",
    ddi: "Código do país",
    telefone: "Telefone",
    pais: "País onde você estuda",
    instituicao: "Instituição de ensino",
    curso: "Curso",
    selecione: "Selecione",
    enviar: "Registrar meu interesse",
    enviando: "Um instante",
    okTitulo: "Cadastro recebido.",
    okTexto: "Avisamos assim que a condição estiver disponível no seu país.",
    erroCampos: "Confira os campos marcados.",
    erroEnvio: "Não foi possível registrar agora. Tente de novo em alguns minutos.",
    naoObrigatorio: "Opcional. Não condiciona seu cadastro.",
    politica: "Política de Privacidade",
    legal:
      "Tratamos estes dados para registrar seu interesse e avisar você, com base em diligências pré-contratuais. Você pode exercer seus direitos a qualquer momento.",
  },
};

/* Espanha, Portugal e a América hispânica. Portugal entra porque é
   União Europeia e porque o público lusófono europeu também fica sem o
   fluxo brasileiro. */
const PAISES = [
  "España", "Portugal", "Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica",
  "Cuba", "Ecuador", "El Salvador", "Guatemala", "Honduras", "México", "Nicaragua",
  "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana", "Uruguay",
  "Venezuela", "Otro",
];

export function FormularioGlobal({ lang = "es" }: { lang?: Lang }) {
  const t = T[lang];

  const [dados, setDados] = useState({
    nome: "", email: "", ddi: "", telefone: "",
    pais: "", instituicao: "", curso: "",
  });
  const [consent, setConsent] = useState<Record<ChaveConsentimento, boolean>>({
    marketingProprio: false,
    parceiros: false,
  });
  const [erros, setErros] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "enviando" | "ok" | "erro">("idle");

  const set = (k: string, v: string) => {
    setDados((d) => ({ ...d, [k]: v }));
    if (erros[k]) setErros((e) => ({ ...e, [k]: false }));
  };

  const enviar = async () => {
    const falhas: Record<string, boolean> = {};
    if (dados.nome.trim().split(/\s+/).filter(Boolean).length < 2) falhas.nome = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) falhas.email = true;
    if (!dados.pais) falhas.pais = true;
    if (dados.instituicao.trim().length < 2) falhas.instituicao = true;
    setErros(falhas);
    if (Object.keys(falhas).length) return;

    setStatus("enviando");
    try {
      const r = await fetch("/api/estudante/interesse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dados,
          telefone: dados.ddi && dados.telefone ? `${dados.ddi}${dados.telefone}`.replace(/\D/g, "") : "",
          // Registro do consentimento. Os quatro campos existem para que
          // seja possível DEMONSTRAR o aceite depois.
          consentimento: {
            versao: VERSAO_CONSENTIMENTO,
            aceitoEm: new Date().toISOString(),
            origem: "form-estudante-global",
            idioma: lang,
            ...consent,
          },
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setStatus("ok");
    } catch {
      setStatus("erro");
    }
  };

  if (status === "ok") {
    return (
      <div className="fg-ok">
        <h2 className="t-title">{t.okTitulo}</h2>
        <p>{t.okTexto}</p>
      </div>
    );
  }

  const campo = (k: string, label: string, tipo = "text", auto?: string) => (
    <div className="fg-campo">
      <label className="fg-label" htmlFor={k}>{label}</label>
      <input
        id={k}
        name={k}
        type={tipo}
        autoComplete={auto}
        className="fg-input"
        aria-invalid={!!erros[k]}
        value={(dados as Record<string, string>)[k]}
        onChange={(e) => set(k, e.target.value)}
      />
    </div>
  );

  return (
    <div className="fg">
      <h2 className="t-title fg-h">{t.titulo}</h2>
      <p className="fg-intro">{t.intro}</p>

      <div className="fg-grid">
        {campo("nome", t.nome, "text", "name")}
        {campo("email", t.email, "email", "email")}

        <div className="fg-campo">
          <label className="fg-label" htmlFor="pais">{t.pais}</label>
          <select
            id="pais" name="pais" className="fg-input"
            aria-invalid={!!erros.pais}
            value={dados.pais} onChange={(e) => set("pais", e.target.value)}
          >
            <option value="">{t.selecione}</option>
            {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {campo("instituicao", t.instituicao, "text", "organization")}
        {campo("curso", t.curso)}

        <div className="fg-tel">
          <div className="fg-campo fg-ddi">
            <label className="fg-label" htmlFor="ddi">{t.ddi}</label>
            <input
              id="ddi" name="ddi" type="tel" inputMode="tel" placeholder="+34"
              className="fg-input" autoComplete="tel-country-code"
              value={dados.ddi} onChange={(e) => set("ddi", e.target.value)}
            />
          </div>
          {campo("telefone", t.telefone, "tel", "tel-national")}
        </div>
      </div>

      {/* CONSENTIMENTO · duas caixas separadas, ambas desmarcadas.
          Nenhuma bloqueia o envio: condicionar serviço a consentimento
          não necessário invalida o próprio consentimento. */}
      <div className="fg-consent">
        {OPCOES.map((o) => (
          <label key={o.chave} className="fg-check">
            <input
              type="checkbox"
              checked={consent[o.chave]}
              onChange={(e) => setConsent((c) => ({ ...c, [o.chave]: e.target.checked }))}
            />
            <span>
              <b>{o.rotulo[lang]}</b>
              <small>{o.detalhe[lang]}</small>
              <small className="fg-opt">{t.naoObrigatorio}</small>
            </span>
          </label>
        ))}
      </div>

      {Object.keys(erros).length > 0 && <p className="fg-erro">{t.erroCampos}</p>}
      {status === "erro" && <p className="fg-erro">{t.erroEnvio}</p>}

      <button
        type="button" className="btn btn-primary fg-btn"
        onClick={enviar} disabled={status === "enviando"}
      >
        {status === "enviando" ? t.enviando : t.enviar}
      </button>

      <p className="fg-legal">
        {t.legal}{" "}
        <a href={caminho("privacidade", lang)} className="teal">{t.politica}</a>
      </p>
    </div>
  );
}
