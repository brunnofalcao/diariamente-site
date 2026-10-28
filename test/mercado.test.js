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
// Estes testes descrevem o site LANÇADO (chave de lançamento ligada,
// config/lancamento.ts). O standby está em test/standby.test.js.
const pedido = (x) => ({ pathname: "/", busca: "", userAgent: NAVEGADOR, cookie: null, pais: null, idiomas: null, lancado: true, ...x });

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
  // ?lang= antigo do seletor PT | ES continua funcionando nas homes
  assert.equal(M.decidirRota(pedido({ busca: "?lang=es" })).destino, "/es");
});

test("?lang= fora das homes não é seletor: as páginas de obrigado usam ?lang= para o idioma", () => {
  // Depois do pagamento, a Hotmart manda a pessoa de volta com ?lang=es;
  // redirecionar para /es perderia a página de obrigado e o Purchase.
  for (const lancado of [true, false]) {
    for (const pathname of ["/obrigado", "/obrigado-aprovado", "/obrigado-aguardando-pagamento", "/obrigado-aguardando-analise"]) {
      for (const busca of ["?lang=es", "?lang=pt", "?transaction=HP1&lang=es"]) {
        assert.deepEqual(M.decidirRota(pedido({ pathname, busca, pais: "MX", lancado })), { tipo: "seguir", vary: false }, `${pathname}${busca} lancado=${lancado}`);
      }
    }
  }
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

test("hreflang das homes: pt-BR, pt-PT, es-ES, es genérico e x-default (sem es-419, como na main)", () => {
  assert.deepEqual(M.HREFLANG, { "pt-BR": "/", "pt-PT": "/pt-pt", "es-ES": "/es-es", es: "/es", "x-default": "/" });
});

/* ------------------------------- preços ------------------------------- */

const ESP = " ";
const n = (s) => s.replace(/ /g, " ");

test("formato numérico de cada mercado", () => {
  assert.equal(n(P.formatar("br", 149.9)), "R$ 149,90");
  assert.equal(n(P.formatar("la", 29.99)), "US$ 29.99");
  assert.equal(n(P.formatar("rw", 29.99)), "US$ 29,99");
  assert.equal(n(P.formatar("pt", 29.99)), "29,99 €");
  assert.equal(n(P.formatar("es", 29.99)), "29,99 €");
  assert.equal(n(P.formatar("br", 1234.5)), "R$ 1.234,50");
  assert.ok(P.formatar("br", 1).includes(ESP), "símbolo e número não quebram linha");
});

test("equivalente mensal é anual ÷ 12, em centavos", () => {
  assert.equal(P.mensal(149.9), 12.49);
  assert.equal(P.mensal(99.98), 8.33);
  assert.equal(P.mensal(89.9), 7.49);
  assert.equal(P.mensal(41.94), 3.5);
  assert.equal(P.mensal(24.99), 2.08);
  assert.equal(P.mensal(29.99), 2.5);
});

test("estudante: preço final R$ 89,90 e R$ 7,49/mês; o desconto (0.40027) sai do preço final", () => {
  assert.equal(P.ESTUDANTE_PRECO_FINAL, 89.9);
  assert.equal(P.precoEstudante(), 89.9);
  assert.equal(P.porMesEstudante(), 7.49);
  assert.equal(P.ESTUDANTE_DESCONTO, 0.40027);
  assert.ok(Math.abs(P.ESTUDANTE_DESCONTO - (1 - 89.9 / 149.9)) < 0.000005);
  assert.ok(P.ESTUDANTE_DESCONTO > 0 && P.ESTUDANTE_DESCONTO < 0.99, "faixa que a API da Hotmart aceita");
});

test("hoje (12/10/2026), o Brasil mostra o preço de lançamento e o botão abre a oferta de lançamento", () => {
  const hoje = Date.parse("2026-10-12T12:00:00-03:00");
  assert.equal(P.lancamentoVigente("br", hoje), true);
  assert.equal(P.precoFinal("br", hoje), 99.98);
  assert.equal(P.porMes("br", hoje), 8.33);
  assert.equal(n(P.precoCheio("br", hoje)), "R$ 149,90");
  assert.equal(P.linkCheckout("br", hoje), P.MERCADOS.br.lancamento.checkout);
  assert.notEqual(P.linkCheckout("br", hoje), P.MERCADOS.br.checkout);
});

test("lançamento com link pendente não vale: preço cheio e oferta oficial", () => {
  const br = P.MERCADOS.br;
  const original = { ...br.lancamento };
  try {
    br.lancamento.checkout = "[PREENCHER: link da oferta de lançamento]";
    const antes = Date.parse("2026-10-20T12:00:00-03:00");
    assert.equal(P.lancamentoVigente("br", antes), false);
    assert.equal(P.precoFinal("br", antes), 149.9);
    assert.equal(P.linkCheckout("br", antes), br.checkout);
  } finally {
    Object.assign(br.lancamento, original);
  }
});

test("data que não existe no calendário não vira prazo nem fim de lançamento", () => {
  const br = P.MERCADOS.br;
  const original = { ...br.lancamento };
  try {
    br.lancamento.ativo = true;
    br.lancamento.terminaEm = "2026-11-31";
    assert.equal(P.fimDoLancamento("br"), null);
    assert.equal(P.dataDoLancamento("br"), null);
    assert.equal(P.lancamentoVigente("br", Date.parse("2026-11-20T12:00:00-03:00")), false);
  } finally {
    Object.assign(br.lancamento, original);
  }
});

test("lançamento valendo: R$ 99,98, R$ 8,33/mês, oferta própria sem cupom; encerrado, volta ao cheio", () => {
  const br = P.MERCADOS.br;
  const original = { ...br.lancamento };
  try {
    const antes = Date.parse("2026-11-16T23:00:00-03:00");
    const depois = Date.parse("2026-11-17T00:00:01-03:00");
    assert.equal(P.lancamentoVigente("br", antes), true);
    assert.equal(P.precoFinal("br", antes), 99.98);
    assert.equal(P.porMes("br", antes), 8.33);
    assert.equal(P.linkCheckout("br", antes), "https://pay.hotmart.com/K105072021O?off=lf63bgdd");
    assert.equal(/offDiscount/.test(P.linkCheckout("br", antes)), false);
    assert.equal(P.dataDoLancamento("br"), "16 de novembro");
    // passou da data: preço cheio e oferta oficial
    assert.equal(P.precoFinal("br", depois), 149.9);
    assert.equal(P.porMes("br", depois), 12.49);
    assert.equal(P.linkCheckout("br", depois), "https://pay.hotmart.com/K105072021O?off=fhrttdh8");
    // marcado como encerrado antes da data: idem
    br.lancamento.ativo = false;
    assert.equal(P.precoFinal("br", antes), 149.9);
    assert.equal(P.linkCheckout("br", antes), br.checkout);
  } finally {
    Object.assign(br.lancamento, original);
  }
});

test("mercados fora do Brasil: sem lançamento e todos fechados até o dono confirmar", () => {
  for (const m of ["la", "es", "pt", "rw"]) {
    assert.equal(P.MERCADOS[m].lancamento, null, m);
    assert.equal(P.MERCADOS[m].vendaAberta, false, m);
    assert.equal(P.vendeAgora(m), false, m);
  }
  assert.equal(P.MERCADOS.br.vendaAberta, true);
  assert.equal(P.vendeAgora("br"), true);
});

test("texto do lançamento: preço dos 3 primeiros anos, o desconto sobre o oficial e depois o cheio, só à vista", () => {
  const t = P.MERCADOS.br.textos;
  // card novo (27/10/2026): o desconto travado nos 3 anos e a renovação às
  // claras; o *destaque* nunca chega à tela
  assert.equal(t.lancamentoRegra, "*{pct}% a menos*, travado nos {anos} primeiros anos. Depois, {cheio} por ano.");
  assert.equal(t.lancamentoRegraSemPercentual, "Travado nos {anos} primeiros anos. Depois, {cheio} por ano.");
  assert.equal(t.lancamentoRegraEstudante, "nos {anos} primeiros anos. Depois, {cheio} por ano.");
  assert.equal(t.ancora, "Preço oficial");
  // o "à vista" do lançamento está no prazo, antes do botão
  assert.equal(t.prazo, "Preço de lançamento, à vista, para quem assinar até");
  assert.equal(t.tituloLancamento, "Seu Diariamente");
  assert.equal(t.linhaValor, "Equivale a *{mes}* por mês. Por dia, cerca de *{dia}* e três minutos.");
  assert.deepEqual([t.quadroOficial, t.quadroLancamento, t.quadroEconomia, t.quadroLegenda], [
    "{anos} anos no preço oficial", "{anos} anos no lançamento", "Você deixa de pagar", "Quase o preço oficial de um ano inteiro.",
  ]);
  assert.equal(t.notaLancamento, "por ano nos {anos} primeiros anos, para quem assinar até {data} · Garantia de 7 dias");
  assert.equal(t.notaBarraLancamento, "por ano durante {anos} anos");
  // a pílula do card de sempre (o Brasil não a mostra mais; fica para
  // pagamentoAgora e para quem tiver lançamento sem o card novo)
  assert.equal(t.pagamentoLancamento, "Pagamento à vista");
  // parcelado com acréscimo (o checkout da fhrttdh8 parcela com acréscimo),
  // separado do equivalente mensal da manchete
  assert.equal(t.pagamento, "À vista, ou em até 12x no cartão com acréscimo");
  assert.equal("cupomAplicado" in t, false);
});

test("textos do bloco: sem travessão longo, sem compra, sem valor de parcela", () => {
  const todos = JSON.stringify(P.MERCADOS);
  assert.equal(/[—–]/.test(todos), false, "travessão");
  assert.equal(/\bcompr(a|ar|e)\b/i.test(todos), false, "compra/comprar/compre");
  assert.equal(/cashback|de graça|grátis|gratis|pague 2|leve 3|fundador/i.test(todos), false, "promessa vetada");
  assert.equal(/\d+\s*x\s*de\b/i.test(todos), false, "valor de parcela");
  // renovação do Brasil sem "pelo mesmo valor" enquanto o dono não confirmar
  assert.equal(P.MERCADOS.br.renovaMesmoValor, false);
  assert.equal(/mesmo valor/.test(P.MERCADOS.br.textos.renovacao), false);
});
