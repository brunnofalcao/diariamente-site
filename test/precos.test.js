// Testes do cálculo de config/pricing.ts: o que o visitante lê e para
// onde o botão leva, antes e depois do fim do lançamento.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const { carregarPrecos } = require("../scripts/checar-precos");

const P = carregarPrecos();
const NBSP = " ";
const txt = (s) => String(s).replace(new RegExp(NBSP, "g"), " ");

const ANTES = Date.parse("2026-10-12T12:00:00-03:00");
const ULTIMO_MINUTO = Date.parse("2026-11-16T23:59:00-03:00");
const DEPOIS = Date.parse("2026-11-17T00:00:00-03:00");

test("até 16/11/2026 (Brasília): R$ 99,98 por ano, R$ 8,33/mês, oferta de lançamento, à vista", () => {
  for (const agora of [ANTES, ULTIMO_MINUTO]) {
    assert.equal(P.lancamentoVigente("br", agora), true);
    assert.equal(P.precoFinal("br", agora), 99.98);
    assert.equal(txt(P.formatar("br", P.precoFinal("br", agora))), "R$ 99,98");
    assert.equal(txt(P.formatar("br", P.porMes("br", agora))), "R$ 8,33");
    assert.equal(P.linkCheckout("br", agora), "https://pay.hotmart.com/K105072021O?off=lf63bgdd");
    // A oferta de lançamento também parcela (checkout da lf63bgdd, 28/10/2026):
    // nada de "Pagamento à vista" como se fosse a única forma.
    assert.equal(P.parcelaAgora("br", agora), true);
    assert.equal(P.pagamentoAgora("br", agora), "À vista, ou em até 12x no cartão com acréscimo");
    assert.equal(txt(P.precoCheio("br", agora)), "R$ 149,90");
    assert.equal(P.percentualDoLancamento("br", agora), 33);
    assert.equal(txt(P.regraDoLancamento("br", agora)), "33% a menos, travado nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
    // a /estudante usa a regra sem o percentual, com o texto de sempre
    // (components/BlocoPreco.tsx, "Por ano nos 3 primeiros anos. ...")
    assert.equal(txt(P.regraDoLancamento("br", agora, { semPercentual: true })), "nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
  }
  assert.equal(P.dataDoLancamento("br"), "16 de novembro");
});

test("a partir de 17/11/2026 00:00 (Brasília): R$ 149,90, R$ 12,49/mês, oferta oficial, até 12x com acréscimo", () => {
  assert.equal(P.lancamentoVigente("br", DEPOIS), false);
  assert.equal(P.precoFinal("br", DEPOIS), 149.9);
  assert.equal(txt(P.formatar("br", P.porMes("br", DEPOIS))), "R$ 12,49");
  assert.equal(P.linkCheckout("br", DEPOIS), "https://pay.hotmart.com/K105072021O?off=fhrttdh8");
  assert.equal(P.parcelaAgora("br", DEPOIS), true);
  assert.equal(P.pagamentoAgora("br", DEPOIS), "À vista, ou em até 12x no cartão com acréscimo");
  assert.equal(P.precoCheio("br", DEPOIS), null);
  assert.equal(P.percentualDoLancamento("br", DEPOIS), null);
  assert.equal(P.regraDoLancamento("br", DEPOIS), null);
  assert.equal(P.fimDoLancamento("br"), DEPOIS);
});

test("nenhum link de venda leva cupom, antes ou depois do lançamento", () => {
  for (const m of P.LISTA_MERCADOS) {
    for (const agora of [ANTES, DEPOIS]) assert.equal(/offDiscount/.test(P.linkCheckout(m, agora)), false, m);
  }
});

test("estudante: o preço, a oferta e o texto viram com o card (16/11/2026, horário de Brasília)", () => {
  const ultimo = Date.parse("2026-11-16T23:59:59.999-03:00");
  const virada = ultimo + 1;
  const antes = { ...P.OFERTAS_DO_ESTUDANTE };
  try {
    Object.assign(P.OFERTAS_DO_ESTUDANTE, { lancamento: "estlanc1", depois: "estdep01" });
    // no último milissegundo do lançamento
    assert.equal(P.faseDoEstudante(ultimo), "lancamento");
    assert.equal(P.lancamentoVigente("br", ultimo), true);
    assert.equal(txt(P.formatar("br", P.precoEstudante(ultimo))), "R$ 59,90");
    assert.equal(P.checkoutDoEstudante(ultimo, "DIARIAESTABC"), "https://pay.hotmart.com/K105072021O?off=estlanc1&sck=DIARIAESTABC");
    assert.equal(txt(P.regraDoEstudante(ultimo)), "R$ 59,90 por ano nos 3 primeiros anos, para quem assinar até 16 de novembro. Depois, R$ 149,90 por ano.");
    assert.equal(txt(P.regraDoEstudante(ultimo, { semPreco: true })), "Nos 3 primeiros anos, para quem assinar até 16 de novembro. Depois, R$ 149,90 por ano.");
    // na virada, junto com o card
    assert.equal(P.faseDoEstudante(virada), "depois");
    assert.equal(P.lancamentoVigente("br", virada), false);
    assert.equal(txt(P.formatar("br", P.precoEstudante(virada))), "R$ 79,90");
    assert.equal(P.checkoutDoEstudante(virada, "DIARIAESTABC"), "https://pay.hotmart.com/K105072021O?off=estdep01&sck=DIARIAESTABC");
    assert.equal(txt(P.regraDoEstudante(virada)), "R$ 79,90 por ano nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
    assert.equal(txt(P.regraDoEstudante(virada, { semPreco: true })), "Nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
    // sem token, sem sck; nunca cupom
    assert.equal(P.checkoutDoEstudante(virada), "https://pay.hotmart.com/K105072021O?off=estdep01");
    for (const t of [ultimo, virada]) assert.equal(/offDiscount|fhrttdh8|lf63bgdd/.test(P.checkoutDoEstudante(t, "X")), false);
    // as duas ofertas, para o webhook
    assert.deepEqual(P.ofertasDoEstudante(), ["estlanc1", "estdep01"]);
    // lançamento encerrado antes da data (ativo: false): o estudante vira junto
    P.MERCADOS.br.lancamento.ativo = false;
    assert.equal(P.faseDoEstudante(ultimo), "depois");
  } finally {
    P.MERCADOS.br.lancamento.ativo = true;
    Object.assign(P.OFERTAS_DO_ESTUDANTE, antes);
  }
});

test("estudante: sem o código da fase (ou com código fora do formato), nenhum checkout: o fluxo fecha", () => {
  const lanc = Date.parse("2026-10-28T12:00:00-03:00");
  const antes = { ...P.OFERTAS_DO_ESTUDANTE };
  try {
    for (const codigo of ["", "  ", "off=abc", "https://pay.hotmart.com/K105072021O?off=abcd1234", "[PREENCHER]"]) {
      Object.assign(P.OFERTAS_DO_ESTUDANTE, { lancamento: codigo, depois: "" });
      assert.equal(P.ofertaDoEstudante(lanc), "", codigo);
      assert.equal(P.estudanteTemOferta(lanc), false, codigo);
      assert.equal(P.checkoutDoEstudante(lanc, "T"), null, codigo);
    }
  } finally {
    Object.assign(P.OFERTAS_DO_ESTUDANTE, antes);
  }
  // o config real: vazio ou um código no formato da Hotmart
  for (const c of [P.ESTUDANTE_OFERTA_LANCAMENTO, P.ESTUDANTE_OFERTA]) assert.ok(c === "" || P.codigoDeOfertaValido(c), c);
});

test("estudante: desconto equivalente só informativo (coluna cupons_estudante.desconto): 0.6004 e 0.46698", () => {
  assert.equal(P.descontoEquivalenteDoEstudante(Date.parse("2026-10-28T12:00:00-03:00")), 0.6004);
  assert.equal(P.descontoEquivalenteDoEstudante(Date.parse("2026-11-20T12:00:00-03:00")), 0.46698);
});

test("mercados de fora: US$ 29,99 por ano (US$ 2,50/mês) em la e rw; 29,99 € em pt e es; sem lançamento", () => {
  assert.equal(txt(P.formatar("la", P.precoFinal("la", ANTES))), "US$ 29.99");
  assert.equal(txt(P.formatar("la", P.porMes("la", ANTES))), "US$ 2.50");
  assert.equal(txt(P.formatar("rw", P.precoFinal("rw", ANTES))), "US$ 29,99");
  assert.equal(txt(P.formatar("rw", P.porMes("rw", ANTES))), "US$ 2,50");
  assert.equal(txt(P.formatar("pt", P.precoFinal("pt", ANTES))), "29,99 €");
  assert.equal(txt(P.formatar("es", P.precoFinal("es", ANTES))), "29,99 €");
  for (const m of ["la", "rw", "pt", "es"]) {
    assert.equal(P.lancamentoVigente(m, ANTES), false, m);
    assert.equal(P.vendeAgora(m), false, m);
  }
});

test("moeda por mercado (decisão do dono, 12/10/2026): Brasil em real, Portugal e Espanha em euro, todo o resto em dólar", () => {
  const moedas = Object.fromEntries(Object.entries(P.MERCADOS).map(([m, o]) => [m, o.moeda]));
  assert.deepEqual(moedas, { br: "BRL", la: "USD", es: "EUR", pt: "EUR", rw: "USD" });
  // América Latina e resto do mundo: a MESMA oferta em dólar, US$ 29,99 por ano
  assert.equal(P.MERCADOS.la.checkout, P.MERCADOS.rw.checkout);
  assert.equal(P.MERCADOS.la.anual, 29.99);
  assert.equal(P.MERCADOS.rw.anual, 29.99);
  assert.equal(txt(P.formatar("la", 29.99)), "US$ 29.99");
  assert.equal(txt(P.formatar("rw", 29.99)), "US$ 29,99");
  assert.equal(txt(P.formatar("pt", 29.99)), "29,99 €");
  assert.equal(txt(P.formatar("es", 29.99)), "29,99 €");
});

test("regra do lançamento: o {pct} sai da conta; sem desconto de 1% ou mais, o trecho do percentual some", () => {
  const br = P.MERCADOS.br;
  const original = br.lancamento.anual;
  try {
    // 10% a menos: R$ 134,91 sobre R$ 149,90
    br.lancamento.anual = 134.91;
    assert.equal(P.percentualDoLancamento("br", ANTES), 10);
    assert.equal(txt(P.regraDoLancamento("br", ANTES)), "10% a menos, travado nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
    // menos de 1% de desconto: nenhum "0% a menos", nem "{pct}" na tela
    br.lancamento.anual = 149.0;
    assert.equal(P.percentualDoLancamento("br", ANTES), null);
    assert.equal(txt(P.regraDoLancamento("br", ANTES)), "Travado nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
    assert.equal(txt(P.regraDoLancamento("br", ANTES, { semPercentual: true })), "nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
  } finally {
    br.lancamento.anual = original;
  }
  // nenhum percentual escrito à mão nos textos do config
  assert.equal(/\d+\s*%/.test(JSON.stringify(P.MERCADOS)), false);
});

/* ----------------------- card de oferta do Brasil ----------------------- */

const centavosInteiros = (v) => Number.isInteger(Math.round(v * 100)) && Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;

test("funções novas, valores de hoje: R$ 0,27 por dia, R$ 449,70, R$ 299,94, R$ 149,76 e \"quase um ano inteiro\"", () => {
  for (const agora of [ANTES, ULTIMO_MINUTO]) {
    assert.equal(P.porDia("br", agora), 0.27);
    assert.equal(txt(P.formatar("br", P.porDia("br", agora))), "R$ 0,27");
    assert.equal(P.economiaDoLancamento("br", agora), 149.76);
    assert.equal(txt(P.formatar("br", P.economiaDoLancamento("br", agora))), "R$ 149,76");
    assert.equal(P.quaseUmAnoInteiro("br", agora), true);
  }
  assert.equal(P.totalEmAnos(P.MERCADOS.br.anual, P.MERCADOS.br.lancamento.anos), 449.7);
  assert.equal(P.totalEmAnos(P.MERCADOS.br.lancamento.anual, P.MERCADOS.br.lancamento.anos), 299.94);
  assert.equal(txt(P.formatar("br", P.totalEmAnos(149.9, 3))), "R$ 449,70");
  assert.equal(txt(P.formatar("br", P.totalEmAnos(99.98, 3))), "R$ 299,94");
  // tudo em centavos inteiros (nada de 449,70000000000005)
  for (const v of [P.porDia("br", ANTES), P.totalEmAnos(149.9, 3), P.totalEmAnos(99.98, 3), P.economiaDoLancamento("br", ANTES), P.totalEmAnos(29.99, 7)]) {
    assert.ok(centavosInteiros(v), String(v));
  }
  // a conta à mão da especificação: 449,70 - 299,94 = 149,76; faltam 0,14 para 149,90
  assert.equal(Math.round(P.totalEmAnos(149.9, 3) * 100) - Math.round(P.totalEmAnos(99.98, 3) * 100), 14976);
  assert.equal(14990 - 14976, 14);
  // depois do lançamento: R$ 0,41 por dia, nenhuma economia, nenhuma legenda
  assert.equal(P.porDia("br", DEPOIS), 0.41);
  assert.equal(P.economiaDoLancamento("br", DEPOIS), null);
  assert.equal(P.quaseUmAnoInteiro("br", DEPOIS), false);
  assert.equal(P.quadroDoLancamento("br", DEPOIS), null);
  // mercados sem lançamento
  for (const m of ["la", "es", "pt", "rw"]) {
    assert.equal(P.economiaDoLancamento(m, ANTES), null, m);
    assert.equal(P.quaseUmAnoInteiro(m, ANTES), false, m);
    assert.equal(P.quadroDoLancamento(m, ANTES), null, m);
    assert.equal(P.linhaDeValor(m, ANTES), null, m);
    assert.equal(P.notaDoLancamento(m, ANTES), null, m);
    assert.equal(P.notaDaBarra(m, ANTES), null, m);
  }
});

test("legenda \"Quase o preço oficial de um ano inteiro.\": só de 95% a menos de 100% do preço oficial", () => {
  const br = P.MERCADOS.br;
  const original = br.lancamento.anual;
  const legenda = () => P.quadroDoLancamento("br", ANTES).legenda;
  try {
    assert.equal(legenda(), "Quase o preço oficial de um ano inteiro.");
    // economia de um ano inteiro ou mais: (149,90 - 99,93) x 3 = 149,91, "quase" seria falso
    br.lancamento.anual = 99.93;
    assert.equal(P.economiaDoLancamento("br", ANTES), 149.91);
    assert.equal(P.quaseUmAnoInteiro("br", ANTES), false);
    assert.equal(legenda(), null);
    // (149,90 - 99,90) x 3 = 150,00: passa de um ano, também sem legenda
    br.lancamento.anual = 99.9;
    assert.equal(P.economiaDoLancamento("br", ANTES), 150);
    assert.equal(P.quaseUmAnoInteiro("br", ANTES), false);
    // menos de 95%: (149,90 - 110,00) x 3 = 119,70, 79,9%
    br.lancamento.anual = 110;
    assert.equal(P.economiaDoLancamento("br", ANTES), 119.7);
    assert.equal(P.quaseUmAnoInteiro("br", ANTES), false);
    assert.equal(legenda(), null);
    // o quadro continua, só a legenda some
    assert.equal(txt(P.quadroDoLancamento("br", ANTES).economia.valor), "R$ 119,70");
    // limite de 95%: 14241 centavos (95,004%) aparece; 14238 (94,98%) não
    br.lancamento.anual = 102.43; // (14990 - 10243) x 3 = 14241
    assert.equal(P.quaseUmAnoInteiro("br", ANTES), true);
    br.lancamento.anual = 102.44; // (14990 - 10244) x 3 = 14238
    assert.equal(P.quaseUmAnoInteiro("br", ANTES), false);
  } finally {
    br.lancamento.anual = original;
  }
});

test("textos do card com conta: regra, valor por mês e por dia, quadro, CTA final e barra fixa", () => {
  const corrido = (partes) => txt(P.textoCorrido(partes));
  assert.deepEqual(P.regraDoLancamentoEmPartes("br", ANTES).map((p) => [txt(p.texto), p.destaque]), [
    ["33% a menos", true], [", travado nos 3 primeiros anos. Depois, R$ 149,90 por ano.", false],
  ]);
  assert.equal(corrido(P.linhaDeValor("br", ANTES)), "Equivale a R$ 8,33 por mês. Por dia, cerca de R$ 0,27 e três minutos.");
  assert.deepEqual(P.linhaDeValor("br", ANTES).filter((p) => p.destaque).map((p) => txt(p.texto)), ["R$ 8,33", "R$ 0,27"]);
  assert.equal(corrido(P.linhaDeValor("br", DEPOIS)), "Equivale a R$ 12,49 por mês. Por dia, cerca de R$ 0,41 e três minutos.");
  const q = P.quadroDoLancamento("br", ANTES);
  assert.deepEqual(
    [q.oficial, q.lancamento, q.economia].map((l) => [l.rotulo, txt(l.valor)]),
    [["3 anos no preço oficial", "R$ 449,70"], ["3 anos no lançamento", "R$ 299,94"], ["Em 3 anos, você deixa de pagar", "R$ 149,76"]],
  );
  assert.equal(txt(P.notaDoLancamento("br", ANTES)), "por ano à vista nos 3 primeiros anos, para quem assinar até 16 de novembro · Garantia de 7 dias");
  assert.equal(P.notaDaBarra("br", ANTES), "por ano durante 3 anos");
  assert.equal(P.notaDoLancamento("br", DEPOIS), null);
  assert.equal(P.notaDaBarra("br", DEPOIS), null);
  // nenhum {marcador} nem asterisco chega ao texto
  for (const s of [
    P.regraDoLancamento("br", ANTES), P.regraDoLancamento("br", ANTES, { semPercentual: true }),
    P.textoCorrido(P.linhaDeValor("br", ANTES)), P.textoCorrido(P.linhaDeValor("br", DEPOIS)),
    P.notaDoLancamento("br", ANTES), P.notaDaBarra("br", ANTES), q.oficial.rotulo, q.lancamento.rotulo, q.economia.rotulo,
  ]) {
    assert.equal(/[{}*]/.test(s), false, s);
  }
});

test("revisão do card (28/10/2026): os anos do quadro e do CTA final saem da conta, com o à vista no CTA", () => {
  // "Em 3 anos, você deixa de pagar": o 3 é o lancamento.anos, não texto
  // escrito; com outro número de anos, o rótulo e o valor acompanham.
  const l = P.MERCADOS.br.lancamento;
  const anos = l.anos;
  try {
    l.anos = 2;
    const q = P.quadroDoLancamento("br", ANTES);
    assert.deepEqual([q.economia.rotulo, txt(q.economia.valor)], ["Em 2 anos, você deixa de pagar", "R$ 99,84"]);
    assert.equal(txt(P.notaDoLancamento("br", ANTES)), "por ano à vista nos 2 primeiros anos, para quem assinar até 16 de novembro · Garantia de 7 dias");
  } finally {
    l.anos = anos;
  }
  // o "à vista" vem logo depois de "por ano", nunca colado à data
  assert.match(txt(P.notaDoLancamento("br", ANTES)), /^por ano à vista nos 3 primeiros anos, para quem assinar até /);
});

test("garantia escrita em config/pricing.ts é a de GARANTIA.dias (config.ts)", () => {
  const path = require("path");
  const { carregarTs } = require("../scripts/carregar-ts");
  const C = carregarTs(path.join(__dirname, "..", "config.ts"), { "@/config/pricing": P });
  const dias = C.GARANTIA.dias;
  assert.equal(dias, 7);
  const br = P.MERCADOS.br;
  assert.equal(br.confianca[0], `Garantia incondicional de ${dias} dias. Decida com o app na mão.`);
  assert.match(br.textos.notaLancamento, new RegExp(` · Garantia de ${dias} dias$`));
  assert.match(br.textos.nota, new RegExp(`Garantia de ${dias} dias$`));
  for (const o of Object.values(P.MERCADOS)) {
    for (const s of [...o.confianca, o.textos.nota]) {
      for (const n of (s.match(/(\d+) d[ií]as/g) || [])) assert.equal(parseInt(n, 10), dias, s);
    }
  }
  // "Decida com o app na mão." só no Brasil, e sempre colada à garantia
  for (const m of ["la", "es", "pt", "rw"]) assert.equal(/app na mão/.test(JSON.stringify(P.MERCADOS[m])), false, m);
});

/* ------------- o código da oferta de estudante fica no servidor ------------- */

test("estudante: fasesComOferta (o que o build grava em DM_ESTUDANTE_FASES) traz só o NOME das fases com código", () => {
  const antes = { ...P.OFERTAS_DO_ESTUDANTE };
  try {
    Object.assign(P.OFERTAS_DO_ESTUDANTE, { lancamento: "estlanc1", depois: "estdep01" });
    assert.deepEqual(P.fasesComOferta(), ["lancamento", "depois"]);
    Object.assign(P.OFERTAS_DO_ESTUDANTE, { lancamento: "estlanc1", depois: "" });
    assert.deepEqual(P.fasesComOferta(), ["lancamento"]);
    Object.assign(P.OFERTAS_DO_ESTUDANTE, { lancamento: "off=x", depois: "estdep01" });
    assert.deepEqual(P.fasesComOferta(), ["depois"]);
    // o pós-pagamento reconhece a oferta paga (sem diferença de maiúsculas)
    Object.assign(P.OFERTAS_DO_ESTUDANTE, { lancamento: "estlanc1", depois: "estdep01" });
    assert.equal(P.faseDaOfertaDoEstudante("estlanc1"), "lancamento");
    assert.equal(P.faseDaOfertaDoEstudante(" ESTDEP01 "), "depois");
    for (const off of ["", null, undefined, "fhrttdh8", "lf63bgdd", "estlanc"]) assert.equal(P.faseDaOfertaDoEstudante(off), null, String(off));
    assert.deepEqual(P.mercadosDasOfertasDoEstudante(), { estlanc1: ["br"], estdep01: ["br"] });
  } finally {
    Object.assign(P.OFERTAS_DO_ESTUDANTE, antes);
  }
});

const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

/** O que lê o código da oferta de estudante (config/pricing.ts). */
const LE_O_CODIGO = /\b(OFERTAS_DO_ESTUDANTE|ESTUDANTE_OFERTA_LANCAMENTO|ESTUDANTE_OFERTA|ofertaDoEstudante|ofertasDoEstudante|estudanteTemOferta|checkoutDoEstudante|faseDaOfertaDoEstudante|mercadosDasOfertasDoEstudante|fasesComOferta)\b/;

/** Arquivos que vão ao navegador: os "use client" e o que eles importam
    do projeto (@/...), menos o config/pricing.ts, onde as funções moram
    (o build tira o que não é chamado; scripts/conferir-bundle.js confere). */
function arquivosDoNavegador() {
  const todos = [];
  const varrer = (pasta) => {
    for (const nome of fs.readdirSync(path.join(raiz, pasta))) {
      const rel = path.join(pasta, nome);
      if (fs.statSync(path.join(raiz, rel)).isDirectory()) varrer(rel);
      else if (/\.(tsx?|jsx?|mjs)$/.test(nome)) todos.push(rel);
    }
  };
  for (const p of ["app", "components", "lib"]) varrer(p);
  const doCliente = todos.filter((f) => /^\s*["']use client["']/.test(fs.readFileSync(path.join(raiz, f), "utf8")));
  const vistos = new Set();
  const fila = [...doCliente];
  while (fila.length) {
    const f = fila.shift();
    if (vistos.has(f)) continue;
    vistos.add(f);
    const fonte = fs.readFileSync(path.join(raiz, f), "utf8");
    for (const m of fonte.matchAll(/^\s*import\s+(?!type\b)[^;]*?from\s+["']@\/([^"']+)["']/gm)) {
      const base = m[1];
      const achado = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx"]
        .map((ext) => base + ext)
        .find((c) => fs.existsSync(path.join(raiz, c)) && fs.statSync(path.join(raiz, c)).isFile());
      if (achado && achado !== path.join("config", "pricing.ts")) fila.push(achado);
    }
  }
  return { doCliente, vistos: [...vistos] };
}

test("estudante: nenhum arquivo que vai ao navegador lê o código da oferta (só o nome das fases, DM_ESTUDANTE_FASES)", () => {
  const { doCliente, vistos } = arquivosDoNavegador();
  assert.ok(doCliente.includes(path.join("components", "Home.tsx")));
  assert.ok(doCliente.includes(path.join("components", "BlocoOferta.tsx")));
  assert.ok(vistos.includes("config.ts"), "o config.ts vai ao navegador pela Home");
  for (const f of vistos) {
    const fonte = fs.readFileSync(path.join(raiz, f), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    assert.equal(LE_O_CODIGO.test(fonte), false, `${f} lê o código da oferta de estudante: ${(fonte.match(LE_O_CODIGO) || [])[0]}`);
  }
  // o config.ts decide pelo nome das fases que o build gravou
  const config = fs.readFileSync(path.join(raiz, "config.ts"), "utf8");
  assert.match(config, /process\.env\.DM_ESTUDANTE_FASES/);
});

test("estudante: a conferência depois do build acha o código no JavaScript do navegador e ignora o .js do servidor", () => {
  const { procurarCodigos, codigosDoConfig } = require("../scripts/conferir-bundle");
  const os = require("os");
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "conferir-bundle-"));
  try {
    const next = path.join(pasta, ".next");
    fs.mkdirSync(path.join(next, "static", "chunks"), { recursive: true });
    fs.mkdirSync(path.join(next, "server", "app", "estudante", "ativar"), { recursive: true });
    fs.writeFileSync(path.join(next, "static", "chunks", "a.js"), 'x={lancamento:"zzestl59",depois:""}');
    fs.writeFileSync(path.join(next, "static", "chunks", "zzestd79abc.js"), "nada aqui");
    fs.writeFileSync(path.join(next, "server", "app", "estudante", "ativar", "route.js"), 'o="zzestd79"');
    fs.writeFileSync(path.join(next, "server", "app", "index.html"), "<p>sem código</p>");
    const achados = procurarCodigos(next, ["zzestl59", "zzestd79"]);
    assert.deepEqual(achados.map((a) => a.codigo), ["zzestl59"]);
    assert.match(achados[0].arquivo, /static[\\/]chunks[\\/]a\.js$/);
    // no HTML gerado no build também conta
    fs.writeFileSync(path.join(next, "server", "app", "index.html"), '<a href="?off=zzestd79">');
    assert.deepEqual(procurarCodigos(next, ["zzestd79"]).map((a) => a.codigo), ["zzestd79"]);
    assert.deepEqual(procurarCodigos(next, []), []);
  } finally {
    fs.rmSync(pasta, { recursive: true, force: true });
  }
  assert.deepEqual(codigosDoConfig({ OFERTAS_DO_ESTUDANTE: { lancamento: "estlanc1", depois: " " } }), ["estlanc1"]);
  // o npm run build roda a conferência logo depois do next build
  const pacote = JSON.parse(fs.readFileSync(path.join(raiz, "package.json"), "utf8"));
  assert.equal(pacote.scripts.build, "next build && node scripts/conferir-bundle.js");
});
