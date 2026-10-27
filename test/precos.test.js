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
    assert.equal(P.parcelaAgora("br", agora), false);
    assert.equal(P.pagamentoAgora("br", agora), "Pagamento à vista");
    assert.equal(/12x/.test(P.pagamentoAgora("br", agora)), false);
    assert.equal(txt(P.precoCheio("br", agora)), "R$ 149,90");
    assert.equal(P.percentualDoLancamento("br", agora), 33);
    assert.equal(txt(P.regraDoLancamento("br", agora)), "nos 3 primeiros anos, 33% a menos que o preço oficial. Depois, R$ 149,90 por ano.");
    // a /estudante usa a regra sem o percentual (components/BlocoPreco.tsx)
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

test("estudante: preço final R$ 89,90 por ano, R$ 7,49/mês, no checkout oficial com o cupom", () => {
  assert.equal(P.ESTUDANTE_PRECO_FINAL, 89.9);
  assert.equal(txt(P.formatar("br", P.precoEstudante())), "R$ 89,90");
  assert.equal(txt(P.formatar("br", P.porMesEstudante())), "R$ 7,49");
  // o desconto do cupom nasce do preço final: 1 - 89,90/149,90, 5 casas
  assert.equal(P.ESTUDANTE_DESCONTO, 0.40027);
  assert.equal(P.precoComDesconto(P.MERCADOS.br.anual, P.ESTUDANTE_DESCONTO), 89.9);
  // com 2 casas (40%), o checkout daria R$ 89,94
  assert.equal(P.precoComDesconto(P.MERCADOS.br.anual, 0.4), 89.94);
  assert.equal(
    P.linkComCupom(P.MERCADOS.br.checkout, "DIARIAESTABCD2345"),
    "https://pay.hotmart.com/K105072021O?off=fhrttdh8&offDiscount=DIARIAESTABCD2345"
  );
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

test("estudante: o desconto do cupom deixa o preço exato em R$ 89,90 ou abaixo, nunca acima", () => {
  assert.equal(P.ESTUDANTE_DESCONTO, 0.40027);
  const exato = Math.round(P.MERCADOS.br.anual * 100) * (1 - P.ESTUDANTE_DESCONTO);
  assert.ok(exato <= 8990 && Math.round(exato) === 8990, String(exato));
  assert.equal(P.precoEstudante(), 89.9);
  assert.equal(P.porMesEstudante(), 7.49);
});

test("regra do lançamento: o {pct} sai da conta; sem desconto de 1% ou mais, o trecho do percentual some", () => {
  const br = P.MERCADOS.br;
  const original = br.lancamento.anual;
  try {
    // 10% a menos: R$ 134,91 sobre R$ 149,90
    br.lancamento.anual = 134.91;
    assert.equal(P.percentualDoLancamento("br", ANTES), 10);
    assert.equal(txt(P.regraDoLancamento("br", ANTES)), "nos 3 primeiros anos, 10% a menos que o preço oficial. Depois, R$ 149,90 por ano.");
    // menos de 1% de desconto: nenhum "0% a menos"
    br.lancamento.anual = 149.0;
    assert.equal(P.percentualDoLancamento("br", ANTES), null);
    assert.equal(txt(P.regraDoLancamento("br", ANTES)), "nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
  } finally {
    br.lancamento.anual = original;
  }
  // nenhum percentual escrito à mão nos textos do config
  assert.equal(/\d+\s*%/.test(JSON.stringify(P.MERCADOS)), false);
});
