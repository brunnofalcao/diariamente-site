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
    [["3 anos no preço oficial", "R$ 449,70"], ["3 anos no lançamento", "R$ 299,94"], ["Você deixa de pagar", "R$ 149,76"]],
  );
  assert.equal(txt(P.notaDoLancamento("br", ANTES)), "por ano nos 3 primeiros anos, para quem assinar até 16 de novembro · Garantia de 7 dias");
  assert.equal(P.notaDaBarra("br", ANTES), "por ano durante 3 anos");
  assert.equal(P.notaDoLancamento("br", DEPOIS), null);
  assert.equal(P.notaDaBarra("br", DEPOIS), null);
  // nenhum {marcador} nem asterisco chega ao texto
  for (const s of [
    P.regraDoLancamento("br", ANTES), P.regraDoLancamento("br", ANTES, { semPercentual: true }),
    P.textoCorrido(P.linhaDeValor("br", ANTES)), P.textoCorrido(P.linhaDeValor("br", DEPOIS)),
    P.notaDoLancamento("br", ANTES), P.notaDaBarra("br", ANTES), q.oficial.rotulo, q.lancamento.rotulo,
  ]) {
    assert.equal(/[{}*]/.test(s), false, s);
  }
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
