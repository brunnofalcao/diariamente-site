// Testes do STANDBY do site de vendas (decisão do dono, 27/10/2026):
// a chave de lançamento (config/lancamento.ts, DM_SITE_LANCADO), o
// roteamento das homes e de /vendas, o noindex, o sitemap, os
// redirecionamentos das prévias antigas e a trava do build em standby.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const jsx = require("react/jsx-runtime");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { carregarTs } = require("../scripts/carregar-ts");
const { checarPrecos, checarPrecosDoProjeto, carregarPrecos, siteLancado, emStandby } = require("../scripts/checar-precos");

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

/* --------------------------- standby: /vendas --------------------------- */

test("os cinco endereços de /vendas, um por mercado", () => {
  assert.deepEqual(M.VENDAS_DO_MERCADO, {
    br: "/vendas", la: "/vendas/es", es: "/vendas/es-es", pt: "/vendas/pt-pt", rw: "/vendas/mundo",
  });
  assert.equal(M.ehVitrine("/vendas"), true);
  assert.equal(M.ehVitrine("/vendas/es-es"), true);
  assert.equal(M.ehVitrine("/vendasx"), false);
  assert.equal(M.ehVitrine("/"), false);
});

test("standby: /vendas/* abre como foi pedido, de qualquer país, sem cookie nem reescrita", () => {
  for (const pathname of Object.values(M.VENDAS_DO_MERCADO)) {
    for (const x of [{ pais: "BR" }, { pais: "PT" }, { pais: "US" }, { cookie: "es", pais: "MX" }, { userAgent: GOOGLEBOT }]) {
      assert.equal(standby({ pathname, ...x }).tipo, "seguir", `${pathname} ${JSON.stringify(x)}`);
    }
  }
});

test("standby: ?mercado= dentro de /vendas fica em /vendas (sem gravar cookie)", () => {
  assert.deepEqual(standby({ pathname: "/vendas", busca: "?mercado=la" }), { tipo: "redirecionar", destino: "/vendas/es", vary: false });
  assert.deepEqual(standby({ pathname: "/vendas/es", busca: "?mercado=pt&utm_source=ig" }), { tipo: "redirecionar", destino: "/vendas/pt-pt?utm_source=ig", vary: false });
  assert.deepEqual(standby({ pathname: "/vendas/pt-pt", busca: "?mercado=es" }), { tipo: "redirecionar", destino: "/vendas/es-es", vary: false });
  assert.deepEqual(standby({ pathname: "/vendas/es-es", busca: "?mercado=br" }), { tipo: "redirecionar", destino: "/vendas", vary: false });
  assert.deepEqual(standby({ pathname: "/vendas", busca: "?mercado=rw" }), { tipo: "redirecionar", destino: "/vendas/mundo", vary: false });
});

test("standby: prévias antigas levam ao /vendas do mercado, com utm, até para robô", () => {
  const casos = { "/embreve": "/vendas", "/es/embreve": "/vendas/es", "/pt-pt/embreve": "/vendas/pt-pt", "/es-es/embreve": "/vendas/es-es" };
  assert.deepEqual(M.PREVIAS_ANTIGAS, casos);
  for (const [de, para] of Object.entries(casos)) {
    assert.deepEqual(standby({ pathname: de, pais: "BR" }), { tipo: "redirecionar", destino: para, vary: false }, de);
    assert.deepEqual(standby({ pathname: de, userAgent: GOOGLEBOT }), { tipo: "redirecionar", destino: para, vary: false }, de);
    assert.equal(standby({ pathname: de, busca: "?utm_source=ig&fbclid=x" }).destino, `${para}?utm_source=ig&fbclid=x`, de);
  }
  // a página de /embreve e /es/embreve repete a regra (caso o middleware não rode)
  assert.match(fs.readFileSync(arq("app", "embreve", "page.tsx"), "utf8"), /SITE_LANCADO \? "\/" : "\/vendas"/);
  assert.match(fs.readFileSync(arq("app", "es", "embreve", "page.tsx"), "utf8"), /SITE_LANCADO \? "\/es" : "\/vendas\/es"/);
});

test("lançado: /vendas e /vendas/* redirecionam para a home real do mercado, até para robô", () => {
  const casos = { "/vendas": "/", "/vendas/es": "/es", "/vendas/es-es": "/es-es", "/vendas/pt-pt": "/pt-pt", "/vendas/mundo": "/" };
  for (const [de, para] of Object.entries(casos)) {
    assert.deepEqual(lancado({ pathname: de, pais: "BR" }), { tipo: "redirecionar", destino: para, vary: false }, de);
    assert.deepEqual(lancado({ pathname: de, userAgent: GOOGLEBOT }), { tipo: "redirecionar", destino: para, vary: false }, de);
  }
  // ?mercado= vai junto e decide no passo seguinte (cookie e home do mercado)
  assert.equal(lancado({ pathname: "/vendas", busca: "?mercado=la&utm_source=ig" }).destino, "/?mercado=la&utm_source=ig");
  assert.deepEqual(lancado({ busca: "?mercado=la&utm_source=ig" }), { tipo: "redirecionar", destino: "/es?utm_source=ig", cookie: "la", vary: true });
  // as prévias antigas voltam ao comportamento do PR #3 (decidido pela página)
  for (const de of ["/embreve", "/es/embreve", "/pt-pt/embreve", "/es-es/embreve"]) {
    assert.deepEqual(lancado({ pathname: de, pais: "BR" }), { tipo: "seguir", vary: false }, de);
  }
});

test("uma página para cada endereço de /vendas, com o mercado certo, noindex e a página do lançamento", () => {
  for (const [mercado, caminho] of Object.entries(M.VENDAS_DO_MERCADO)) {
    const arquivo = arq("app", ...caminho.split("/").filter(Boolean), "page.tsx");
    assert.ok(fs.existsSync(arquivo), arquivo);
    const fonte = fs.readFileSync(arquivo, "utf8");
    assert.match(fonte, new RegExp(`metadataDaVitrine\\("${mercado}"\\)`), arquivo);
    assert.match(fonte, new RegExp(`<PaginaDoMercado mercado="${mercado}" vitrine />`), arquivo);
    assert.match(fonte, /export const revalidate = 3600;/, arquivo);
  }
});

/* ------------------------------ indexação ------------------------------ */

test("/vendas/*: noindex, nofollow, canonical próprio e SEM hreflang", () => {
  const S = seo(false);
  for (const [mercado, caminho] of Object.entries(M.VENDAS_DO_MERCADO)) {
    const m = S.metadataDaVitrine(mercado);
    assert.equal(m.robots.index, false, mercado);
    assert.equal(m.robots.follow, false, mercado);
    assert.equal(m.robots.googleBot.index, false, mercado);
    assert.deepEqual(m.alternates, { canonical: DOMINIO + caminho }, mercado);
    assert.equal("openGraph" in m, false, mercado);
    // o título é o que a home do mercado terá no lançamento
    const doLancamento = S.metadataDoMercado(mercado === "rw" ? "br" : mercado, true);
    assert.equal(m.title, doLancamento.title, mercado);
    assert.equal(m.description, doLancamento.description, mercado);
  }
  assert.equal(S.metadataDaVitrine("br").title, "Diariamente · uma prática diária de hábitos e bem-estar");
});

test("next.config.js: X-Robots-Tag noindex em /vendas e /vendas/*", async () => {
  const fabrica = require(arq("next.config.js"));
  const aviso = console.warn;
  console.warn = () => {};
  let regras;
  try {
    regras = await fabrica("phase-development-server").headers();
  } finally {
    console.warn = aviso;
  }
  for (const source of ["/vendas", "/vendas/:path*"]) {
    const r = regras.find((x) => x.source === source);
    assert.ok(r, source);
    assert.deepEqual(r.headers, [{ key: "X-Robots-Tag", value: "noindex, nofollow" }], source);
  }
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

test("nenhuma página pública aponta para /vendas (canonical, hreflang, Open Graph)", () => {
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
  assert.deepEqual(R.parDeIdiomas("vendas"), { pt: "/vendas", es: "/vendas/es" });
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

test("standby: as homes públicas mostram a lista de espera; /vendas mostra o que vai ao ar", () => {
  const ver = pagina(false);
  for (const m of ["br", "pt", "la", "es", "rw"]) {
    assert.match(ver(m, false), new RegExp(`data-c="EmBreve" data-m="${m}" data-v="false"`), m);
  }
  // /vendas: igual à home do lançamento, com os links dentro de /vendas
  assert.match(ver("br", true), /data-c="Home" data-m="br" data-v="true"/);
  assert.match(ver("pt", true), /data-c="Home" data-m="pt" data-v="true"/);
  assert.match(ver("rw", true), /data-c="Home" data-m="rw" data-v="true"/);
  assert.match(ver("la", true), /data-c="EmBreve" data-m="la" data-v="true"/);
  assert.match(ver("es", true), /data-c="EmBreve" data-m="es" data-v="true"/);
});

test("lançado: a home pública de cada mercado é a mesma que /vendas mostrava (PR #3)", () => {
  const ver = pagina(true);
  const antes = pagina(false);
  for (const m of ["br", "pt", "la", "es", "rw"]) {
    assert.equal(ver(m, false).replace(/data-v="false"/, ""), antes(m, true).replace(/data-v="true"/, ""), m);
  }
  assert.match(ver("br", false), /data-c="Home"/);
  assert.match(ver("la", false), /data-c="EmBreve"/);
});

test("seletor de país: na home pública grava o mercado (?mercado=); em /vendas leva ao /vendas do mercado", () => {
  const { SeletorMercado } = carregarTs(arq("components", "SeletorMercado.tsx"), { "@/lib/mercado": M, "react/jsx-runtime": jsx }, { jsx: true });
  const publico = renderToStaticMarkup(React.createElement(SeletorMercado, { atual: "br", titulo: "País" }));
  for (const m of ["br", "pt", "es", "la"]) assert.ok(publico.includes(`href="/?mercado=${m}"`), m);
  assert.equal(/\/vendas/.test(publico), false);
  const vitrine = renderToStaticMarkup(React.createElement(SeletorMercado, { atual: "br", titulo: "País", vitrine: true }));
  for (const m of ["br", "pt", "es", "la"]) assert.ok(vitrine.includes(`href="${M.VENDAS_DO_MERCADO[m]}"`), m);
  assert.equal(/\?mercado=/.test(vitrine), false);
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
  // /vendas/es e /vendas/es-es mostram o rodapé que vai ao ar
  const vitrine = renderToStaticMarkup(React.createElement(EmBreve, { lang: "es", mercado: "es", vitrine: true }));
  assert.match(vitrine, /Diariamente App by Science Play/);
  assert.match(vitrine, /data-vitrine="true"/);
  // ligada a chave, as homes es ganham assinatura e seletor (PR #3)
  const lancada = renderToStaticMarkup(React.createElement(emBreve(true), { lang: "es", mercado: "la" }));
  assert.match(lancada, /Diariamente App by Science Play/);
  assert.match(lancada, /href="\/\?mercado=es"/);
});

test("lista de espera (EmBreve): logo e seletor ficam em /vendas na vitrine; na home pública, como hoje", () => {
  const EmBreve = emBreve(false);
  const publica = renderToStaticMarkup(React.createElement(EmBreve, { lang: "es", mercado: "la" }));
  assert.match(publica, /<a href="\/es" aria-label="Diariamente">/);
  assert.match(publica, /Todavía no es hoy/);
  const vitrine = renderToStaticMarkup(React.createElement(EmBreve, { lang: "es", mercado: "es", vitrine: true }));
  assert.match(vitrine, /<a href="\/vendas\/es-es" aria-label="Diariamente">/);
  assert.match(vitrine, /href="\/vendas\/es"/);
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

test("aviso de cookies em espanhol também em /vendas/es e /vendas/es-es", () => {
  const fonte = fs.readFileSync(arq("components", "Consentimento.tsx"), "utf8");
  assert.match(fonte, /es\("\/vendas\/es"\) \|\| es\("\/vendas\/es-es"\)/);
});

test("standby: a lista de espera de /pt-pt fica em português do Brasil, como na produção; pt-PT só em /vendas/pt-pt e com a chave ligada", () => {
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

/* -------------------- /vendas: checkout só depois do webhook -------------------- */

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

test("next.config.js: DM_VENDA_LIBERADA só com a chave ligada ou com DM_WEBHOOK_V2_OK=1; o estudante novo só com a chave ligada", () => {
  assert.equal(envDoBuild({}).DM_VENDA_LIBERADA, "");
  assert.equal(envDoBuild({ DM_VENDA_LIBERADA: "1" }).DM_VENDA_LIBERADA, "", "posta à mão não vale");
  assert.equal(envDoBuild({ DM_WEBHOOK_V2_OK: "0" }).DM_VENDA_LIBERADA, "");
  assert.equal(envDoBuild({ DM_WEBHOOK_V2_OK: "1" }).DM_VENDA_LIBERADA, "1");
  assert.equal(envDoBuild({ DM_SITE_LANCADO: "1" }).DM_VENDA_LIBERADA, "1");
  const estudantePronto = { WA_TEMPLATE_ESTUDANTE: "diariamente_estudante_aprovado_v2", HOTMART_PRODUCT_ID: "7448309", STUDENT_DISCOUNT: "0.40027" };
  assert.equal(envDoBuild(estudantePronto).DM_ESTUDANTE_ABERTO, "", "standby: a /estudante é a da produção");
  assert.equal(envDoBuild({ ...estudantePronto, DM_SITE_LANCADO: "1" }).DM_ESTUDANTE_ABERTO, "1");
});

/** BlocoOferta com DM_VENDA_LIBERADA como o build gravaria. */
function blocoOferta(liberada) {
  const C2 = carregarTs(arq("config.ts"), { "@/config/pricing": P });
  const B = carregarTs(arq("components", "BlocoOferta.tsx"), {
    "@/config": C2, "@/config/pricing": P, "@/lib/rotas": R,
    "@/lib/medicao": { registrarInicioDeCheckout() {} },
    "@/components/ListaEsperaForm": { ListaEsperaForm: () => null },
    "react/jsx-runtime": jsx,
  }, { jsx: true }).BlocoOferta;
  return (props) => {
    const antes = process.env.DM_VENDA_LIBERADA;
    if (liberada) process.env.DM_VENDA_LIBERADA = "1";
    else delete process.env.DM_VENDA_LIBERADA;
    try {
      return renderToStaticMarkup(React.createElement(B, { mercado: "br", momento: Date.parse("2026-10-20T12:00:00-03:00"), ...props }));
    } finally {
      if (antes === undefined) delete process.env.DM_VENDA_LIBERADA;
      else process.env.DM_VENDA_LIBERADA = antes;
    }
  };
}

test("standby: em /vendas, sem DM_WEBHOOK_V2_OK=1, o botão do bloco de oferta não abre o checkout (mesmo texto e mesmo visual)", () => {
  const bloqueado = blocoOferta(false)({ vitrine: true });
  assert.equal(/pay\.hotmart\.com/.test(bloqueado), false);
  const rotulo = P.MERCADOS.br.textos.botao;
  assert.ok(bloqueado.includes(`">${rotulo}</a>`), rotulo);
  assert.match(bloqueado, /<a href="#preco" style="[^"]*background:#27BDBE[^"]*cursor:pointer">/);
  assert.equal(/aria-disabled|not-allowed|target="_blank"/.test(bloqueado), false);
  // com o webhook confirmado, o mesmo botão abre o checkout de lançamento
  const liberado = blocoOferta(true)({ vitrine: true });
  assert.match(liberado, /href="https:\/\/pay\.hotmart\.com\/K105072021O\?off=lf63bgdd" target="_blank"/);
  // fora da vitrine (homes públicas com a chave ligada), sempre o checkout
  assert.match(blocoOferta(false)({}), /href="https:\/\/pay\.hotmart\.com\/K105072021O\?off=lf63bgdd"/);
  // o texto e o estilo do botão são os mesmos com e sem o bloqueio
  const botao = (h) => h.match(new RegExp(`<a [^>]*>${rotulo}</a>`))[0].replace(/ href="[^"]*"| target="_blank"| rel="noopener noreferrer"/g, "");
  assert.equal(botao(bloqueado), botao(liberado));
});

test("Home.tsx: o botão final de /vendas segue a mesma regra (sem checkout até DM_WEBHOOK_V2_OK=1)", () => {
  const fonte = fs.readFileSync(arq("components", "Home.tsx"), "utf8");
  assert.match(fonte, /const checkoutBloqueado = vitrine && process\.env\.DM_VENDA_LIBERADA !== "1";/);
  assert.match(fonte, /const semLink = pendente\(linkFinal\) \|\| !oferta\.vendaAberta \|\| checkoutBloqueado;/);
  assert.match(fonte, /<BlocoOferta mercado=\{mkt\} momento=\{agora\} previa=\{previa\} vitrine=\{vitrine\} \/>/);
  // o único link para o checkout no corpo da Home é o do botão final, e só sem semLink
  assert.match(fonte, /\{vende && !semLink \? \(\s*<a href=\{linkFinal\}/);
  assert.equal((fonte.match(/href=\{linkFinal\}/g) || []).length, 1);
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
  const r = checarPrecos({ mercados: quebrado, alvoEstudante: { precoFinal: 89.9, desconto: 0.40027 }, env: { VERCEL: "1", VERCEL_ENV: "production" } });
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

test("doc do lançamento existe e explica a chave, /vendas e a trava", () => {
  const doc = fs.readFileSync(arq("docs", "LANCAMENTO.md"), "utf8");
  for (const termo of ["DM_SITE_LANCADO", "/vendas", "DM_WEBHOOK_V2_OK", "noindex", "/vendas/es", "/vendas/pt-pt", "/vendas/es-es", "/vendas/mundo"]) {
    assert.ok(doc.includes(termo), termo);
  }
  assert.equal(/[\u2013\u2014]/.test(doc), false, "sem travessão");
  assert.equal(/\bcompra(r|s)?\b/i.test(doc), false, "sem a palavra vetada no texto do site");
});
