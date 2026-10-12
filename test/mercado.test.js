// Testes do roteamento por país (lib/mercado.ts) e das contas de preço
// (config/pricing.ts), carregados do arquivo real fora do Next.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { carregarTs } = require("../scripts/carregar-ts");

const raiz = path.join(__dirname, "..");
const M = carregarTs(path.join(raiz, "lib", "mercado.ts"));
const P = carregarTs(path.join(raiz, "config", "pricing.ts"));

const NAVEGADOR = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const INSTAGRAM = NAVEGADOR + " Instagram 300.0.0.0 (iPhone; iOS 17_0; pt_BR)";
const pedido = (x) => ({ pathname: "/", busca: "", userAgent: NAVEGADOR, cookie: null, pais: null, idiomas: null, ...x });

/* ------------------------------- países ------------------------------- */

test("lista da América Latina num só lugar, com os 17 países da seção 1", () => {
  assert.equal(M.PAISES_LATAM.length, 17);
  for (const p of ["MX", "CO", "AR", "CL", "PE", "UY", "PY", "BO", "EC", "VE", "GT", "CR", "DO", "PA", "HN", "SV", "NI"]) {
    assert.equal(M.mercadoDoPais(p), "la", p);
  }
  assert.equal(M.mercadoDoPais("BR"), "br");
  assert.equal(M.mercadoDoPais("PT"), "pt");
  assert.equal(M.mercadoDoPais("ES"), "es");
  assert.equal(M.mercadoDoPais("US"), "rw");
  assert.equal(M.mercadoDoPais("DE"), "rw");
  assert.equal(M.mercadoDoPais("ao"), "rw");
});

/* ------------------------------- rotas -------------------------------- */

test("país do IP decide só nas homes", () => {
  assert.deepEqual(M.decidirRota(pedido({ pais: "PT" })), { tipo: "redirecionar", destino: "/pt-pt", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ pais: "ES" })), { tipo: "redirecionar", destino: "/es-es", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ pais: "MX" })), { tipo: "redirecionar", destino: "/es", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ pais: "BR" })), { tipo: "seguir", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ pathname: "/es", pais: "BR" })), { tipo: "redirecionar", destino: "/", vary: true });
  // página interna abre como foi pedida
  assert.deepEqual(M.decidirRota(pedido({ pathname: "/termos", pais: "PT" })), { tipo: "seguir", vary: false });
  assert.deepEqual(M.decidirRota(pedido({ pathname: "/estudante", pais: "MX" })), { tipo: "seguir", vary: false });
});

test("resto do mundo fica em / (reescrita para a rota interna, sem trocar a URL)", () => {
  assert.deepEqual(M.decidirRota(pedido({ pais: "US" })), { tipo: "reescrever", destino: "/mundo", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ pathname: "/pt-pt", pais: "DE" })), { tipo: "redirecionar", destino: "/", vary: true });
  // a rota interna pedida direto volta para "/"
  assert.equal(M.decidirRota(pedido({ pathname: "/mundo", pais: "US" })).destino, "/");
});

test("robôs e prévias de link nunca são redirecionados", () => {
  for (const ua of [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "WhatsApp/2.23.20.0 A",
    "TelegramBot (like TwitterBot)",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Mozilla/5.0 (compatible; Google-InspectionTool/1.0)",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
    "Mozilla/5.0 (compatible; Pinterestbot/1.0; +http://www.pinterest.com/bot.html)",
    "Pinterest/0.2 (+http://www.pinterest.com/bot.html)",
    "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
    "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
  ]) {
    assert.equal(M.decidirRota(pedido({ userAgent: ua, pais: "PT" })).tipo, "seguir", ua);
    assert.equal(M.decidirRota(pedido({ userAgent: ua, pais: "US", busca: "?mercado=es" })).tipo, "seguir", ua);
  }
});

test("navegador interno do Instagram é gente: decide pelo país", () => {
  assert.equal(M.decidirRota(pedido({ userAgent: INSTAGRAM, pais: "PT" })).destino, "/pt-pt");
});

test("navegador interno de LinkedIn, Pinterest, Telegram, DuckDuckGo e Baidu é gente", () => {
  const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36";
  for (const ua of [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.30.1",
    ANDROID + " [LinkedInApp]/4.1.900",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [Pinterest/iOS]",
    ANDROID + " Telegram-Android/10.14.5 (Google Pixel 8; Android 14; SDK 34; HIGH)",
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0 Mobile DuckDuckGo/5 Safari/537.36",
    ANDROID + " baiduboxapp/13.40.0.10",
  ]) {
    assert.equal(M.ehRobo(ua), false, ua);
    assert.deepEqual(M.decidirRota(pedido({ userAgent: ua, pais: "PT" })), { tipo: "redirecionar", destino: "/pt-pt", vary: true }, ua);
    assert.equal(M.decidirRota(pedido({ pathname: "/es", userAgent: ua, pais: "ES" })).destino, "/es-es", ua);
    assert.equal(M.decidirRota(pedido({ userAgent: ua, pais: "US" })).tipo, "reescrever", ua);
    // o seletor do rodapé funciona para quem chega por esses apps
    assert.deepEqual(M.decidirRota(pedido({ userAgent: ua, busca: "?mercado=pt", pais: "BR" })), { tipo: "redirecionar", destino: "/pt-pt", cookie: "pt", vary: true }, ua);
  }
});

test("?mercado= grava o cookie, vai para a home do mercado e vence o país", () => {
  assert.deepEqual(M.decidirRota(pedido({ busca: "?mercado=pt", pais: "BR" })), { tipo: "redirecionar", destino: "/pt-pt", cookie: "pt", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ pathname: "/termos", busca: "?mercado=la" })), { tipo: "redirecionar", destino: "/es", cookie: "la", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ busca: "?mercado=br", pais: "MX" })), { tipo: "redirecionar", destino: "/", cookie: "br", vary: true });
  // valor inválido é ignorado
  assert.equal(M.decidirRota(pedido({ busca: "?mercado=xx", pais: "BR" })).tipo, "seguir");
  // ?lang= antigo do seletor PT | ES continua funcionando
  assert.equal(M.decidirRota(pedido({ busca: "?lang=es" })).destino, "/es");
});

test("cookie dm_market vence o país do IP", () => {
  assert.deepEqual(M.decidirRota(pedido({ cookie: "br", pais: "PT" })), { tipo: "seguir", vary: true });
  assert.deepEqual(M.decidirRota(pedido({ pathname: "/pt-pt", cookie: "pt", pais: "BR" })), { tipo: "seguir", vary: true });
  assert.equal(M.decidirRota(pedido({ cookie: "es", pais: "BR" })).destino, "/es-es");
  assert.equal(M.decidirRota(pedido({ cookie: "rw", pais: "BR" })).tipo, "reescrever");
  // cookie inválido é ignorado e o país decide
  assert.equal(M.decidirRota(pedido({ cookie: "xx", pais: "PT" })).destino, "/pt-pt");
});

test("sem cabeçalho de país, o idioma do navegador decide, como antes", () => {
  assert.equal(M.decidirRota(pedido({ idiomas: "es-MX,es;q=0.9,pt;q=0.5" })).destino, "/es");
  assert.equal(M.decidirRota(pedido({ idiomas: "pt-BR,pt;q=0.9,es;q=0.8" })).tipo, "seguir");
  assert.equal(M.decidirRota(pedido({ idiomas: "en-US" })).tipo, "seguir");
  assert.equal(M.decidirRota(pedido({ pathname: "/es", idiomas: "pt-BR" })).tipo, "seguir");
});

test("utm, fbclid e gclid seguem junto em todo redirecionamento", () => {
  const d = M.decidirRota(pedido({ busca: "?utm_source=ig&utm_campaign=lanc&fbclid=abc", pais: "PT" }));
  assert.equal(d.destino, "/pt-pt?utm_source=ig&utm_campaign=lanc&fbclid=abc");
  const s = M.decidirRota(pedido({ busca: "?mercado=es&gclid=x1", pais: "BR" }));
  assert.equal(s.destino, "/es-es?gclid=x1");
});

test("hreflang das homes: pt-BR, pt-PT, es-ES, es-419, es genérico e x-default", () => {
  assert.deepEqual(M.HREFLANG, { "pt-BR": "/", "pt-PT": "/pt-pt", "es-ES": "/es-es", "es-419": "/es", es: "/es", "x-default": "/" });
});

/* ------------------------------- preços ------------------------------- */

const ESP = " ";
const n = (s) => s.replace(/ /g, " ");

test("formato numérico de cada mercado", () => {
  assert.equal(n(P.formatar("br", 149.9)), "R$ 149,90");
  assert.equal(n(P.formatar("la", 24.99)), "US$ 24.99");
  assert.equal(n(P.formatar("rw", 24.99)), "US$ 24,99");
  assert.equal(n(P.formatar("pt", 29.99)), "29,99 €");
  assert.equal(n(P.formatar("es", 29.99)), "29,99 €");
  assert.equal(n(P.formatar("br", 1234.5)), "R$ 1.234,50");
  assert.ok(P.formatar("br", 1).includes(ESP), "símbolo e número não quebram linha");
});

test("equivalente mensal é anual ÷ 12, em centavos", () => {
  assert.equal(P.mensal(149.9), 12.49);
  assert.equal(P.mensal(119.92), 9.99);
  assert.equal(P.mensal(89.94), 7.5);
  assert.equal(P.mensal(24.99), 2.08);
  assert.equal(P.mensal(29.99), 2.5);
});

test("estudante: 40% sobre R$ 149,90 dá R$ 89,94 e R$ 7,50/mês", () => {
  assert.equal(P.ESTUDANTE_DESCONTO, 40);
  assert.equal(P.precoEstudante(), 89.94);
  assert.equal(P.porMesEstudante(), 7.5);
});

test("hoje, sem cupom e data preenchidos, o Brasil mostra o preço cheio e o link sem cupom", () => {
  assert.equal(P.lancamentoVigente("br"), false);
  assert.equal(P.precoFinal("br"), 149.9);
  assert.equal(P.precoCheio("br"), null);
  assert.equal(P.linkCheckout("br"), P.MERCADOS.br.checkout);
});

test("com link, cupom e data preenchidos, o cupom só vale depois de ativo: true", () => {
  const br = P.MERCADOS.br;
  const original = { checkout: br.checkout, lancamento: { ...br.lancamento } };
  try {
    br.checkout = "https://pay.hotmart.com/X00000000Y?off=teste000";
    br.lancamento.codigo = "LANCAMENTO";
    br.lancamento.terminaEm = "2026-10-31";
    const antes = Date.parse("2026-10-20T12:00:00-03:00");
    assert.equal(original.lancamento.ativo, false, "o dono deixou ativo: false");
    assert.equal(P.precoFinal("br", antes), 149.9);
    assert.equal(P.linkCheckout("br", antes), br.checkout);
    br.lancamento.ativo = true;
    assert.equal(P.precoFinal("br", antes), 119.92);
  } finally {
    br.checkout = original.checkout;
    Object.assign(br.lancamento, original.lancamento);
  }
});

test("data que não existe no calendário não vira prazo nem fim de lançamento", () => {
  const br = P.MERCADOS.br;
  const original = { lancamento: { ...br.lancamento } };
  try {
    br.lancamento.codigo = "LANCAMENTO";
    br.lancamento.ativo = true;
    br.lancamento.terminaEm = "2026-11-31";
    assert.equal(P.fimDoLancamento("br"), null);
    assert.equal(P.dataDoLancamento("br"), null);
    assert.equal(P.lancamentoVigente("br", Date.parse("2026-11-20T12:00:00-03:00")), false);
  } finally {
    Object.assign(br.lancamento, original.lancamento);
  }
});

test("lançamento valendo: R$ 119,92, R$ 9,99/mês, cupom no link com offDiscount; encerrado, volta ao cheio", () => {
  // Cópia do mercado br com cupom e data, sem mexer no config real.
  const br = P.MERCADOS.br;
  const original = { checkout: br.checkout, lancamento: { ...br.lancamento } };
  try {
    br.checkout = "https://pay.hotmart.com/X00000000Y?off=teste000";
    br.lancamento.codigo = "LANCAMENTO";
    br.lancamento.terminaEm = "2026-10-31";
    br.lancamento.ativo = true;
    const antes = Date.parse("2026-10-31T23:00:00-03:00");
    const depois = Date.parse("2026-11-01T00:00:01-03:00");
    assert.equal(P.lancamentoVigente("br", antes), true);
    assert.equal(P.precoFinal("br", antes), 119.92);
    assert.equal(P.porMes("br", antes), 9.99);
    assert.equal(n(P.precoCheio("br", antes)), "R$ 149,90");
    assert.equal(P.linkCheckout("br", antes), "https://pay.hotmart.com/X00000000Y?off=teste000&offDiscount=LANCAMENTO");
    assert.equal(P.dataDoLancamento("br"), "31 de outubro");
    // passou da data: preço cheio e link sem parâmetro
    assert.equal(P.precoFinal("br", depois), 149.9);
    assert.equal(P.linkCheckout("br", depois), br.checkout);
    // marcado como encerrado antes da data: idem
    br.lancamento.ativo = false;
    assert.equal(P.precoFinal("br", antes), 149.9);
    assert.equal(P.linkCheckout("br", antes), br.checkout);
  } finally {
    br.checkout = original.checkout;
    Object.assign(br.lancamento, original.lancamento);
  }
});

test("mercados fora do Brasil: sem cupom; rw aberto com o Brasil, la, es e pt na lista de espera", () => {
  for (const m of ["la", "es", "pt", "rw"]) assert.equal(P.MERCADOS[m].lancamento, null, m);
  for (const m of ["la", "es", "pt"]) {
    assert.equal(P.MERCADOS[m].vendaAberta, false, m);
    assert.equal(P.vendeAgora(m), false, m);
  }
  assert.equal(P.MERCADOS.br.vendaAberta, true);
  assert.equal(P.MERCADOS.rw.vendaAberta, true);
  // sem o link USD, rw ainda não vende (e o build de produção trava)
  assert.equal(P.vendeAgora("rw"), false);
});

test("total do Brasil com o texto do handoff, seção 2", () => {
  assert.equal(P.MERCADOS.br.textos.cupomAplicado, "com o cupom de lançamento já aplicado pelo botão");
});

test("textos do bloco: sem travessão longo, sem compra, sem valor de parcela", () => {
  const todos = JSON.stringify(P.MERCADOS);
  assert.equal(/—/.test(todos), false, "travessão longo");
  assert.equal(/\bcompra(r)?\b/i.test(todos), false, "compra/comprar");
  assert.equal(/\d+\s*x\s*de\b/i.test(todos), false, "valor de parcela");
  // renovação do Brasil sem "pelo mesmo valor" enquanto o dono não confirmar
  assert.equal(P.MERCADOS.br.renovaMesmoValor, false);
  assert.equal(/mesmo valor/.test(P.MERCADOS.br.textos.renovacao), false);
});
