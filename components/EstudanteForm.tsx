"use client";

import { useEffect, useRef, useState } from "react";

/**
 * EstudanteForm — formulário de solicitação do código de estudante.
 *
 * Consome POST /api/estudante/solicitar (rota criada em outro fluxo; aqui só chamamos).
 * Estados: idle | enviando | erro | instavel (503) | sucesso.
 * Tracking: lead_estudante_submit (GA4) + Lead (Meta) no submit;
 *           cupom_estudante_emitido (GA4) quando a tela de sucesso aparece.
 */

const CURSOS = [
  { valor: "Medicina", rotulo: "Medicina" },
  { valor: "Nutricao", rotulo: "Nutrição" },
  { valor: "Psicologia", rotulo: "Psicologia" },
  { valor: "Enfermagem", rotulo: "Enfermagem" },
  { valor: "Fisioterapia", rotulo: "Fisioterapia" },
  { valor: "Odontologia", rotulo: "Odontologia" },
  { valor: "Biomedicina", rotulo: "Biomedicina" },
  { valor: "Farmacia", rotulo: "Farmácia" },
  { valor: "EducacaoFisica", rotulo: "Educação Física" },
  { valor: "Outro", rotulo: "Outro" },
];

// ---------- máscaras ----------
function mascaraCPF(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function mascaraWhats(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// UTMs da URL atual (preserva origem da campanha)
function coletarUTMs(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const chaves = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const out: Record<string, string> = {};
  chaves.forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v;
  });
  return out;
}

type Sucesso = {
  codigo: string;
  checkout: string;
  whatsapp_enviado: boolean;
  expira_em?: string;
};

export function EstudanteForm() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [whats, setWhats] = useState("");
  const [email, setEmail] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [curso, setCurso] = useState("");
  const [semestre, setSemestre] = useState("");
  const [conclusao, setConclusao] = useState("");

  const [status, setStatus] = useState<"idle" | "enviando" | "erro" | "instavel" | "sucesso">("idle");
  const [erros, setErros] = useState<string[]>([]);
  const [ok, setOk] = useState<Sucesso | null>(null);
  const sucessoTrackeado = useRef(false);

  // evento: tela de sucesso exibida (uma vez)
  useEffect(() => {
    if (status === "sucesso" && !sucessoTrackeado.current) {
      sucessoTrackeado.current = true;
      (window as any).gtag?.("event", "cupom_estudante_emitido");
      (window as any).dataLayer?.push({ event: "cupom_estudante_emitido" });
    }
  }, [status]);

  const validar = (): string[] => {
    const e: string[] = [];
    if (nome.trim().split(/\s+/).length < 2) e.push("Informe seu nome completo.");
    if (cpf.replace(/\D/g, "").length !== 11) e.push("CPF deve ter 11 dígitos.");
    const wd = whats.replace(/\D/g, "");
    if (wd.length < 10 || wd.length > 11) e.push("WhatsApp deve ter DDD + número.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.push("Informe um e-mail válido.");
    if (!instituicao.trim()) e.push("Informe sua instituição de ensino.");
    if (!curso) e.push("Selecione seu curso.");
    if (!semestre) e.push("Selecione seu semestre atual.");
    if (!/^\d{4}-\d{2}$/.test(conclusao)) e.push("Informe a previsão de conclusão.");
    return e;
  };

  const enviar = async () => {
    const locais = validar();
    if (locais.length) {
      setErros(locais);
      setStatus("erro");
      return;
    }

    setStatus("enviando");
    setErros([]);

    // tracking: submit
    (window as any).gtag?.("event", "lead_estudante_submit");
    (window as any).fbq?.("track", "Lead");
    (window as any).dataLayer?.push({ event: "lead_estudante_submit" });

    const payload = {
      nome: nome.trim(),
      cpf: cpf.replace(/\D/g, ""),
      whatsapp: "55" + whats.replace(/\D/g, ""),
      email: email.trim().toLowerCase(),
      instituicao: instituicao.trim(),
      curso,
      semestre: Number(semestre),
      previsao_conclusao: conclusao,
      utm: coletarUTMs(),
    };

    try {
      const r = await fetch("/api/estudante/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (r.status === 503) {
        setStatus("instavel");
        return;
      }

      let dados: any = null;
      try {
        dados = await r.json();
      } catch {
        dados = null;
      }

      if (r.ok && dados?.ok && dados?.codigo) {
        setOk({
          codigo: String(dados.codigo),
          checkout: String(dados.checkout || ""),
          whatsapp_enviado: Boolean(dados.whatsapp_enviado),
          expira_em: dados.expira_em ? String(dados.expira_em) : undefined,
        });
        setStatus("sucesso");
        return;
      }

      const lista: string[] =
        Array.isArray(dados?.erros) && dados.erros.length
          ? dados.erros.map((x: unknown) => String(x))
          : ["Não foi possível gerar seu código agora. Confira os dados e tente de novo."];
      setErros(lista);
      setStatus("erro");
    } catch {
      setErros(["Falha de conexão. Verifique sua internet e tente de novo."]);
      setStatus("erro");
    }
  };

  // data de expiração legível (defensivo: só exibe se parsear)
  const expiraLegivel = (() => {
    if (!ok?.expira_em) return null;
    const d = new Date(ok.expira_em);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  })();

  // ---------- SUCESSO ----------
  if (status === "sucesso" && ok) {
    return (
      <div className="est-card est-sucesso">
        <span className="overline teal">Código gerado</span>
        <h3 className="est-card-titulo">Seu código de estudante</h3>

        <div className="est-codigo">{ok.codigo}</div>

        <p className="body-sm muted" style={{ marginBottom: "var(--sp5)" }}>
          {ok.whatsapp_enviado
            ? "Enviamos também no seu WhatsApp. Use o código na tela de pagamento pra ativar sua condição."
            : "Guarde este código agora. Não conseguimos enviar no seu WhatsApp, então ele aparece apenas aqui. Use na tela de pagamento pra ativar sua condição."}
          {expiraLegivel ? ` Válido até ${expiraLegivel}.` : ""}
        </p>

        {ok.checkout && (
          <a href={ok.checkout} className="btn btn-primary btn-block est-btn">
            Ativar seu acesso
          </a>
        )}
      </div>
    );
  }

  // ---------- FORMULÁRIO ----------
  return (
    <div className="est-card">
      <span className="overline teal">Solicite seu código</span>
      <h3 className="est-card-titulo">Preencha com seus dados de estudante</h3>
      <p className="body-sm muted" style={{ marginBottom: "var(--sp6)" }}>
        Você recebe um código exclusivo no WhatsApp e ativa sua condição na tela de
        pagamento.
      </p>

      {/* 503: mensagem neutra */}
      {status === "instavel" && (
        <div className="est-erro" role="alert">
          <p>Estamos com uma instabilidade temporária. Tente de novo em alguns minutos.</p>
        </div>
      )}

      {/* erros (todos, do array) */}
      {status === "erro" && erros.length > 0 && (
        <div className="est-erro" role="alert">
          {erros.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}

      <div className="est-form">
        <label className="est-label">
          Nome completo
          <input
            className="est-input"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome como no documento"
            autoComplete="name"
          />
        </label>

        <div className="est-grid2">
          <label className="est-label">
            CPF
            <input
              className="est-input"
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(mascaraCPF(e.target.value))}
              placeholder="000.000.000-00"
              autoComplete="off"
            />
          </label>

          <label className="est-label">
            WhatsApp
            <input
              className="est-input"
              type="tel"
              inputMode="tel"
              value={whats}
              onChange={(e) => setWhats(mascaraWhats(e.target.value))}
              placeholder="(00) 00000-0000"
              autoComplete="tel-national"
            />
          </label>
        </div>

        <label className="est-label">
          E-mail
          <input
            className="est-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Se tiver, use o e-mail da sua instituição"
            autoComplete="email"
          />
        </label>

        <label className="est-label">
          Instituição de ensino
          <input
            className="est-input"
            type="text"
            value={instituicao}
            onChange={(e) => setInstituicao(e.target.value)}
            placeholder="Ex: UFMG"
            autoComplete="organization"
          />
        </label>

        <div className="est-grid2">
          <label className="est-label">
            Curso
            <select
              className="est-input est-select"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            >
              <option value="" disabled>
                Selecione
              </option>
              {CURSOS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="est-label">
            Semestre atual
            <select
              className="est-input est-select"
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
            >
              <option value="" disabled>
                Selecione
              </option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  {s}º semestre
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="est-label">
          Previsão de conclusão
          <input
            className="est-input"
            type="month"
            value={conclusao}
            onChange={(e) => setConclusao(e.target.value)}
            min={new Date().toISOString().slice(0, 7)}
          />
        </label>

        <button
          className="btn btn-primary btn-block est-btn"
          onClick={enviar}
          disabled={status === "enviando"}
        >
          {status === "enviando" ? "Gerando seu código..." : "Gerar meu código de estudante"}
        </button>

        <p className="caption" style={{ textAlign: "center", marginTop: "var(--sp3)" }}>
          Seus dados são usados apenas pra validar sua condição de estudante e emitir o
          código. <a href="/privacidade" className="teal">Política de Privacidade</a>
        </p>
      </div>
    </div>
  );
}
