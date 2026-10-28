// Testes do caminho do estudante até o checkout: /estudante/ativar, o
// pedido (/api/estudante/solicitar), o webhook do site, o e-mail pelo
// Resend, o campo do RD e o nome do modelo de WhatsApp. Tudo com dublês
// em memória: nenhuma chamada sai para a Meta, a Hotmart, o RD, o Resend
// ou o banco.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { carregarTs } = require("../scripts/carregar-ts");

const raiz = path.join(__dirname, "..");
const P = carregarTs(path.join(raiz, "config", "pricing.ts"));

const LANCAMENTO = Date.parse("2026-10-28T12:00:00-03:00");
const ULTIMO_SEGUNDO = Date.parse("2026-11-16T23:59:59-03:00");
const DEPOIS = Date.parse("2026-11-17T00:00:01-03:00");

/** Códigos de oferta FICTÍCIOS nas duas fases, só durante `fn` (o config
    real ainda não tem os do dono). */
async function comOfertas(ofertas, fn) {
  const antes = { ...P.OFERTAS_DO_ESTUDANTE };
  Object.assign(P.OFERTAS_DO_ESTUDANTE, ofertas);
  try {
    return await fn();
  } finally {
    Object.assign(P.OFERTAS_DO_ESTUDANTE, antes);
  }
}
const FICTICIAS = { lancamento: "estlanc1", depois: "estdep01" };

async function comRelogio(agora, fn) {
  const real = Date.now;
  Date.now = () => agora;
  try {
    return await fn();
  } finally {
    Date.now = real;
  }
}

/* ------------------------------ banco falso ------------------------------ */

/** Banco falso do Supabase: registra cada chamada e devolve o que `regras`
    mandar (por tabela e operação), ou o mínimo que as rotas esperam.
    Nada sai da máquina. */
function bancoFalso(regras = {}) {
  const chamadas = [];
  const resposta = (op) => {
    const nomes = op.passos.map((p) => p[0]);
    const regra = regras[op.tabela];
    if (typeof regra === "function") {
      const r = regra(op, nomes);
      if (r !== undefined) return r;
    }
    if (nomes.includes("maybeSingle")) return { data: null, error: null };
    if (nomes.includes("single")) return { data: { id: "lead-teste", nome: "Fulana de Teste", email: "fulana@exemplo.test" }, error: null };
    if (op.passos.some(([n, a]) => n === "select" && a[1] && a[1].head)) return { count: 0, error: null };
    return { data: [], error: null };
  };
  const db = {
    from(tabela) {
      const op = { tabela, passos: [] };
      chamadas.push(op);
      const cadeia = new Proxy({}, {
        get(_, nome) {
          if (nome === "then") {
            const r = resposta(op);
            return (ok, erro) => Promise.resolve(r).then(ok, erro);
          }
          return (...args) => {
            op.passos.push([nome, args]);
            return cadeia;
          };
        },
      });
      return cadeia;
    },
  };
  return { db, chamadas };
}
const passo = (op, nome) => (op.passos.find((p) => p[0] === nome) || [null, []])[1];

/* --------------------------- /estudante/ativar --------------------------- */

/** NextResponse de mentira: só registra para onde a rota redireciona. */
const nextServer = {
  NextResponse: { redirect: (url, status) => ({ location: String(url), status }) },
};
/** /estudante/ativar com a chave de lançamento do build e um banco falso
    em que só `conhecidos` existem ({ TOKEN: status }). */
function rotaAtivar(lancado, conhecidos = {}) {
  const banco = bancoFalso({
    cupons_estudante: (op) => {
      const [, codigo] = passo(op, "eq");
      if (!passo(op, "maybeSingle")) return undefined;
      return codigo in conhecidos
        ? { data: { id: "linha-" + codigo, lead_id: "lead-1", status: conhecidos[codigo] }, error: null }
        : { data: null, error: null };
    },
  });
  const rota = carregarTs(path.join(raiz, "app", "estudante", "ativar", "route.ts"), {
    "next/server": nextServer,
    "@supabase/supabase-js": { createClient: () => banco.db },
    "@/config/pricing": P,
    "@/config/lancamento": { SITE_LANCADO: lancado },
  });
  return { rota, banco };
}

const ENV_BANCO = { SUPABASE_URL: "https://banco.exemplo.test", SUPABASE_SERVICE_KEY: "chave-falsa" };

function pedido(busca) {
  const url = `https://diariamente.app/estudante/ativar${busca}`;
  return { url, nextUrl: new URL(url) };
}

async function ativar(busca, { lancado = true, conhecidos = { DIARIAESTABCD2345: "ativo" }, agora = LANCAMENTO, ofertas = FICTICIAS } = {}) {
  const { rota, banco } = rotaAtivar(lancado, conhecidos);
  const r = await comOfertas(ofertas, () => comRelogio(agora, () => comEnvAsync(ENV_BANCO, () => rota.GET(pedido(busca)))));
  return { r, banco };
}

test("/estudante/ativar: token conhecido, no lançamento, vai (302) para a oferta de R$ 59,90 com o token no sck", async () => {
  const { r, banco } = await ativar("?cupom=DIARIAESTABCD2345");
  assert.equal(r.status, 302);
  assert.equal(r.location, "https://pay.hotmart.com/K105072021O?off=estlanc1&sck=DIARIAESTABCD2345");
  // o clique fica registrado com a fase e a oferta da hora
  const log = banco.chamadas.find((c) => c.tabela === "log_estudante");
  assert.ok(log, "clique registrado");
  assert.deepEqual(passo(log, "insert")[0].detalhe, { codigo: "DIARIAESTABCD2345", fase: "lancamento", oferta: "estlanc1", status: "ativo" });
});

test("/estudante/ativar decide NO CLIQUE: aprovado no lançamento e aberto depois de 16/11 vai para a oferta de R$ 79,90", async () => {
  const ultimo = await ativar("?cupom=DIARIAESTABCD2345", { agora: ULTIMO_SEGUNDO });
  assert.match(ultimo.r.location, /off=estlanc1&sck=/);
  const depois = await ativar("?cupom=DIARIAESTABCD2345", { agora: DEPOIS });
  assert.equal(depois.r.status, 302);
  assert.equal(depois.r.location, "https://pay.hotmart.com/K105072021O?off=estdep01&sck=DIARIAESTABCD2345");
  // o link não vence: expirado (prazo de envio do WhatsApp) e usado continuam abrindo
  for (const status of ["expirado", "usado"]) {
    const { r } = await ativar("?cupom=DIARIAESTABCD2345", { conhecidos: { DIARIAESTABCD2345: status } });
    assert.equal(r.status, 302, status);
  }
});

test("/estudante/ativar nunca abre a oferta oficial, a de lançamento, o checkout antigo nem leva cupom", async () => {
  for (const agora of [LANCAMENTO, DEPOIS]) {
    const { r } = await ativar("?cupom=diariaestabcd2345", { agora });
    assert.equal(/fhrttdh8|lf63bgdd|L107085210M|h82bllbx|offDiscount/.test(r.location), false, r.location);
  }
});

test("/estudante/ativar volta (307) para /estudante: token desconhecido, revogado, fora do formato, sem oferta da fase, standby ou sem banco", async () => {
  const volta = "https://diariamente.app/estudante";
  for (const busca of ["", "?cupom=", "?cupom=ABC%20DEF", "?cupom=" + "A".repeat(26), "?cupom=<script>", "?cupom=DIARIAESTDESCONHECID"]) {
    const { r } = await ativar(busca);
    assert.equal(r.status, 307, busca);
    assert.equal(r.location, volta, busca);
  }
  for (const status of ["revogado", "cancelado"]) {
    const { r } = await ativar("?cupom=DIARIAESTABCD2345", { conhecidos: { DIARIAESTABCD2345: status } });
    assert.equal(r.location, volta, status);
  }
  // a fase vigente sem o código: fechado, sem nem consultar o banco
  const semLanc = await ativar("?cupom=DIARIAESTABCD2345", { ofertas: { lancamento: "", depois: "estdep01" } });
  assert.equal(semLanc.r.location, volta);
  assert.equal(semLanc.banco.chamadas.length, 0);
  const semDepois = await ativar("?cupom=DIARIAESTABCD2345", { ofertas: { lancamento: "estlanc1", depois: "" }, agora: DEPOIS });
  assert.equal(semDepois.r.location, volta);
  // o config real, com os dois códigos vazios: fechado
  const real = await ativar("?cupom=DIARIAESTABCD2345", { ofertas: { ...P.OFERTAS_DO_ESTUDANTE } });
  if (!P.ESTUDANTE_OFERTA_LANCAMENTO) assert.equal(real.r.location, volta);
  // standby: nenhum checkout do 7448309, nem com token conhecido
  const standby = await ativar("?cupom=DIARIAESTABCD2345", { lancado: false });
  assert.equal(standby.r.location, volta);
  assert.equal(standby.banco.chamadas.length, 0);
  // sem as variáveis do banco: volta, sem quebrar
  const { rota } = rotaAtivar(true, { DIARIAESTABCD2345: "ativo" });
  const semBanco = await semLog(() => comOfertas(FICTICIAS, () => comRelogio(LANCAMENTO, () =>
    comEnvAsync({ SUPABASE_URL: undefined, SUPABASE_SERVICE_KEY: undefined }, () => rota.GET(pedido("?cupom=DIARIAESTABCD2345"))))));
  assert.equal(semBanco.location, volta);
});

/* ------------------------- modelo de WhatsApp ------------------------- */

const W = carregarTs(path.join(raiz, "lib", "whatsapp.js"));

function comEnv(vars, fn) {
  const antes = {};
  for (const k of Object.keys(vars)) {
    antes[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(antes)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("WA_TEMPLATE_ESTUDANTE (chave ligada): padrão diariamente_estudante_aprovado; nome válido vale; inválido volta ao padrão", () => {
  assert.equal(W.MODELO_ESTUDANTE_PADRAO, "diariamente_estudante_aprovado");
  const L = { DM_SITE_LANCADO: "1" };
  comEnv({ ...L, WA_TEMPLATE_ESTUDANTE: undefined }, () => assert.equal(W.modeloEstudante(), "diariamente_estudante_aprovado"));
  comEnv({ ...L, WA_TEMPLATE_ESTUDANTE: "  " }, () => assert.equal(W.modeloEstudante(), "diariamente_estudante_aprovado"));
  comEnv({ ...L, WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2" }, () =>
    assert.equal(W.modeloEstudante(), "diariamente_estudante_aprovado_v2"));
  const aviso = console.warn;
  console.warn = () => {};
  try {
    comEnv({ ...L, WA_TEMPLATE_ESTUDANTE: "Diariamente-V2" }, () => assert.equal(W.modeloEstudante(), "diariamente_estudante_aprovado"));
  } finally {
    console.warn = aviso;
  }
});

test("standby: o WhatsApp do estudante sai sempre com o modelo de hoje, como na produção", () => {
  for (const chave of [undefined, "", "0"]) {
    comEnv({ DM_SITE_LANCADO: chave, WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2" }, () =>
      assert.equal(W.modeloEstudante(), "diariamente_estudante_aprovado", String(chave)));
  }
});

test("o envio da aprovação usa o modelo configurado e manda só o nome e o código (dublê do fetch)", async () => {
  const fetchReal = global.fetch;
  let enviado = null;
  global.fetch = async (url, opcoes) => {
    enviado = { url: String(url), corpo: JSON.parse(opcoes.body) };
    return { ok: true, json: async () => ({ messages: [{ id: "teste" }] }) };
  };
  try {
    await comEnv(
      { DM_SITE_LANCADO: "1", WHATSAPP_PHONE_NUMBER_ID: "000", WHATSAPP_TOKEN: "token-de-teste", WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2" },
      () => W.whatsapp.aprovado("5500000000000", "Fulana", "DIARIAESTABCD2345")
    );
  } finally {
    global.fetch = fetchReal;
  }
  assert.ok(enviado, "o dublê do fetch não foi chamado");
  assert.match(enviado.url, /graph\.facebook\.com\/v22\.0\/000\/messages$/);
  const t = enviado.corpo.template;
  assert.equal(t.name, "diariamente_estudante_aprovado_v2");
  assert.equal(t.language.code, "pt_BR");
  assert.deepEqual(t.components[0].parameters, [{ type: "text", text: "Fulana" }]);
  assert.deepEqual(t.components[1].parameters, [{ type: "text", text: "DIARIAESTABCD2345" }]);
});

/* ------------------------- /api/estudante/solicitar ------------------------- */

const fs = require("fs");

/** CPF fictício com dígitos verificadores certos (base 123456789). */
function cpfFicticio(base = "123456789") {
  let cpf = base;
  for (const pos of [10, 11]) {
    let soma = 0;
    for (let i = 0; i < pos - 1; i++) soma += Number(cpf[i]) * (pos - i);
    const d = (soma * 10) % 11;
    cpf += String(d === 10 ? 0 : d);
  }
  return cpf;
}

/** A rota com dublês: banco, Hotmart (só standby), RD e Resend. */
function carregarSolicitar(regras = {}) {
  const banco = bancoFalso(regras);
  const cupons = [];
  const rd = [];
  const emails = [];
  const E = carregarTs(path.join(raiz, "lib", "estudante.js"), { "@/config/pricing": P });
  const rota = carregarTs(path.join(raiz, "app", "api", "estudante", "solicitar", "route.js"), {
    "@supabase/supabase-js": { createClient: () => banco.db },
    "@/lib/hotmart": {
      gerarCodigo: () => "DIARIAESTTESTE0001",
      offerIdsDoAmbiente: () => undefined,
      apagarCupom: async () => true,
      criarCupom: async (args) => {
        cupons.push(args);
        return { codigo: args.codigo, hotmartCouponId: 123, expiraEm: new Date(Date.now() + 48 * 3600_000) };
      },
    },
    "@/lib/rdstation": { enviarLeadRD: async (lead, extras) => { rd.push({ lead, extras }); } },
    "@/lib/estudante": {
      ...E,
      gerarToken: () => "DIARIAESTTOKEN00000001",
      enviarEmailDeAprovacao: async (args) => { emails.push(args); return { id: "re_1", fase: P.faseDoEstudante(args.agora) }; },
    },
    "@/config/pricing": P,
  });
  return { rota, banco, cupons, rd, emails };
}

let corpoLido = false;
function pedidoEstudante() {
  corpoLido = false;
  return {
    url: "https://diariamente.app/api/estudante/solicitar",
    headers: new Headers({ "user-agent": "teste", "x-forwarded-for": "203.0.113.9" }),
    json: async () => {
      corpoLido = true;
      return {
        nome: "Fulana de Teste", cpf: cpfFicticio(), whatsapp: "5500900000000", email: "fulana@exemplo.test",
        instituicao: "Universidade Teste", estado: "Distrito Federal (DF)", curso: "Outro", semestre: 3,
        previsao_conclusao: "2029-12",
      };
    },
  };
}

/** comEnv que espera a promessa: a rota lê o ambiente depois de cada await. */
async function comEnvAsync(vars, fn) {
  const antes = {};
  for (const k of Object.keys(vars)) {
    antes[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  try {
    return await fn();
  } finally {
    for (const [k, v] of Object.entries(antes)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

async function semLog(fn) {
  const erro = console.error;
  const aviso = console.warn;
  console.error = () => {};
  console.warn = () => {};
  try {
    return await fn();
  } finally {
    console.error = erro;
    console.warn = aviso;
  }
}

const LIGADO = { DM_SITE_LANCADO: "1", DM_ESTUDANTE_ABERTO: "1", RESEND_API_KEY: undefined };

test("fluxo FECHADO (chave ligada): 503 sem ler o pedido, sem banco e sem nada criado, pela configuração ou pela oferta da fase", async () => {
  const { rota, banco, cupons, rd, emails } = carregarSolicitar();
  const casos = [
    // a Vercel sem o modelo v2 (DM_ESTUDANTE_ABERTO vazio), mesmo com as ofertas
    ...[undefined, "", "0", "true"].map((valor) => [{ ...LIGADO, DM_ESTUDANTE_ABERTO: valor }, FICTICIAS, LANCAMENTO]),
    // configurado, mas a fase vigente sem o código da oferta
    [LIGADO, { lancamento: "", depois: "estdep01" }, LANCAMENTO],
    [LIGADO, { lancamento: "estlanc1", depois: "" }, DEPOIS],
    // o config real de hoje (códigos vazios)
    [LIGADO, { ...P.OFERTAS_DO_ESTUDANTE }, LANCAMENTO],
  ];
  for (const [env, ofertas, agora] of casos) {
    if (ofertas.lancamento && agora === LANCAMENTO && env.DM_ESTUDANTE_ABERTO === "1") continue;
    const r = await semLog(() => comOfertas(ofertas, () => comRelogio(agora, () => comEnvAsync(env, () => rota.POST(pedidoEstudante())))));
    const rotulo = JSON.stringify({ aberto: env.DM_ESTUDANTE_ABERTO, ofertas, agora });
    assert.equal(r.status, 503, rotulo);
    const corpo = await r.json();
    assert.equal(corpo.ok, false);
    assert.match(corpo.erros[0], /abre em breve/);
    assert.equal(corpoLido, false, "o corpo nem é lido");
  }
  assert.equal(banco.chamadas.length, 0, "nenhuma chamada ao banco: nenhum CPF preso");
  assert.equal(cupons.length + rd.length + emails.length, 0, "nenhum cupom, RD ou e-mail");
});

test("fluxo ABERTO: grava o lead e o LINK pessoal (sem cupom na Hotmart), manda o link ao RD e agenda o WhatsApp", async () => {
  const { rota, banco, cupons, rd, emails } = carregarSolicitar();
  const r = await semLog(() => comOfertas(FICTICIAS, () => comRelogio(LANCAMENTO, () => comEnvAsync(LIGADO, () => rota.POST(pedidoEstudante())))));
  assert.equal(r.status, 200);
  const corpo = await r.json();
  assert.equal(corpo.ok, true, JSON.stringify(corpo));
  assert.equal(corpo.agendado, true);
  assert.equal(cupons.length, 0, "nada de cupom pela API da Hotmart");
  const tabelas = banco.chamadas.map((c) => c.tabela);
  assert.ok(tabelas.includes("leads_estudante"));
  const insercao = banco.chamadas.find((c) => c.tabela === "cupons_estudante" && c.passos[0][0] === "insert");
  assert.ok(insercao, "link registrado");
  const linha = insercao.passos[0][1][0];
  assert.equal(linha.codigo, "DIARIAESTTOKEN00000001");
  assert.equal(linha.status, "ativo");
  assert.equal("hotmart_coupon_id" in linha, false, "sem hotmart_coupon_id");
  // desconto só informativo: 59,90 sobre 149,90
  assert.equal(linha.desconto, 0.6004);
  const enviarEm = Date.parse(linha.enviar_em);
  assert.ok(enviarEm - LANCAMENTO >= corpo.espera_minutos * 60_000 - 1000, "WhatsApp agendado para depois da janela");
  // o link não vence: expira_em é só o prazo de envio do cron (30 dias)
  assert.ok(Date.parse(linha.expira_em) - LANCAMENTO >= 29 * 24 * 3600_000);
  // RD com o link pessoal no campo
  assert.equal(rd.length, 1);
  assert.equal(rd[0].extras.link, "https://www.diariamente.app/estudante/ativar?cupom=DIARIAESTTOKEN00000001");
  // sem RESEND_API_KEY, nenhum e-mail sai do site
  assert.equal(emails.length, 0);
  const log = banco.chamadas.find((c) => c.tabela === "log_estudante" && passo(c, "insert")[0].acao === "link_emitido");
  assert.equal(passo(log, "insert")[0].detalhe.fase, "lancamento");
  assert.equal(passo(log, "insert")[0].detalhe.oferta, "estlanc1");
});

test("fluxo ABERTO com RESEND_API_KEY: o e-mail de aprovação sai pelo Resend com o token; falha nele não derruba o pedido", async () => {
  const { rota, emails } = carregarSolicitar();
  const r = await semLog(() => comOfertas(FICTICIAS, () => comRelogio(DEPOIS, () =>
    comEnvAsync({ ...LIGADO, RESEND_API_KEY: "re_teste" }, () => rota.POST(pedidoEstudante())))));
  assert.equal(r.status, 200);
  assert.equal(emails.length, 1);
  assert.equal(emails[0].email, "fulana@exemplo.test");
  assert.equal(emails[0].token, "DIARIAESTTOKEN00000001");
  // falha no Resend: o pedido segue e o log registra
  const banco2 = bancoFalso();
  const E = carregarTs(path.join(raiz, "lib", "estudante.js"), { "@/config/pricing": P });
  const rota2 = carregarTs(path.join(raiz, "app", "api", "estudante", "solicitar", "route.js"), {
    "@supabase/supabase-js": { createClient: () => banco2.db },
    "@/lib/hotmart": {},
    "@/lib/rdstation": { enviarLeadRD: async () => {} },
    "@/lib/estudante": { ...E, enviarEmailDeAprovacao: async () => { throw new Error("Resend HTTP 500"); } },
    "@/config/pricing": P,
  });
  const r2 = await semLog(() => comOfertas(FICTICIAS, () => comRelogio(LANCAMENTO, () =>
    comEnvAsync({ ...LIGADO, RESEND_API_KEY: "re_teste" }, () => rota2.POST(pedidoEstudante())))));
  assert.equal(r2.status, 200);
  assert.ok(banco2.chamadas.some((c) => c.tabela === "log_estudante" && passo(c, "insert")[0].acao === "email_falhou"));
});

test("fluxo ABERTO: 1 CPF = 1 lead (409 sem gravar nada), teto por hora (429) e o CPF liberado se o link não grava", async () => {
  // CPF que já pediu: 409, e o texto depende do link anterior
  for (const [status, padrao] of [["ativo", /ja tem seu link de estudante/], ["usado", /ja usou a condicao/], [null, /ja solicitou/]]) {
    const { rota, banco } = carregarSolicitar({
      leads_estudante: (op, nomes) => (nomes.includes("maybeSingle") ? { data: { id: "lead-antigo" }, error: null } : undefined),
      cupons_estudante: (op, nomes) => (nomes.includes("maybeSingle") ? { data: status ? { codigo: "X", status } : null, error: null } : undefined),
    });
    const r = await semLog(() => comOfertas(FICTICIAS, () => comRelogio(LANCAMENTO, () => comEnvAsync(LIGADO, () => rota.POST(pedidoEstudante())))));
    assert.equal(r.status, 409, String(status));
    assert.match((await r.json()).erros[0], padrao);
    assert.equal(banco.chamadas.some((c) => c.passos.some((p) => p[0] === "insert")), false, "nada gravado");
  }
  // teto por hora
  const teto = carregarSolicitar({
    cupons_estudante: (op) => (op.passos.some(([n, a]) => n === "select" && a[1] && a[1].head) ? { count: 100, error: null } : undefined),
  });
  const r429 = await semLog(() => comOfertas(FICTICIAS, () => comRelogio(LANCAMENTO, () => comEnvAsync(LIGADO, () => teto.rota.POST(pedidoEstudante())))));
  assert.equal(r429.status, 429);
  assert.equal(teto.banco.chamadas.some((c) => c.tabela === "leads_estudante" && c.passos[0][0] === "insert"), false);
  // o link não grava: o lead é apagado (o CPF pode tentar de novo)
  const falha = carregarSolicitar({
    cupons_estudante: (op, nomes) => (nomes.includes("insert") ? { data: null, error: { message: "codigo duplicado" } } : undefined),
  });
  const r500 = await semLog(() => comOfertas(FICTICIAS, () => comRelogio(LANCAMENTO, () => comEnvAsync(LIGADO, () => falha.rota.POST(pedidoEstudante())))));
  assert.equal(r500.status, 500);
  assert.ok(falha.banco.chamadas.some((c) => c.tabela === "leads_estudante" && c.passos[0][0] === "delete"), "lead apagado");
  assert.equal(falha.rd.length, 0);
});

test("standby: /api/estudante/solicitar é a da produção, sem o 503 (o cupom da main, com o STUDENT_DISCOUNT da Vercel)", async () => {
  const { rota, cupons, rd } = carregarSolicitar();
  for (const chave of [undefined, ""]) {
    const r = await semLog(() =>
      comEnvAsync({ DM_SITE_LANCADO: chave, DM_ESTUDANTE_ABERTO: undefined, STUDENT_DISCOUNT: "0.42" }, () => rota.POST(pedidoEstudante()))
    );
    assert.equal(r.status, 200, String(chave));
    const corpo = await r.json();
    assert.equal(corpo.ok, true, JSON.stringify(corpo));
    assert.equal(corpoLido, true);
  }
  assert.equal(cupons.length, 2);
  // o desconto é o da Vercel, como na main, e o RD vai sem o link novo
  assert.equal(cupons[0].desconto, 0.42);
  assert.deepEqual(rd[0].extras, {});
});

/* ------------------------------ lib/estudante ------------------------------ */

const E = carregarTs(path.join(raiz, "lib", "estudante.js"), { "@/config/pricing": P });

test("token do link: DIARIAEST + 14 caracteres sem ambíguos, no formato que o /estudante/ativar e o botão da Meta aceitam", () => {
  const vistos = new Set();
  for (let i = 0; i < 200; i++) {
    const t = E.gerarToken();
    assert.match(t, /^DIARIAEST[A-HJ-NP-Z2-9]{14}$/);
    assert.ok(E.FORMATO_DO_TOKEN.test(t));
    vistos.add(t);
  }
  assert.equal(vistos.size, 200);
  assert.equal(E.linkPessoal("DIARIAESTABC"), "https://www.diariamente.app/estudante/ativar?cupom=DIARIAESTABC");
  // o mesmo endereço do SITE.dominio e do botão do modelo v2
  const config = fs.readFileSync(path.join(raiz, "config.ts"), "utf8");
  assert.ok(E.ENDERECO_DE_ATIVACAO.startsWith(config.match(/^\s*dominio:\s*"([^"]+)"/m)[1]));
});

/** Regras de texto para o cliente: sem "compra", sem travessão, até 1 emoji. */
function textoDeCliente(t, rotulo) {
  assert.equal(/\bcompr(a|ar|as|ou)\b/i.test(t), false, `${rotulo}: "compra"`);
  assert.equal(/[—–]/.test(t), false, `${rotulo}: travessão`);
  assert.ok((t.match(/\p{Extended_Pictographic}/gu) || []).length <= 1, `${rotulo}: emoji`);
}

test("e-mail de aprovação: o texto do modelo, o botão para o link pessoal e o preço da fase NO MOMENTO do envio", () => {
  const l = E.textoDoEmail({ nome: "Fulana de Teste", token: "DIARIAESTABC", agora: LANCAMENTO });
  assert.equal(l.assunto, "Sua inscrição de estudante no Diariamente foi aprovada");
  const t = l.texto.replace(/ /g, " ");
  assert.match(t, /^Olá, Fulana\./);
  assert.match(t, /Sua inscrição como estudante no Diariamente App foi aprovada\. Toque no botão abaixo para concluir sua matrícula\. Sua condição de estudante já está aplicada\./);
  assert.match(t, /Concluir inscrição: https:\/\/www\.diariamente\.app\/estudante\/ativar\?cupom=DIARIAESTABC/);
  assert.match(t, /Sua condição: R\$ 59,90 por ano nos 3 primeiros anos, para quem assinar até 16 de novembro\. Depois, R\$ 149,90 por ano\. À vista, ou em até 12x no cartão com acréscimo\./);
  assert.match(l.html, /<a href="https:\/\/www\.diariamente\.app\/estudante\/ativar\?cupom=DIARIAESTABC"[^>]*>Concluir inscrição<\/a>/);
  const d = E.textoDoEmail({ nome: "Fulana", token: "DIARIAESTABC", agora: DEPOIS });
  assert.match(d.texto.replace(/ /g, " "), /Sua condição: R\$ 79,90 por ano nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\./);
  assert.equal(/16 de novembro/.test(d.texto), false);
  for (const [m, rotulo] of [[l, "lançamento"], [d, "depois"]]) {
    textoDeCliente(m.texto, rotulo);
    textoDeCliente(m.html, rotulo);
    assert.equal(/saúde|medicina/i.test(m.texto), false, `${rotulo}: não diz que é só para saúde`);
  }
  // nome com HTML é escapado
  assert.equal(/<script>/.test(E.textoDoEmail({ nome: "<script>x", token: "T", agora: LANCAMENTO }).html), false);
});

test("e-mail pelo Resend: remetente, responder para o suporte, sem chave não envia (dublê do fetch)", async () => {
  const fetchReal = global.fetch;
  const enviados = [];
  global.fetch = async (url, opcoes) => {
    enviados.push({ url: String(url), headers: opcoes.headers, corpo: JSON.parse(opcoes.body) });
    return { ok: true, json: async () => ({ id: "re_123" }) };
  };
  try {
    await assert.rejects(() => comEnvAsync({ RESEND_API_KEY: undefined }, () => E.enviarEmailDeAprovacao({ email: "a@exemplo.test", nome: "A B", token: "T1", agora: LANCAMENTO })));
    assert.equal(enviados.length, 0);
    assert.equal(comEnv({ RESEND_API_KEY: "  " }, () => E.emailConfigurado()), false);
    const r = await comEnvAsync({ RESEND_API_KEY: "re_teste" }, () =>
      E.enviarEmailDeAprovacao({ email: "fulana@exemplo.test", nome: "Fulana de Teste", token: "DIARIAESTABC", agora: LANCAMENTO }));
    assert.deepEqual(r, { id: "re_123", fase: "lancamento" });
  } finally {
    global.fetch = fetchReal;
  }
  const e = enviados[0];
  assert.equal(e.url, "https://api.resend.com/emails");
  assert.equal(e.headers.Authorization, "Bearer re_teste");
  assert.equal(e.headers["Idempotency-Key"], "estudante-aprovado-DIARIAESTABC");
  assert.equal(e.corpo.from, "Diariamente App <acesso@diariamente.app>");
  assert.equal(e.corpo.reply_to, "suporte@scienceplay.com");
  assert.deepEqual(e.corpo.to, ["fulana@exemplo.test"]);
  assert.match(e.corpo.text, /cupom=DIARIAESTABC/);
});

/* ------------------------------ RD Station ------------------------------ */

test("RD: o link vai em cf_link_estudante; se o RD recusar o campo (4xx), a conversão sai sem ele, como antes", async () => {
  const RD = carregarTs(path.join(raiz, "lib", "rdstation.js"));
  const fetchReal = global.fetch;
  const corpos = [];
  let recusar = false;
  global.fetch = async (url, opcoes) => {
    const corpo = JSON.parse(opcoes.body);
    corpos.push(corpo.payload);
    if (recusar && "cf_link_estudante" in corpo.payload) return { ok: false, status: 400, text: async () => "campo invalido" };
    return { ok: true, text: async () => "" };
  };
  const lead = { nome: "Fulana de Teste", email: "f@exemplo.test", whatsapp: "5500900000000", instituicao: "U", curso: "Outro" };
  try {
    const ok = await comEnvAsync({ RD_STATION_TOKEN: "t" }, () => RD.enviarLeadRD(lead, { link: "https://www.diariamente.app/estudante/ativar?cupom=X" }));
    assert.deepEqual(ok, { ok: true, semExtras: false });
    assert.equal(corpos[0].cf_link_estudante, "https://www.diariamente.app/estudante/ativar?cupom=X");
    recusar = true;
    const r = await semLog(() => comEnvAsync({ RD_STATION_TOKEN: "t" }, () => RD.enviarLeadRD(lead, { link: "L" })));
    assert.deepEqual(r, { ok: true, semExtras: true });
    assert.equal("cf_link_estudante" in corpos[corpos.length - 1], false);
    // sem link, o payload é o de antes
    await comEnvAsync({ RD_STATION_TOKEN: "t" }, () => RD.enviarLeadRD(lead));
    assert.equal("cf_link_estudante" in corpos[corpos.length - 1], false);
  } finally {
    global.fetch = fetchReal;
  }
  assert.equal(RD.CAMPO_LINK_ESTUDANTE, "cf_link_estudante");
});

/* --------------------------- webhook do site --------------------------- */

/** Venda aprovada no formato 2.0.0 da Hotmart (só o que a rota lê). */
function venda({ oferta = "estlanc1", email = "fulana@exemplo.test", sck, cupom, recorrencia } = {}) {
  return {
    event: "PURCHASE_APPROVED",
    data: {
      buyer: { email },
      purchase: {
        transaction: "HP0000000000001",
        offer: { code: oferta, ...(cupom ? { coupon_code: cupom } : {}) },
        ...(sck ? { origin: { sck } } : {}),
        ...(recorrencia ? { recurrence_number: recorrencia } : {}),
      },
    },
  };
}

function rotaWebhook(regras = {}) {
  const banco = bancoFalso(regras);
  const apagados = [];
  const rota = carregarTs(path.join(raiz, "app", "api", "webhooks", "hotmart", "route.js"), {
    "@supabase/supabase-js": { createClient: () => banco.db },
    "@/lib/hotmart": { apagarCupom: async (id) => { apagados.push(id); return true; } },
    "@/lib/seguranca": carregarTs(path.join(raiz, "lib", "seguranca.js"), { "node:crypto": require("node:crypto") }),
    "@/config/pricing": P,
  });
  const chamar = (payload, hottok = "segredo") => comOfertas(FICTICIAS, () => comEnvAsync({ HOTMART_HOTTOK: "segredo" }, () =>
    rota.POST({ headers: new Headers({ "x-hotmart-hottok": hottok }), json: async () => payload })));
  return { chamar, banco, apagados };
}

const LINK = { id: "linha-1", lead_id: "lead-1", codigo: "DIARIAESTTOKEN00000001", status: "ativo", hotmart_coupon_id: null };

test("webhook: venda da oferta de estudante com o token no sck marca o link como usado, sem chamar a API de cupom", async () => {
  const { chamar, banco, apagados } = rotaWebhook({
    cupons_estudante: (op, nomes) => (nomes.includes("maybeSingle") && passo(op, "eq")[1] === LINK.codigo ? { data: LINK, error: null } : undefined),
  });
  const r = await chamar(venda({ sck: LINK.codigo.toLowerCase(), email: "outro@exemplo.test" }));
  const corpo = await r.json();
  assert.deepEqual(corpo, { ok: true, codigo: LINK.codigo, via: "rastreio", apagado: false });
  const update = banco.chamadas.find((c) => c.tabela === "cupons_estudante" && c.passos[0][0] === "update");
  assert.equal(passo(update, "update")[0].status, "usado");
  assert.equal(passo(update, "update")[0].transacao_hotmart, "HP0000000000001");
  assert.equal(apagados.length, 0, "nenhuma chamada à API de cupom");
  const log = banco.chamadas.find((c) => c.tabela === "log_estudante");
  assert.equal(passo(log, "insert")[0].acao, "link_usado");
});

test("webhook: sem o sck, acha o link pelo e-mail igual ao do pedido (só na oferta de estudante)", async () => {
  const regras = {
    leads_estudante: (op) => (passo(op, "eq")[1] === "fulana@exemplo.test" ? { data: [{ id: "lead-1" }], error: null } : { data: [], error: null }),
    cupons_estudante: (op, nomes) => (nomes.includes("in") && nomes.includes("maybeSingle") ? { data: LINK, error: null } : undefined),
  };
  const { chamar, banco } = rotaWebhook(regras);
  const corpo = await (await chamar(venda({ email: "Fulana@Exemplo.test", oferta: "estdep01" }))).json();
  assert.equal(corpo.via, "email");
  assert.ok(banco.chamadas.some((c) => c.tabela === "cupons_estudante" && c.passos[0][0] === "update"));
  // venda de OUTRA oferta (a oficial) com o mesmo e-mail: não mexe no link
  const outra = rotaWebhook(regras);
  const c2 = await (await outra.chamar(venda({ oferta: "fhrttdh8" }))).json();
  assert.deepEqual(c2, { ok: true, cupom: null });
  assert.equal(outra.banco.chamadas.some((c) => c.passos[0][0] === "update"), false);
});

test("webhook: oferta de estudante sem pedido fica no log; recorrência é ignorada; hottok errado é 401", async () => {
  const { chamar, banco } = rotaWebhook();
  const corpo = await (await chamar(venda({ email: "ninguem@exemplo.test" }))).json();
  assert.deepEqual(corpo, { ok: true, estudante: "sem_link" });
  const log = banco.chamadas.find((c) => c.tabela === "log_estudante");
  assert.deepEqual(passo(log, "insert")[0], { lead_id: null, acao: "venda_estudante_sem_link", detalhe: { transacao: "HP0000000000001", oferta: "estlanc1" }, ator: "hotmart" });
  const rec = rotaWebhook();
  assert.deepEqual(await (await rec.chamar(venda({ recorrencia: 2 }))).json(), { ok: true, estudante: "recorrencia" });
  assert.equal(rec.banco.chamadas.length, 0);
  const negado = rotaWebhook();
  const r = await semLog(() => negado.chamar(venda(), "errado"));
  assert.equal(r.status, 401);
});

test("webhook: o cupom da main (standby, com hotmart_coupon_id) continua sendo apagado na Hotmart, como antes", async () => {
  const antigo = { id: "linha-2", lead_id: "lead-2", codigo: "DIARIAESTANTIGO1", status: "ativo", hotmart_coupon_id: 987 };
  const { chamar, apagados, banco } = rotaWebhook({
    cupons_estudante: (op, nomes) => (nomes.includes("maybeSingle") && passo(op, "eq")[1] === antigo.codigo ? { data: antigo, error: null } : undefined),
  });
  const corpo = await (await chamar(venda({ oferta: "fhrttdh8", cupom: antigo.codigo }))).json();
  assert.deepEqual(corpo, { ok: true, codigo: antigo.codigo, via: "cupom", apagado: true });
  assert.deepEqual(apagados, [987]);
  assert.equal(passo(banco.chamadas.find((c) => c.tabela === "log_estudante"), "insert")[0].acao, "cupom_usado");
});

test("o tempo prometido na tela cobre a janela da API e as tentativas do cron", () => {
  const ler = (...p) => fs.readFileSync(path.join(raiz, ...p), "utf8");
  const espera = Number(ler("app", "api", "estudante", "solicitar", "route.js").match(/const ESPERA_MINUTOS = (\d+);/)[1]);
  const tentativas = Number(ler("app", "api", "cron", "manutencao", "route.js").match(/const MAX_TENTATIVAS = (\d+);/)[1]);
  const prometido = Number(ler("config.ts").match(/esperaMinutos:\s*(\d+)/)[1]);
  // o cron roda de minuto em minuto e tenta uma vez por rodada
  assert.match(ler("vercel.json"), /"schedule": "\* \* \* \* \*"/);
  assert.ok(prometido >= espera + tentativas, `promete ${prometido} min; a API espera ${espera} e o cron tenta ${tentativas}x`);
  assert.equal(/SÍNCRONO/.test(ler("config.ts")), false, "o envio é agendado, não síncrono");
});

/* ---------------- lista de espera com origem "estudante" ---------------- */

test("lista de espera: origem estudante vai para outra conversão e outra tag no RD (dublê do fetch)", async () => {
  const rota = carregarTs(path.join(raiz, "app", "api", "lista-espera", "route.js"), {
    "@supabase/supabase-js": { createClient: () => { throw new Error("sem banco no teste"); } },
    "@/lib/lista-espera": carregarTs(path.join(raiz, "lib", "lista-espera.ts")),
    "@/lib/mercado": carregarTs(path.join(raiz, "lib", "mercado.ts")),
  });
  const fetchReal = global.fetch;
  const enviados = [];
  global.fetch = async (url, opcoes) => {
    enviados.push(JSON.parse(opcoes.body).payload);
    return { ok: true, json: async () => ({}) };
  };
  try {
    for (const origem of ["estudante", "oferta", "qualquer"]) {
      const r = await semLog(() =>
        comEnvAsync({ SUPABASE_URL: undefined, SUPABASE_SERVICE_KEY: undefined, RD_STATION_TOKEN: "token-de-teste" }, () =>
          rota.POST({
            headers: new Headers({ "x-vercel-ip-country": "BR" }),
            json: async () => ({
              nome: "Fulana de Teste", email: "fulana@exemplo.test", whatsapp: "5500900000000",
              mercado: "br", idioma: "pt", origem, consentimento: { versao: "v-teste", aceitoEm: new Date().toISOString() },
            }),
          })
        )
      );
      assert.equal(r.status, 200, origem);
    }
  } finally {
    global.fetch = fetchReal;
  }
  assert.equal(enviados[0].conversion_identifier, "diariamente-estudante-em-breve");
  assert.ok(enviados[0].tags.includes("estudante-em-breve"));
  assert.equal(enviados[0].tags.includes("em-breve"), false, "o aviso de abertura do produto não chega a quem pediu o de estudante");
  for (const p of enviados.slice(1)) {
    assert.equal(p.conversion_identifier, "diariamente-em-breve");
    assert.ok(p.tags.includes("em-breve"));
  }
});
