"use client";

import { useState } from "react";
import { LockupHorizontal, Simbolo } from "@/components/Brand";
import { OPCOES, VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import { caminho } from "@/lib/rotas";

/* =====================================================================
   EM BREVE · lista de espera
   ---------------------------------------------------------------------
   Tom de voz (Brandbook 5.0): direto sem ser frio, acolhedor sem ser
   genérico. Por isso esta página NÃO tem:
     - contagem regressiva       urgência artificial é proibida
     - "vagas limitadas"         escassez fabricada, idem
     - "garanta já o seu"        linguagem de compra, idem
     - "a gente"                 vetado em copy formal da marca

   Captura nome, e-mail e WhatsApp. O motivo da coleta está escrito ao
   lado do botão, em linguagem simples: avisar sobre a abertura. Esse é
   o consentimento para ESSA finalidade, por ação afirmativa (enviar o
   formulário). O compartilhamento com parceiros fica numa caixa
   separada, desmarcada e opcional, conforme lib/consentimento.ts.
   ===================================================================== */

const VEM_AI = [
  { t: "Um texto por dia", d: "Curto, para ler em três minutos." },
  { t: "Uma ação possível", d: "Que cabe no dia que você já tem." },
  { t: "Sem cobrança", d: "Quando você faltar, ele te espera." },
];

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

export function EmBreve() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ddi, setDdi] = useState("55");
  const [whats, setWhats] = useState("");
  const [parceiros, setParceiros] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "enviando" | "ok" | "erro">("idle");

  const brasil = ddi.replace(/\D/g, "") === "55";

  const validar = () => {
    const e: Record<string, string> = {};
    if (nome.trim().split(/\s+/).filter(Boolean).length < 2) e.nome = "Escreva seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Confira o e-mail.";
    const num = whats.replace(/\D/g, "");
    const ok = brasil ? num.length === 10 || num.length === 11 : num.length >= 6 && num.length <= 15;
    if (!ok) e.whats = brasil ? "Informe o número com DDD." : "Confira o número.";
    if (!/^\d{1,4}$/.test(ddi.replace(/\D/g, ""))) e.whats = "Confira o código do país.";
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
          consentimento: {
            versao: VERSAO_CONSENTIMENTO,
            aceitoEm: new Date().toISOString(),
            origem: "em-breve",
            idioma: "pt",
            // enviar o formulário é o consentimento para ser avisado
            marketingProprio: true,
            parceiros,
          },
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setStatus("ok");
      (window as any).fbq?.("track", "Lead", { content_name: "em-breve" });
      (window as any).gtag?.("event", "generate_lead", { form: "em-breve" });
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

  return (
    <main className="eb">
      <div className="eb-glow" aria-hidden="true" />

      <header className="eb-top">
        <a href={caminho("home", "pt")} aria-label="Diariamente">
          <LockupHorizontal altura={26} />
        </a>
      </header>

      <section className="eb-wrap">
        <span className="eb-over">Em breve</span>

        <h1 className="eb-h1">
          Ainda não é hoje.
          <br />
          <span>Mas está perto.</span>
        </h1>

        <p className="eb-lead">
          O Diariamente está sendo preparado com o mesmo cuidado que ele vai pedir de você:
          um passo de cada vez. Deixe seu contato e avisamos no dia em que abrir.
        </p>

        <ul className="eb-vem">
          {VEM_AI.map((v) => (
            <li key={v.t}>
              <b>{v.t}</b>
              <span>{v.d}</span>
            </li>
          ))}
        </ul>

        {status === "ok" ? (
          <div className="eb-ok" role="status">
            <Simbolo size={36} />
            <h2>Anotado.</h2>
            <p>
              Quando o Diariamente abrir, você fica sabendo primeiro, pelo WhatsApp e pelo
              e-mail que deixou aqui. Até lá, sem pressa.
            </p>
          </div>
        ) : (
          <div className="eb-form" onKeyDown={onEnter}>
            <div className="eb-campo">
              <label htmlFor="eb-nome">Nome completo</label>
              <input
                id="eb-nome" type="text" autoComplete="name"
                value={nome} onChange={(e) => setNome(e.target.value)}
                aria-invalid={!!erros.nome} aria-describedby={erros.nome ? "eb-nome-e" : undefined}
              />
              {erros.nome && <small id="eb-nome-e">{erros.nome}</small>}
            </div>

            <div className="eb-campo">
              <label htmlFor="eb-email">E-mail</label>
              <input
                id="eb-email" type="email" inputMode="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!erros.email} aria-describedby={erros.email ? "eb-email-e" : undefined}
              />
              {erros.email && <small id="eb-email-e">{erros.email}</small>}
            </div>

            <div className="eb-campo">
              <label htmlFor="eb-whats">WhatsApp</label>
              <div className="eb-tel">
                <span className="eb-ddi">
                  <span aria-hidden="true">+</span>
                  <input
                    aria-label="Código do país" inputMode="numeric" maxLength={4}
                    value={ddi} onChange={(e) => setDdi(e.target.value.replace(/\D/g, ""))}
                  />
                </span>
                <input
                  id="eb-whats" type="tel" inputMode="numeric" autoComplete="tel-national"
                  placeholder={brasil ? "(00) 00000-0000" : ""}
                  value={whats}
                  onChange={(e) => setWhats(brasil ? mascaraBR(e.target.value) : e.target.value.replace(/[^\d ]/g, ""))}
                  aria-invalid={!!erros.whats} aria-describedby={erros.whats ? "eb-whats-e" : undefined}
                />
              </div>
              {erros.whats && <small id="eb-whats-e">{erros.whats}</small>}
            </div>

            <label className="eb-check">
              <input type="checkbox" checked={parceiros} onChange={(e) => setParceiros(e.target.checked)} />
              <span>
                {PARCEIROS.rotulo.pt} <em>Opcional.</em>
              </span>
            </label>

            {status === "erro" && (
              <p className="eb-erro" role="alert">
                Não foi possível registrar agora. Tente de novo em alguns minutos.
              </p>
            )}

            <button type="button" className="eb-btn" onClick={enviar} disabled={status === "enviando"}>
              {status === "enviando" ? "Um instante" : "Me avise quando abrir"}
            </button>

            <p className="eb-legal">
              Usamos seus dados só para avisar sobre a abertura do Diariamente. Você pode sair
              da lista a qualquer momento. Veja a{" "}
              <a href={caminho("privacidade", "pt")}>Política de Privacidade</a>.
            </p>
          </div>
        )}
      </section>

      <footer className="eb-foot">
        <span className="eb-seq" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i className="hoje" />
        </span>
        <p>Uma prática diária de hábitos e bem-estar.</p>
      </footer>
    </main>
  );
}
