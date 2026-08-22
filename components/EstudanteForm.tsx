"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ESTUDANTE } from "@/config";

/**
 * EstudanteForm — solicitação do código de estudante, em 3 etapas.
 *
 * Contrato de API INALTERADO: POST /api/estudante/solicitar recebe
 * exatamente o mesmo payload de antes (nome, cpf, whatsapp com DDI,
 * email, instituicao, estado, curso, semestre, previsao_conclusao, utm).
 *
 * O que mudou é só a camada de experiência:
 *   1. Você           -> nome, WhatsApp, e-mail
 *   2. Sua faculdade  -> instituição, estado, curso, semestre, conclusão
 *   3. Confirmação    -> CPF + revisão dos dados
 *
 * Decisões de UX:
 *  - erro por campo, ancorado no input (aria-invalid + aria-describedby)
 *  - só avança com a etapa válida, então o erro aparece perto de onde nasceu
 *  - foco vai para o primeiro campo inválido (teclado e leitor de tela)
 *  - rascunho em sessionStorage, SEM CPF (dado sensível não persiste)
 *  - inputs de 16px: iOS não aplica zoom automático ao focar
 *  - o código nunca aparece na tela: entrega só por WhatsApp
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

// UFs no MESMO formato do campo "Estado e UF" do RD (cf_estado_e_uf).
const UFS = [
  "Acre (AC)", "Alagoas (AL)", "Amapá (AP)", "Amazonas (AM)", "Bahia (BA)",
  "Ceará (CE)", "Distrito Federal (DF)", "Espírito Santo (ES)", "Goiás (GO)",
  "Maranhão (MA)", "Mato Grosso (MT)", "Mato Grosso do Sul (MS)", "Minas Gerais (MG)",
  "Pará (PA)", "Paraíba (PB)", "Paraná (PR)", "Pernambuco (PE)", "Piauí (PI)",
  "Rio de Janeiro (RJ)", "Rio Grande do Norte (RN)", "Rio Grande do Sul (RS)",
  "Rondônia (RO)", "Roraima (RR)", "Santa Catarina (SC)", "São Paulo (SP)",
  "Sergipe (SE)", "Tocantins (TO)",
];

const ETAPAS = ["Você", "Sua faculdade", "Confirmação"];
const RASCUNHO = "ed_estudante_v1";

// ------------------------------ máscaras ------------------------------
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

// Mesma regra de dígitos verificadores da API: evita ida e volta desnecessária.
function cpfValido(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const pares: ReadonlyArray<readonly [number, number]> = [
    [9, 10],
    [10, 11],
  ];
  for (const [fim, pos] of pares) {
    let soma = 0;
    for (let i = 0; i < fim; i++) soma += parseInt(cpf[i], 10) * (pos - i);
    let d = (soma * 10) % 11;
    if (d === 10) d = 0;
    if (d !== parseInt(cpf[fim], 10)) return false;
  }
  return true;
}

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

// ------------------------------ modelo ------------------------------
type Campo =
  | "nome"
  | "whats"
  | "email"
  | "instituicao"
  | "estado"
  | "curso"
  | "semestre"
  | "conclusao"
  | "cpf";

type Dados = Record<Campo, string>;

const VAZIO: Dados = {
  nome: "",
  whats: "",
  email: "",
  instituicao: "",
  estado: "",
  curso: "",
  semestre: "",
  conclusao: "",
  cpf: "",
};

const REGRAS: Record<Campo, (v: string) => string> = {
  nome: (v) =>
    v.trim().split(/\s+/).filter(Boolean).length < 2 ? "Escreva seu nome completo." : "",
  whats: (v) => {
    const d = v.replace(/\D/g, "");
    if (!d) return "Informe seu WhatsApp com DDD.";
    return d.length < 10 || d.length > 11 ? "Número incompleto. Confira o DDD." : "";
  },
  email: (v) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "Confira o e-mail digitado." : "",
  instituicao: (v) => (v.trim().length < 2 ? "Informe sua instituição de ensino." : ""),
  estado: (v) => (!v ? "Selecione seu estado." : ""),
  curso: (v) => (!v ? "Selecione seu curso." : ""),
  semestre: (v) => (!v ? "Selecione seu semestre." : ""),
  conclusao: (v) => (!/^\d{4}-\d{2}$/.test(v) ? "Informe mês e ano de conclusão." : ""),
  cpf: (v) => {
    const d = v.replace(/\D/g, "");
    if (d.length !== 11) return "O CPF precisa ter 11 dígitos.";
    return cpfValido(d) ? "" : "Esse CPF não confere. Confira os números.";
  },
};

const CAMPOS_POR_ETAPA: Campo[][] = [
  ["nome", "whats", "email"],
  ["instituicao", "estado", "curso", "semestre", "conclusao"],
  ["cpf"],
];

// ------------------------------ wrapper de campo ------------------------------
// Declarado FORA do componente: se ficasse dentro, o React remontaria o input
// a cada tecla digitada e o foco seria perdido.
function Field({
  campo,
  rotulo,
  dica,
  erro,
  children,
}: {
  campo: Campo;
  rotulo: string;
  dica?: string;
  erro?: string;
  children: (a11y: {
    id: string;
    name: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const temErro = Boolean(erro);
  const idErro = temErro ? `${campo}-erro` : undefined;
  const idDica = dica && !temErro ? `${campo}-dica` : undefined;
  const descrito = [idErro, idDica].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ed-field">
      <label className="ed-label" htmlFor={campo}>
        {rotulo}
      </label>
      {children({
        id: campo,
        name: campo,
        "aria-invalid": temErro,
        "aria-describedby": descrito,
      })}
      {temErro && (
        <span className="ed-msg-err" id={idErro}>
          {erro}
        </span>
      )}
      {!temErro && dica && (
        <span className="ed-msg" id={idDica}>
          {dica}
        </span>
      )}
    </div>
  );
}

// ------------------------------ componente ------------------------------
export function EstudanteForm() {
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [etapa, setEtapa] = useState(0);
  const [status, setStatus] = useState<"idle" | "enviando" | "erro" | "instavel">("idle");
  const [errosServidor, setErrosServidor] = useState<string[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  const etapasVistas = useRef<Set<number>>(new Set([0]));
  const router = useRouter();

  const minMes = useMemo(() => new Date().toISOString().slice(0, 7), []);

  // rascunho: recupera (sem CPF)
  useEffect(() => {
    try {
      const bruto = sessionStorage.getItem(RASCUNHO);
      if (bruto) setDados((d) => ({ ...d, ...JSON.parse(bruto), cpf: "" }));
    } catch {
      /* rascunho é conveniência: nunca deve quebrar a página */
    }
    (window as any).gtag?.("event", "view_form_estudante");
    (window as any).dataLayer?.push({ event: "ViewContent", content_name: "form_estudante" });
  }, []);

  // rascunho: salva (sem CPF)
  useEffect(() => {
    try {
      const { cpf, ...semCpf } = dados;
      sessionStorage.setItem(RASCUNHO, JSON.stringify(semCpf));
    } catch {
      /* navegação privada pode bloquear: seguimos sem rascunho */
    }
  }, [dados]);

  const set = (campo: Campo, valor: string) => {
    setDados((d) => ({ ...d, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: "" }));
  };

  const borrar = (campo: Campo) => {
    const msg = REGRAS[campo](dados[campo]);
    if (msg) setErros((e) => ({ ...e, [campo]: msg }));
  };

  const focar = (campo: Campo) => {
    window.requestAnimationFrame(() => {
      cardRef.current?.querySelector<HTMLElement>(`[name="${campo}"]`)?.focus();
    });
  };

  const validarEtapa = (i: number): boolean => {
    const campos = CAMPOS_POR_ETAPA[i];
    const novos: Partial<Record<Campo, string>> = {};
    campos.forEach((c) => {
      const msg = REGRAS[c](dados[c]);
      if (msg) novos[c] = msg;
    });
    setErros((e) => ({ ...e, ...novos }));

    const primeiro = campos.find((c) => novos[c]);
    if (primeiro) {
      focar(primeiro);
      return false;
    }
    return true;
  };

  const avancar = () => {
    if (!validarEtapa(etapa)) return;
    const proxima = etapa + 1;
    setEtapa(proxima);
    if (!etapasVistas.current.has(proxima)) {
      etapasVistas.current.add(proxima);
      (window as any).gtag?.("event", "form_estudante_etapa", { etapa: proxima + 1 });
      (window as any).dataLayer?.push({ event: "FormStep", step: proxima + 1 });
    }
    focar(CAMPOS_POR_ETAPA[proxima][0]);
  };

  const voltar = () => {
    const anterior = Math.max(0, etapa - 1);
    setEtapa(anterior);
    focar(CAMPOS_POR_ETAPA[anterior][0]);
  };

  const enviar = async () => {
    // trava final: nenhuma etapa pode ter ficado inválida
    for (let i = 0; i < CAMPOS_POR_ETAPA.length; i++) {
      if (!validarEtapa(i)) {
        setEtapa(i);
        return;
      }
    }

    setStatus("enviando");
    setErrosServidor([]);

    // Tentativa de envio. O Lead do Meta NAO sai aqui: sai so quando o
    // servidor confirma. Disparar no submit contaria quem levou erro 400
    // como lead, inflando o volume e distorcendo o CPL.
    (window as any).gtag?.("event", "lead_estudante_submit");
    (window as any).dataLayer?.push({ event: "lead_estudante_submit" });

    const payload = {
      nome: dados.nome.trim(),
      cpf: dados.cpf.replace(/\D/g, ""),
      whatsapp: "55" + dados.whats.replace(/\D/g, ""),
      email: dados.email.trim().toLowerCase(),
      instituicao: dados.instituicao.trim(),
      estado: dados.estado,
      curso: dados.curso,
      semestre: Number(dados.semestre),
      previsao_conclusao: dados.conclusao,
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

      let corpo: any = null;
      try {
        corpo = await r.json();
      } catch {
        corpo = null;
      }

      if (r.ok && corpo?.ok) {
        // Lead confirmado pelo servidor: agora sim vale como conversao.
        (window as any).fbq?.("track", "Lead", { content_name: "estudante" });
        (window as any).gtag?.("event", "cupom_estudante_emitido");
        (window as any).dataLayer?.push({ event: "cupom_estudante_emitido" });
        try {
          sessionStorage.removeItem(RASCUNHO);
        } catch {
          /* sem rascunho para limpar */
        }
        router.push("/estudante/solicitacaorecebida");
        return;
      }

      setErrosServidor(
        Array.isArray(corpo?.erros) && corpo.erros.length
          ? corpo.erros.map((x: unknown) => String(x))
          : [
              "Não foi possível processar sua solicitação agora. Confira os dados e tente de novo.",
            ]
      );
      setStatus("erro");
    } catch {
      setErrosServidor(["Falha de conexão. Confira sua internet e tente de novo."]);
      setStatus("erro");
    }
  };

  // Enter avança de etapa em vez de submeter cedo demais.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (etapa < ETAPAS.length - 1) avancar();
    else void enviar();
  };

  const pct = ((etapa + 1) / ETAPAS.length) * 100;
  const enviando = status === "enviando";
  const rotuloCurso = CURSOS.find((c) => c.valor === dados.curso)?.rotulo || "";
  const conclusaoLegivel = /^\d{4}-\d{2}$/.test(dados.conclusao)
    ? `${dados.conclusao.slice(5)}/${dados.conclusao.slice(0, 4)}`
    : "";

  return (
    <div className="ed-card-form" ref={cardRef} onKeyDown={onKeyDown}>
      <span className="ed-overline" style={{ marginBottom: 0 }}>
        Solicite seu código
      </span>
      <h2 className="ed-form-h">Sua condição de estudante</h2>
      <p className="ed-form-sub">
        Leva cerca de um minuto. O código chega no seu WhatsApp e é aplicado no campo de
        cupom da tela de pagamento.
      </p>

      <div className="ed-prog">
        <div className="ed-prog-bar">
          <div
            className="ed-prog-fill"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={etapa + 1}
            aria-valuemin={1}
            aria-valuemax={ETAPAS.length}
            aria-label={`Etapa ${etapa + 1} de ${ETAPAS.length}`}
          />
        </div>
        <span className="ed-prog-lb">
          {etapa + 1}/{ETAPAS.length} · {ETAPAS[etapa]}
        </span>
      </div>

      <div aria-live="polite">
        {status === "instavel" && (
          <div className="ed-alert is-warn" role="status">
            <p>
              Estamos com uma instabilidade momentânea na emissão de códigos. Tente de novo
              em alguns minutos: seus dados continuam preenchidos.
            </p>
          </div>
        )}
        {status === "erro" && errosServidor.length > 0 && (
          <div className="ed-alert" role="alert">
            {errosServidor.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- ETAPA 1 · VOCÊ ---------------- */}
      {etapa === 0 && (
        <div className="ed-fieldset">
          <Field campo="nome" rotulo="Nome completo" erro={erros.nome}>
            {(a) => (
              <input
                {...a}
                className="ed-input"
                type="text"
                autoComplete="name"
                placeholder="Como está no seu documento"
                value={dados.nome}
                onChange={(e) => set("nome", e.target.value)}
                onBlur={() => borrar("nome")}
              />
            )}
          </Field>

          <Field
            campo="whats"
            rotulo="WhatsApp"
            dica="É neste número que o código vai chegar."
            erro={erros.whats}
          >
            {(a) => (
              <input
                {...a}
                className="ed-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="(00) 00000-0000"
                value={dados.whats}
                onChange={(e) => set("whats", mascaraWhats(e.target.value))}
                onBlur={() => borrar("whats")}
              />
            )}
          </Field>

          <Field
            campo="email"
            rotulo="E-mail"
            dica="Se tiver e-mail da instituição, use ele: agiliza a validação."
            erro={erros.email}
          >
            {(a) => (
              <input
                {...a}
                className="ed-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@instituicao.edu.br"
                value={dados.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => borrar("email")}
              />
            )}
          </Field>

          <div className="ed-nav">
            <button
              type="button"
              className="ed-btn ed-btn-primary ed-btn-block"
              onClick={avancar}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ---------------- ETAPA 2 · FACULDADE ---------------- */}
      {etapa === 1 && (
        <div className="ed-fieldset">
          <div className="ed-row2">
            <Field campo="instituicao" rotulo="Instituição de ensino" erro={erros.instituicao}>
              {(a) => (
                <input
                  {...a}
                  className="ed-input"
                  type="text"
                  autoComplete="organization"
                  placeholder="Ex: UFMG"
                  value={dados.instituicao}
                  onChange={(e) => set("instituicao", e.target.value)}
                  onBlur={() => borrar("instituicao")}
                />
              )}
            </Field>

            <Field campo="estado" rotulo="Estado" erro={erros.estado}>
              {(a) => (
                <select
                  {...a}
                  className="ed-input ed-select"
                  value={dados.estado}
                  onChange={(e) => set("estado", e.target.value)}
                  onBlur={() => borrar("estado")}
                >
                  <option value="">Selecione</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <div className="ed-row2">
            <Field campo="curso" rotulo="Curso" erro={erros.curso}>
              {(a) => (
                <select
                  {...a}
                  className="ed-input ed-select"
                  value={dados.curso}
                  onChange={(e) => set("curso", e.target.value)}
                  onBlur={() => borrar("curso")}
                >
                  <option value="">Selecione</option>
                  {CURSOS.map((c) => (
                    <option key={c.valor} value={c.valor}>
                      {c.rotulo}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field campo="semestre" rotulo="Semestre atual" erro={erros.semestre}>
              {(a) => (
                <select
                  {...a}
                  className="ed-input ed-select"
                  value={dados.semestre}
                  onChange={(e) => set("semestre", e.target.value)}
                  onBlur={() => borrar("semestre")}
                >
                  <option value="">Selecione</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={String(s)}>
                      {s}º semestre
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <Field
            campo="conclusao"
            rotulo="Previsão de conclusão"
            dica="Mês e ano previstos para a sua formatura."
            erro={erros.conclusao}
          >
            {(a) => (
              <input
                {...a}
                className="ed-input"
                type="month"
                min={minMes}
                value={dados.conclusao}
                onChange={(e) => set("conclusao", e.target.value)}
                onBlur={() => borrar("conclusao")}
              />
            )}
          </Field>

          <div className="ed-nav">
            <button type="button" className="ed-back" onClick={voltar}>
              Voltar
            </button>
            <button
              type="button"
              className="ed-btn ed-btn-primary ed-btn-block"
              onClick={avancar}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ---------------- ETAPA 3 · CONFIRMAÇÃO ---------------- */}
      {etapa === 2 && (
        <div className="ed-fieldset">
          <Field
            campo="cpf"
            rotulo="CPF"
            dica="Usado só para garantir um código por pessoa."
            erro={erros.cpf}
          >
            {(a) => (
              <input
                {...a}
                className="ed-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={dados.cpf}
                onChange={(e) => set("cpf", mascaraCPF(e.target.value))}
                onBlur={() => borrar("cpf")}
              />
            )}
          </Field>

          <div className="ed-review">
            <div className="ed-review-l">
              <span className="ed-review-k">Nome</span>
              <span className="ed-review-v">{dados.nome}</span>
            </div>
            <div className="ed-review-l">
              <span className="ed-review-k">WhatsApp</span>
              <span className="ed-review-v">{dados.whats}</span>
            </div>
            <div className="ed-review-l">
              <span className="ed-review-k">E-mail</span>
              <span className="ed-review-v">{dados.email}</span>
            </div>
            <div className="ed-review-l">
              <span className="ed-review-k">Curso</span>
              <span className="ed-review-v">
                {rotuloCurso}
                {dados.semestre ? ` · ${dados.semestre}º semestre` : ""}
              </span>
            </div>
            <div className="ed-review-l">
              <span className="ed-review-k">Instituição</span>
              <span className="ed-review-v">
                {dados.instituicao}
                {dados.estado ? ` · ${dados.estado}` : ""}
              </span>
            </div>
            {conclusaoLegivel && (
              <div className="ed-review-l">
                <span className="ed-review-k">Conclusão</span>
                <span className="ed-review-v">{conclusaoLegivel}</span>
              </div>
            )}
          </div>

          <div className="ed-nav">
            <button type="button" className="ed-back" onClick={voltar} disabled={enviando}>
              Voltar
            </button>
            <button
              type="button"
              className="ed-btn ed-btn-primary ed-btn-block"
              onClick={enviar}
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <span className="ed-spin" aria-hidden="true" />
                  Emitindo seu código
                </>
              ) : (
                "Receber meu código no WhatsApp"
              )}
            </button>
          </div>

          <p className="ed-legal">
            O código é pessoal e vale por {ESTUDANTE.validadeHoras} horas. Seus dados são
            usados apenas para validar sua condição de estudante e emitir o código.{" "}
            <a href="/privacidade">Política de Privacidade</a>
          </p>
        </div>
      )}
    </div>
  );
}
