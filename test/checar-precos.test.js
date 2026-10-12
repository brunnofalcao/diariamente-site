// Testes da trava de preços e checkout (scripts/checar-precos.js).
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const { checarPrecos, carregarPrecos, checarPrecosDoProjeto, estudanteMostraPrecoNoConfig } = require("../scripts/checar-precos");

const LINK_OK = "https://pay.hotmart.com/X00000000Y?off=teste000&checkoutMode=10";

/** Mercados fictícios a partir do config real, com o que o teste trocar. */
function mercados(troca = {}) {
  const { MERCADOS } = carregarPrecos();
  const m = JSON.parse(JSON.stringify(MERCADOS));
  m.br.checkout = LINK_OK;
  m.br.lancamento.codigo = "LANCAMENTOTESTE";
  m.br.lancamento.terminaEm = "2099-12-31";
  m.br.lancamento.ativo = true;
  m.rw.checkout = LINK_OK;
  for (const [k, v] of Object.entries(troca)) m[k] = { ...m[k], ...v };
  return m;
}

test("o config/pricing.ts real carrega fora do Next e tem os cinco mercados", () => {
  const cfg = carregarPrecos();
  assert.deepEqual(Object.keys(cfg.MERCADOS).sort(), ["br", "es", "la", "pt", "rw"]);
  assert.equal(cfg.PRODUTO_HOTMART, "7448309");
  assert.equal(cfg.PARAMETRO_CUPOM, "offDiscount");
});

test("hoje (link, cupom e data pendentes) o build de produção trava e diz o que falta", () => {
  const r = checarPrecosDoProjeto({});
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /CHECKOUT_BRL/);
  assert.match(r.mensagem, /CUPOM_LANCAMENTO/);
  assert.match(r.mensagem, /FIM_DO_LANCAMENTO/);
  assert.match(r.mensagem, /config\/pricing\.ts/);
  // rw abre junto com o Brasil (handoff, seção 13, passo 6): sem o link
  // USD, o build também para.
  assert.match(r.mensagem, /Mercado rw/);
});

test("config do dono: cupom de lançamento desligado e rw aberto", () => {
  const { MERCADOS } = carregarPrecos();
  assert.equal(MERCADOS.br.lancamento.ativo, false);
  assert.equal(MERCADOS.rw.vendaAberta, true);
});

test("com os três preenchidos, libera", () => {
  const r = checarPrecos({ mercados: mercados(), estudantePct: 40, env: {}, agora: Date.parse("2026-10-12T12:00:00Z") });
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(r.teste, false);
});

test("cada um dos três, sozinho, já trava", () => {
  for (const [campo, valor, padrao] of [
    ["checkout", "[PREENCHER: link]", /CHECKOUT_BRL/],
    ["codigo", "[PREENCHER: código]", /CUPOM_LANCAMENTO/],
    ["terminaEm", "[PREENCHER: data]", /FIM_DO_LANCAMENTO/],
  ]) {
    const m = mercados();
    if (campo === "checkout") m.br.checkout = valor;
    else m.br.lancamento[campo] = valor;
    const r = checarPrecos({ mercados: m, estudantePct: 40, env: {} });
    assert.equal(r.ok, false, campo);
    assert.match(r.mensagem, padrao);
  }
});

test("link antigo de R$ 137,90, link fora da Hotmart e link já com cupom travam", () => {
  for (const link of [
    "https://pay.hotmart.com/L107085210M?checkoutMode=10",
    "https://pay.hotmart.com/L107085210M",
    "https://exemplo.com/checkout",
    "http://pay.hotmart.com/X00000000Y",
    "https://pay.hotmart.com/X00000000Y?offDiscount=ABC",
  ]) {
    const m = mercados();
    m.br.checkout = link;
    assert.equal(checarPrecos({ mercados: m, estudantePct: 40, env: {} }).ok, false, link);
  }
});

test("L107085210M é código de PRODUTO: com off (oferta escolhida) passa, só com aviso", () => {
  const m = mercados();
  m.br.checkout = "https://pay.hotmart.com/L107085210M?off=abcd1234";
  const r = checarPrecos({ mercados: m, estudantePct: 40, env: {} });
  assert.equal(r.ok, true, r.mensagem);
  assert.match(r.avisos.join(" "), /K105072021O/);
});

test("checkout do 7448309 (K105072021O) passa sem o aviso de produto", () => {
  const m = mercados();
  m.br.checkout = "https://pay.hotmart.com/K105072021O?off=abcd1234";
  const r = checarPrecos({ mercados: m, estudantePct: 40, env: {} });
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(/K105072021O/.test(r.avisos.join(" ")), false);
});

test("data fora do formato e código com caractere estranho travam", () => {
  const m1 = mercados();
  m1.br.lancamento.terminaEm = "31/10/2026";
  assert.equal(checarPrecos({ mercados: m1, estudantePct: 40, env: {} }).ok, false);
  const m2 = mercados();
  m2.br.lancamento.codigo = "LANÇAMENTO 20";
  assert.equal(checarPrecos({ mercados: m2, estudantePct: 40, env: {} }).ok, false);
});

test("data que não existe no calendário trava (Date.parse passaria para o mês seguinte)", () => {
  for (const data of ["2026-11-31", "2026-04-31", "2026-02-31", "2026-02-29", "2026-13-01", "2026-00-10"]) {
    const m = mercados();
    m.br.lancamento.terminaEm = data;
    const r = checarPrecos({ mercados: m, estudantePct: 40, env: {} });
    assert.equal(r.ok, false, data);
    assert.match(r.mensagem, /FIM_DO_LANCAMENTO/, data);
  }
  const bissexto = mercados();
  bissexto.br.lancamento.terminaEm = "2028-02-29";
  assert.equal(checarPrecos({ mercados: bissexto, estudantePct: 40, env: {} }).ok, true);
});

test("cupom desligado: aviso com o link exato para conferir R$ 119,92", () => {
  const m = mercados();
  m.br.lancamento.ativo = false;
  const r = checarPrecos({ mercados: m, estudantePct: 40, env: {} });
  assert.equal(r.ok, true);
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /ativo: false/);
  assert.ok(aviso.includes(`${LINK_OK}&offDiscount=LANCAMENTOTESTE`), aviso);
  assert.match(aviso, /119,92/);
});

test("todo build lista os mercados em lista de espera", () => {
  const r = checarPrecos({ mercados: mercados(), estudantePct: 40, env: {} });
  assert.match(r.avisos.join(" "), /lista de espera \(vendaAberta: false\): la, es, pt/);
  const todos = mercados({ la: { vendaAberta: true, checkout: LINK_OK }, es: { vendaAberta: true, checkout: LINK_OK }, pt: { vendaAberta: true, checkout: LINK_OK }, rw: { vendaAberta: true, checkout: LINK_OK } });
  assert.equal(/lista de espera/.test(checarPrecos({ mercados: todos, estudantePct: 40, env: {} }).avisos.join(" ")), false);
});

test("avisos aparecem também na mensagem do build bloqueado", () => {
  const m = mercados();
  m.br.checkout = "[PREENCHER: link]";
  const r = checarPrecos({ mercados: m, estudantePct: 40, env: {} });
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /Avisos: .*lista de espera/);
});

test("/estudante com preço: aviso até DM_TEMPLATE_ESTUDANTE_OK=1", () => {
  const com = checarPrecos({ mercados: mercados(), estudantePct: 40, env: {}, estudanteMostraPreco: true });
  assert.match(com.avisos.join(" "), /diariamente_estudante_aprovado/);
  assert.match(com.avisos.join(" "), /estudante\/ativar\?cupom=\{\{1\}\}/);
  assert.match(com.avisos.join(" "), /HOTMART_OFFER_IDS/);
  const ok = checarPrecos({ mercados: mercados(), estudantePct: 40, env: { DM_TEMPLATE_ESTUDANTE_OK: "1" }, estudanteMostraPreco: true });
  assert.equal(/diariamente_estudante_aprovado/.test(ok.avisos.join(" ")), false);
  const semPreco = checarPrecos({ mercados: mercados(), estudantePct: 40, env: {}, estudanteMostraPreco: false });
  assert.equal(/diariamente_estudante_aprovado/.test(semPreco.avisos.join(" ")), false);
  // o config.ts real hoje mostra o preço
  assert.equal(estudanteMostraPrecoNoConfig(), true);
});

test("HOTMART_PRODUCT_ID diferente de 7448309 gera aviso", () => {
  const r = checarPrecos({ mercados: mercados(), estudantePct: 40, env: { HOTMART_PRODUCT_ID: "8280315" } });
  assert.match(r.avisos.join(" "), /HOTMART_PRODUCT_ID=8280315/);
  const certo = checarPrecos({ mercados: mercados(), estudantePct: 40, env: { HOTMART_PRODUCT_ID: "7448309" } });
  assert.equal(/HOTMART_PRODUCT_ID/.test(certo.avisos.join(" ")), false);
});

test("mercado ligado (vendaAberta) sem o link do plano trava; desligado, não", () => {
  const ligado = mercados({ pt: { vendaAberta: true } });
  const r = checarPrecos({ mercados: ligado, estudantePct: 40, env: {} });
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /Mercado pt/);
  const comLink = mercados({ pt: { vendaAberta: true, checkout: LINK_OK } });
  assert.equal(checarPrecos({ mercados: comLink, estudantePct: 40, env: {} }).ok, true);
});

test("lançamento vencido não trava, só avisa", () => {
  const m = mercados();
  m.br.lancamento.terminaEm = "2026-10-01";
  const r = checarPrecos({ mercados: m, estudantePct: 40, env: {}, agora: Date.parse("2026-10-12T12:00:00Z") });
  assert.equal(r.ok, true);
  assert.match(r.avisos.join(" "), /terminou/);
});

test("STUDENT_DISCOUNT diferente do anunciado gera aviso", () => {
  const r = checarPrecos({ mercados: mercados(), estudantePct: 40, env: { STUDENT_DISCOUNT: "0.44" } });
  assert.equal(r.ok, true);
  assert.match(r.avisos.join(" "), /STUDENT_DISCOUNT/);
  const igual = checarPrecos({ mercados: mercados(), estudantePct: 40, env: { STUDENT_DISCOUNT: "0.40" } });
  assert.equal(/STUDENT_DISCOUNT/.test(igual.avisos.join(" ")), false);
});

test("DM_ENDERECO_TESTE libera o build local com aviso de teste", () => {
  const r = checarPrecosDoProjeto({ DM_ENDERECO_TESTE: "Rua de Teste, 123" });
  assert.equal(r.ok, true);
  assert.equal(r.teste, true);
  assert.match(r.mensagem, /TESTE/);
});

test("DM_ENDERECO_TESTE é aceita em preview da Vercel e recusada em produção", () => {
  const preview = checarPrecosDoProjeto({ DM_ENDERECO_TESTE: "x", VERCEL: "1", VERCEL_ENV: "preview" });
  assert.equal(preview.ok, true);
  const producao = checarPrecosDoProjeto({ DM_ENDERECO_TESTE: "x", VERCEL: "1", VERCEL_ENV: "production" });
  assert.equal(producao.ok, false);
  const semEnv = checarPrecosDoProjeto({ DM_ENDERECO_TESTE: "x", VERCEL: "1" });
  assert.equal(semEnv.ok, false);
});
