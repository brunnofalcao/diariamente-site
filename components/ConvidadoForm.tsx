"use client";

import { useEffect, useRef, useState } from "react";
import {
  API_DO_APP,
  PAISES_DO_WHATSAPP,
  EMAIL_RE,
  normalizarCupom,
  montarWhatsapp,
  mensagemDoErro,
  erroDoCupom,
  mesesDeAcesso,
} from "@/lib/convidado.mjs";

/**
 * ConvidadoForm: cadastro gratuito com cupom (www.diariamente.app/convidado).
 *
 * Campos obrigatórios: nome, e-mail, WhatsApp, senha, cupom e o aceite dos Termos.
 * O cupom é conferido no app ao sair do campo (GET /api/convite/:cupom) e de novo no
 * cadastro (POST /api/convite/:cupom/cadastro, que reserva a vaga). Sem cupom válido,
 * nada é criado. Deu certo: a tela diz para baixar o app; a confirmação com os botões das
 * lojas sai no WhatsApp (modelo diariamente_convite_conta_criada) e por e-mail.
 *
 * O token que o app devolve não fica no site: a pessoa entra no app com o e-mail e a senha.
 */

type Campo = "nome" | "email" | "whats" | "senha" | "cupom" | "aceite";
type Erros = Partial<Record<Campo, string>>;
type EstadoCupom =
  | { tipo: "vazio" }
  | { tipo: "conferindo" }
  | { tipo: "valido"; codigo: string; nome: string; meses: number; vagas: number }
  | { tipo: "invalido"; mensagem: string };

async function lerJson(r: Response) {
  try {
    return await r.json();
  } catch {
    return {};
  }
}

export function ConvidadoForm({ cupomInicial = "" }: { cupomInicial?: string }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ddi, setDdi] = useState("55");
  const [whats, setWhats] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [cupom, setCupom] = useState(cupomInicial);
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [estadoCupom, setEstadoCupom] = useState<EstadoCupom>({ tipo: "vazio" });
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [pronto, setPronto] = useState<{ email: string } | null>(null);
  const seq = useRef(0);
  const topo = useRef<HTMLDivElement>(null);

  const pais = PAISES_DO_WHATSAPP.find((p) => p.ddi === ddi) || PAISES_DO_WHATSAPP[0];

  async function conferirCupom(valor: string): Promise<EstadoCupom> {
    const codigo = normalizarCupom(valor);
    const n = ++seq.current;
    if (!codigo) {
      const e: EstadoCupom = valor.trim() ? { tipo: "invalido", mensagem: mensagemDoErro("CONVITE_INVALIDO") } : { tipo: "vazio" };
      setEstadoCupom(e);
      return e;
    }
    setEstadoCupom({ tipo: "conferindo" });
    let e: EstadoCupom;
    try {
      const r = await fetch(`${API_DO_APP}/api/convite/${encodeURIComponent(codigo)}`, { cache: "no-store" });
      const d = await lerJson(r);
      e = r.ok && d.ok
        ? { tipo: "valido", codigo, nome: d.nome || codigo, meses: mesesDeAcesso(d.dias_acesso), vagas: Number(d.vagas_restantes) || 0 }
        : { tipo: "invalido", mensagem: mensagemDoErro(d.code) };
    } catch {
      e = { tipo: "invalido", mensagem: mensagemDoErro("ERRO_INTERNO") };
    }
    if (n === seq.current) setEstadoCupom(e);
    return e;
  }

  // Cupom que veio no endereço (?cupom=): confere ao abrir.
  useEffect(() => {
    if (cupomInicial) conferirCupom(cupomInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validar(): { erros: Erros; telefone: string } {
    const e: Erros = {};
    if (!/\p{L}{2,}/u.test(nome)) e.nome = "Digite o seu nome.";
    if (!EMAIL_RE.test(email.trim())) e.email = "Confira o e-mail.";
    const telefone = montarWhatsapp(ddi, whats);
    if (!whats.trim()) e.whats = "Digite o seu WhatsApp.";
    else if (!telefone) e.whats = ddi === "55" ? "Use DDD + número (ex.: 62 99999-9999)." : "Confira o número, sem o código do país.";
    if (senha.length < 6) e.senha = "A senha precisa ter pelo menos 6 caracteres.";
    if (!normalizarCupom(cupom)) e.cupom = "Digite o cupom.";
    if (!aceite) e.aceite = "Para criar a conta, aceite os Termos de uso e a Política de privacidade.";
    return { erros: e, telefone };
  }

  function focarPrimeiroErro(e: Erros) {
    const ordem: Campo[] = ["nome", "email", "whats", "senha", "cupom", "aceite"];
    const primeiro = ordem.find((c) => e[c]);
    if (!primeiro) return;
    const el = document.getElementById(`cv-${primeiro}`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      (el as HTMLElement).focus({ preventScroll: true });
    }
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (enviando) return;
    setErroGeral("");
    const { erros: e, telefone } = validar();
    // O cupom é conferido de novo aqui: o campo pode ter mudado sem sair dele.
    let c = estadoCupom;
    if (!e.cupom && (c.tipo !== "valido" || c.codigo !== normalizarCupom(cupom))) c = await conferirCupom(cupom);
    if (!e.cupom && c.tipo === "invalido") e.cupom = c.mensagem;
    setErros(e);
    if (Object.keys(e).length) {
      focarPrimeiroErro(e);
      return;
    }
    if (c.tipo !== "valido") return;
    setEnviando(true);
    try {
      const r = await fetch(`${API_DO_APP}/api/convite/${encodeURIComponent(c.codigo)}/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), telefone, ddi, senha, aceite: true, locale: "pt-BR" }),
      });
      const d = await lerJson(r);
      if (r.ok && d.token) {
        setPronto({ email: email.trim().toLowerCase() });
        setTimeout(() => topo.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 30);
        return;
      }
      const codigo = String(d.code || "ERRO_INTERNO");
      if (erroDoCupom(codigo)) {
        setEstadoCupom({ tipo: "invalido", mensagem: mensagemDoErro(codigo) });
        setErros({ cupom: mensagemDoErro(codigo) });
        focarPrimeiroErro({ cupom: "x" });
      } else if (codigo === "CONVITE_TELEFONE_INVALIDO") {
        setErros({ whats: mensagemDoErro(codigo) });
        focarPrimeiroErro({ whats: "x" });
      } else if (codigo === "CONVITE_EMAIL_INVALIDO" || codigo === "CONVITE_EMAIL_JA_CADASTRADO") {
        setErros({ email: mensagemDoErro(codigo) });
        focarPrimeiroErro({ email: "x" });
      } else {
        setErroGeral(mensagemDoErro(codigo));
      }
    } catch {
      setErroGeral("Sem conexão com o servidor. Confira a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  if (pronto) {
    return (
      <div className="ed-card-form" ref={topo}>
        <div className="ed-ok" style={{ padding: 0 }}>
          <span className="ed-overline">Conta criada</span>
          <h2 className="ed-form-h" style={{ marginTop: 8 }}>Agora é só baixar o app.</h2>
          <p className="ed-lead" style={{ margin: "10px auto 0", fontSize: 16 }}>
            Enviamos no seu WhatsApp a confirmação com os botões para baixar o app. Depois de instalar, entre com o e-mail{" "}
            <b style={{ color: "var(--n-100)", wordBreak: "break-all" }}>{pronto.email}</b> e a senha que você criou.
          </p>
          <div className="ed-actions" style={{ justifyContent: "center", marginTop: 24 }}>
            <a href="/baixar" className="ed-btn ed-btn-primary">Baixar o app</a>
          </div>
          <p className="ed-legal" style={{ marginTop: 18 }}>
            A partir de amanhã, o app manda a sua provocação do dia para o seu WhatsApp, às 7h.
          </p>
        </div>
      </div>
    );
  }

  const cupomOk = estadoCupom.tipo === "valido";
  return (
    <form className="ed-card-form" onSubmit={enviar} noValidate ref={topo as unknown as React.RefObject<HTMLFormElement>}>
      <h2 className="ed-form-h">Crie sua conta de convidado</h2>
      <p className="ed-form-sub">Todos os campos são obrigatórios. Sem custo.</p>

      {erroGeral && (
        <div className="ed-alert" role="alert">
          <p>{erroGeral}</p>
        </div>
      )}

      <div className="ed-fieldset">
        <div className="ed-field">
          <label className="ed-label" htmlFor="cv-cupom">Cupom</label>
          <input
            id="cv-cupom"
            className="ed-input"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Digite o cupom do convite"
            value={cupom}
            aria-invalid={Boolean(erros.cupom)}
            aria-describedby="cv-cupom-msg"
            onChange={(e) => {
              setCupom(e.target.value);
              if (estadoCupom.tipo !== "vazio") setEstadoCupom({ tipo: "vazio" });
              if (erros.cupom) setErros({ ...erros, cupom: undefined });
            }}
            onBlur={() => conferirCupom(cupom)}
          />
          <span
            id="cv-cupom-msg"
            className={erros.cupom || estadoCupom.tipo === "invalido" ? "ed-msg-err" : "ed-msg"}
            style={cupomOk ? { color: "var(--p-500)", fontWeight: 600 } : undefined}
            aria-live="polite"
          >
            {erros.cupom
              ? erros.cupom
              : estadoCupom.tipo === "conferindo"
                ? "Conferindo o cupom..."
                : estadoCupom.tipo === "valido"
                  ? `Cupom válido: ${estadoCupom.nome}, ${estadoCupom.meses} meses de acesso.`
                  : estadoCupom.tipo === "invalido"
                    ? estadoCupom.mensagem
                    : "O cupom é obrigatório. Só cupons válidos criam a conta."}
          </span>
        </div>

        <div className="ed-field">
          <label className="ed-label" htmlFor="cv-nome">Nome</label>
          <input id="cv-nome" className="ed-input" type="text" autoComplete="name" placeholder="Como quer ser chamado"
            value={nome} maxLength={80} aria-invalid={Boolean(erros.nome)}
            onChange={(e) => setNome(e.target.value)} />
          {erros.nome && <span className="ed-msg-err">{erros.nome}</span>}
        </div>

        <div className="ed-field">
          <label className="ed-label" htmlFor="cv-email">E-mail</label>
          <input id="cv-email" className="ed-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="off"
            spellCheck={false} placeholder="voce@email.com" value={email} aria-invalid={Boolean(erros.email)}
            onChange={(e) => setEmail(e.target.value)} />
          {erros.email ? <span className="ed-msg-err">{erros.email}</span> : <span className="ed-msg">É com ele que você entra no app.</span>}
        </div>

        <div className="ed-field">
          <label className="ed-label" htmlFor="cv-whats">WhatsApp</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="ed-input ed-select" aria-label="País do WhatsApp" value={ddi}
              onChange={(e) => setDdi(e.target.value)} style={{ width: "auto", flex: "0 0 auto" }}>
              {PAISES_DO_WHATSAPP.map((p) => (
                <option key={p.ddi} value={p.ddi}>{p.nome} +{p.ddi}</option>
              ))}
            </select>
            <input id="cv-whats" className="ed-input" type="tel" inputMode="tel" autoComplete="tel-national"
              placeholder={pais.exemplo} value={whats} aria-invalid={Boolean(erros.whats)}
              onChange={(e) => setWhats(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
          </div>
          {erros.whats ? <span className="ed-msg-err">{erros.whats}</span> : <span className="ed-msg">A confirmação e o link do app chegam neste número.</span>}
        </div>

        <div className="ed-field">
          <label className="ed-label" htmlFor="cv-senha">Crie uma senha</label>
          <div style={{ position: "relative" }}>
            <input id="cv-senha" className="ed-input" type={verSenha ? "text" : "password"} autoComplete="new-password"
              placeholder="Mínimo 6 caracteres" value={senha} aria-invalid={Boolean(erros.senha)}
              onChange={(e) => setSenha(e.target.value)} style={{ paddingRight: 84 }} />
            <button type="button" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: 0,
                color: "var(--n-400)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 6 }}>
              {verSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {erros.senha ? <span className="ed-msg-err">{erros.senha}</span> : <span className="ed-msg">Você usa esta senha para entrar no app.</span>}
        </div>

        <div className="ed-field">
          <label htmlFor="cv-aceite" style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
            <input id="cv-aceite" type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)}
              aria-invalid={Boolean(erros.aceite)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: "var(--p-500)", flexShrink: 0 }} />
            <span className="ed-msg" style={{ fontSize: 14, color: "var(--n-300)" }}>
              Li e aceito os <a href="/termos" target="_blank" rel="noopener">Termos de uso</a> e a{" "}
              <a href="/privacidade" target="_blank" rel="noopener">Política de privacidade</a>, e quero receber o Diariamente no meu WhatsApp.
            </span>
          </label>
          {erros.aceite && <span className="ed-msg-err">{erros.aceite}</span>}
        </div>

        <div className="ed-nav">
          <button type="submit" className="ed-btn ed-btn-primary ed-btn-block" disabled={enviando} aria-busy={enviando}>
            {enviando ? "Criando sua conta..." : "Criar conta"}
          </button>
        </div>
      </div>
    </form>
  );
}
