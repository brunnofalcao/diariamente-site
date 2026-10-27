// Testes do caminho do estudante até o checkout: /estudante/ativar e o
// nome do modelo de WhatsApp. Tudo com dublês em memória: nenhuma
// chamada sai para a Meta ou para a Hotmart.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { carregarTs } = require("../scripts/carregar-ts");

const raiz = path.join(__dirname, "..");
const P = carregarTs(path.join(raiz, "config", "pricing.ts"));

/** NextResponse de mentira: só registra para onde a rota redireciona. */
const nextServer = {
  NextResponse: { redirect: (url, status) => ({ location: String(url), status }) },
};
/** /estudante/ativar com a chave de lançamento do build. */
const rotaAtivar = (lancado) => carregarTs(path.join(raiz, "app", "estudante", "ativar", "route.ts"), {
  "next/server": nextServer,
  "@/config/pricing": P,
  "@/config/lancamento": { SITE_LANCADO: lancado },
});
const ativar = rotaAtivar(true);

function pedido(busca) {
  const url = `https://diariamente.app/estudante/ativar${busca}`;
  return { url, nextUrl: new URL(url) };
}

test("/estudante/ativar?cupom=CODIGO abre a oferta oficial fhrttdh8 com o cupom pessoal", () => {
  const r = ativar.GET(pedido("?cupom=DIARIAESTABCD2345"));
  assert.equal(r.status, 307);
  assert.equal(r.location, "https://pay.hotmart.com/K105072021O?off=fhrttdh8&offDiscount=DIARIAESTABCD2345");
});

test("/estudante/ativar nunca abre a oferta de lançamento nem o checkout antigo", () => {
  const r = ativar.GET(pedido("?cupom=diariaestabcd2345"));
  assert.match(r.location, /off=fhrttdh8&offDiscount=DIARIAESTABCD2345$/);
  assert.equal(/lf63bgdd|L107085210M|h82bllbx/.test(r.location), false);
});

test("standby: /estudante/ativar volta sempre para /estudante, até com código válido (nenhum checkout do 7448309)", () => {
  const standby = rotaAtivar(false);
  for (const busca of ["?cupom=DIARIAESTABCD2345", ""]) {
    const r = standby.GET(pedido(busca));
    assert.equal(r.status, 307, busca);
    assert.equal(r.location, "https://diariamente.app/estudante", busca);
  }
});

test("/estudante/ativar com código ausente ou fora do formato volta para /estudante", () => {
  for (const busca of ["", "?cupom=", "?cupom=ABC%20DEF", "?cupom=" + "A".repeat(26), "?cupom=<script>"]) {
    const r = ativar.GET(pedido(busca));
    assert.equal(r.status, 307, busca);
    assert.equal(r.location, "https://diariamente.app/estudante", busca);
  }
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

/* -------------- /api/estudante/solicitar com o fluxo fechado -------------- */

const fs = require("fs");

/** Banco falso do Supabase: registra cada chamada e devolve o mínimo
    que a rota espera. Nada sai da máquina. */
function bancoFalso() {
  const chamadas = [];
  const resposta = (op) => {
    const nomes = op.passos.map((p) => p[0]);
    if (nomes.includes("maybeSingle")) return { data: null, error: null };
    if (nomes.includes("single")) return { data: { id: "lead-teste", nome: "Fulana de Teste" }, error: null };
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

function carregarSolicitar() {
  const banco = bancoFalso();
  const cupons = [];
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
    "@/lib/rdstation": { enviarLeadRD: async () => {} },
  });
  return { rota, banco, cupons };
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
        instituicao: "Universidade Teste", estado: "Distrito Federal (DF)", curso: "Medicina", semestre: 3,
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

test("fluxo FECHADO (chave ligada): /api/estudante/solicitar responde 503 sem ler o pedido, sem banco e sem cupom", async () => {
  const { rota, banco, cupons } = carregarSolicitar();
  for (const valor of [undefined, "", "0", "true"]) {
    const r = await semLog(() =>
      comEnvAsync({ DM_SITE_LANCADO: "1", DM_ESTUDANTE_ABERTO: valor, STUDENT_DISCOUNT: "0.40027" }, () => rota.POST(pedidoEstudante()))
    );
    assert.equal(r.status, 503, String(valor));
    const corpo = await r.json();
    assert.equal(corpo.ok, false);
    assert.match(corpo.erros[0], /abre em breve/);
    assert.equal(corpoLido, false, "o corpo nem é lido");
  }
  assert.equal(banco.chamadas.length, 0, "nenhuma chamada ao banco: nenhum CPF preso");
  assert.equal(cupons.length, 0, "nenhum cupom criado na Hotmart");
});

test("standby: /api/estudante/solicitar é a da produção, sem o 503 (a /estudante de hoje tem o formulário aberto)", async () => {
  const { rota, cupons } = carregarSolicitar();
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
  // o desconto é o da Vercel, como na main
  assert.equal(cupons[0].desconto, 0.42);
});

test("fluxo ABERTO: a mesma rota grava o lead, cria o cupom e agenda o WhatsApp para depois da janela", async () => {
  const { rota, banco, cupons } = carregarSolicitar();
  const antes = Date.now();
  const r = await semLog(() =>
    comEnvAsync({ DM_SITE_LANCADO: "1", DM_ESTUDANTE_ABERTO: "1", STUDENT_DISCOUNT: "0.40027" }, () => rota.POST(pedidoEstudante()))
  );
  assert.equal(r.status, 200);
  const corpo = await r.json();
  assert.equal(corpo.ok, true, JSON.stringify(corpo));
  assert.equal(corpo.agendado, true);
  assert.equal(cupons.length, 1);
  assert.equal(cupons[0].desconto, 0.40027);
  const tabelas = banco.chamadas.map((c) => c.tabela);
  assert.ok(tabelas.includes("leads_estudante"));
  const insercao = banco.chamadas.find((c) => c.tabela === "cupons_estudante" && c.passos[0][0] === "insert");
  assert.ok(insercao, "cupom registrado");
  const enviarEm = Date.parse(insercao.passos[0][1][0].enviar_em);
  assert.ok(enviarEm - antes >= corpo.espera_minutos * 60_000 - 1000, "WhatsApp agendado para depois da janela");
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
