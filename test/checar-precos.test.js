// Testes da trava de preços e checkout (scripts/checar-precos.js).
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const {
  checarPrecos, carregarPrecos, checarPrecosDoProjeto, estudanteMostraPrecoNoConfig, idsDeOfertaValidos,
  estadoDoEstudante, estudanteDoProjeto, descontoGarantido, cenariosDoPrimeiroCupom, SITE_DOMINIO,
} = require("../scripts/checar-precos");

const LINK_OK = "https://pay.hotmart.com/X00000000Y?off=teste000&checkoutMode=10";
const LINK_LANC = "https://pay.hotmart.com/X00000000Y?off=lanc0000";
// Estudante pronto: modelo v2 do WhatsApp, produto 7448309, desconto
// que dá o preço final anunciado e id numérico de oferta.
const ENV_ESTUDANTE = {
  HOTMART_OFFER_IDS: "1234567", WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2",
  HOTMART_PRODUCT_ID: "7448309", STUDENT_DISCOUNT: "0.40027",
};
// O que a página anuncia ao estudante (o anual vem do mercado br).
const ALVO = { precoFinal: 89.9, desconto: 0.40027 };
const ALVO_BR = { anual: 149.9, ...ALVO };
const DIA_12_10 = Date.parse("2026-10-12T12:00:00Z");

/** Mercados fictícios a partir do config real, com o que o teste trocar. */
function mercados(troca = {}) {
  const { MERCADOS } = carregarPrecos();
  const m = JSON.parse(JSON.stringify(MERCADOS));
  m.br.checkout = LINK_OK;
  m.br.lancamento.checkout = LINK_LANC;
  m.br.lancamento.terminaEm = "2099-12-31";
  m.br.lancamento.ativo = true;
  for (const [k, v] of Object.entries(troca)) m[k] = { ...m[k], ...v };
  return m;
}

const checar = (m, extra = {}) => checarPrecos({ mercados: m, alvoEstudante: ALVO, env: ENV_ESTUDANTE, agora: DIA_12_10, ...extra });

test("o config/pricing.ts real carrega fora do Next e tem os cinco mercados", () => {
  const cfg = carregarPrecos();
  assert.deepEqual(Object.keys(cfg.MERCADOS).sort(), ["br", "es", "la", "pt", "rw"]);
  assert.equal(cfg.PRODUTO_HOTMART, "7448309");
  assert.equal(cfg.PARAMETRO_CUPOM, "offDiscount");
});

test("config do dono (12/10/2026): links, lançamento e mercados de fora", () => {
  const { MERCADOS } = carregarPrecos();
  assert.equal(MERCADOS.br.checkout, "https://pay.hotmart.com/K105072021O?off=fhrttdh8");
  assert.equal(MERCADOS.br.anual, 149.9);
  assert.equal(MERCADOS.br.parcela, true);
  const l = MERCADOS.br.lancamento;
  assert.equal(l.checkout, "https://pay.hotmart.com/K105072021O?off=lf63bgdd");
  assert.equal(l.anual, 99.98);
  assert.equal(l.anos, 3);
  assert.equal(l.terminaEm, "2026-11-16");
  assert.equal(l.ativo, true);
  assert.equal(l.parcela, false);
  // lançamento não é cupom: nenhum link de venda leva offDiscount
  for (const o of Object.values(MERCADOS)) assert.equal(/offDiscount/.test(o.checkout), false);
  assert.equal(/offDiscount/.test(l.checkout), false);
  // mercados de fora com link pronto e venda fechada
  assert.equal(MERCADOS.la.checkout, "https://pay.hotmart.com/K105072021O?off=uevhmhy2");
  assert.equal(MERCADOS.rw.checkout, "https://pay.hotmart.com/K105072021O?off=uevhmhy2");
  assert.equal(MERCADOS.pt.checkout, "https://pay.hotmart.com/K105072021O?off=3n484jbe");
  assert.equal(MERCADOS.es.checkout, "https://pay.hotmart.com/K105072021O?off=iuoufnf6");
  assert.equal(MERCADOS.la.anual, 29.99);
  assert.equal(MERCADOS.rw.anual, 29.99);
  for (const m of ["la", "rw", "pt", "es"]) assert.equal(MERCADOS[m].vendaAberta, false, m);
});

test("nenhum link do config aponta para o checkout antigo nem para a oferta de estudante", () => {
  const texto = require("fs").readFileSync(require("path").join(__dirname, "..", "config", "pricing.ts"), "utf8");
  assert.equal(/L107085210M/.test(texto), false);
  assert.equal(/h82bllbx/.test(texto), false);
});

test("hoje o build de produção da trava de preços passa (só avisos)", () => {
  const r = checarPrecosDoProjeto({});
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(r.teste, false);
  // rw fechado não exige link nem trava
  assert.equal(/Mercado rw/.test(r.problemas.join(" ")), false);
  assert.match(r.avisos.join(" "), /lista de espera \(vendaAberta: false\): la, es, pt, rw/);
});

test("com tudo preenchido e o estudante pronto, libera com o estudante ABERTO e sem pendência de estudante", () => {
  const r = checar(mercados());
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(r.teste, false);
  assert.equal(r.estudante.aberto, true);
  const avisos = r.avisos.join(" ");
  assert.equal(/HOTMART_OFFER_IDS/.test(avisos), false);
  assert.equal(/WA_TEMPLATE_ESTUDANTE/.test(avisos), false);
  assert.equal(/FECHADO/.test(avisos), false);
  assert.match(avisos, /Estudante ABERTO/);
  assert.match(avisos, /webhooks\/hotmart/);
});

test("cada peça do Brasil, sozinha, já trava", () => {
  for (const [campo, valor, padrao] of [
    ["checkout", "[PREENCHER: link]", /CHECKOUT_BRL/],
    ["lancamento.checkout", "[PREENCHER: link]", /CHECKOUT_LANCAMENTO/],
    ["lancamento.terminaEm", "[PREENCHER: data]", /FIM_DO_LANCAMENTO/],
  ]) {
    const m = mercados();
    if (campo === "checkout") m.br.checkout = valor;
    else m.br.lancamento[campo.split(".")[1]] = valor;
    const r = checar(m);
    assert.equal(r.ok, false, campo);
    assert.match(r.mensagem, padrao);
  }
});

test("link antigo de R$ 137,90, link fora da Hotmart e link com cupom travam (nos dois links do Brasil)", () => {
  for (const link of [
    "https://pay.hotmart.com/L107085210M?checkoutMode=10",
    "https://pay.hotmart.com/L107085210M",
    "https://exemplo.com/checkout",
    "http://pay.hotmart.com/X00000000Y",
    "https://pay.hotmart.com/X00000000Y?off=abc&offDiscount=ABC",
  ]) {
    const m1 = mercados();
    m1.br.checkout = link;
    assert.equal(checar(m1).ok, false, `CHECKOUT_BRL ${link}`);
    const m2 = mercados();
    m2.br.lancamento.checkout = link;
    assert.equal(checar(m2).ok, false, `CHECKOUT_LANCAMENTO ${link}`);
  }
});

test("lançamento com a mesma oferta do preço cheio trava", () => {
  const igual = mercados();
  igual.br.lancamento.checkout = LINK_OK;
  const r = checar(igual);
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /mesma oferta/);
  const mesmaOferta = mercados();
  mesmaOferta.br.lancamento.checkout = "https://pay.hotmart.com/X00000000Y?off=teste000";
  assert.equal(checar(mesmaOferta).ok, false);
});

test("preço do lançamento acima do cheio, zerado, ou anos inválidos travam", () => {
  for (const [campo, valor] of [["anual", 149.9], ["anual", 0], ["anual", 199], ["anos", 0], ["anos", 1.5]]) {
    const m = mercados();
    m.br.lancamento[campo] = valor;
    assert.equal(checar(m).ok, false, `${campo}=${valor}`);
  }
});

test("L107085210M é código de PRODUTO: com off (oferta escolhida) passa, só com aviso", () => {
  const m = mercados();
  m.br.checkout = "https://pay.hotmart.com/L107085210M?off=abcd1234";
  const r = checar(m);
  assert.equal(r.ok, true, r.mensagem);
  assert.match(r.avisos.join(" "), /K105072021O/);
});

test("checkout do 7448309 (K105072021O) passa sem o aviso de produto", () => {
  const m = mercados();
  m.br.checkout = "https://pay.hotmart.com/K105072021O?off=abcd1234";
  const r = checar(m);
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(/usa o checkout/.test(r.avisos.join(" ")), false);
});

test("data fora do formato trava", () => {
  const m = mercados();
  m.br.lancamento.terminaEm = "16/11/2026";
  assert.equal(checar(m).ok, false);
});

test("data que não existe no calendário trava (Date.parse passaria para o mês seguinte)", () => {
  for (const data of ["2026-11-31", "2026-04-31", "2026-02-31", "2026-02-29", "2026-13-01", "2026-00-10"]) {
    const m = mercados();
    m.br.lancamento.terminaEm = data;
    const r = checar(m);
    assert.equal(r.ok, false, data);
    assert.match(r.mensagem, /FIM_DO_LANCAMENTO/, data);
  }
  const bissexto = mercados();
  bissexto.br.lancamento.terminaEm = "2028-02-29";
  assert.equal(checar(bissexto).ok, true);
});

test("lançamento ligado: aviso com a data, o link e o lembrete de desativar a oferta", () => {
  const m = mercados();
  m.br.lancamento.terminaEm = "2026-11-16";
  const aviso = checar(m).avisos.join(" ");
  assert.match(aviso, /Lançamento ligado até 16\/11\/2026/);
  assert.ok(aviso.includes(LINK_LANC), aviso);
  assert.match(aviso, /02:00 de 17\/11/);
  assert.match(aviso, /desative/);
});

test("lançamento desligado: aviso com o link exato para conferir R$ 99,98", () => {
  const m = mercados();
  m.br.lancamento.ativo = false;
  const r = checar(m);
  assert.equal(r.ok, true);
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /ativo: false/);
  assert.ok(aviso.includes(LINK_LANC), aviso);
  assert.match(aviso, /99,98/);
});

test("lançamento vencido não trava, só avisa", () => {
  const m = mercados();
  m.br.lancamento.terminaEm = "2026-10-01";
  const r = checar(m);
  assert.equal(r.ok, true);
  assert.match(r.avisos.join(" "), /terminou em 01\/10\/2026/);
});

test("mercado br sem lançamento não trava", () => {
  const m = mercados();
  m.br.lancamento = null;
  const r = checar(m);
  assert.equal(r.ok, true, r.mensagem);
  assert.match(r.avisos.join(" "), /sem oferta de lançamento/);
});

test("todo build lista os mercados em lista de espera", () => {
  const r = checar(mercados());
  assert.match(r.avisos.join(" "), /lista de espera \(vendaAberta: false\): la, es, pt, rw/);
  const todos = mercados({ la: { vendaAberta: true }, es: { vendaAberta: true }, pt: { vendaAberta: true }, rw: { vendaAberta: true } });
  assert.equal(/lista de espera/.test(checar(todos).avisos.join(" ")), false);
});

test("mercado ligado (vendaAberta) sem o link do plano trava; fechado sem link, não", () => {
  const ligado = mercados({ pt: { vendaAberta: true, checkout: "[PREENCHER: link]" } });
  const r = checar(ligado);
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /Mercado pt/);
  const fechado = mercados({ rw: { vendaAberta: false, checkout: "[PREENCHER: link]" } });
  assert.equal(checar(fechado).ok, true);
  const comLink = mercados({ rw: { vendaAberta: true } });
  assert.equal(checar(comLink).ok, true);
});

test("link de TODO mercado passa pela conferência: aberto trava; fechado avisa (na vitrine o botão já abre esse link)", () => {
  const ruins = {
    pendente: "[PREENCHER: link]",
    foraDaHotmart: "https://exemplo.com/checkout",
    comCupom: "https://pay.hotmart.com/K105072021O?off=uevhmhy2&offDiscount=X",
    antigo: "https://pay.hotmart.com/L107085210M",
  };
  for (const [caso, link] of Object.entries(ruins)) {
    for (const m of ["la", "es", "pt", "rw"]) {
      const fechado = checar(mercados({ [m]: { vendaAberta: false, checkout: link } }));
      assert.equal(fechado.ok, true, `${caso} ${m} fechado`);
      assert.equal(fechado.problemas.some((x) => x.includes(`Mercado ${m}`)), false, `${caso} ${m} fechado`);
      assert.ok(fechado.avisos.some((x) => x.startsWith(`Mercado ${m} (venda fechada; na vitrine o botão já abre este link)`)), `${caso} ${m} fechado`);
      const aberto = checar(mercados({ [m]: { vendaAberta: true, checkout: link } }));
      assert.equal(aberto.ok, false, `${caso} ${m} aberto`);
      assert.ok(aberto.problemas.some((x) => x.startsWith(`Mercado ${m} com vendaAberta: true`)), `${caso} ${m} aberto`);
    }
  }
  // os links de hoje, todos bons: nenhum aviso de link de mercado fechado
  const hoje = checarPrecosDoProjeto({});
  assert.equal(hoje.avisos.some((x) => /venda fechada; na vitrine/.test(x)), false);
});

test("avisos aparecem também na mensagem do build bloqueado", () => {
  const m = mercados();
  m.br.checkout = "[PREENCHER: link]";
  const r = checar(m);
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /Avisos: .*lista de espera/);
});

test("estudante: HOTMART_OFFER_IDS vazio ou sem id numérico avisa (sem travar)", () => {
  for (const ids of ["", "  ", "fhrttdh8", "fhrttdh8, abc"]) {
    const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, HOTMART_OFFER_IDS: ids } });
    assert.equal(r.ok, true, ids);
    assert.match(r.avisos.join(" "), /HOTMART_OFFER_IDS/, ids);
    assert.match(r.avisos.join(" "), /inclusive a de lançamento/, ids);
  }
  assert.deepEqual(idsDeOfertaValidos("123, abc,456"), ["123", "456"]);
});

test("estudante: modelo de WhatsApp antigo (ou sem WA_TEMPLATE_ESTUDANTE) avisa até o v2", () => {
  for (const nome of [undefined, "", "diariamente_estudante_aprovado"]) {
    const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { HOTMART_OFFER_IDS: "1", WA_TEMPLATE_ESTUDANTE: nome } });
    const aviso = r.avisos.join(" ");
    assert.match(aviso, /diariamente_estudante_aprovado/);
    assert.match(aviso, /estudante\/ativar\?cupom=\{\{1\}\}/);
    assert.match(aviso, /WA_TEMPLATE_ESTUDANTE/);
  }
  const v2 = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: ENV_ESTUDANTE });
  assert.equal(/WA_TEMPLATE_ESTUDANTE/.test(v2.avisos.join(" ")), false);
  const confirmado = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { HOTMART_OFFER_IDS: "1", DM_TEMPLATE_ESTUDANTE_OK: "1" } });
  assert.equal(/WA_TEMPLATE_ESTUDANTE/.test(confirmado.avisos.join(" ")), false);
  // o config.ts real hoje mostra o preço de estudante
  assert.equal(estudanteMostraPrecoNoConfig(), true);
});

test("HOTMART_PRODUCT_ID diferente de 7448309 gera aviso", () => {
  const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, HOTMART_PRODUCT_ID: "8280315" } });
  assert.match(r.avisos.join(" "), /HOTMART_PRODUCT_ID=8280315/);
  const certo = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, HOTMART_PRODUCT_ID: "7448309" } });
  assert.equal(/HOTMART_PRODUCT_ID/.test(certo.avisos.join(" ")), false);
});

test("STUDENT_DISCOUNT que não dá R$ 89,90 gera aviso com o valor exato a pôr na Vercel", () => {
  for (const d of ["0.44", "0.40", "0.4"]) {
    const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, STUDENT_DISCOUNT: d } });
    assert.equal(r.ok, true, d);
    assert.match(r.avisos.join(" "), /STUDENT_DISCOUNT=0\.40027, que sobre R\$ 149,90 dá os R\$ 89,90 por ano/, d);
  }
  // 0.40 era o 40% antigo: o aviso diz quanto ele cobraria
  const antigo = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, STUDENT_DISCOUNT: "0.40" } });
  assert.match(antigo.avisos.join(" "), /hoje STUDENT_DISCOUNT=0\.40, que daria R\$ 89,94/);
  const igual = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, STUDENT_DISCOUNT: "0.40027" } });
  assert.equal(/STUDENT_DISCOUNT=0\.40027, que/.test(igual.avisos.join(" ")), false);
  assert.equal(igual.estudante.aberto, true);
});

test("estudante ABERTO: o aviso pede para conferir o primeiro cupom real no checkout", () => {
  const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: ENV_ESTUDANTE, agora: DIA_12_10 });
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /Estudante ABERTO neste build .*STUDENT_DISCOUNT=0\.40027: R\$ 89,90 por ano sobre R\$ 149,90/);
  assert.match(aviso, /PRIMEIRO cupom real no checkout: ele precisa mostrar R\$ 89,90/);
  // os três resultados possíveis, cada um com a sua decisão no LEIA-ME
  assert.match(aviso, /pode mostrar R\$ 89,90 \(pronto\), R\$ 89,89 se ela cortar o centavo \(1 centavo a menos que a página\), ou R\$ 89,94 se ela guardar só 2 ou 3 casas do desconto/);
  assert.match(aviso, /Não foi possível gerar seu código/);
  assert.match(aviso, /LEIA-ME, item 1/);
  // nunca um cenário acima do anunciado
  assert.equal(/R\$ 89,91/.test(aviso), false);
});

test("primeiro cupom: com o desconto do config, o checkout mostra R$ 89,90, R$ 89,89 ou R$ 89,94, nunca mais que a página", () => {
  assert.deepEqual(cenariosDoPrimeiroCupom(149.9, 0.40027), { esperado: 8990, cortado: 8989, duasCasas: 8994, tresCasas: 8994 });
  // o pior arredondamento possível de cada desconto aceito fica em R$ 89,90 ou abaixo
  for (const d of [0.40027, 0.40028, 0.40029, 0.4003]) {
    const c = cenariosDoPrimeiroCupom(149.9, d);
    const exato = 14990 * (1 - d);
    assert.ok(Math.ceil(exato - 1e-6) <= 8990, `${d}: arredondado para cima ainda cabe nos R$ 89,90`);
    assert.ok(c.cortado >= 8989 && c.esperado === 8990, String(d));
  }
});

test("descontoGarantido: só o desconto cujo preço exato fica em R$ 89,90 ou abaixo, e arredonda para ele", () => {
  for (const d of [0.40027, 0.40028, 0.40029, 0.4003]) assert.equal(descontoGarantido(149.9, d, 89.9), true, String(d));
  // 0.40024 a 0.40026 arredondam para R$ 89,90, mas o preço exato passa dele:
  // cortando o desconto (59,997 vira 59,99), a Hotmart cobraria R$ 89,91
  for (const d of [0.40024, 0.40025, 0.40026, 0.400266, 0.400266844]) assert.equal(descontoGarantido(149.9, d, 89.9), false, String(d));
  for (const d of [0.40023, 0.40031, 0.4, 0.44]) assert.equal(descontoGarantido(149.9, d, 89.9), false, String(d));
});

test("STUDENT_DISCOUNT que arredonda para R$ 89,90 mas passa dele (0.40025) fecha o fluxo e o aviso diz o porquê", () => {
  const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, STUDENT_DISCOUNT: "0.40025" } });
  assert.equal(r.ok, true);
  assert.equal(r.estudante.aberto, false);
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /STUDENT_DISCOUNT=0\.40027, que sobre R\$ 149,90 dá os R\$ 89,90 por ano/);
  assert.match(aviso, /hoje STUDENT_DISCOUNT=0\.40025, cujo preço exato passa de R\$ 89,90 e pode sair R\$ 89,91 no checkout/);
});

test("preço de estudante do config que não fecha a conta TRAVA o build", () => {
  for (const alvo of [
    { precoFinal: 89.9, desconto: 0.4 },      // desconto não dá o preço final
    { precoFinal: 0, desconto: 0.40027 },     // preço final inválido
    { precoFinal: 149.9, desconto: 0.40027 }, // igual ao cheio
    { precoFinal: 89.9, desconto: 0.995 },    // fora da faixa da API
    { precoFinal: 89.9, desconto: 0.40025 },  // arredonda para 89,90, mas o exato passa dele
    {},
  ]) {
    const r = checarPrecos({ mercados: mercados(), alvoEstudante: alvo, env: ENV_ESTUDANTE, agora: DIA_12_10 });
    assert.equal(r.ok, false, JSON.stringify(alvo));
    assert.match(r.mensagem, /ESTUDANTE_/, JSON.stringify(alvo));
    assert.equal(r.estudante.aberto, false, JSON.stringify(alvo));
  }
});

test("DM_ENDERECO_TESTE libera o build local com problema de preço, com aviso de teste", () => {
  const m = mercados();
  m.br.checkout = "[PREENCHER: link]";
  const r = checarPrecos({ mercados: m, alvoEstudante: ALVO, env: { DM_ENDERECO_TESTE: "Rua de Teste, 123" } });
  assert.equal(r.ok, true);
  assert.equal(r.teste, true);
  assert.match(r.mensagem, /TESTE/);
});

test("DM_ENDERECO_TESTE é aceita em preview da Vercel e recusada em produção", () => {
  const m = mercados();
  m.br.checkout = "[PREENCHER: link]";
  const env = (extra) => ({ mercados: m, alvoEstudante: ALVO, env: { DM_ENDERECO_TESTE: "x", VERCEL: "1", ...extra } });
  assert.equal(checarPrecos(env({ VERCEL_ENV: "preview" })).ok, true);
  assert.equal(checarPrecos(env({ VERCEL_ENV: "production" })).ok, false);
  assert.equal(checarPrecos(env({})).ok, false);
});

test("estudante: WA_TEMPLATE_ESTUDANTE fora do padrão da Meta avisa e conta como modelo antigo", () => {
  const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { HOTMART_OFFER_IDS: "1", WA_TEMPLATE_ESTUDANTE: "Diariamente-V2" } });
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /não é um nome de modelo da Meta/);
  assert.match(aviso, /estudante\/ativar\?cupom=\{\{1\}\}/);
});

/* --------------------- estudante aberto ou fechado --------------------- */

const PRONTO = { WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2", HOTMART_PRODUCT_ID: "7448309", STUDENT_DISCOUNT: "0.40027" };

test("estudante: sem nada na Vercel, FECHADO, com as três pendências", () => {
  const e = estadoDoEstudante({}, ALVO_BR);
  assert.equal(e.aberto, false);
  assert.equal(e.faltas.length, 3);
  const faltas = e.faltas.join(" ");
  assert.match(faltas, /WA_TEMPLATE_ESTUDANTE/);
  assert.match(faltas, /HOTMART_PRODUCT_ID=7448309 \(hoje vazio\)/);
  assert.match(faltas, /STUDENT_DISCOUNT=0\.40027, que sobre R\$ 149,90 dá os R\$ 89,90 por ano que a página anuncia \(hoje vazio\)/);
});

test("estudante: ABERTO só com modelo v2, produto 7448309 e o desconto anunciado; cada falta, sozinha, fecha", () => {
  assert.equal(estadoDoEstudante(PRONTO, ALVO_BR).aberto, true);
  // só o valor cujo preço exato fica em R$ 89,90 ou abaixo e arredonda para ele
  for (const d of ["0.40027", "0.40028", "0.40029", "0.4003", "0.40030"]) {
    assert.equal(estadoDoEstudante({ ...PRONTO, STUDENT_DISCOUNT: d }, ALVO_BR).aberto, true, d);
  }
  for (const [k, v] of [
    ["WA_TEMPLATE_ESTUDANTE", undefined],
    ["WA_TEMPLATE_ESTUDANTE", "diariamente_estudante_aprovado"],
    ["WA_TEMPLATE_ESTUDANTE", "Diariamente-V2"],
    ["HOTMART_PRODUCT_ID", undefined],
    ["HOTMART_PRODUCT_ID", "8280315"],
    ["STUDENT_DISCOUNT", undefined],
    ["STUDENT_DISCOUNT", "0.44"],
    ["STUDENT_DISCOUNT", "0.4"],
    ["STUDENT_DISCOUNT", "0.40"],
    ["STUDENT_DISCOUNT", "0.40023"],
    ["STUDENT_DISCOUNT", "0.40024"],
    ["STUDENT_DISCOUNT", "0.40026"],
    ["STUDENT_DISCOUNT", "0.400266"],
    ["STUDENT_DISCOUNT", "0.400266844"],
    ["STUDENT_DISCOUNT", "0.40031"],
    ["STUDENT_DISCOUNT", "0.40027x"],
    ["STUDENT_DISCOUNT", "quarenta"],
  ]) {
    const env = { ...PRONTO, [k]: v };
    if (v === undefined) delete env[k];
    const e = estadoDoEstudante(env, ALVO_BR);
    assert.equal(e.aberto, false, `${k}=${v}`);
    assert.equal(e.faltas.length, 1, `${k}=${v}`);
  }
});

test("estudante: DM_TEMPLATE_ESTUDANTE_OK=1 confirma à mão o modelo; HOTMART_OFFER_IDS não fecha o fluxo", () => {
  const confirmado = { HOTMART_PRODUCT_ID: "7448309", STUDENT_DISCOUNT: "0.40027", DM_TEMPLATE_ESTUDANTE_OK: "1" };
  assert.equal(estadoDoEstudante(confirmado, ALVO_BR).aberto, true);
  const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: PRONTO, agora: DIA_12_10 });
  assert.equal(r.estudante.aberto, true);
  // o risco aceito pelo dono continua à vista no log
  assert.match(r.avisos.join(" "), /HOTMART_OFFER_IDS está vazio/);
});

test("estudante fechado: o aviso do build diz o que a página faz e o que falta na Vercel", () => {
  const r = checar(mercados(), { env: {} });
  assert.equal(r.ok, true);
  assert.equal(r.estudante.aberto, false);
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /Estudante FECHADO/);
  assert.match(aviso, /lista de espera/);
  assert.match(aviso, /503 sem gravar nada/);
  assert.match(aviso, /HOTMART_PRODUCT_ID=7448309/);
});

test("estudanteDoProjeto lê o config real: fechado sem a Vercel, aberto com as três", () => {
  assert.equal(estudanteDoProjeto({}).aberto, false);
  assert.equal(estudanteDoProjeto(PRONTO).aberto, true);
});

test("next.config.js grava DM_ESTUDANTE_ABERTO no build: vazio por padrão e em standby, \"1\" com a chave ligada e o estudante pronto", () => {
  const fabrica = require(path.join(__dirname, "..", "next.config.js"));
  const aviso = console.warn;
  const antes = { ...process.env };
  console.warn = () => {};
  try {
    for (const k of ["WA_TEMPLATE_ESTUDANTE", "HOTMART_PRODUCT_ID", "STUDENT_DISCOUNT", "DM_TEMPLATE_ESTUDANTE_OK", "DM_ESTUDANTE_ABERTO", "DM_SITE_LANCADO"]) delete process.env[k];
    assert.equal(fabrica("phase-development-server").env.DM_ESTUDANTE_ABERTO, "");
    // valor posto à mão na Vercel não vale: é recalculado
    process.env.DM_ESTUDANTE_ABERTO = "1";
    assert.equal(fabrica("phase-development-server").env.DM_ESTUDANTE_ABERTO, "");
    // standby: as três chaves do estudante não abrem o fluxo novo (a
    // /estudante é a da produção)
    Object.assign(process.env, PRONTO);
    assert.equal(fabrica("phase-development-server").env.DM_ESTUDANTE_ABERTO, "");
    process.env.DM_SITE_LANCADO = "1";
    assert.equal(fabrica("phase-development-server").env.DM_ESTUDANTE_ABERTO, "1");
  } finally {
    console.warn = aviso;
    for (const k of Object.keys(process.env)) if (!(k in antes)) delete process.env[k];
    Object.assign(process.env, antes);
  }
});

/* ------------------- webhook do 7448309 antes de vender ------------------- */

test("produção na Vercel com venda aberta TRAVA sem DM_WEBHOOK_V2_OK=1 (ordem do dono)", () => {
  const r = checar(mercados(), { env: { ...ENV_ESTUDANTE, VERCEL: "1", VERCEL_ENV: "production" } });
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /DM_WEBHOOK_V2_OK=1/);
  assert.match(r.mensagem, /HOTMART_WEBHOOK_V2 na posição 1/);
  assert.match(r.mensagem, /venda aberta \(br\)/);
  // o problema não está no config: a mensagem não manda abrir o pricing.ts
  assert.equal(/LINKS DA HOTMART/.test(r.mensagem), false);
  assert.match(r.mensagem, /ordem do lançamento/);
  // com problema no config também, a mensagem fala dos dois
  const doisProblemas = mercados();
  doisProblemas.br.checkout = "[PREENCHER: link]";
  const r2 = checar(doisProblemas, { env: { ...ENV_ESTUDANTE, VERCEL: "1", VERCEL_ENV: "production" } });
  assert.equal(r2.ok, false);
  assert.match(r2.mensagem, /CHECKOUT_BRL/);
  assert.match(r2.mensagem, /DM_WEBHOOK_V2_OK=1/);
  // com a confirmação, passa
  const ok = checar(mercados(), { env: { ...ENV_ESTUDANTE, VERCEL: "1", VERCEL_ENV: "production", DM_WEBHOOK_V2_OK: "1" } });
  assert.equal(ok.ok, true, ok.mensagem);
  assert.equal(/DM_WEBHOOK_V2_OK/.test(ok.avisos.join(" ")), false);
  // DM_ENDERECO_TESTE não fura a trava em produção
  const furo = checar(mercados(), { env: { ...ENV_ESTUDANTE, VERCEL: "1", VERCEL_ENV: "production", DM_ENDERECO_TESTE: "x" } });
  assert.equal(furo.ok, false);
});

test("preview da Vercel e build local não travam pelo webhook, só avisam", () => {
  for (const extra of [{ VERCEL: "1", VERCEL_ENV: "preview" }, {}]) {
    const r = checar(mercados(), { env: { ...ENV_ESTUDANTE, ...extra } });
    assert.equal(r.ok, true, r.mensagem);
    assert.match(r.avisos.join(" "), /só passa com DM_WEBHOOK_V2_OK=1/);
  }
});

test("produção sem nenhum mercado vendendo não exige a confirmação do webhook", () => {
  const m = mercados({ br: { vendaAberta: false } });
  const r = checar(m, { env: { ...ENV_ESTUDANTE, VERCEL: "1", VERCEL_ENV: "production" } });
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(/DM_WEBHOOK_V2_OK/.test(r.avisos.join(" ")), false);
});

test("chave de lançamento ligada: o build de produção da Vercel trava até o dono confirmar o webhook", () => {
  const r = checarPrecosDoProjeto({ VERCEL: "1", VERCEL_ENV: "production", DM_SITE_LANCADO: "1" });
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /DM_WEBHOOK_V2_OK=1/);
  assert.equal(checarPrecosDoProjeto({ VERCEL: "1", VERCEL_ENV: "production", DM_SITE_LANCADO: "1", DM_WEBHOOK_V2_OK: "1" }).ok, true);
});

test("hoje (standby, chave desligada), o build de produção da Vercel passa sem DM_WEBHOOK_V2_OK e diz o que travaria", () => {
  const r = checarPrecosDoProjeto({ VERCEL: "1", VERCEL_ENV: "production" });
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(r.standby, true);
  assert.match(r.mensagem, /STANDBY/);
  assert.match(r.mensagem, /TRAVARIA por isto/);
  assert.match(r.mensagem, /DM_WEBHOOK_V2_OK=1/);
});

test("webhook e botão do WhatsApp nos avisos usam o SITE.dominio do config.ts, com www (sem www a Vercel responde 308)", () => {
  const texto = require("fs").readFileSync(path.join(__dirname, "..", "config.ts"), "utf8");
  const dominio = texto.match(/^\s*dominio:\s*"([^"]+)"/m);
  assert.ok(dominio, "SITE.dominio no config.ts");
  assert.equal(SITE_DOMINIO, dominio[1]);
  assert.equal(SITE_DOMINIO, "https://www.diariamente.app");
  const aberto = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: ENV_ESTUDANTE, agora: DIA_12_10 }).avisos.join(" ");
  assert.ok(aberto.includes("https://www.diariamente.app/api/webhooks/hotmart"), "webhook com www");
  const antigo = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { HOTMART_OFFER_IDS: "1" } }).avisos.join(" ");
  assert.ok(antigo.includes("https://www.diariamente.app/estudante/ativar?cupom={{1}}"), "botão com www");
  for (const aviso of [aberto, antigo]) assert.equal(/https:\/\/diariamente\.app/.test(aviso), false, "nenhum endereço sem www");
});
