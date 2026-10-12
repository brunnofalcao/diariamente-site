"use client";

import { useState } from "react";
import { Simbolo } from "@/components/Brand";
import { OPCOES, VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import { caminho } from "@/lib/rotas";
import { MERCADOS, type Mercado } from "@/config/pricing";

/* =====================================================================
   FORMULÁRIO DA LISTA DE ESPERA · um só, para a página "em breve" e para
   o bloco de oferta dos mercados ainda sem venda
   ---------------------------------------------------------------------
   Captura nome, e-mail e WhatsApp e manda junto o mercado e o idioma da
   página; o país sai do cabeçalho da Vercel, no servidor
   (app/api/lista-espera/route.js). O motivo da coleta está escrito ao
   lado do botão: avisar sobre a abertura. Esse é o consentimento para
   ESSA finalidade, por ação afirmativa (enviar o formulário). O
   compartilhamento com parceiros fica numa caixa separada, desmarcada e
   opcional, conforme lib/consentimento.ts.
   ===================================================================== */

const T = {
  pt: {
    nome: "Nome completo", email: "E-mail", whats: "WhatsApp", ddi: "Código do país",
    eNome: "Escreva seu nome completo.", eEmail: "Confira o e-mail.",
    eWhatsBR: "Informe o número com DDD.", eWhats: "Confira o número.", eDdi: "Confira o código do país.",
    opcional: "Opcional.",
    erro: "Não foi possível registrar agora. Tente de novo em alguns minutos.",
    btn: "Me avise quando abrir", enviando: "Um instante",
    legal1: "Usamos seus dados só para avisar sobre a abertura do Diariamente. Você pode sair da lista a qualquer momento. Veja a",
    politica: "Política de Privacidade",
    okT: "Anotado.",
    okD: "Quando o Diariamente abrir, você fica sabendo primeiro, pelo WhatsApp e pelo e-mail que deixou aqui. Até lá, sem pressa.",
  },
  // Português de Portugal: tratamento por tu, como o dicionário pt-PT da home.
  ptPT: {
    nome: "Nome completo", email: "E-mail", whats: "WhatsApp", ddi: "Código do país",
    eNome: "Escreve o teu nome completo.", eEmail: "Confirma o e-mail.",
    eWhatsBR: "Indica o número com DDD.", eWhats: "Confirma o número.", eDdi: "Confirma o código do país.",
    opcional: "Opcional.",
    erro: "Não foi possível registar agora. Tenta de novo dentro de alguns minutos.",
    btn: "Avisem-me quando abrir", enviando: "Um instante",
    legal1: "Usamos os teus dados só para avisar sobre a abertura do Diariamente. Podes sair da lista a qualquer momento. Consulta a",
    politica: "Política de Privacidade",
    okT: "Anotado.",
    okD: "Quando o Diariamente abrir em Portugal, ficas a saber primeiro, pelo WhatsApp e pelo e-mail que deixaste aqui. Até lá, sem pressa.",
  },
  es: {
    nome: "Nombre completo", email: "Correo electrónico", whats: "WhatsApp", ddi: "Código de país",
    eNome: "Escribe tu nombre completo.", eEmail: "Revisa el correo.",
    eWhatsBR: "Incluye el código de área.", eWhats: "Revisa el número.", eDdi: "Revisa el código de país.",
    opcional: "Opcional.",
    erro: "No pudimos registrar ahora. Inténtalo de nuevo en unos minutos.",
    btn: "Avísame cuando abra", enviando: "Un instante",
    legal1: "Usamos tus datos solo para avisarte de la apertura de Diariamente. Puedes salir de la lista en cualquier momento. Consulta la",
    politica: "Política de Privacidad",
    okT: "Anotado.",
    okD: "Cuando Diariamente abra, serás de las primeras personas en saberlo, por WhatsApp y por el correo que dejaste aquí. Hasta entonces, sin prisa.",
  },
};

const PARCEIROS = OPCOES.find((o) => o.chave === "parceiros")!;

function mascaraBR(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function utms(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v;
  });
  return out;
}

export function ListaEsperaForm({
  mercado,
  origem,
  embutido = false,
  botao,
}: {
  mercado: Mercado;
  /** "em-breve" (página inteira) ou "oferta" (bloco de oferta). */
  origem: "em-breve" | "oferta";
  /** Dentro do bloco de oferta: sem o cartão próprio em volta. */
  embutido?: boolean;
  /** Texto do botão do mercado (config/pricing.ts). */
  botao?: string;
}) {
  const o = MERCADOS[mercado];
  const lang = o.idioma;
  const t = o.locale === "pt-PT" ? T.ptPT : T[lang];
  const sufixo = embutido ? "-oferta" : "";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  // Sem padrão onde o público está espalhado por vários países: um DDI
  // pré-preenchido errado é pior que vazio.
  const [ddi, setDdi] = useState(o.ddi);
  const [whats, setWhats] = useState("");
  const [parceiros, setParceiros] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "enviando" | "ok" | "erro">("idle");

  const brasil = ddi.replace(/\D/g, "") === "55";

  const validar = () => {
    const e: Record<string, string> = {};
    if (nome.trim().split(/\s+/).filter(Boolean).length < 2) e.nome = t.eNome;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t.eEmail;
    const num = whats.replace(/\D/g, "");
    const ok = brasil ? num.length === 10 || num.length === 11 : num.length >= 6 && num.length <= 15;
    if (!ok) e.whats = brasil ? t.eWhatsBR : t.eWhats;
    if (!/^\d{1,4}$/.test(ddi.replace(/\D/g, ""))) e.whats = t.eDdi;
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const enviar = async () => {
    if (!validar()) return;
    setStatus("enviando");
    try {
      const r = await fetch("/api/lista-espera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: ddi.replace(/\D/g, "") + whats.replace(/\D/g, ""),
          utm: utms(),
          mercado,
          idioma: lang,
          origem,
          consentimento: {
            versao: VERSAO_CONSENTIMENTO,
            aceitoEm: new Date().toISOString(),
            origem,
            idioma: lang,
            // enviar o formulário é o consentimento para ser avisado
            marketingProprio: true,
            parceiros,
          },
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setStatus("ok");
      // fbq e gtag só existem depois do Aceitar no aviso de cookies.
      (window as any).fbq?.("track", "Lead", { content_name: `${origem}-${mercado}` });
      (window as any).gtag?.("event", "generate_lead", { form: origem, mercado });
    } catch {
      setStatus("erro");
    }
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enviar();
    }
  };

  if (status === "ok") {
    return (
      <div className={`eb-ok${embutido ? " eb-embutido" : ""}`} role="status">
        <Simbolo size={36} />
        <h2>{t.okT}</h2>
        <p>{t.okD}</p>
      </div>
    );
  }

  return (
    <div className={`eb-form${embutido ? " eb-embutido" : ""}`} onKeyDown={onEnter}>
      <div className="eb-campo">
        <label htmlFor={`eb-nome${sufixo}`}>{t.nome}</label>
        <input
          id={`eb-nome${sufixo}`} type="text" autoComplete="name"
          value={nome} onChange={(e) => setNome(e.target.value)}
          aria-invalid={!!erros.nome} aria-describedby={erros.nome ? `eb-nome-e${sufixo}` : undefined}
        />
        {erros.nome && <small id={`eb-nome-e${sufixo}`}>{erros.nome}</small>}
      </div>

      <div className="eb-campo">
        <label htmlFor={`eb-email${sufixo}`}>{t.email}</label>
        <input
          id={`eb-email${sufixo}`} type="email" inputMode="email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!erros.email} aria-describedby={erros.email ? `eb-email-e${sufixo}` : undefined}
        />
        {erros.email && <small id={`eb-email-e${sufixo}`}>{erros.email}</small>}
      </div>

      <div className="eb-campo">
        <label htmlFor={`eb-whats${sufixo}`}>{t.whats}</label>
        <div className="eb-tel">
          <span className="eb-ddi">
            <span aria-hidden="true">+</span>
            <input
              aria-label={t.ddi} inputMode="numeric" maxLength={4}
              value={ddi} onChange={(e) => setDdi(e.target.value.replace(/\D/g, ""))}
            />
          </span>
          <input
            id={`eb-whats${sufixo}`} type="tel" inputMode="numeric" autoComplete="tel-national"
            placeholder={brasil ? "(00) 00000-0000" : ""}
            value={whats}
            onChange={(e) => setWhats(brasil ? mascaraBR(e.target.value) : e.target.value.replace(/[^\d ]/g, ""))}
            aria-invalid={!!erros.whats} aria-describedby={erros.whats ? `eb-whats-e${sufixo}` : undefined}
          />
        </div>
        {erros.whats && <small id={`eb-whats-e${sufixo}`}>{erros.whats}</small>}
      </div>

      <label className="eb-check">
        <input type="checkbox" checked={parceiros} onChange={(e) => setParceiros(e.target.checked)} />
        <span>
          {PARCEIROS.rotulo[lang]} <em>{t.opcional}</em>
        </span>
      </label>

      {status === "erro" && (
        <p className="eb-erro" role="alert">
          {t.erro}
        </p>
      )}

      <button type="button" className="eb-btn" onClick={enviar} disabled={status === "enviando"}>
        {status === "enviando" ? t.enviando : botao ?? t.btn}
      </button>

      <p className="eb-legal">
        {t.legal1}{" "}
        <a href={caminho("privacidade", lang)}>{t.politica}</a>.
      </p>
    </div>
  );
}
