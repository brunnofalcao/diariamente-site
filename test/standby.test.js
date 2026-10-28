// Testes do STANDBY do site de vendas (decisão do dono, 27/10/2026):
// a chave de lançamento (config/lancamento.ts, DM_SITE_LANCADO), o
// roteamento das homes e da vitrine (/vendas, /es/vendas, /es-es/vendas,
// /pt-pt/vendas, /mundo/vendas), o noindex, o sitemap, os
// redirecionamentos das prévias e dos endereços antigos, todos os
// mercados com a venda aberta e o checkout de verdade na vitrine, o preço
// oficial riscado e a trava do build em standby.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const jsx = require("react/jsx-runtime");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { carregarTs } = require("../scripts/carregar-ts");
const { checarPrecos, checarPrecosDoProjeto, carregarPrecos, siteLancado, emStandby, alvoDoEstudante } = require("../scripts/checar-precos");

const raiz = path.join(__dirname, "..");
const arq = (...p) => path.join(raiz, ...p);
const P = carregarTs(arq("config", "pricing.ts"));
const M = carregarTs(arq("lib", "mercado.ts"));
const R = carregarTs(arq("lib", "rotas.ts"));
const C = carregarTs(arq("config.ts"), { "@/config/pricing": P });

const DOMINIO = "https://www.diariamente.app";
const NAVEGADOR = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const pedido = (x) => ({ pathname: "/", busca: "", userAgent: NAVEGADOR, cookie: null, pais: null, idiomas: null, ...x });
const standby = (x) => M.decidirRota(pedido({ lancado: false, ...x }));
const lancado = (x) => M.decidirRota(pedido({ lancado: true, ...x }));

/** config/lancamento.ts carregado com DM_SITE_LANCADO como o build gravaria. */
function chave(valor) {
  const antes = process.env.DM_SITE_LANCADO;
  if (valor === undefined) delete process.env.DM_SITE_LANCADO;
  else process.env.DM_SITE_LANCADO = valor;
  try {
    return carregarTs(arq("config", "lancamento.ts")).SITE_LANCADO;
  } finally {
    if (antes === undefined) delete process.env.DM_SITE_LANCADO;
    else process.env.DM_SITE_LANCADO = antes;
  }
}

/** lib/seo.ts com a chave do build (o padrão do metadataDoMercado). */
function seo(lancadoNoBuild = false) {
  return carregarTs(arq("lib", "seo.ts"), {
    "@/config": C, "@/lib/rotas": R, "@/lib/mercado": M, "@/config/pricing": P,
    "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild },
  });
}

/* ------------------------------- a chave ------------------------------- */

test("chave: desligada por padrão; só DM_SITE_LANCADO=1 liga", () => {
  assert.equal(chave(undefined), false);
  assert.equal(chave(""), false);
  assert.equal(chave("1"), true);
  assert.equal(siteLancado({}), false);
  assert.equal(siteLancado({ DM_SITE_LANCADO: "1" }), true);
  assert.equal(siteLancado({ DM_SITE_LANCADO: " 1 " }), true);
  for (const v of ["0", "true", "sim", "yes", "2"]) assert.equal(siteLancado({ DM_SITE_LANCADO: v }), false, v);
});

test("next.config.js grava DM_SITE_LANCADO no build: vazio por padrão, \"1\" só com \"1\"", () => {
  const fabrica = require(arq("next.config.js"));
  const aviso = console.warn;
  const antes = process.env.DM_SITE_LANCADO;
  console.warn = () => {};
  try {
    delete process.env.DM_SITE_LANCADO;
    assert.equal(fabrica("phase-development-server").env.DM_SITE_LANCADO, "");
    process.env.DM_SITE_LANCADO = "true";
    assert.equal(fabrica("phase-development-server").env.DM_SITE_LANCADO, "");
    process.env.DM_SITE_LANCADO = "1";
    assert.equal(fabrica("phase-development-server").env.DM_SITE_LANCADO, "1");
  } finally {
    console.warn = aviso;
    if (antes === undefined) delete process.env.DM_SITE_LANCADO;
    else process.env.DM_SITE_LANCADO = antes;
  }
});

test("o middleware passa a chave do build para a decisão de rota", () => {
  const fonte = fs.readFileSync(arq("middleware.ts"), "utf8");
  assert.match(fonte, /import \{ SITE_LANCADO \} from "@\/config\/lancamento"/);
  assert.match(fonte, /lancado: SITE_LANCADO/);
  // sem a chave, a decisão é a do standby
  assert.deepEqual(M.decidirRota(pedido({ pais: "US" })), { tipo: "seguir", vary: true });
});

/* ------------------------- standby: homes públicas ------------------------- */

test("standby: cada país vai para a sua home, como a produção antes do lançamento", () => {
  assert.deepEqual(standby({ pais: "BR" }), { tipo: "seguir", vary: true });
  assert.deepEqual(standby({ pais: "PT" }), { tipo: "redirecionar", destino: "/pt-pt", vary: true });
  assert.deepEqual(standby({ pais: "ES" }), { tipo: "redirecionar", destino: "/es-es", vary: true });
  assert.deepEqual(standby({ pais: "MX" }), { tipo: "redirecionar", destino: "/es", vary: true });
  assert.deepEqual(standby({ pathname: "/es", pais: "BR" }), { tipo: "redirecionar", destino: "/", vary: true });
  assert.deepEqual(standby({ pathname: "/pt-pt", pais: "PT" }), { tipo: "seguir", vary: true });
  assert.equal(standby({ cookie: "la", pais: "BR" }).destino, "/es");
  assert.equal(standby({ idiomas: "es-MX,es;q=0.9" }).destino, "/es");
});

test("standby: o middleware NÃO reescreve \"/\" para /mundo (resto do mundo fica na lista de espera)", () => {
  for (const x of [{ pais: "US" }, { pais: "DE" }, { cookie: "rw", pais: "BR" }]) {
    assert.deepEqual(standby(x), { tipo: "seguir", vary: true }, JSON.stringify(x));
  }
  assert.deepEqual(standby({ pathname: "/pt-pt", pais: "US" }), { tipo: "redirecionar", destino: "/", vary: true });
  // /mundo pedido direto: a página responde 404 (app/mundo/page.tsx), como a produção de hoje
  assert.deepEqual(standby({ pathname: "/mundo", pais: "US" }), { tipo: "seguir", vary: false });
  const mundo = fs.readFileSync(arq("app", "mundo", "page.tsx"), "utf8");
  assert.match(mundo, /if \(!SITE_LANCADO\) notFound\(\);/);
  // lançado, continua como no PR #3
  assert.deepEqual(lancado({ pais: "US" }), { tipo: "reescrever", destino: "/mundo", vary: true });
  assert.equal(lancado({ pathname: "/mundo" }).destino, "/");
});

test("standby: ?lang= antigo não redireciona nem grava cookie (a home pedida abre, como na produção)", () => {
  for (const pathname of ["/", "/es", "/pt-pt", "/es-es"]) {
    for (const busca of ["?lang=es", "?lang=pt", "?lang=es&utm_source=ig"]) {
      const d = standby({ pathname, busca, pais: pathname === "/" ? "BR" : pathname === "/es" ? "MX" : pathname === "/pt-pt" ? "PT" : "ES" });
      assert.deepEqual(d, { tipo: "seguir", vary: true }, pathname + busca);
    }
  }
  // lançado, o seletor antigo volta a valer nas homes
  assert.deepEqual(lancado({ busca: "?lang=es", pais: "BR" }), { tipo: "redirecionar", destino: "/es", cookie: "la", vary: true });
});

test("standby: ?mercado= nas páginas públicas grava o cookie e vai para a home do mercado, como hoje", () => {
  assert.deepEqual(standby({ busca: "?mercado=pt", pais: "BR" }), { tipo: "redirecionar", destino: "/pt-pt", cookie: "pt", vary: true });
  assert.deepEqual(standby({ pathname: "/termos", busca: "?mercado=la" }), { tipo: "redirecionar", destino: "/es", cookie: "la", vary: true });
});

test("páginas internas abrem como foram pedidas nos dois estados (obrigado, legais, estudante)", () => {
  for (const pathname of [
    "/obrigado", "/obrigado-aprovado", "/obrigado-aguardando-pagamento", "/obrigado-aguardando-analise",
    "/privacidade", "/es/privacidad", "/termos", "/es/condicionesdeuso", "/sobre", "/es/acerca-de",
    "/estudante", "/es/estudiantes", "/estudante/solicitacaorecebida", "/em-breve",
  ]) {
    for (const busca of ["", "?lang=es"]) {
      assert.deepEqual(standby({ pathname, busca, pais: "PT" }), { tipo: "seguir", vary: false }, pathname + busca);
      assert.deepEqual(lancado({ pathname, busca, pais: "PT" }), { tipo: "seguir", vary: false }, pathname + busca);
    }
  }
});

/* --------------------------- standby: a vitrine --------------------------- */

const VITRINE_NOVA = { br: "/vendas", la: "/es/vendas", es: "/es-es/vendas", pt: "/pt-pt/vendas", rw: "/mundo/vendas" };
const VITRINE_VELHA = { "/vendas/es": "/es/vendas", "/vendas/es-es": "/es-es/vendas", "/vendas/pt-pt": "/pt-pt/vendas", "/vendas/mundo": "/mundo/vendas" };

test("os cinco endereços da vitrine, um por mercado, com o idioma na frente", () => {
  assert.deepEqual(M.VENDAS_DO_MERCADO, VITRINE_NOVA);
  for (const caminho of Object.values(VITRINE_NOVA)) {
    assert.equal(M.ehVitrine(caminho), true, caminho);
    assert.equal(M.ehVitrine(caminho + "/qualquer"), true, caminho);
    assert.equal(M.ehVitrine(caminho + "x"), false, caminho);
  }
  // nenhum endereço público é vitrine
  for (const p of [
    "/", "/es", "/es-es", "/pt-pt", "/mundo", "/estudante", "/es/estudiantes", "/sobre", "/es/acerca-de",
    "/termos", "/privacidade", "/es/privacidad", "/es/condicionesdeuso", "/obrigado", "/obrigado-aprovado",
    "/embreve", "/es/embreve", "/vendasx", "/es/vendasx",
  ]) {
    assert.equal(M.ehVitrine(p), false, p);
  }
});

test("standby: a vitrine abre como foi pedida, de qualquer país, sem cookie nem reescrita", () => {
  for (const pathname of Object.values(M.VENDAS_DO_MERCADO)) {
    for (const x of [{ pais: "BR" }, { pais: "PT" }, { pais: "US" }, { cookie: "es", pais: "MX" }, { idiomas: "es-MX" }]) {
      assert.deepEqual(standby({ pathname, ...x }), { tipo: "seguir", vary: false }, `${pathname} ${JSON.stringify(x)}`);
    }
    assert.equal(standby({ pathname, userAgent: GOOGLEBOT }).tipo, "seguir", pathname);
  }
});

test("standby: PT | ES e ?mercado= dentro da vitrine ficam na vitrine (sem gravar cookie)", () => {
  assert.deepEqual(standby({ pathname: "/vendas", busca: "?mercado=la" }), { tipo: "redirecionar", destino: "/es/vendas", vary: false });
  assert.deepEqual(standby({ pathname: "/es/vendas", busca: "?mercado=pt&utm_source=ig" }), { tipo: "redirecionar", destino: "/pt-pt/vendas?utm_source=ig", vary: false });
  assert.deepEqual(standby({ pathname: "/pt-pt/vendas", busca: "?mercado=es" }), { tipo: "redirecionar", destino: "/es-es/vendas", vary: false });
  assert.deepEqual(standby({ pathname: "/es-es/vendas", busca: "?mercado=br" }), { tipo: "redirecionar", destino: "/vendas", vary: false });
  assert.deepEqual(standby({ pathname: "/vendas", busca: "?mercado=rw" }), { tipo: "redirecionar", destino: "/mundo/vendas", vary: false });
  assert.deepEqual(standby({ pathname: "/mundo/vendas", busca: "?mercado=la" }), { tipo: "redirecionar", destino: "/es/vendas", vary: false });
});

test("standby: os endereços antigos da vitrine (/vendas/es...) levam aos novos, 307 com todos os parâmetros, até para robô", () => {
  assert.deepEqual(M.VITRINE_ANTIGA, { "/vendas/es": "la", "/vendas/es-es": "es", "/vendas/pt-pt": "pt", "/vendas/mundo": "rw" });
  for (const [de, para] of Object.entries(VITRINE_VELHA)) {
    for (const x of [{ pais: "BR" }, { pais: "US" }, { userAgent: GOOGLEBOT }, { cookie: "pt" }]) {
      assert.deepEqual(standby({ pathname: de, ...x }), { tipo: "redirecionar", destino: para, vary: false }, `${de} ${JSON.stringify(x)}`);
    }
    assert.equal(standby({ pathname: de, busca: "?utm_source=ig&fbclid=x" }).destino, `${para}?utm_source=ig&fbclid=x`, de);
    // a query vai inteira; o ?mercado= decide no pedido seguinte, já na vitrine
    assert.equal(standby({ pathname: de, busca: "?mercado=br&utm_source=ig" }).destino, `${para}?mercado=br&utm_source=ig`, de);
  }
  // o middleware aplica a decisão como redirecionamento (NextResponse.redirect, 307)
  const fonte = fs.readFileSync(arq("middleware.ts"), "utf8");
  assert.match(fonte, /r = NextResponse\.redirect\(new URL\(d\.destino, req\.url\)\);/);
  // e as páginas antigas saíram do app/ (só o redirecionamento responde)
  for (const de of Object.keys(VITRINE_VELHA)) {
    assert.equal(fs.existsSync(arq("app", ...de.split("/").filter(Boolean), "page.tsx")), false, de);
  }
});

test("standby: prévias antigas levam à vitrine do mercado, com utm, até para robô", () => {
  const casos = { "/embreve": "/vendas", "/es/embreve": "/es/vendas", "/pt-pt/embreve": "/pt-pt/vendas", "/es-es/embreve": "/es-es/vendas" };
  assert.deepEqual(M.PREVIAS_ANTIGAS, casos);
  for (const [de, para] of Object.entries(casos)) {
    assert.deepEqual(standby({ pathname: de, pais: "BR" }), { tipo: "redirecionar", destino: para, vary: false }, de);
    assert.deepEqual(standby({ pathname: de, userAgent: GOOGLEBOT }), { tipo: "redirecionar", destino: para, vary: false }, de);
    assert.equal(standby({ pathname: de, busca: "?utm_source=ig&fbclid=x" }).destino, `${para}?utm_source=ig&fbclid=x`, de);
  }
  // a página de /embreve e /es/embreve repete a regra (caso o middleware não
  // rode), com os endereços de lib/mercado.ts, sem caminho escrito à mão
  const embreve = fs.readFileSync(arq("app", "embreve", "page.tsx"), "utf8");
  const esEmbreve = fs.readFileSync(arq("app", "es", "embreve", "page.tsx"), "utf8");
  assert.match(embreve, /SITE_LANCADO \? HOME_DO_MERCADO\.br : VENDAS_DO_MERCADO\.br/);
  assert.match(esEmbreve, /SITE_LANCADO \? HOME_DO_MERCADO\.la : VENDAS_DO_MERCADO\.la/);
  for (const f of [embreve, esEmbreve]) assert.equal(/"\/vendas/.test(f), false);
});

test("lançado: a vitrine, nova ou antiga, redireciona para a home real do mercado, até para robô", () => {
  const casos = {
    "/vendas": "/", "/es/vendas": "/es", "/es-es/vendas": "/es-es", "/pt-pt/vendas": "/pt-pt", "/mundo/vendas": "/",
    "/vendas/es": "/es", "/vendas/es-es": "/es-es", "/vendas/pt-pt": "/pt-pt", "/vendas/mundo": "/",
  };
  for (const [de, para] of Object.entries(casos)) {
    assert.deepEqual(lancado({ pathname: de, pais: "BR" }), { tipo: "redirecionar", destino: para, vary: false }, de);
    assert.deepEqual(lancado({ pathname: de, userAgent: GOOGLEBOT }), { tipo: "redirecionar", destino: para, vary: false }, de);
    assert.equal(lancado({ pathname: de, busca: "?utm_source=ig" }).destino, `${para}?utm_source=ig`, de);
  }
  // ?mercado= vai junto e decide no passo seguinte (cookie e home do mercado)
  assert.equal(lancado({ pathname: "/vendas", busca: "?mercado=la&utm_source=ig" }).destino, "/?mercado=la&utm_source=ig");
  assert.deepEqual(lancado({ busca: "?mercado=la&utm_source=ig" }), { tipo: "redirecionar", destino: "/es?utm_source=ig", cookie: "la", vary: true });
  // as prévias antigas voltam ao comportamento do PR #3 (decidido pela página)
  for (const de of ["/embreve", "/es/embreve", "/pt-pt/embreve", "/es-es/embreve"]) {
    assert.deepEqual(lancado({ pathname: de, pais: "BR" }), { tipo: "seguir", vary: false }, de);
  }
  // /mundo continua a rota interna do resto do mundo; /mundo/vendas não é ela
  assert.equal(lancado({ pathname: "/mundo" }).destino, "/");
  assert.deepEqual(standby({ pathname: "/mundo/vendas", pais: "US" }), { tipo: "seguir", vary: false });
});

test("uma página para cada endereço da vitrine, com o mercado certo, noindex e a página do lançamento", () => {
  for (const [mercado, caminho] of Object.entries(M.VENDAS_DO_MERCADO)) {
    const arquivo = arq("app", ...caminho.split("/").filter(Boolean), "page.tsx");
    assert.ok(fs.existsSync(arquivo), arquivo);
    const fonte = fs.readFileSync(arquivo, "utf8");
    assert.match(fonte, new RegExp(`metadataDaVitrine\\("${mercado}"\\)`), arquivo);
    assert.match(fonte, new RegExp(`<PaginaDoMercado mercado="${mercado}" vitrine />`), arquivo);
    assert.match(fonte, /export const revalidate = 3600;/, arquivo);
  }
  // nenhum layout nos segmentos das homes: a vitrine herda só o layout raiz
  for (const seg of ["es", "es-es", "pt-pt", "mundo", "vendas"]) {
    for (const nome of ["layout.tsx", "template.tsx", "not-found.tsx", "error.tsx", "loading.tsx"]) {
      assert.equal(fs.existsSync(arq("app", seg, nome)), false, `app/${seg}/${nome}`);
    }
  }
  // o 404 de /mundo em standby é do page.tsx de /mundo, não da rota filha
  assert.match(fs.readFileSync(arq("app", "mundo", "page.tsx"), "utf8"), /if \(!SITE_LANCADO\) notFound\(\);/);
  assert.equal(/next\/navigation|notFound\(\);/.test(fs.readFileSync(arq("app", "mundo", "vendas", "page.tsx"), "utf8")), false);
});

/* ------------------------------ indexação ------------------------------ */

test("vitrine: noindex, nofollow, canonical para si mesma, SEM hreflang, Open Graph próprio e o título de venda do mercado", () => {
  const S = seo(false);
  const LOCALE = { br: "pt_BR", la: "es_LA", es: "es_ES", pt: "pt_PT", rw: "pt_BR" };
  for (const [mercado, caminho] of Object.entries(M.VENDAS_DO_MERCADO)) {
    const m = S.metadataDaVitrine(mercado);
    assert.equal(m.robots.index, false, mercado);
    assert.equal(m.robots.follow, false, mercado);
    assert.equal(m.robots.googleBot.index, false, mercado);
    assert.deepEqual(m.alternates, { canonical: DOMINIO + caminho }, mercado);
    // Open Graph da própria vitrine (prévia do link): título, descrição,
    // idioma do mercado e a URL dela, nunca a da home pública
    assert.equal(m.openGraph.url, DOMINIO + caminho, mercado);
    assert.equal(m.openGraph.locale, LOCALE[mercado], mercado);
    assert.equal(m.openGraph.title, m.title, mercado);
    assert.equal(m.openGraph.description, m.description, mercado);
    assert.equal(m.openGraph.images.length, 1, mercado);
    assert.equal(m.openGraph.images[0].url, P.MERCADOS[mercado].idioma === "es" ? "/es/opengraph-image" : "/opengraph-image.png", mercado);
    assert.equal(m.twitter.title, m.title, mercado);
    assert.equal("languages" in m.alternates, false, mercado);
  }
  // o título é o de VENDA do mercado, também onde a home pública ainda é a
  // lista de espera (la e es): a vitrine mostra a venda aberta
  const venda = {
    br: ["Diariamente · uma prática diária de hábitos e bem-estar", S.metadataDoMercado("br", true).description],
    rw: ["Diariamente · uma prática diária de hábitos e bem-estar", S.metadataDoMercado("br", true).description],
    pt: ["Diariamente · uma prática diária de hábitos e bem-estar", "Uma provocação por dia que termina numa ação possível ainda hoje. Porque interromper não significa abandonar."],
    es: ["Diariamente · una práctica diaria de hábitos y bienestar", "Una provocación por día que termina en una acción posible hoy mismo. Porque interrumpir no significa abandonar."],
    la: ["Diariamente · una práctica diaria de hábitos y bienestar", "Una provocación por día que termina en una acción posible hoy mismo. Porque interrumpir no significa abandonar."],
  };
  for (const [mercado, [title, description]] of Object.entries(venda)) {
    assert.equal(S.metadataDaVitrine(mercado).title, title, mercado);
    assert.equal(S.metadataDaVitrine(mercado).description, description, mercado);
  }
  assert.equal(/próximamente|em breve/i.test(JSON.stringify(Object.keys(venda).map((m) => S.metadataDaVitrine(m)))), false);
});

test("next.config.js: X-Robots-Tag noindex nos cinco endereços da vitrine (e abaixo deles) e nas 8 rotas do pós-pagamento, e só neles", async () => {
  const fabrica = require(arq("next.config.js"));
  const aviso = console.warn;
  console.warn = () => {};
  let regras;
  try {
    regras = await fabrica("phase-development-server").headers();
  } finally {
    console.warn = aviso;
  }
  const comNoindex = regras.filter((r) => r.headers.some((h) => h.key === "X-Robots-Tag"));
  // Pós-pagamento (lib/obrigado.mjs): obrigado e /baixar, em pt e em es, só a rota exata.
  const { ROTAS_DO_POS_PAGAMENTO } = await import(arq("lib", "obrigado.mjs"));
  assert.equal(ROTAS_DO_POS_PAGAMENTO.length, 8);
  const esperado = [
    ...Object.values(M.VENDAS_DO_MERCADO).flatMap((base) => [base, `${base}/:path*`]),
    ...ROTAS_DO_POS_PAGAMENTO,
  ];
  assert.deepEqual(comNoindex.map((r) => r.source).sort(), esperado.sort());
  for (const r of comNoindex) {
    assert.deepEqual(r.headers, [{ key: "X-Robots-Tag", value: "noindex, nofollow" }], r.source);
  }
  // "/vendas/:path*" cobre os endereços antigos (/vendas/es...), que só redirecionam
  assert.ok(esperado.includes("/vendas/:path*"));
  // o resto do site não recebe noindex
  assert.equal(regras.find((x) => x.source === "/:path*").headers.some((h) => h.key === "X-Robots-Tag"), false);
});

test("standby: homes públicas indexáveis, com o título da lista de espera e o hreflang de sempre", () => {
  const S = seo(false);
  const br = S.metadataDoMercado("br");
  assert.equal(br.title, "Diariamente · em breve");
  assert.equal(br.description, "Uma prática diária de hábitos e bem-estar. Ainda não é hoje, mas está perto. Deixe seu contato e avisamos no dia em que abrir.");
  assert.equal(br.robots.index, true);
  assert.equal(br.alternates.canonical, DOMINIO);
  assert.deepEqual(br.alternates.languages, {
    "pt-BR": DOMINIO, "pt-PT": DOMINIO + "/pt-pt", "es-ES": DOMINIO + "/es-es", es: DOMINIO + "/es", "x-default": DOMINIO,
  });
  // /pt-pt e /es-es: o título e a descrição que a produção (main) sempre
  // declarou para elas, mesmo mostrando a lista de espera
  assert.equal(S.metadataDoMercado("pt").title, "Diariamente · uma prática diária de hábitos e bem-estar");
  assert.equal(S.metadataDoMercado("pt").description, "Uma provocação por dia que termina numa ação possível ainda hoje. Porque interromper não significa abandonar.");
  assert.equal(S.metadataDoMercado("es").title, "Diariamente · una práctica diaria de hábitos y bienestar");
  assert.equal(S.metadataDoMercado("es").description, "Una provocación por día que termina en una acción posible hoy mismo. Porque interrumpir no significa abandonar.");
  assert.equal(S.metadataDoMercado("la").title, "Diariamente · próximamente");
  assert.equal(S.metadataDoMercado("la").description, "Una práctica diaria de hábitos y bienestar. Todavía no es hoy, pero está cerca. Déjanos tu contacto y te avisamos el día que abra.");
  // lançado, "/" volta ao título de vendas (PR #3)
  assert.equal(seo(true).metadataDoMercado("br").title, "Diariamente · uma prática diária de hábitos e bem-estar");
  assert.equal(S.metadataDoMercado("pt", true).title, "Diariamente · uma prática diária de hábitos e bem-estar");
});

test("nenhuma página pública aponta para a vitrine (canonical, hreflang, Open Graph)", () => {
  for (const lancadoNoBuild of [false, true]) {
    const S = seo(lancadoNoBuild);
    const publicas = [
      ...["br", "pt", "es", "la"].map((m) => S.metadataDoMercado(m)),
      ...R.CHAVES.filter((c) => !R.PRIVADAS.includes(c)).flatMap((c) => ["pt", "es"].map((l) => S.metadataDaPagina(c, l))),
    ];
    for (const m of publicas) {
      const texto = JSON.stringify(m);
      assert.equal(/\/vendas/.test(texto), false, texto.slice(0, 120));
      assert.equal(/\/embreve/.test(texto), false, texto.slice(0, 120));
      assert.equal(m.robots.index, true);
    }
  }
  assert.ok(R.PRIVADAS.includes("vendas"));
  assert.deepEqual(R.parDeIdiomas("vendas"), { pt: M.VENDAS_DO_MERCADO.br, es: M.VENDAS_DO_MERCADO.la });
});

test("sitemap: as 12 URLs públicas de sempre, sem /vendas, sem /embreve e sem /mundo", () => {
  const S = seo(false);
  const mapa = carregarTs(arq("app", "sitemap.ts"), { "@/lib/rotas": R, "@/lib/mercado": M, "@/lib/seo": S }).default();
  const urls = mapa.map((e) => e.url);
  assert.deepEqual(urls.sort(), [
    "", "/es", "/es-es", "/pt-pt", "/estudante", "/es/estudiantes", "/sobre", "/es/acerca-de",
    "/termos", "/es/condicionesdeuso", "/privacidade", "/es/privacidad",
  ].map((c) => DOMINIO + c).sort());
  const texto = JSON.stringify(mapa);
  assert.equal(/\/vendas|\/embreve|\/mundo/.test(texto), false);
});

test("robots.txt continua liberando o site e apontando para o sitemap (o noindex de /vendas vem da página)", () => {
  const robots = carregarTs(arq("app", "robots.ts"), { "@/config": C }).default();
  assert.deepEqual(robots.rules, { userAgent: "*", allow: "/" });
  assert.equal(robots.sitemap, DOMINIO + "/sitemap.xml");
});

/* ------------------------- o que cada rota mostra ------------------------- */

/** PaginaDoMercado com Home e EmBreve de mentira, para ver qual delas sai. */
function pagina(lancadoNoBuild) {
  const Home = (p) => React.createElement("div", { "data-c": "Home", "data-m": p.mercado, "data-v": String(Boolean(p.vitrine)) });
  const EmBreve = (p) => React.createElement("div", { "data-c": "EmBreve", "data-m": p.mercado, "data-v": String(Boolean(p.vitrine)) });
  const { PaginaDoMercado } = carregarTs(arq("components", "PaginaDoMercado.tsx"), {
    "@/components/Home": { Home }, "@/components/EmBreve": { EmBreve }, "@/config/pricing": P,
    "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild }, "react/jsx-runtime": jsx,
  }, { jsx: true });
  return (mercado, vitrine) => renderToStaticMarkup(React.createElement(PaginaDoMercado, { mercado, vitrine }));
}

test("standby: as homes públicas mostram a lista de espera; a vitrine mostra o site de vendas de TODOS os mercados", () => {
  const ver = pagina(false);
  for (const m of ["br", "pt", "la", "es", "rw"]) {
    assert.match(ver(m, false), new RegExp(`data-c="EmBreve" data-m="${m}" data-v="false"`), m);
    // a vitrine: a página inteira de vendas, inclusive la e es (semVenda "pagina")
    assert.match(ver(m, true), new RegExp(`data-c="Home" data-m="${m}" data-v="true"`), m);
  }
});

test("lançado: as homes públicas seguem vendaAberta e semVenda; a vitrine continua mostrando a venda aberta", () => {
  const ver = pagina(true);
  // br, pt e rw: o site de vendas (pt e rw com a lista de espera no bloco)
  for (const m of ["br", "pt", "rw"]) assert.match(ver(m, false), new RegExp(`data-c="Home" data-m="${m}" data-v="false"`), m);
  // la e es: a lista de espera inteira, como no PR #3
  for (const m of ["la", "es"]) assert.match(ver(m, false), new RegExp(`data-c="EmBreve" data-m="${m}" data-v="false"`), m);
  // a vitrine, se o middleware não redirecionasse, segue as regras públicas
  for (const m of ["br", "pt", "rw"]) assert.match(ver(m, true), new RegExp(`data-c="Home" data-m="${m}" data-v="false"`), m);
  for (const m of ["la", "es"]) assert.match(ver(m, true), new RegExp(`data-c="EmBreve" data-m="${m}" data-v="false"`), m);
  // vendaAberta e semVenda não mudaram: o lançamento público segue fechado fora do Brasil
  assert.deepEqual(
    Object.fromEntries(["br", "la", "es", "pt", "rw"].map((m) => [m, [P.MERCADOS[m].vendaAberta, P.MERCADOS[m].semVenda]])),
    { br: [true, "bloco"], la: [false, "pagina"], es: [false, "pagina"], pt: [false, "bloco"], rw: [false, "bloco"] },
  );
});

test("seletor de país: na home pública grava o mercado (?mercado=); na vitrine leva à vitrine do mercado, com o idioma na frente", () => {
  const { SeletorMercado } = carregarTs(arq("components", "SeletorMercado.tsx"), { "@/lib/mercado": M, "react/jsx-runtime": jsx }, { jsx: true });
  const publico = renderToStaticMarkup(React.createElement(SeletorMercado, { atual: "br", titulo: "País" }));
  for (const m of ["br", "pt", "es", "la"]) assert.ok(publico.includes(`href="/?mercado=${m}"`), m);
  assert.equal(/\/vendas/.test(publico), false);
  const vitrine = renderToStaticMarkup(React.createElement(SeletorMercado, { atual: "br", titulo: "País", vitrine: true }));
  for (const m of ["br", "pt", "es", "la"]) assert.ok(vitrine.includes(`href="${M.VENDAS_DO_MERCADO[m]}"`), m);
  for (const h of ["/vendas", "/pt-pt/vendas", "/es-es/vendas", "/es/vendas"]) assert.ok(vitrine.includes(`href="${h}"`), h);
  assert.equal(/\?mercado=|\/vendas\//.test(vitrine), false);
});

/** components/EmBreve.tsx com a chave de lançamento do build. */
function emBreve(lancadoNoBuild) {
  return carregarTs(arq("components", "EmBreve.tsx"), {
    "@/components/Brand": { LockupHorizontal: () => null },
    "@/components/ListaEsperaForm": { ListaEsperaForm: (p) => React.createElement("form", { "data-mercado": p.mercado, "data-vitrine": String(Boolean(p.vitrine)) }) },
    "@/components/SeletorMercado": carregarTs(arq("components", "SeletorMercado.tsx"), { "@/lib/mercado": M, "react/jsx-runtime": jsx }, { jsx: true }),
    "@/lib/mercado": M, "@/config": C, "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild }, "react/jsx-runtime": jsx,
  }, { jsx: true }).EmBreve;
}

test("standby: o rodapé das homes da lista de espera é o da produção (sem assinatura e sem seletor de país)", () => {
  const EmBreve = emBreve(false);
  for (const [lang, mercado] of [["pt", "br"], ["pt", "pt"], ["es", "la"], ["es", "es"]]) {
    const h = renderToStaticMarkup(React.createElement(EmBreve, { lang, mercado }));
    assert.equal(/Diariamente App by Science Play/.test(h), false, mercado);
    assert.equal(/\?mercado=|Portugal|España|América Latina/.test(h), false, mercado);
    assert.match(h, lang === "pt" ? /Uma prática diária de hábitos e bem-estar\./ : /Una práctica diaria de hábitos y bienestar\./);
    assert.match(h, /data-vitrine="false"/);
  }
  // com `vitrine`, o rodapé que vai ao ar (as páginas da vitrine não usam
  // mais o EmBreve: lá todo mercado aparece com a venda aberta)
  const vitrine = renderToStaticMarkup(React.createElement(EmBreve, { lang: "es", mercado: "es", vitrine: true }));
  assert.match(vitrine, /Diariamente App by Science Play/);
  assert.match(vitrine, /data-vitrine="true"/);
  // ligada a chave, as homes es ganham assinatura e seletor (PR #3)
  const lancada = renderToStaticMarkup(React.createElement(emBreve(true), { lang: "es", mercado: "la" }));
  assert.match(lancada, /Diariamente App by Science Play/);
  assert.match(lancada, /href="\/\?mercado=es"/);
});

test("lista de espera (EmBreve): com `vitrine`, logo e seletor ficam na vitrine; na home pública, como hoje", () => {
  const EmBreve = emBreve(false);
  const publica = renderToStaticMarkup(React.createElement(EmBreve, { lang: "es", mercado: "la" }));
  assert.match(publica, /<a href="\/es" aria-label="Diariamente">/);
  assert.match(publica, /Todavía no es hoy/);
  const vitrine = renderToStaticMarkup(React.createElement(EmBreve, { lang: "es", mercado: "es", vitrine: true }));
  assert.match(vitrine, /<a href="\/es-es\/vendas" aria-label="Diariamente">/);
  assert.match(vitrine, /href="\/es\/vendas"/);
  assert.match(vitrine, /href="\/vendas"/);
  assert.equal(/\?mercado=/.test(vitrine), false);
  assert.match(vitrine, /data-mercado="es"/);
  // "/" em standby: a lista de espera do Brasil, com o título de hoje
  const br = renderToStaticMarkup(React.createElement(EmBreve, { lang: "pt", mercado: "br" }));
  assert.match(br, /Ainda não é hoje\./);
  assert.match(br, /<a href="\/" aria-label="Diariamente">/);
});

test("site de vendas (Home): PT | ES e o seletor seguem a vitrine", () => {
  const fonte = fs.readFileSync(arq("components", "Home.tsx"), "utf8");
  assert.match(fonte, /const enderecoDo = \(m: Mercado\) => \(vitrine \? VENDAS_DO_MERCADO\[m\] : `\/\?mercado=\$\{m\}`\);/);
  assert.match(fonte, /<a href=\{enderecoDo\(parPt\)\}/);
  assert.match(fonte, /<a href=\{enderecoDo\(parEs\)\}/);
  assert.match(fonte, /<SeletorMercado atual=\{mkt\} titulo="País" vitrine=\{vitrine\} \/>/);
  // nenhum outro link escrito à mão para ?mercado= dentro do site de vendas
  assert.equal((fonte.match(/href=\{`\/\?mercado=/g) || []).length, 0);
  assert.equal((fonte.match(/`\/\?mercado=\$\{/g) || []).length, 1);
});

test("aviso de cookies em espanhol também em /es/vendas e /es-es/vendas (o idioma vem primeiro no endereço)", () => {
  const fonte = fs.readFileSync(arq("components", "Consentimento.tsx"), "utf8");
  const corpo = fonte.match(/function idiomaDaRota\(pathname: string \| null\): Lang \{([\s\S]*?)\n\}/)[1];
  // eslint-disable-next-line no-new-func
  const idiomaDaRota = new Function("pathname", corpo.replace(/const es = \(base: string\)/, "const es = (base)"));
  for (const p of ["/es", "/es/vendas", "/es-es", "/es-es/vendas", "/es/estudiantes"]) assert.equal(idiomaDaRota(p), "es", p);
  for (const p of ["/", "/vendas", "/pt-pt/vendas", "/mundo/vendas", "/estudante", "/vendas/es"]) assert.equal(idiomaDaRota(p), "pt", p);
});

test("standby: a lista de espera de /pt-pt fica em português do Brasil, como na produção; pt-PT só com `vitrine` e com a chave ligada", () => {
  const form = (lancadoNoBuild) => carregarTs(arq("components", "ListaEsperaForm.tsx"), {
    react: React, "react/jsx-runtime": jsx, "@/components/Brand": { Simbolo: () => null },
    "@/lib/consentimento": carregarTs(arq("lib", "consentimento.ts")),
    "@/lib/rotas": R, "@/config/pricing": P, "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild },
  }, { jsx: true }).ListaEsperaForm;
  const ver = (F, props) => renderToStaticMarkup(React.createElement(F, { mercado: "pt", origem: "em-breve", ...props }));
  const publica = ver(form(false), {});
  assert.match(publica, /Me avise quando abrir/);
  assert.match(publica, /Você pode sair da lista a qualquer momento\. Veja a/);
  assert.equal(/Avisem-me|Podes sair|Consulta a/.test(publica), false);
  for (const h of [ver(form(false), { vitrine: true }), ver(form(true), {})]) {
    assert.match(h, /Avisem-me quando abrir/);
    assert.match(h, /Podes sair da lista a qualquer momento\. Consulta a/);
  }
  // o bloco de oferta passa a vitrine para a lista de espera embutida
  assert.match(fs.readFileSync(arq("components", "BlocoOferta.tsx"), "utf8"), /<ListaEsperaForm mercado=\{mercado\} origem="oferta" embutido botao=\{o\.espera\.botao\} vitrine=\{vitrine\} \/>/);
  assert.match(fs.readFileSync(arq("components", "EmBreve.tsx"), "utf8"), /<ListaEsperaForm mercado=\{mkt\} origem="em-breve" vitrine=\{vitrine\} \/>/);
});

/* ------------------ vitrine: checkout de verdade, já ------------------ */

/** next.config.js com estas variáveis, como o build gravaria. */
function envDoBuild(vars) {
  const fabrica = require(arq("next.config.js"));
  const aviso = console.warn;
  const antes = { ...process.env };
  console.warn = () => {};
  try {
    for (const k of ["DM_SITE_LANCADO", "DM_WEBHOOK_V2_OK", "DM_VENDA_LIBERADA", "WA_TEMPLATE_ESTUDANTE", "HOTMART_PRODUCT_ID", "STUDENT_DISCOUNT"]) delete process.env[k];
    Object.assign(process.env, vars);
    return fabrica("phase-development-server").env;
  } finally {
    console.warn = aviso;
    for (const k of Object.keys(process.env)) if (!(k in antes)) delete process.env[k];
    Object.assign(process.env, antes);
  }
}

test("next.config.js: a trava DM_VENDA_LIBERADA saiu; o estudante novo só com a chave ligada", () => {
  for (const vars of [{}, { DM_WEBHOOK_V2_OK: "1" }, { DM_SITE_LANCADO: "1" }, { DM_VENDA_LIBERADA: "1" }]) {
    assert.equal("DM_VENDA_LIBERADA" in envDoBuild(vars), false, JSON.stringify(vars));
  }
  // o fluxo novo do estudante só precisa do modelo v2 na Vercel (a oferta
  // da fase é conferida na hora, config.ts)
  const estudantePronto = { WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2" };
  assert.equal(envDoBuild(estudantePronto).DM_ESTUDANTE_ABERTO, "", "standby: a /estudante é a da produção");
  assert.equal(envDoBuild({ ...estudantePronto, DM_SITE_LANCADO: "1" }).DM_ESTUDANTE_ABERTO, "1");
  // nenhum arquivo do site lê mais a variável
  for (const f of [
    ["next.config.js"], ["middleware.ts"], ["components", "BlocoOferta.tsx"], ["components", "Home.tsx"],
    ["components", "PaginaDoMercado.tsx"], ["config", "lancamento.ts"], ["lib", "mercado.ts"],
  ]) {
    assert.equal(/process\.env\.DM_VENDA_LIBERADA|DM_VENDA_LIBERADA:/.test(fs.readFileSync(arq(...f), "utf8")), false, f.join("/"));
  }
});

const LANCAMENTO_VALE = Date.parse("2026-10-20T12:00:00-03:00");
const DEPOIS_DO_LANCAMENTO = Date.parse("2026-11-17T12:00:00-03:00");
/** Sem o espaço que não quebra e sem os marcadores de texto do React. */
const limpo = (h) => h.replace(/ /g, " ").replace(/<!-- -->/g, "");

/** Os componentes de verdade (Home, BlocoOferta, EmBreve, PaginaDoMercado,
    SeletorMercado), com a chave de lançamento do build. Só a lista de
    espera, a arte das lojas, o rodapé do grupo e a medição são de mentira. */
function componentesReais(lancadoNoBuild = false) {
  const I = carregarTs(arq("lib", "i18n.ts"));
  const C2 = carregarTs(arq("config.ts"), { "@/config/pricing": P });
  const Seletor = carregarTs(arq("components", "SeletorMercado.tsx"), { "@/lib/mercado": M, "react/jsx-runtime": jsx }, { jsx: true });
  const Lista = { ListaEsperaForm: (p) => React.createElement("form", { "data-lista": p.mercado }) };
  const medicao = { registrarInicioDeCheckout() {} };
  const Bloco = carregarTs(arq("components", "BlocoOferta.tsx"), {
    "@/config": C2, "@/config/pricing": P, "@/lib/rotas": R, "@/lib/medicao": medicao,
    "@/components/ListaEsperaForm": Lista, "react/jsx-runtime": jsx,
  }, { jsx: true });
  const { Home } = carregarTs(arq("components", "Home.tsx"), {
    react: React, "react/jsx-runtime": jsx, "@/lib/i18n": I, "@/lib/rotas": R, "@/config": C2,
    "@/lib/medicao": medicao, "@/components/CnpjsDoGrupo": { RodapeDoGrupo: () => null },
    "@/components/BlocoOferta": Bloco, "@/components/TelaDaLoja": { TelaDaLoja: () => null, RAIO_DA_TELA: 40 },
    "@/components/SeletorMercado": Seletor, "@/lib/mercado": M, "@/config/pricing": P,
  }, { jsx: true });
  const { EmBreve } = carregarTs(arq("components", "EmBreve.tsx"), {
    "@/components/Brand": { LockupHorizontal: () => null }, "@/components/ListaEsperaForm": Lista,
    "@/components/SeletorMercado": Seletor, "@/lib/mercado": M, "@/config": C2,
    "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild }, "react/jsx-runtime": jsx,
  }, { jsx: true });
  const { PaginaDoMercado } = carregarTs(arq("components", "PaginaDoMercado.tsx"), {
    "@/components/Home": { Home }, "@/components/EmBreve": { EmBreve }, "@/config/pricing": P,
    "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild }, "react/jsx-runtime": jsx,
  }, { jsx: true });
  return {
    BlocoOferta: Bloco.BlocoOferta,
    bloco: (props) => limpo(renderToStaticMarkup(React.createElement(Bloco.BlocoOferta, { momento: LANCAMENTO_VALE, ...props }))),
    home: (mercado, props = {}) =>
      limpo(renderToStaticMarkup(React.createElement(Home, { lang: P.MERCADOS[mercado].idioma, mercado, momento: LANCAMENTO_VALE, ...props }))),
    pagina: (mercado, vitrine = false) => limpo(renderToStaticMarkup(React.createElement(PaginaDoMercado, { mercado, vitrine }))),
  };
}

const OFERTA_DA_VITRINE = { br: "lf63bgdd", la: "uevhmhy2", es: "iuoufnf6", pt: "3n484jbe", rw: "uevhmhy2" };
const checkouts = (h) => (h.match(/href="https:\/\/pay\.hotmart\.com\/[^"]*"/g) || []).map((x) => x.slice(6, -1));

test("vitrine: todo mercado é o site de vendas, com o botão abrindo o checkout de verdade da Hotmart", () => {
  const { home } = componentesReais(false);
  for (const [m, off] of Object.entries(OFERTA_DA_VITRINE)) {
    const h = home(m, { vitrine: true });
    const link = `https://pay.hotmart.com/K105072021O?off=${off}`;
    assert.equal(P.linkCheckout(m, LANCAMENTO_VALE), link, m);
    // o botão do bloco de oferta e o do CTA final, os dois para o checkout do mercado
    assert.deepEqual(checkouts(h), [link, link], m);
    assert.equal((h.match(/target="_blank" rel="noopener noreferrer"/g) || []).length >= 2, true, m);
    // preço na moeda do mercado, o botão de venda, sem lista de espera e sem "Prévia interna"
    assert.ok(h.includes(limpo(P.formatar(m, P.precoFinal(m, LANCAMENTO_VALE)))), m);
    assert.ok(h.includes(`>${P.MERCADOS[m].textos.botao}</a>`), m);
    assert.equal(/data-lista|Prévia interna|aria-disabled|not-allowed/.test(h), false, m);
    assert.equal(h.includes(P.MERCADOS[m].espera.botao), false, m);
  }
  // depois do lançamento, o Brasil abre a oferta oficial
  assert.deepEqual(checkouts(home("br", { vitrine: true, momento: DEPOIS_DO_LANCAMENTO })), Array(2).fill("https://pay.hotmart.com/K105072021O?off=fhrttdh8"));
});

test("vitrine: a foto da manhã no idioma da página, do próprio domínio, com espaço reservado e lazy", () => {
  const { home } = componentesReais(false);
  for (const m of ["br", "la", "es", "pt", "rw"]) {
    const lang = P.MERCADOS[m].idioma;
    const base = `/fotos/manha-${lang}`;
    const h = home(m, { vitrine: true });
    assert.ok(h.includes(`<picture style="display:block;width:100%;height:100%"><source type="image/webp" srcSet="${base}-600.webp 600w, ${base}-900.webp 900w, ${base}-1200.webp 1200w" sizes="(min-width:900px) 520px, 92vw"/>`), m);
    assert.match(h, new RegExp(`<img src="${base}-900\\.jpg" alt="(Uma mão|Una mano)[^"]+" width="1200" height="1500" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block"/></picture>`), m);
    // o quadro 4:5 da seção continua o mesmo
    assert.match(h, /aspect-ratio:4\/5;background:[^"]+"><picture/, m);
    assert.equal(/cloudinary[^"]*Lifestyle|caderno|cuaderno/i.test(h), false, m);
  }
});

test("vitrine (PaginaDoMercado): la e es também saem como site de vendas, com o link do mercado", () => {
  const { pagina } = componentesReais(false);
  for (const [m, off] of Object.entries(OFERTA_DA_VITRINE)) {
    const h = pagina(m, true);
    const esperado = m === "br" ? P.linkCheckout("br", Date.now()) : `https://pay.hotmart.com/K105072021O?off=${off}`;
    assert.ok(checkouts(h).length >= 2, m);
    for (const link of checkouts(h)) assert.equal(link, esperado, m);
    assert.match(h, new RegExp(`<div id="dm-root" lang="${P.MERCADOS[m].idioma}"`), m);
    assert.equal(/Todavía no es hoy|Ainda não é hoje/.test(h), false, m);
  }
});

test("standby: \"/\" e \"/es\" (e as outras homes públicas) continuam \"Em breve\", sem checkout nenhum", () => {
  const { pagina } = componentesReais(false);
  const br = pagina("br");
  assert.match(br, /Em breve/);
  assert.match(br, /Ainda não é hoje\./);
  const la = pagina("la");
  assert.match(la, /Próximamente/);
  assert.match(la, /Todavía no es hoy\./);
  for (const m of ["br", "la", "es", "pt", "rw"]) {
    const h = pagina(m);
    assert.equal(/pay\.hotmart\.com/.test(h), false, m);
    assert.match(h, /data-lista=/, m);
    assert.equal(/id="dm-root"/.test(h), false, m);
  }
  // as páginas públicas usam a PaginaDoMercado sem `vitrine`
  for (const [arquivo, m] of [[["page.tsx"], "br"], [["es", "page.tsx"], "la"], [["es-es", "page.tsx"], "es"], [["pt-pt", "page.tsx"], "pt"]]) {
    assert.match(fs.readFileSync(arq("app", ...arquivo), "utf8"), new RegExp(`<PaginaDoMercado mercado="${m}" />`), arquivo.join("/"));
  }
});

test("lançado: só o Brasil vende na home pública; /es segue a lista de espera e /pt-pt, a lista no bloco", () => {
  const { pagina } = componentesReais(true);
  assert.ok(checkouts(pagina("br")).length >= 2);
  for (const m of ["la", "es"]) {
    const h = pagina(m);
    assert.equal(/pay\.hotmart\.com/.test(h), false, m);
    assert.match(h, /Próximamente/, m);
  }
  for (const m of ["pt", "rw"]) {
    const h = pagina(m);
    assert.equal(/pay\.hotmart\.com/.test(h), false, m);
    assert.match(h, new RegExp(`data-lista="${m}"`), m);
  }
});

test("prévias do dono (previa) seguem como estavam: bloco de venda, botão sem pagamento e a nota de prévia interna", () => {
  const { bloco } = componentesReais(true);
  const h = bloco({ mercado: "pt", previa: true });
  assert.equal(/pay\.hotmart\.com/.test(h), false);
  assert.match(h, /aria-disabled="true"/);
  assert.match(h, /Prévia interna: a venda deste mercado ainda está fechada/);
  // fora da vitrine e sem prévia, mercado fechado continua lista de espera
  assert.match(bloco({ mercado: "pt" }), /data-lista="pt"/);
});

test("vitrine: PT | ES e o seletor de país levam aos endereços novos, com o idioma na frente", () => {
  const { home } = componentesReais(false);
  const idiomas = (h) => h.match(/role="group" aria-label="Idioma \/ Idioma"[\s\S]*?<\/div>/)[0];
  const casos = { br: ["/vendas", "/es/vendas"], la: ["/vendas", "/es/vendas"], es: ["/pt-pt/vendas", "/es-es/vendas"], pt: ["/pt-pt/vendas", "/es-es/vendas"], rw: ["/mundo/vendas", "/es/vendas"] };
  for (const [m, [pt, es]] of Object.entries(casos)) {
    const h = home(m, { vitrine: true });
    const grupo = idiomas(h);
    assert.match(grupo, new RegExp(`<a href="${pt}"[^>]*>PT</a>`), m);
    assert.match(grupo, new RegExp(`<a href="${es}"[^>]*>ES</a>`), m);
    for (const v of ["/vendas", "/pt-pt/vendas", "/es-es/vendas", "/es/vendas"]) assert.ok(h.includes(`href="${v}"`), `${m} ${v}`);
    assert.equal(/href="\/vendas\/|\?mercado=/.test(h), false, m);
  }
  // fora da vitrine, PT | ES gravam o mercado, como hoje
  assert.match(idiomas(home("br")), /<a href="\/\?mercado=la"[^>]*>ES<\/a>/);
});

test("vitrine: o idioma de cada página (o <html lang> é trocado na hidratação, como em /es)", () => {
  const fonte = fs.readFileSync(arq("components", "Home.tsx"), "utf8");
  assert.match(fonte, /document\.documentElement\.lang = oferta\.locale;/);
  assert.deepEqual(
    Object.fromEntries(Object.keys(VITRINE_NOVA).map((m) => [VITRINE_NOVA[m], P.MERCADOS[m].locale])),
    { "/vendas": "pt-BR", "/es/vendas": "es-419", "/es-es/vendas": "es-ES", "/pt-pt/vendas": "pt-PT", "/mundo/vendas": "pt-BR" },
  );
  // o conteúdo já sai do servidor marcado com o idioma
  const { home } = componentesReais(false);
  assert.match(home("la", { vitrine: true }), /<div id="dm-root" lang="es"/);
  assert.match(home("pt", { vitrine: true }), /<div id="dm-root" lang="pt"/);
});

/* ------------------------- preço oficial riscado ------------------------- */

test("card do Brasil no lançamento: \"Preço oficial\" com R$ 149,90 riscado logo acima de R$ 99,98 por ano, 33% a menos e o prazo", () => {
  const { bloco } = componentesReais(false);
  for (const vitrine of [true, false]) {
    const h = bloco({ mercado: "br", vitrine });
    // a âncora é o primeiro elemento do miolo; só o valor é riscado
    assert.match(h, /<div style="padding:clamp\(20px,3vw,28px\)"><p style="margin:0;font-size:14.5px;line-height:1.4;color:#8A9494">Preço oficial: <s style="text-decoration-thickness:1.5px;text-decoration-color:#AAB2B2">R\$ 149,90 por ano<\/s><\/p>/);
    // logo abaixo, a manchete ANUAL, na mesma unidade
    assert.match(h, /<\/s><\/p><div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;flex-wrap:wrap"><span [^>]*>R\$ 99,98<\/span><span style="font-size:16px;line-height:1;color:#AAB2B2">por ano<\/span><\/div>/);
    assert.match(h, /<strong [^>]*>33% a menos<\/strong>, travado nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\./);
    assert.match(h, /<span>Preço de lançamento, à vista, para quem assinar até <span style="white-space:nowrap">16 de novembro<\/span>\.<\/span>/);
    assert.match(h, />33% OFF<\/span>/);
    // um único riscado: R$ 449,70 não é riscado
    assert.equal((h.match(/<s[ >]/g) || []).length, 1);
    assert.equal(/R\$ 8,33<\/span>|\/mês<\/span>|no lançamento<\/span>|Pagamento à vista/.test(h), false);
  }
  // o percentual vem da conta, igual ao do selo
  assert.equal(P.percentualDoLancamento("br", LANCAMENTO_VALE), 33);
});

test("card do Brasil depois do lançamento (ou com o lançamento desligado): nada riscado, só o preço cheio, por ano", () => {
  const { bloco } = componentesReais(false);
  const depois = bloco({ mercado: "br", vitrine: true, momento: DEPOIS_DO_LANCAMENTO });
  const br = P.MERCADOS.br;
  const ativo = br.lancamento.ativo;
  let desligado;
  try {
    br.lancamento.ativo = false;
    desligado = bloco({ mercado: "br", vitrine: true });
  } finally {
    br.lancamento.ativo = ativo;
  }
  for (const h of [depois, desligado]) {
    assert.equal(/Preço oficial|<s[ >]|a menos|OFF<|Preço de lançamento|<dl|deixa de pagar|ano inteiro/.test(h), false);
    assert.match(h, />Seu Diariamente por um ano<\/span><\/div>/);
    assert.match(h, /<span [^>]*>R\$ 149,90<\/span><span [^>]*>por ano<\/span>/);
    assert.match(h, /Equivale a <strong [^>]*>R\$ 12,49<\/strong> por mês\. Por dia, cerca de <strong [^>]*>R\$ 0,41<\/strong> e três minutos\./);
    assert.match(h, /<span>À vista, ou em até 12x no cartão com acréscimo\.<\/span><\/p><a href="https:\/\/pay\.hotmart\.com\/K105072021O\?off=fhrttdh8"/);
  }
});

test("mercados sem lançamento: nenhum \"Preço oficial\", nada riscado", () => {
  const { bloco, home } = componentesReais(false);
  for (const m of ["la", "es", "pt", "rw"]) {
    assert.equal(P.MERCADOS[m].lancamento, null, m);
    for (const h of [bloco({ mercado: m, vitrine: true }), home(m, { vitrine: true })]) {
      assert.equal(/Preço oficial|Precio oficial|<s[ >]|a menos que/.test(h), false, m);
    }
  }
});

test("barra fixa e CTA final do Brasil: o preço oficial riscado ao lado do de lançamento e a condição dos 3 anos", () => {
  const { home } = componentesReais(false);
  const h = home("br", { vitrine: true });
  // card, CTA final e barra fixa
  assert.equal((h.match(/<s[ >]/g) || []).length, 3);
  // CTA final: R$ 149,90 riscado ao lado de R$ 99,98 por ano à vista nos 3 primeiros anos
  assert.match(h, /<span style="position:absolute;[^"]*">Preço oficial: <\/span><s style="text-decoration-thickness:1.5px">R\$ 149,90<\/s> R\$ 99,98 por ano à vista nos 3 primeiros anos, para quem assinar até 16 de novembro · Garantia de 7 dias<\/span>/);
  // barra fixa: R$ 149,90 riscado antes de R$ 99,98 e "por ano durante 3 anos"
  assert.match(h, /<span style="position:absolute;[^"]*">Preço oficial: <\/span><s style="font-size:13px;color:#8A9494;font-family:var\(--font-sans\);margin-right:6px">R\$ 149,90<\/s>R\$ 99,98<\/div><div style="margin-top:4px;font-size:12px;font-weight:500;color:#8A9494;white-space:nowrap">por ano durante 3 anos<\/div>/);
  // depois do lançamento, nada riscado em lugar nenhum, e as notas de sempre
  const d = home("br", { vitrine: true, momento: DEPOIS_DO_LANCAMENTO });
  assert.equal(/<s[ >]|Preço oficial/.test(d), false);
  assert.match(d, /R\$ 149,90<\/div><div [^>]*>1 ano · 7 dias de garantia<\/div>/);
  assert.match(d, />R\$ 149,90 por um ano · Garantia de 7 dias<\/span>/);
});

/* ------------------------- /sobre em standby ------------------------- */

test("standby: a /sobre mostra as linhas de preço da produção; ligada a chave, o preço de config/pricing.ts", () => {
  const fonte = fs.readFileSync(arq("app", "sobre", "page.tsx"), "utf8");
  const sobre = (lancadoNoBuild) => carregarTs(arq("app", "sobre", "page.tsx"), {
    "@/lib/seo": { metadataDaPagina: () => ({}) }, "@/config": C, "@/config/pricing": P,
    "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild },
    "@/components/Brand": { LockupHorizontal: () => null }, "react/jsx-runtime": jsx,
  }, { jsx: true }).default;
  const ver = (F) => renderToStaticMarkup(React.createElement(F)).replace(/<!-- -->/g, "");
  const standbyH = ver(sobre(false));
  assert.match(standbyH, /assinatura anual\. Diariamente App, R\$ 197 \(R\$ 137,90 na condição de lançamento\)\. São 365 textos por ano/);
  assert.match(standbyH, /<li><b>Preço:<\/b> R\$ 197 · R\$ 137,90 na condição de lançamento, ou 12x de R\$ 14,26 no cartão \(total R\$ 171,12\)<\/li>/);
  assert.equal(/149,90|99,98|16 de novembro/.test(standbyH), false);
  const lancadaH = ver(sobre(true)).replace(/\u00a0/g, " ");
  assert.match(lancadaH, /R\$ 149,90 por ano/);
  assert.equal(/137,90|R\$ 197/.test(lancadaH), false);
  // a linha da produção está escrita uma vez só
  assert.equal((fonte.match(/R\$ 137,90 na condição de lançamento/g) || []).length, 2);
});

/* --------------------------- trava em standby --------------------------- */

test("trava em standby: o que travaria o lançamento vira aviso, e o build passa", () => {
  const { MERCADOS } = carregarPrecos();
  const quebrado = JSON.parse(JSON.stringify(MERCADOS));
  quebrado.br.checkout = "[PREENCHER: link]";
  const r = checarPrecos({ mercados: quebrado, alvoEstudante: alvoDoEstudante(carregarPrecos()), env: { VERCEL: "1", VERCEL_ENV: "production" } });
  assert.equal(r.ok, false);
  const s = emStandby(r);
  assert.equal(s.ok, true);
  assert.equal(s.standby, true);
  assert.match(s.mensagem, /STANDBY/);
  assert.match(s.mensagem, /TRAVARIA por isto/);
  assert.match(s.mensagem, /CHECKOUT_BRL/);
  assert.match(s.mensagem, /DM_WEBHOOK_V2_OK=1/);
  // resultado bom continua bom, com o aviso de standby na frente
  const bom = emStandby({ ok: true, teste: false, problemas: [], avisos: ["x"], mensagem: "x" });
  assert.equal(bom.ok, true);
  assert.match(bom.mensagem, /^Site em STANDBY.* x$/);
});

test("trava do projeto: standby passa em produção sem DM_WEBHOOK_V2_OK; ligada, trava; ligada e confirmada, passa", () => {
  const prod = { VERCEL: "1", VERCEL_ENV: "production" };
  assert.equal(checarPrecosDoProjeto(prod).ok, true);
  assert.equal(checarPrecosDoProjeto({ ...prod, DM_SITE_LANCADO: "1" }).ok, false);
  assert.equal(checarPrecosDoProjeto({ ...prod, DM_SITE_LANCADO: "1", DM_WEBHOOK_V2_OK: "1" }).ok, true);
  // valor que não é "1" não liga a chave: continua standby
  assert.equal(checarPrecosDoProjeto({ ...prod, DM_SITE_LANCADO: "true" }).ok, true);
});

test("next.config.js em build de produção da Vercel: standby não para; ligada sem webhook, para", () => {
  const fabrica = require(arq("next.config.js"));
  const { PHASE_PRODUCTION_BUILD } = require("next/constants");
  const aviso = console.warn;
  const erro = console.error;
  const antes = { ...process.env };
  const log = [];
  console.warn = (m) => log.push(m);
  console.error = (m) => log.push(m);
  try {
    for (const k of ["DM_SITE_LANCADO", "DM_WEBHOOK_V2_OK", "DM_ENDERECO_TESTE"]) delete process.env[k];
    Object.assign(process.env, { VERCEL: "1", VERCEL_ENV: "production" });
    const cfg = fabrica(PHASE_PRODUCTION_BUILD);
    assert.equal(cfg.env.DM_SITE_LANCADO, "");
    assert.ok(log.some((m) => /STANDBY/.test(m)), "o log diz que o site está em standby");
    process.env.DM_SITE_LANCADO = "1";
    assert.throws(() => fabrica(PHASE_PRODUCTION_BUILD), /DM_WEBHOOK_V2_OK/);
    process.env.DM_WEBHOOK_V2_OK = "1";
    assert.equal(fabrica(PHASE_PRODUCTION_BUILD).env.DM_SITE_LANCADO, "1");
  } finally {
    console.warn = aviso;
    console.error = erro;
    for (const k of Object.keys(process.env)) if (!(k in antes)) delete process.env[k];
    Object.assign(process.env, antes);
  }
});

test("doc do lançamento existe e explica a chave, a vitrine, o checkout ligado nela, o preço oficial e a trava", () => {
  const doc = fs.readFileSync(arq("docs", "LANCAMENTO.md"), "utf8");
  for (const termo of [
    "DM_SITE_LANCADO", "DM_WEBHOOK_V2_OK", "noindex", "/vendas", "/es/vendas", "/es-es/vendas", "/pt-pt/vendas", "/mundo/vendas",
    // os endereços antigos e para onde vão
    "/vendas/es", "/vendas/pt-pt", "/vendas/es-es", "/vendas/mundo",
    // a decisão do checkout, com a frase do dono, a data e o contexto do webhook
    "Já pode colocar o link do checkout. Quero testar a jornada inteira.", "27/10/2026", "21/10/2026",
    "HOTMART_WEBHOOK_V2=1", "DM_VENDA_LIBERADA", "Preço oficial", "Eu quero acessar todas as paginas de vendas que temos.",
  ]) {
    assert.ok(doc.includes(termo), termo);
  }
  assert.equal(/[\u2013\u2014]/.test(doc), false, "sem travessão");
  assert.equal(/\bcompra(r|s)?\b/i.test(doc), false, "sem a palavra vetada no texto do site");
  // a /estudante em standby: o fluxo da produção, com a arte Hoje das lojas no hero
  const linha = doc.split("\n").find((l) => l.startsWith("| `/estudante` |"));
  assert.match(linha, /R\$ 77,00 sobre R\$ 137,90/);
  assert.match(linha, /a imagem do hero já é a arte Hoje das lojas, a pedido do dono/);
  assert.equal(/mockup do Cloudinary/.test(linha), false);
  assert.match(doc, /\*\*\/estudante, imagem do hero\*\*: a arte Hoje da App Store/);
});

/* ----------------- páginas legais e medição em standby ----------------- */

const LEGAIS = [
  ["termos", "page.tsx", "Termos", "TermosDaProducao"],
  ["privacidade", "page.tsx", "Privacidade", "PrivacidadeDaProducao"],
  ["es/privacidad", "page.tsx", "Privacidad", "PrivacidadDaProducao"],
  ["es/condicionesdeuso", "page.tsx", "CondicionesDeUso", "CondicionesDeUsoDaProducao"],
];

test("standby: as quatro páginas legais mostram o texto da produção; ligada a chave, o texto do PR #3", () => {
  for (const [dir, arquivo, modulo, comp] of LEGAIS) {
    const fonte = fs.readFileSync(arq("app", ...dir.split("/"), arquivo), "utf8");
    assert.match(fonte, new RegExp(`if \\(!SITE_LANCADO\\) return <${comp} />;`), dir);
    const pagina = (lancadoNoBuild) => carregarTs(arq("app", ...dir.split("/"), arquivo), {
      "@/lib/seo": { metadataDaPagina: () => ({}) }, "@/config": C, "@/lib/rotas": R,
      "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild },
      [`@/components/legais-da-producao/${modulo}`]: { [comp]: () => React.createElement("main", null, "TEXTO-DA-PRODUCAO") },
      "@/components/LegalShell": { LegalShell: ({ children }) => React.createElement("main", null, "TEXTO-NOVO", children) },
      "@/components/Titularidade": { Titularidade: () => null },
      "@/components/RevisarCookies": { RevisarCookies: () => null },
      "react/jsx-runtime": jsx,
    }, { jsx: true }).default;
    const ver = (F) => renderToStaticMarkup(React.createElement(F));
    assert.equal(ver(pagina(false)), "<main>TEXTO-DA-PRODUCAO</main>", dir);
    assert.match(ver(pagina(true)), /^<main>TEXTO-NOVO/, dir);
    // a cópia da produção não tem a seção nova do PR #3
    const producao = fs.readFileSync(arq("components", "legais-da-producao", `${modulo}.tsx`), "utf8");
    assert.equal(/Titularidade|RevisarCookies|metadataDaPagina|export default/.test(producao), false, modulo);
    assert.match(producao, /<IdentificacaoDoGrupo lang="(pt|es)" \/>/, modulo);
  }
});

test("standby: fora da vitrine, GA4 e Pixel montam direto e sem aviso, como na produção; na vitrine e com a chave ligada, só com o aceite", async () => {
  const O = await import(arq("lib", "obrigado.mjs"));
  const consentimento = (lancadoNoBuild, pathname) => carregarTs(arq("components", "Consentimento.tsx"), {
    react: React, "react/jsx-runtime": jsx,
    "next/navigation": { usePathname: () => pathname },
    "@/components/Tracking": { Tracking: () => React.createElement("i", null, "MEDICAO") },
    "@/lib/rotas": R, "@/lib/mercado": M, "@/lib/obrigado.mjs": O,
    "@/lib/cookies": { lerEscolha: () => null, gravarEscolha: () => {}, apagarCookiesDeMedicao: () => {} },
    "@/config/lancamento": { SITE_LANCADO: lancadoNoBuild },
  }, { jsx: true }).Consentimento;
  const ver = (lancadoNoBuild, pathname) =>
    renderToStaticMarkup(React.createElement(consentimento(lancadoNoBuild, pathname), null, "PAGINA"));
  for (const p of ["/", "/es", "/es-es", "/pt-pt", "/mundo", "/estudante", "/es/estudiantes", "/privacidade"]) {
    assert.equal(ver(false, p), "<i>MEDICAO</i>PAGINA", p);
  }
  for (const p of Object.values(VITRINE_NOVA)) assert.equal(ver(false, p), "PAGINA", p);
  for (const p of ["/", "/estudante", "/privacidade"]) assert.equal(ver(true, p), "PAGINA", p);
  // Pós-pagamento em standby: nada de medição no HTML do servidor. A
  // página lê a escolha de cookies no navegador antes de montar (quem
  // recusou na vitrine não manda nada; testes/obrigado.test.mjs).
  for (const p of [...O.ROTAS_DO_POS_PAGAMENTO, "/obrigado"]) assert.equal(ver(false, p), "PAGINA", p);
});
