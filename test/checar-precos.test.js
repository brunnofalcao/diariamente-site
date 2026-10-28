// Testes da trava de preços e checkout (scripts/checar-precos.js).
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const {
  checarPrecos, carregarPrecos, checarPrecosDoProjeto, estudanteMostraPrecoNoConfig,
  estadoDoEstudante, estudanteDoProjeto, alvoDoEstudante, faseDoEstudanteEm, problemasDoAlvo, SITE_DOMINIO,
} = require("../scripts/checar-precos");

const LINK_OK = "https://pay.hotmart.com/X00000000Y?off=teste000&checkoutMode=10";
const LINK_LANC = "https://pay.hotmart.com/X00000000Y?off=lanc0000";
// Estudante pronto na Vercel: o modelo v2 do WhatsApp (o fluxo novo não
// usa mais STUDENT_DISCOUNT, HOTMART_OFFER_IDS nem HOTMART_PRODUCT_ID).
const ENV_ESTUDANTE = { WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2", RESEND_API_KEY: "re_teste" };
// O que a página anuncia ao estudante, com códigos de oferta FICTÍCIOS
// nas duas fases (o config real ainda não tem os códigos do dono).
const ALVO = {
  precos: { lancamento: 59.9, depois: 79.9 }, anos: 3,
  ofertas: { lancamento: "estlanc1", depois: "estdep01" },
};
const DIA_12_10 = Date.parse("2026-10-12T12:00:00Z");
/** O alvo com o lançamento de um mercados() (a fase sai dele). */
const alvoBr = (m = mercados(), troca = {}) => ({ ...ALVO, anual: m.br.anual, lancamento: m.br.lancamento, ...troca });

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
  // o estudante não usa mais cupom: o token do link vai no sck
  assert.equal(cfg.PARAMETRO_RASTREIO, "sck");
  assert.equal("PARAMETRO_CUPOM" in cfg, false);
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
  // o checkout da lf63bgdd parcela em até 12x com acréscimo (conferido em 28/10/2026)
  assert.equal(l.parcela, true);
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
  assert.equal(/HOTMART_OFFER_IDS|STUDENT_DISCOUNT|HOTMART_PRODUCT_ID/.test(avisos), false);
  assert.equal(/WA_TEMPLATE_ESTUDANTE/.test(avisos), false);
  assert.equal(/FECHADO/.test(avisos), false);
  assert.equal(/falta o código da fase seguinte/.test(avisos), false);
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

/* ------------------------ estudante (fluxo novo) ------------------------ */

const LANC = Date.parse("2026-10-28T12:00:00-03:00");
const DEPOIS = Date.parse("2026-11-17T00:00:00-03:00");
const ULTIMO_MS = Date.parse("2026-11-16T23:59:59.999-03:00");
/** mercados() com o lançamento real (16/11/2026), para a virada de verdade. */
const mercadosReais = () => {
  const m = mercados();
  m.br.lancamento.terminaEm = "2026-11-16";
  return m;
};

test("estudante ABERTO com o modelo v2 e o código da fase: o aviso diz a fase, a oferta, o webhook e o primeiro checkout", () => {
  const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: ENV_ESTUDANTE, agora: DIA_12_10 });
  assert.equal(r.ok, true, r.mensagem);
  assert.equal(r.estudante.aberto, true);
  assert.equal(r.estudante.configurado, true);
  assert.equal(r.estudante.fase, "lancamento");
  assert.equal(r.estudante.oferta, "estlanc1");
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /Estudante ABERTO neste build \(modelo diariamente_estudante_aprovado_v2; fase no lançamento, até 31\/12\/2099: R\$ 59,90 por ano nos 3 primeiros anos; oferta off=estlanc1/);
  assert.match(aviso, /https:\/\/pay\.hotmart\.com\/K105072021O\?off=estlanc1/);
  assert.match(aviso, /marca o link\s+como usado/);
  assert.match(aviso, /3 primeiras recorrências/);
  // a oferta de estudante do lançamento é aberta: desativar depois da data
  assert.match(aviso, /mantenha a oferta de estudante do lançamento \(off=estlanc1\) ativa até 02:00 de 01\/01/);
});

test("estudante: STUDENT_DISCOUNT, HOTMART_OFFER_IDS e HOTMART_PRODUCT_ID não contam mais para abrir nem aparecem no aviso", () => {
  for (const extra of [{}, { STUDENT_DISCOUNT: "0.4" }, { HOTMART_OFFER_IDS: "" }, { HOTMART_PRODUCT_ID: "8280315" }]) {
    const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { ...ENV_ESTUDANTE, ...extra }, agora: DIA_12_10 });
    assert.equal(r.estudante.aberto, true, JSON.stringify(extra));
    assert.equal(/STUDENT_DISCOUNT|HOTMART_OFFER_IDS|HOTMART_PRODUCT_ID|offDiscount/.test(r.avisos.join(" ")), false, JSON.stringify(extra));
  }
});

test("estudante: modelo de WhatsApp antigo (ou sem WA_TEMPLATE_ESTUDANTE) fecha e avisa até o v2; DM_TEMPLATE_ESTUDANTE_OK=1 confirma à mão", () => {
  for (const nome of [undefined, "", "diariamente_estudante_aprovado", "Diariamente-V2"]) {
    const r = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { WA_TEMPLATE_ESTUDANTE: nome }, agora: DIA_12_10 });
    assert.equal(r.estudante.aberto, false, String(nome));
    assert.equal(r.estudante.configurado, false, String(nome));
    const aviso = r.avisos.join(" ");
    assert.match(aviso, /Estudante FECHADO/);
    assert.match(aviso, /WA_TEMPLATE_ESTUDANTE=diariamente_estudante_aprovado_v2/);
    assert.match(aviso, /estudante\/ativar\?cupom=\{\{1\}\}/);
  }
  const invalido = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { WA_TEMPLATE_ESTUDANTE: "Diariamente-V2" }, agora: DIA_12_10 });
  assert.match(invalido.avisos.join(" "), /não é um nome de modelo da Meta/);
  const confirmado = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { DM_TEMPLATE_ESTUDANTE_OK: "1" }, agora: DIA_12_10 });
  assert.equal(confirmado.estudante.aberto, true);
  // o config.ts real hoje mostra o preço de estudante
  assert.equal(estudanteMostraPrecoNoConfig(), true);
});

test("estudante: sem o código da FASE VIGENTE, fechado (configurado, mas sem oferta); o aviso diz a constante e o preço", () => {
  const m = mercadosReais();
  // lançamento sem ESTUDANTE_OFERTA_LANCAMENTO
  const semL = checarPrecos({ mercados: m, alvoEstudante: { ...ALVO, ofertas: { lancamento: "", depois: "estdep01" } }, env: ENV_ESTUDANTE, agora: LANC });
  assert.equal(semL.ok, true, semL.mensagem);
  assert.equal(semL.estudante.configurado, true);
  assert.equal(semL.estudante.aberto, false);
  assert.match(semL.avisos.join(" "), /Estudante FECHADO neste build \(fase no lançamento, até 16\/11\/2026: R\$ 59,90 por ano nos 3 primeiros anos\)/);
  assert.match(semL.avisos.join(" "), /ESTUDANTE_OFERTA_LANCAMENTO com o código \(off\) da oferta de estudante de R\$ 59,90 por ano nos 3 primeiros anos/);
  // depois do lançamento sem ESTUDANTE_OFERTA, mesmo com o do lançamento
  const semD = checarPrecos({ mercados: m, alvoEstudante: { ...ALVO, ofertas: { lancamento: "estlanc1", depois: "" } }, env: ENV_ESTUDANTE, agora: DEPOIS });
  assert.equal(semD.estudante.aberto, false);
  assert.equal(semD.estudante.fase, "depois");
  assert.match(semD.avisos.join(" "), /ESTUDANTE_OFERTA com o código \(off\) da oferta de estudante de R\$ 79,90 por ano nos 3 primeiros anos/);
  assert.match(semD.avisos.join(" "), /desative na Hotmart a oferta de estudante do lançamento \(off=estlanc1\)/);
  // com o código da fase, abre
  assert.equal(checarPrecos({ mercados: m, alvoEstudante: ALVO, env: ENV_ESTUDANTE, agora: DEPOIS }).estudante.oferta, "estdep01");
});

test("estudante: no lançamento sem o ESTUDANTE_OFERTA, abre e AVISA que a /estudante fecha sozinha em 17/11", () => {
  const r = checarPrecos({ mercados: mercadosReais(), alvoEstudante: { ...ALVO, ofertas: { lancamento: "estlanc1", depois: "" } }, env: ENV_ESTUDANTE, agora: LANC });
  assert.equal(r.estudante.aberto, true);
  const aviso = r.avisos.join(" ");
  assert.match(aviso, /Estudante: falta o código da fase seguinte\. ESTUDANTE_OFERTA, em config\/pricing\.ts: a partir de 17\/11 o estudante paga R\$ 79,90 por ano nos 3 primeiros anos, e sem o código dessa oferta a \/estudante fecha sozinha/);
  // com as duas, nada de fase seguinte
  const ok = checarPrecos({ mercados: mercadosReais(), alvoEstudante: ALVO, env: ENV_ESTUDANTE, agora: LANC });
  assert.equal(/fase seguinte/.test(ok.avisos.join(" ")), false);
});

test("estudante: a virada da trava é a mesma do card (faseDoEstudante de config/pricing.ts), segundo a segundo", () => {
  const { carregarTs } = require("../scripts/carregar-ts");
  const P = carregarTs(path.join(__dirname, "..", "config", "pricing.ts"));
  const l = P.MERCADOS.br.lancamento;
  for (const t of [LANC, ULTIMO_MS, ULTIMO_MS + 1, DEPOIS, DIA_12_10, Date.parse("2027-01-01T00:00:00Z")]) {
    assert.equal(faseDoEstudanteEm(l, t), P.faseDoEstudante(t), new Date(t).toISOString());
  }
  assert.equal(faseDoEstudanteEm(l, ULTIMO_MS), "lancamento");
  assert.equal(faseDoEstudanteEm(l, ULTIMO_MS + 1), "depois");
  // lançamento desligado antes da data: a fase vira na hora, como o card
  assert.equal(faseDoEstudanteEm({ ...l, ativo: false }, LANC), "depois");
});

test("estudante: código de oferta errado TRAVA o build (formato, oferta de venda ou a mesma nas duas fases)", () => {
  const m = mercados();
  for (const [ofertas, padrao] of [
    [{ lancamento: "https://pay.hotmart.com/K105072021O?off=abc12345", depois: "estdep01" }, /não é um código de oferta da Hotmart/],
    [{ lancamento: "off=abc", depois: "estdep01" }, /não é um código de oferta da Hotmart/],
    [{ lancamento: "estlanc1", depois: "teste000" }, /ESTUDANTE_OFERTA=teste000 é a oferta de CHECKOUT_BRL/],
    [{ lancamento: "lanc0000", depois: "estdep01" }, /ESTUDANTE_OFERTA_LANCAMENTO=lanc0000 é a oferta de CHECKOUT_LANCAMENTO/],
    [{ lancamento: "igual123", depois: "igual123" }, /são a mesma oferta \(igual123\)/],
  ]) {
    const r = checarPrecos({ mercados: m, alvoEstudante: { ...ALVO, ofertas }, env: ENV_ESTUDANTE, agora: DIA_12_10 });
    assert.equal(r.ok, false, JSON.stringify(ofertas));
    assert.match(r.mensagem, padrao, JSON.stringify(ofertas));
    assert.equal(r.estudante.aberto, false, JSON.stringify(ofertas));
    assert.equal(r.estudante.configurado, false, JSON.stringify(ofertas));
  }
  // preços inválidos também travam
  for (const precos of [{ lancamento: 0, depois: 79.9 }, { lancamento: 59.9, depois: 149.9 }, {}]) {
    const r = checarPrecos({ mercados: m, alvoEstudante: { ...ALVO, precos }, env: ENV_ESTUDANTE, agora: DIA_12_10 });
    assert.equal(r.ok, false, JSON.stringify(precos));
    assert.match(r.mensagem, /ESTUDANTE_PRECO_FINAL/, JSON.stringify(precos));
  }
  // vazio não trava: só fecha a fase
  assert.deepEqual(problemasDoAlvo(alvoBr(m, { ofertas: { lancamento: "", depois: "" } }), m), []);
});

test("estudante: e-mail pelo Resend só com RESEND_API_KEY; sem ela, o aviso diz que o link vai pelo WhatsApp e pelo RD", () => {
  const sem = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: { WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2" }, agora: DIA_12_10 });
  assert.match(sem.avisos.join(" "), /sem RESEND_API_KEY na Vercel, o site não manda o e-mail de aprovação; o link pessoal vai pelo WhatsApp e no campo cf_link_estudante/);
  const com = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: ENV_ESTUDANTE, agora: DIA_12_10 });
  assert.equal(/RESEND_API_KEY/.test(com.avisos.join(" ")), false);
  assert.equal(sem.estudante.aberto, true, "o e-mail não fecha o fluxo");
});

test("estudanteDoProjeto lê o config real: os dois códigos ainda vazios (o dono põe depois), então configurado com o v2 e FECHADO", () => {
  const cfg = carregarPrecos();
  for (const c of [cfg.ESTUDANTE_OFERTA_LANCAMENTO, cfg.ESTUDANTE_OFERTA]) {
    assert.ok(c === "" || /^[A-Za-z0-9]{4,20}$/.test(c), `código no formato da Hotmart ou vazio: "${c}"`);
  }
  assert.deepEqual(cfg.ESTUDANTE_PRECO_FINAL, { lancamento: 59.9, depois: 79.9 });
  assert.equal(cfg.ESTUDANTE_ANOS, 3);
  const alvo = alvoDoEstudante(cfg);
  assert.equal(alvo.anual, 149.9);
  assert.equal(estudanteDoProjeto({}, LANC).configurado, false);
  const e = estudanteDoProjeto({ WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2" }, LANC);
  assert.equal(e.configurado, true);
  assert.equal(e.fase, "lancamento");
  assert.equal(e.aberto, cfg.ESTUDANTE_OFERTA_LANCAMENTO !== "");
  if (!cfg.ESTUDANTE_OFERTA_LANCAMENTO) assert.match(e.faltas.join(" "), /ESTUDANTE_OFERTA_LANCAMENTO/);
  // estadoDoEstudante com o alvo real e um código fictício abre
  const comCodigo = estadoDoEstudante(
    { WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2" },
    { ...alvo, ofertas: { lancamento: "estlanc1", depois: "estdep01" } }, LANC, cfg.MERCADOS,
  );
  assert.equal(comCodigo.aberto, true);
});

test("next.config.js grava DM_ESTUDANTE_ABERTO (a Vercel pronta) e DM_ESTUDANTE_EMAIL (o Resend) só com a chave ligada", () => {
  const fabrica = require(path.join(__dirname, "..", "next.config.js"));
  const aviso = console.warn;
  const antes = { ...process.env };
  console.warn = () => {};
  try {
    for (const k of ["WA_TEMPLATE_ESTUDANTE", "HOTMART_PRODUCT_ID", "STUDENT_DISCOUNT", "DM_TEMPLATE_ESTUDANTE_OK", "DM_ESTUDANTE_ABERTO", "DM_SITE_LANCADO", "RESEND_API_KEY", "DM_ESTUDANTE_EMAIL"]) delete process.env[k];
    let env = fabrica("phase-development-server").env;
    assert.equal(env.DM_ESTUDANTE_ABERTO, "");
    assert.equal(env.DM_ESTUDANTE_EMAIL, "");
    // valor posto à mão na Vercel não vale: é recalculado
    process.env.DM_ESTUDANTE_ABERTO = "1";
    process.env.DM_ESTUDANTE_EMAIL = "1";
    env = fabrica("phase-development-server").env;
    assert.equal(env.DM_ESTUDANTE_ABERTO, "");
    assert.equal(env.DM_ESTUDANTE_EMAIL, "");
    // standby: o modelo v2 e o Resend não abrem o fluxo novo (a /estudante é a da produção)
    process.env.WA_TEMPLATE_ESTUDANTE = "diariamente_estudante_aprovado_v2";
    process.env.RESEND_API_KEY = "re_teste";
    env = fabrica("phase-development-server").env;
    assert.equal(env.DM_ESTUDANTE_ABERTO, "");
    assert.equal(env.DM_ESTUDANTE_EMAIL, "");
    process.env.DM_SITE_LANCADO = "1";
    env = fabrica("phase-development-server").env;
    assert.equal(env.DM_ESTUDANTE_ABERTO, "1", "a Vercel pronta: a oferta da fase é conferida na hora");
    assert.equal(env.DM_ESTUDANTE_EMAIL, "1");
    // a chave do Resend nunca vai para o navegador
    assert.equal("RESEND_API_KEY" in env, false);
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
  const antigo = checarPrecos({ mercados: mercados(), alvoEstudante: ALVO, env: {}, agora: DIA_12_10 }).avisos.join(" ");
  assert.ok(antigo.includes("https://www.diariamente.app/estudante/ativar?cupom={{1}}"), "botão com www");
  for (const aviso of [aberto, antigo]) assert.equal(/https:\/\/diariamente\.app/.test(aviso), false, "nenhum endereço sem www");
});
