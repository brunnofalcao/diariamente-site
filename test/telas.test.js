// O HTML que o visitante lê, renderizado de verdade (react-dom/server) a
// partir dos componentes e do config real, fora do Next. Cobre:
//   - o comparativo da /estudante durante e depois do lançamento;
//   - a linha "Sou estudante" e o parcelamento do bloco de oferta;
//   - a /estudante com o fluxo do cupom pessoal aberto e fechado.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const jsx = require("react/jsx-runtime");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { carregarTs } = require("../scripts/carregar-ts");

const raiz = path.join(__dirname, "..");
const arq = (...p) => path.join(raiz, ...p);
const P = carregarTs(arq("config", "pricing.ts"));
const rotas = carregarTs(arq("lib", "rotas.ts"));

const LANCAMENTO = Date.parse("2026-10-20T12:00:00-03:00");
const DEPOIS = Date.parse("2026-11-20T12:00:00-03:00");

/** Espaço que não quebra vira espaço comum, para comparar texto. */
const txt = (html) => html.replace(/\u00a0/g, " ");

/** config.ts carregado com DM_ESTUDANTE_ABERTO como o build gravaria. */
function config(aberto) {
  const antes = process.env.DM_ESTUDANTE_ABERTO;
  if (aberto) process.env.DM_ESTUDANTE_ABERTO = "1";
  else delete process.env.DM_ESTUDANTE_ABERTO;
  try {
    return carregarTs(arq("config.ts"), { "@/config/pricing": P });
  } finally {
    if (antes === undefined) delete process.env.DM_ESTUDANTE_ABERTO;
    else process.env.DM_ESTUDANTE_ABERTO = antes;
  }
}

function comRelogio(agora, fn) {
  const real = Date.now;
  Date.now = () => agora;
  try {
    return fn();
  } finally {
    Date.now = real;
  }
}

function blocoPreco(C) {
  return carregarTs(arq("components", "BlocoPreco.tsx"), {
    "@/config": C, "@/config/pricing": P, "react/jsx-runtime": jsx,
  }, { jsx: true }).BlocoPreco;
}

function blocoOferta(C) {
  return carregarTs(arq("components", "BlocoOferta.tsx"), {
    "@/config": C, "@/config/pricing": P, "@/lib/rotas": rotas,
    "@/lib/medicao": { registrarInicioDeCheckout() {} },
    "@/components/ListaEsperaForm": { ListaEsperaForm: () => null },
    "react/jsx-runtime": jsx,
  }, { jsx: true }).BlocoOferta;
}

const html = (Componente, props = {}) => txt(renderToStaticMarkup(React.createElement(Componente, props)));

/* ------------------------- comparativo da /estudante ------------------------- */

test("/estudante no lançamento: a economia é só do primeiro ano e a regra dos 3 anos aparece", () => {
  const h = comRelogio(LANCAMENTO, () => html(blocoPreco(config(true))));
  assert.match(h, /R\$ 10,04 OFF no primeiro ano/);
  assert.match(h, /10% a menos no primeiro ano que o valor que qualquer pessoa paga hoje/);
  assert.match(h, /Hoje, pelo site, o preço de lançamento é R\$ 99,98 por ano nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\./);
  assert.match(h, /Quem entra hoje pelo site<\/span><span class="ed-econ-v">R\$ 99,98<\/span><span class="ed-econ-d">R\$ 8,33\/mês<\/span><span class="ed-econ-d">Por ano nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\.<\/span>/);
  assert.match(h, /Você economiza no primeiro ano<\/span><span class="ed-econ-v">R\$ 10,04<\/span><span class="ed-econ-d">10% de diferença no primeiro ano/);
  assert.match(h, /R\$ 7,50\/mês no primeiro ano/);
  // nenhuma economia sem o "no primeiro ano"
  assert.equal(/Você economiza<\/span>/.test(h), false);
  assert.equal(/OFF<\/span>/.test(h), false);
  // não promete duração do cupom
  assert.equal(/mesmo valor/.test(h), false);
});

test("/estudante depois do lançamento: base R$ 149,90, sem a regra dos 3 anos, ainda \"no primeiro ano\" (renovação não confirmada)", () => {
  const h = comRelogio(DEPOIS, () => html(blocoPreco(config(true))));
  assert.match(h, /R\$ 59,96 OFF no primeiro ano/);
  assert.match(h, /40% a menos no primeiro ano/);
  assert.equal(/3 primeiros anos/.test(h), false);
  assert.equal(/preço de lançamento/.test(h), false);
});

test("/estudante com a renovação confirmada e sem lançamento: a economia passa a ser por ano", () => {
  const C = config(true);
  C.ESTUDANTE.renovaMesmoValor = true;
  const h = comRelogio(DEPOIS, () => html(blocoPreco(C)));
  assert.match(h, /R\$ 59,96 OFF por ano/);
  assert.match(h, /Renova a cada ano pelo mesmo valor/);
  // mas, no lançamento, continua "no primeiro ano"
  const l = comRelogio(LANCAMENTO, () => html(blocoPreco(C)));
  assert.match(l, /OFF no primeiro ano/);
});

test("/estudante com o fluxo fechado: o card avisa que a solicitação abre em breve", () => {
  const h = comRelogio(LANCAMENTO, () => html(blocoPreco(config(false))));
  assert.match(h, /A solicitação do código abre em breve/);
  assert.equal(/o botão da mensagem abre o pagamento/.test(h), false);
  const aberto = comRelogio(LANCAMENTO, () => html(blocoPreco(config(true))));
  assert.match(aberto, /o botão da mensagem abre o pagamento com o\s+desconto já aplicado/);
});

/* --------------------------- bloco de oferta (home) --------------------------- */

test("home do Brasil com o estudante aberto: \"Sou estudante\" com o preço do primeiro ano e o link para a /estudante", () => {
  const h = html(blocoOferta(config(true)), { mercado: "br", momento: LANCAMENTO });
  assert.match(h, /href="\/estudante"/);
  assert.match(h, /Sou estudante: R\$ 7,50\/mês · R\$ 89,94 no primeiro ano/);
  assert.match(h, /R\$ 99,98<\/strong> por ano nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\./);
});

test("home do Brasil com o estudante FECHADO: nenhum link nem preço de estudante", () => {
  for (const momento of [LANCAMENTO, DEPOIS]) {
    const h = html(blocoOferta(config(false)), { mercado: "br", momento });
    assert.equal(/estudante/i.test(h), false);
    assert.equal(/89,94|7,50/.test(h), false);
  }
});

test("home: ESTUDANTE.mostrarPreco = false também esconde o preço de estudante na home", () => {
  const C = config(true);
  C.ESTUDANTE.mostrarPreco = false;
  const h = html(blocoOferta(C), { mercado: "br", momento: LANCAMENTO });
  assert.match(h, /Sou estudante: ver a condição/);
  assert.equal(/89,94|7,50/.test(h), false);
});

test("home depois do lançamento: o parcelamento diz que tem acréscimo e fica separado do equivalente mensal", () => {
  const h = html(blocoOferta(config(true)), { mercado: "br", momento: DEPOIS });
  assert.match(h, /R\$ 12,49/);
  assert.match(h, /À vista, ou em até 12x no cartão com acréscimo/);
  assert.equal(/12x(?! no cartão com acréscimo)/.test(h), false);
  // nunca valor de parcela
  assert.equal(/\d+\s*x\s*de\s*R\$/i.test(h), false);
  // no lançamento, só à vista
  const l = html(blocoOferta(config(true)), { mercado: "br", momento: LANCAMENTO });
  assert.match(l, /Pagamento à vista/);
  assert.equal(/12x/.test(l), false);
});

test("/sobre: o equivalente mensal não encosta no parcelamento, e o parcelado diz que tem acréscimo", () => {
  const fonte = require("fs").readFileSync(arq("app", "sobre", "page.tsx"), "utf8");
  assert.equal(/\/mês\), em até 12x/.test(fonte), false);
  assert.equal(/12x no cartão(?! com acréscimo)/.test(fonte), false);
  assert.match(fonte, /à vista \(equivale a \{cheioMes\}\/mês\), ou em até 12x no cartão com acréscimo/);
});

/* ------------------------- /estudante, página inteira ------------------------- */

function paginaEstudante(C) {
  const Brand = carregarTs(arq("components", "Brand.tsx"), { "react/jsx-runtime": jsx }, { jsx: true });
  const ListaEsperaForm = carregarTs(arq("components", "ListaEsperaForm.tsx"), {
    react: React, "react/jsx-runtime": jsx, "@/components/Brand": Brand,
    "@/lib/consentimento": carregarTs(arq("lib", "consentimento.ts")),
    "@/lib/rotas": rotas, "@/config/pricing": P,
  }, { jsx: true });
  const EstudanteEspera = carregarTs(arq("components", "EstudanteEspera.tsx"), {
    "@/config/pricing": P, "@/components/ListaEsperaForm": ListaEsperaForm, "react/jsx-runtime": jsx,
  }, { jsx: true });
  const EstudanteSticky = carregarTs(arq("components", "EstudanteSticky.tsx"), { react: React, "react/jsx-runtime": jsx }, { jsx: true });
  return carregarTs(arq("app", "estudante", "page.tsx"), {
    "@/lib/seo": { metadataDaPagina: () => ({}) },
    "@/config": C, "@/config/pricing": P,
    "@/components/Brand": Brand,
    "@/components/BlocoPreco": { BlocoPreco: blocoPreco(C) },
    // o formulário real usa o roteador do Next; aqui basta saber se ele entra
    "@/components/EstudanteForm": { EstudanteForm: () => React.createElement("div", { id: "formulario-cpf" }) },
    "@/components/EstudanteEspera": EstudanteEspera,
    "@/components/EstudanteSticky": EstudanteSticky,
    "./estudante.css": {},
    "react/jsx-runtime": jsx,
  }, { jsx: true }).default;
}

test("/estudante FECHADA: lista de espera no lugar do formulário, botões \"Me avise quando abrir\"", () => {
  const h = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(false))));
  assert.equal(/formulario-cpf/.test(h), false, "sem o formulário que pede CPF");
  assert.match(h, /A solicitação do código abre em breve/);
  assert.match(h, /Me avise quando abrir/);
  assert.match(h, /quando a solicitação da condição de estudante abrir/);
  assert.equal(/Solicitar minha condição|Solicitar meu código/.test(h), false);
  assert.equal(/Por que pedimos esses dados/.test(h), false);
});

test("/estudante ABERTA: o formulário de sempre e os botões de solicitar", () => {
  const h = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(true))));
  assert.match(h, /formulario-cpf/);
  assert.match(h, /Solicitar minha condição/);
  assert.match(h, /Solicitar meu código/);
  assert.equal(/abre em breve/.test(h), false);
  // o tempo prometido é o do config, e o resumo fala do primeiro ano
  assert.match(h, /em até 10 minutos/);
  assert.match(h, /R\$ 89,94 no primeiro ano, R\$ 7,50\/mês/);
});

/* ------------------------- home: card do estudante ------------------------- */

test("Home.tsx: o card do estudante depende de ESTUDANTE.aberto e o preço, de ESTUDANTE.mostrarPreco", () => {
  const fonte = require("fs").readFileSync(arq("components", "Home.tsx"), "utf8");
  assert.match(fonte, /\{mkt === "br" && ESTUDANTE\.aberto && \(/);
  assert.match(fonte, /ESTUDANTE\.mostrarPreco \? t\.stH\.replace\("\{preco\}"/);
  // o único outro link da home para a /estudante é o do bloco de oferta
  const links = fonte.match(/caminho\("estudante"/g) || [];
  assert.equal(links.length, 1);
});
