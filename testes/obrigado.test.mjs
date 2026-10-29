// Pós-pagamento: páginas de obrigado (aprovado, aguardando pagamento, em
// análise) e o /baixar, nos quatro locais (pt, pt-pt, es e en; pedido do
// dono, 29/10/2026: uma página de obrigado por mercado; só pt e es têm
// /baixar). Confere a decisão de idioma das URLs automáticas, o mercado do
// pedido (Purchase, Pix e boleto), o Purchase de verdade, o consentimento
// em standby e o idioma do aviso de cookies, a detecção de aparelho, os
// links das lojas, a copy (chaves e regras da marca), o log só com nomes
// de parâmetros, as rotas e o noindex.
// Roda com: npm test   (node --test, sem dependência nova)
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as O from "../lib/obrigado.mjs";
import { TEXTOS } from "../lib/obrigado-textos.mjs";

const {
  LOCAIS,
  LOCAIS_DO_BAIXAR,
  ESTADOS,
  CAMINHOS,
  ROTAS_DO_POS_PAGAMENTO,
  BOTAO_DO_APP,
  MERCADOS_DA_OFERTA,
  aparelhoDoUserAgent,
  caminhoDoBaixar,
  caminhoDoObrigado,
  dadosDoPurchase,
  decidirObrigado,
  destinoDoBaixar,
  destinoDoObrigado,
  ehPosPagamento,
  formaDoPagamento,
  LANG_HTML,
  localDoPosPagamento,
  linhaDoLog,
  localDoBaixar,
  localDoIdioma,
  localDoNavegador,
  mercadoDoObrigado,
  nomesDosParametros,
  orientacaoDoPagamento,
  primeiro,
} = O;

const require = createRequire(import.meta.url);
const { carregarTs } = require("../scripts/carregar-ts.js");
const raiz = fileURLToPath(new URL("..", import.meta.url));
const arq = (...p) => join(raiz, ...p);
const ler = (rel) => readFileSync(arq(rel), "utf8");
const React = require("react");
const jsxRuntime = require("react/jsx-runtime");
const { renderToStaticMarkup } = require("react-dom/server");

const P = carregarTs(arq("config", "pricing.ts"));
const I = carregarTs(arq("lib", "i18n.ts"));
const M = carregarTs(arq("lib", "mercado.ts"));
const PP = carregarTs(arq("lib", "pos-pagamento.ts"), { "@/config/pricing": P });

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36";
const INSTAGRAM_IOS = IPHONE + " Instagram 300.0.0.0 (iPhone; iOS 17_0; pt_BR)";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

/** O mercado do país como o middleware entrega (lib/mercado.ts, a mesma lista das homes). */
const doPais = (pais) => (pais ? M.mercadoDoPais(pais) : null);

/* ================================ rotas ================================ */

test("as 14 rotas: pt sem prefixo, pt-pt, es e en com o caminho no idioma da página; só pt e es têm /baixar", () => {
  assert.deepEqual(LOCAIS, ["pt", "pt-pt", "es", "en"]);
  assert.deepEqual(LOCAIS_DO_BAIXAR, ["pt", "es"]);
  assert.deepEqual(CAMINHOS, {
    pt: {
      aprovado: "/obrigado-aprovado",
      "aguardando-pagamento": "/obrigado-aguardando-pagamento",
      "aguardando-analise": "/obrigado-aguardando-analise",
      baixar: "/baixar",
    },
    "pt-pt": {
      aprovado: "/pt-pt/obrigado-aprovado",
      "aguardando-pagamento": "/pt-pt/obrigado-aguardando-pagamento",
      "aguardando-analise": "/pt-pt/obrigado-aguardando-analise",
    },
    es: {
      aprovado: "/es/gracias-aprobado",
      "aguardando-pagamento": "/es/gracias-pago-pendiente",
      "aguardando-analise": "/es/gracias-en-analisis",
      baixar: "/es/descargar",
    },
    en: {
      aprovado: "/en/thank-you-approved",
      "aguardando-pagamento": "/en/thank-you-pending-payment",
      "aguardando-analise": "/en/thank-you-under-review",
    },
  });
  assert.deepEqual(LANG_HTML, { pt: "pt-BR", "pt-pt": "pt-PT", es: "es", en: "en" });
  assert.equal(ROTAS_DO_POS_PAGAMENTO.length, 14);
  for (const r of ROTAS_DO_POS_PAGAMENTO) assert.equal(ehPosPagamento(r), true, r);
  assert.equal(ehPosPagamento("/obrigado"), true);
  for (const r of ["/", "/vendas", "/es/vendas", "/es", "/pt-pt", "/en", "/es/obrigado-aprovado", "/baixar/x", "/es-es/baixar", "/pt-pt/baixar", "/en/baixar", "/es-es/gracias-aprobado"]) {
    assert.equal(ehPosPagamento(r), false, r);
  }
  // o local de cada rota vem do caminho
  for (const local of LOCAIS) for (const r of Object.values(CAMINHOS[local])) assert.equal(localDoPosPagamento(r), local, r);
  for (const r of ["/", "/obrigado", "/pt-pt", "/en", "/es"]) assert.equal(localDoPosPagamento(r), null, r);
  // nenhuma URL em espanhol com palavra em português; nenhuma em inglês com palavra em português ou espanhol
  for (const r of Object.values(CAMINHOS.es)) assert.doesNotMatch(r, /obrigado|aguardando|analise|baixar/, r);
  for (const r of Object.values(CAMINHOS.en)) assert.doesNotMatch(r, /obrigado|aguardando|analise|baixar|gracias|pago|pendiente/, r);
});

/* =========================== decisão de idioma =========================== */

test("?lang= vira local: espanhol é es; pt-PT é pt-pt; o resto do português é pt; inglês é en", () => {
  for (const t of ["es", "es-ES", "es_es", "es-419", "es-MX", "ES-ar"]) assert.equal(localDoIdioma(t), "es", t);
  for (const t of ["pt-PT", "pt_pt", "PT-pt"]) assert.equal(localDoIdioma(t), "pt-pt", t);
  for (const t of ["pt", "pt-BR", "pt_br", "pt-AO"]) assert.equal(localDoIdioma(t), "pt", t);
  for (const t of ["en", "en-US", "en_GB", "EN"]) assert.equal(localDoIdioma(t), "en", t);
  for (const t of ["fr", "est", "ptx", "eng", "", null]) assert.equal(localDoIdioma(t), null, String(t));
});

test("Accept-Language: peso (q) e ordem; pt-PT e pt com IP de Portugal são pt-pt; inglês e outros idiomas são pulados", () => {
  assert.equal(localDoNavegador("es-MX,es;q=0.9,en;q=0.8"), "es");
  assert.equal(localDoNavegador("es-ES,es;q=0.9"), "es");
  assert.equal(localDoNavegador("pt-PT,pt;q=0.9"), "pt-pt");
  assert.equal(localDoNavegador("pt-PT,pt;q=0.9", "br"), "pt-pt");
  assert.equal(localDoNavegador("pt-BR,pt;q=0.9,es;q=0.8"), "pt");
  assert.equal(localDoNavegador("pt-BR", "pt"), "pt");
  // pt simples: o país do IP decide entre pt-pt e pt
  assert.equal(localDoNavegador("pt", "pt"), "pt-pt");
  assert.equal(localDoNavegador("pt,en;q=0.5", "pt"), "pt-pt");
  assert.equal(localDoNavegador("pt", "br"), "pt");
  assert.equal(localDoNavegador("pt", "rw"), "pt");
  assert.equal(localDoNavegador("pt"), "pt");
  // inglês é pulado, mesmo antes de um pt ou es
  assert.equal(localDoNavegador("en-US,en;q=0.9,es;q=0.8,pt;q=0.7"), "es");
  assert.equal(localDoNavegador("en-US,en;q=0.9,pt;q=0.7", "pt"), "pt-pt");
  assert.equal(localDoNavegador("pt;q=0.5, es-ES;q=0.9"), "es");
  assert.equal(localDoNavegador("es;q=0, pt-BR"), "pt");
  assert.equal(localDoNavegador("en-US"), null);
  assert.equal(localDoNavegador("en-US,fr;q=0.8", "rw"), null);
  assert.equal(localDoNavegador(""), null);
});

test("(a) oferta de um mercado só na URL vence tudo: Brasil em pt, Portugal em pt-pt, Espanha em es", () => {
  const tudoContra = { cookie: "la", lang: "en", idiomas: "es-MX", mercadoDoIp: "rw" };
  for (const off of ["fhrttdh8", "lf63bgdd"]) {
    assert.deepEqual(decidirObrigado({ off, ...tudoContra }), { local: "pt", fonte: "oferta" }, off);
  }
  assert.deepEqual(decidirObrigado({ off: "3n484jbe", ...tudoContra }), { local: "pt-pt", fonte: "oferta" });
  assert.deepEqual(decidirObrigado({ off: "3n484jbe", cookie: "br", idiomas: "pt-BR", mercadoDoIp: "br" }), { local: "pt-pt", fonte: "oferta" });
  assert.deepEqual(decidirObrigado({ off: "iuoufnf6", cookie: "br", lang: "pt", idiomas: "pt-BR", mercadoDoIp: "br" }), { local: "es", fonte: "oferta" });
  // maiúsculas e espaços não atrapalham; oferta desconhecida é ignorada
  assert.equal(decidirObrigado({ off: " IUOUFNF6 " }).local, "es");
  assert.equal(decidirObrigado({ off: "3N484JBE" }).local, "pt-pt");
  assert.deepEqual(decidirObrigado({ off: "zzz", idiomas: "es-MX" }), { local: "es", fonte: "navegador" });
  // a oferta em dólar (América Latina E resto do mundo) não decide sozinha
  assert.notEqual(decidirObrigado({ off: "uevhmhy2" }).fonte, "oferta");
});

test("(b) cookie dm_mercado: br em pt, pt em pt-pt, la e es em espanhol; rw não decide", () => {
  const casos = { br: "pt", pt: "pt-pt", la: "es", es: "es" };
  for (const [cookie, local] of Object.entries(casos)) {
    const contra = local === "es" ? { lang: "en", idiomas: "pt-BR", mercadoDoIp: "br" } : { lang: "es", idiomas: "es-MX", mercadoDoIp: "la" };
    assert.deepEqual(decidirObrigado({ cookie, ...contra }), { local, fonte: "cookie" }, cookie);
  }
  // a oferta em dólar não decide sozinha: o cookie decide
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", cookie: "la", idiomas: "pt-BR" }), { local: "es", fonte: "cookie" });
  // rw (o site do resto do mundo é em português): segue para ?lang=, navegador e país
  assert.deepEqual(decidirObrigado({ cookie: "rw", mercadoDoIp: doPais("DE") }), { local: "en", fonte: "pais" });
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", cookie: "rw", idiomas: "es-MX" }), { local: "es", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", cookie: "rw", idiomas: "pt-BR", mercadoDoIp: doPais("US") }), { local: "pt", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ cookie: "rw", lang: "pt" }), { local: "pt", fonte: "lang" });
  assert.deepEqual(decidirObrigado({ cookie: "rw" }), { local: "pt", fonte: "padrao" });
  // cookie inválido é ignorado
  assert.equal(decidirObrigado({ cookie: "xx", idiomas: "es-MX" }).local, "es");
});

test("(c) ?lang= e (d) Accept-Language, antes do país", () => {
  assert.deepEqual(decidirObrigado({ lang: "es", idiomas: "pt-BR", mercadoDoIp: "br" }), { local: "es", fonte: "lang" });
  assert.deepEqual(decidirObrigado({ lang: ["es", "pt"] }), { local: "es", fonte: "lang" });
  assert.deepEqual(decidirObrigado({ lang: "pt", idiomas: "es-MX", mercadoDoIp: "la" }), { local: "pt", fonte: "lang" });
  for (const lang of ["pt-pt", "pt-PT", "pt_PT"]) assert.deepEqual(decidirObrigado({ lang, idiomas: "pt-BR", mercadoDoIp: "br" }), { local: "pt-pt", fonte: "lang" }, lang);
  assert.deepEqual(decidirObrigado({ lang: "en", idiomas: "pt-BR", mercadoDoIp: "br" }), { local: "en", fonte: "lang" });
  assert.deepEqual(decidirObrigado({ lang: "fr", idiomas: "es-ES", mercadoDoIp: "br" }), { local: "es", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ idiomas: "es-MX,es;q=0.9", mercadoDoIp: "br" }), { local: "es", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ idiomas: "pt-PT", mercadoDoIp: "es" }), { local: "pt-pt", fonte: "navegador" });
  // navegador em pt (sem país) e IP de Portugal: pt-pt; com IP de fora, pt
  assert.deepEqual(decidirObrigado({ idiomas: "pt", mercadoDoIp: doPais("PT") }), { local: "pt-pt", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ idiomas: "pt", mercadoDoIp: doPais("US") }), { local: "pt", fonte: "navegador" });
  // a oferta em dólar com o navegador em espanhol: es; em pt-BR, mesmo com IP dos Estados Unidos: pt
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", idiomas: "es-AR" }), { local: "es", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", idiomas: "es-US,en;q=0.8", mercadoDoIp: doPais("US") }), { local: "es", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", idiomas: "pt-BR,en;q=0.8", mercadoDoIp: doPais("US") }), { local: "pt", fonte: "navegador" });
  // navegador em inglês não decide: o país do IP decide
  assert.deepEqual(decidirObrigado({ idiomas: "en-US", mercadoDoIp: doPais("BR") }), { local: "pt", fonte: "pais" });
});

test("(e) país do IP, com as listas de lib/mercado.ts: Brasil pt, Portugal pt-pt, Espanha e América Latina es, o resto en; (f) pt", () => {
  for (const pais of ["MX", "CO", "AR", "CL", "PE", "ES"]) {
    assert.deepEqual(decidirObrigado({ idiomas: "en-US,en;q=0.9", mercadoDoIp: doPais(pais) }), { local: "es", fonte: "pais" }, pais);
  }
  assert.deepEqual(decidirObrigado({ idiomas: "en-US", mercadoDoIp: doPais("BR") }), { local: "pt", fonte: "pais" });
  assert.deepEqual(decidirObrigado({ idiomas: "en-US", mercadoDoIp: doPais("PT") }), { local: "pt-pt", fonte: "pais" });
  for (const pais of ["US", "FR", "JP", "DE", "GB", "CA"]) {
    assert.deepEqual(decidirObrigado({ idiomas: "en-US", mercadoDoIp: doPais(pais) }), { local: "en", fonte: "pais" }, pais);
  }
  // a oferta em dólar com o navegador em inglês: o país escolhe
  assert.equal(decidirObrigado({ off: "uevhmhy2", idiomas: "en-US", mercadoDoIp: doPais("MX") }).local, "es");
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", idiomas: "en-US", mercadoDoIp: doPais("US") }), { local: "en", fonte: "pais" });
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", mercadoDoIp: doPais("US") }), { local: "en", fonte: "pais" });
  // sem país (ambiente local) e sem nada: pt
  assert.deepEqual(decidirObrigado({ idiomas: "en-US", mercadoDoIp: null }), { local: "pt", fonte: "padrao" });
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", idiomas: "en-US" }), { local: "pt", fonte: "padrao" });
  assert.deepEqual(decidirObrigado({}), { local: "pt", fonte: "padrao" });
  assert.deepEqual(decidirObrigado(), { local: "pt", fonte: "padrao" });
});

test("middleware: as 3 URLs automáticas levam à rota do mesmo status no local decidido, com TODOS os parâmetros", () => {
  const busca = "?transaction=HPTESTE&off=uevhmhy2&utm_source=ig&lang=es";
  for (const estado of ESTADOS) {
    const pathname = `/obrigado-${estado}`;
    const em = (local) => CAMINHOS[local][estado];
    for (const cookie of ["la", "es"]) assert.equal(destinoDoObrigado({ pathname, busca, cookie }), `${em("es")}${busca}`, `${estado} ${cookie}`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE&off=iuoufnf6" }), `${em("es")}?transaction=HPTESTE&off=iuoufnf6`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE", idiomas: "es-MX" }), `${em("es")}?transaction=HPTESTE`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE", mercadoDoIp: doPais("MX") }), `${em("es")}?transaction=HPTESTE`);
    // Portugal: a oferta, o cookie, o navegador pt-PT, o pt com IP de Portugal ou só o IP
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE&off=3n484jbe", cookie: "br" }), `${em("pt-pt")}?transaction=HPTESTE&off=3n484jbe`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE", cookie: "pt" }), `${em("pt-pt")}?transaction=HPTESTE`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE", idiomas: "pt-PT" }), `${em("pt-pt")}?transaction=HPTESTE`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE", idiomas: "pt", mercadoDoIp: doPais("PT") }), `${em("pt-pt")}?transaction=HPTESTE`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE", mercadoDoIp: doPais("PT") }), `${em("pt-pt")}?transaction=HPTESTE`);
    // a oferta em dólar dos Estados Unidos e demais países: en
    const dolar = "?transaction=HPTESTE&off=uevhmhy2&utm_source=ig";
    assert.equal(destinoDoObrigado({ pathname, busca: dolar, idiomas: "en-US", mercadoDoIp: doPais("US") }), `${em("en")}${dolar}`);
    assert.equal(destinoDoObrigado({ pathname, busca: dolar, cookie: "rw", mercadoDoIp: doPais("DE") }), `${em("en")}${dolar}`);
    assert.equal(destinoDoObrigado({ pathname, busca: "?lang=en" }), `${em("en")}?lang=en`);
    // pt-BR (oferta do Brasil, cookie br, navegador pt-BR com IP de fora, ou nada): fica onde está
    for (const cookie of ["br", "pt", "rw", "la", null]) {
      assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE&off=fhrttdh8", cookie }), null, `${estado} ${cookie}`);
    }
    assert.equal(destinoDoObrigado({ pathname, busca: dolar, idiomas: "pt-BR,en;q=0.8", mercadoDoIp: doPais("US") }), null);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE", cookie: "br", mercadoDoIp: doPais("US") }), null);
    assert.equal(destinoDoObrigado({ pathname, busca: "?transaction=HPTESTE" }), null);
  }
  // ?lang=es dos links antigos do app ainda leva ao es
  assert.equal(destinoDoObrigado({ pathname: "/obrigado-aprovado", busca: "?lang=es" }), "/es/gracias-aprobado?lang=es");
  // o /obrigado antigo vai direto para a aprovada do local
  assert.equal(destinoDoObrigado({ pathname: "/obrigado", busca: "?transaction=HP1", cookie: "la" }), "/es/gracias-aprobado?transaction=HP1");
  assert.equal(destinoDoObrigado({ pathname: "/obrigado", busca: "?transaction=HP1", cookie: "pt" }), "/pt-pt/obrigado-aprovado?transaction=HP1");
  assert.equal(destinoDoObrigado({ pathname: "/obrigado", busca: "?transaction=HP1", mercadoDoIp: doPais("US") }), "/en/thank-you-approved?transaction=HP1");
  // parâmetro repetido e caracteres especiais seguem iguais
  assert.equal(
    destinoDoObrigado({ pathname: "/obrigado-aprovado", busca: "?a=1&a=2&email=x%40y.com", idiomas: "es-CO" }),
    "/es/gracias-aprobado?a=1&a=2&email=x%40y.com",
  );
  assert.equal(
    destinoDoObrigado({ pathname: "/obrigado-aguardando-pagamento", busca: "?a=1&a=2&email=x%40y.com&off=uevhmhy2", mercadoDoIp: doPais("US") }),
    "/en/thank-you-pending-payment?a=1&a=2&email=x%40y.com&off=uevhmhy2",
  );
  // sem busca
  assert.equal(destinoDoObrigado({ pathname: "/obrigado-aprovado", idiomas: "es-AR" }), "/es/gracias-aprobado");
  assert.equal(destinoDoObrigado({ pathname: "/obrigado-aguardando-analise", mercadoDoIp: doPais("JP") }), "/en/thank-you-under-review");
});

test("middleware: nas rotas com prefixo (pt-pt, es e en) o caminho manda, e nada fora das URLs automáticas redireciona", () => {
  const contra = [
    { busca: "?lang=pt", cookie: "br", idiomas: "pt-BR", mercadoDoIp: "br" },
    { busca: "?lang=en&off=uevhmhy2", cookie: "rw", idiomas: "en-US", mercadoDoIp: "rw" },
    { busca: "?off=iuoufnf6", cookie: "es", idiomas: "es-ES", mercadoDoIp: "es" },
    { busca: "?off=3n484jbe", cookie: "pt", idiomas: "pt-PT", mercadoDoIp: "pt" },
  ];
  const caminhos = [...Object.values(CAMINHOS["pt-pt"]), ...Object.values(CAMINHOS.es), ...Object.values(CAMINHOS.en), "/termos", "/vendas", "/es/vendas", "/pt-pt", "/en", "/baixar"];
  for (const caminho of caminhos) {
    for (const c of contra) assert.equal(destinoDoObrigado({ pathname: caminho, ...c }), null, `${caminho} ${c.busca}`);
  }
});

test("middleware: a decisão das homes não intercepta as rotas de obrigado com prefixo, nem grava o dm_mercado nelas", () => {
  for (const pathname of [...Object.values(CAMINHOS["pt-pt"]), ...Object.values(CAMINHOS.en), ...Object.values(CAMINHOS.es)]) {
    for (const lancado of [false, true]) {
      for (const pais of ["BR", "PT", "US", "MX", null]) {
        const p = { pathname, busca: "?transaction=HP1&off=uevhmhy2", userAgent: IPHONE, cookie: null, pais, idiomas: "en-US", lancado };
        const d = M.decidirRota(p);
        assert.equal(d.tipo, "seguir", `${pathname} ${pais} ${lancado}`);
        assert.equal(M.mercadoDaVisita(p, d), null, pathname);
      }
    }
  }
});

test("o middleware aplica as regras do pós-pagamento antes da decisão das homes, com o país do IP", () => {
  const fonte = ler("middleware.ts");
  assert.match(fonte, /destinoDoObrigado\(\{/);
  assert.match(fonte, /cookie: req\.cookies\.get\(COOKIE_VISITA\)\?\.value/);
  assert.match(fonte, /mercadoDoIp: pais \? mercadoDoPais\(pais\) : null/);
  assert.match(fonte, /NextResponse\.redirect\(new URL\(obrigado, req\.url\)\)/);
  assert.match(fonte, /destinoDoBaixar\(\{ pathname, busca: req\.nextUrl\.search, userAgent \}, LOJAS_DO_LOCAL\)/);
  assert.match(fonte, /NextResponse\.redirect\(baixar\.destino, 302\)/);
  assert.match(fonte, /if \(!ehRobo\(userAgent\)\)/);
  assert.ok(fonte.indexOf("destinoDoObrigado({") < fonte.indexOf("decidirRota(pedido)"));
});

/* =============================== mercado =============================== */

test("mercado do pedido: a oferta manda; a do dólar é la na página es e rw nas outras", () => {
  assert.equal(mercadoDoObrigado("es", { off: "iuoufnf6" }), "es");
  assert.equal(mercadoDoObrigado("pt", { off: "3n484jbe" }), "pt");
  assert.equal(mercadoDoObrigado("pt-pt", { off: "3n484jbe", cookie: "br" }), "pt");
  assert.equal(mercadoDoObrigado("en", { off: "fhrttdh8" }), "br");
  assert.equal(mercadoDoObrigado("pt", { off: "lf63bgdd", cookie: "rw" }), "br");
  assert.equal(mercadoDoObrigado("pt", { off: "uevhmhy2" }), "rw");
  assert.equal(mercadoDoObrigado("pt-pt", { off: "uevhmhy2" }), "rw");
  assert.equal(mercadoDoObrigado("en", { off: "uevhmhy2", cookie: "la" }), "rw");
  assert.equal(mercadoDoObrigado("es", { off: "uevhmhy2", cookie: "es" }), "la");
});

test("mercado do pedido sem oferta: o cookie, depois o país, se forem mercados do local (pt: br e rw; pt-pt: pt; es: la e es; en: rw); senão o natural", () => {
  assert.deepEqual(O.MERCADOS_DO_LOCAL, { pt: ["br", "rw"], "pt-pt": ["pt"], es: ["la", "es"], en: ["rw"] });
  assert.deepEqual(O.MERCADO_DO_LOCAL, { pt: "br", "pt-pt": "pt", es: "la", en: "rw" });
  // pt: brasileiro no Brasil ou no exterior (dólar)
  assert.equal(mercadoDoObrigado("pt", { cookie: "rw" }), "rw");
  assert.equal(mercadoDoObrigado("pt", { cookie: "br", mercadoDoIp: "rw" }), "br");
  assert.equal(mercadoDoObrigado("pt", { cookie: "pt" }), "br");
  assert.equal(mercadoDoObrigado("pt", { cookie: "la" }), "br");
  assert.equal(mercadoDoObrigado("pt", { cookie: "la", mercadoDoIp: doPais("US") }), "rw");
  assert.equal(mercadoDoObrigado("pt", { mercadoDoIp: doPais("US") }), "rw");
  assert.equal(mercadoDoObrigado("pt", { mercadoDoIp: doPais("PT") }), "br");
  assert.equal(mercadoDoObrigado("pt", { mercadoDoIp: doPais("BR") }), "br");
  assert.equal(mercadoDoObrigado("pt", { mercadoDoIp: doPais("MX") }), "br");
  // pt-pt: só Portugal (euro)
  assert.equal(mercadoDoObrigado("pt-pt", { cookie: "pt" }), "pt");
  assert.equal(mercadoDoObrigado("pt-pt", { cookie: "br", mercadoDoIp: doPais("BR") }), "pt");
  assert.equal(mercadoDoObrigado("pt-pt", { mercadoDoIp: doPais("US") }), "pt");
  assert.equal(mercadoDoObrigado("pt-pt"), "pt");
  // es: América Latina (dólar) ou Espanha (euro)
  assert.equal(mercadoDoObrigado("es", { cookie: "es" }), "es");
  assert.equal(mercadoDoObrigado("es", { cookie: "br" }), "la");
  assert.equal(mercadoDoObrigado("es", { mercadoDoIp: doPais("ES") }), "es");
  assert.equal(mercadoDoObrigado("es", { mercadoDoIp: doPais("MX") }), "la");
  assert.equal(mercadoDoObrigado("es", { mercadoDoIp: doPais("US") }), "la");
  // en: só o resto do mundo (dólar)
  assert.equal(mercadoDoObrigado("en", { cookie: "br", mercadoDoIp: doPais("BR") }), "rw");
  assert.equal(mercadoDoObrigado("en", { cookie: "es" }), "rw");
  assert.equal(mercadoDoObrigado("en", { mercadoDoIp: doPais("US") }), "rw");
  assert.equal(mercadoDoObrigado("en"), "rw");
  assert.equal(mercadoDoObrigado("pt"), "br");
  assert.equal(mercadoDoObrigado("es", {}), "la");
});

test("as ofertas de lib/obrigado.mjs são as mesmas dos links de config/pricing.ts", () => {
  const off = (link) => new URL(link).searchParams.get("off");
  const doPricing = {};
  for (const m of P.LISTA_MERCADOS) {
    const o = P.MERCADOS[m];
    (doPricing[off(o.checkout)] ??= new Set()).add(m);
    if (o.lancamento) (doPricing[off(o.lancamento.checkout)] ??= new Set()).add(m);
  }
  const esperado = Object.fromEntries(Object.entries(doPricing).map(([k, v]) => [k, [...v].sort()]));
  const atual = Object.fromEntries(Object.entries(MERCADOS_DA_OFERTA).map(([k, v]) => [k, [...v].sort()]));
  assert.deepEqual(atual, esperado);
});

test("valor do pedido: o preço da oferta paga; sem oferta, o preço de agora do mercado", () => {
  const antesDoFim = Date.parse("2026-11-01T12:00:00-03:00");
  const depoisDoFim = Date.parse("2026-12-01T12:00:00-03:00");
  assert.equal(PP.valorDoPedido("br", "lf63bgdd", depoisDoFim), P.MERCADOS.br.lancamento.anual);
  assert.equal(PP.valorDoPedido("br", "fhrttdh8", antesDoFim), P.MERCADOS.br.anual);
  assert.equal(PP.valorDoPedido("br", null, antesDoFim), P.precoFinal("br", antesDoFim));
  assert.equal(PP.valorDoPedido("br", null, depoisDoFim), P.MERCADOS.br.anual);
  for (const m of ["la", "es", "pt", "rw"]) {
    assert.equal(PP.valorDoPedido(m, null), P.precoFinal(m));
    assert.equal(PP.moedaDoMercado(m), P.MERCADOS[m].moeda);
  }
  assert.equal(PP.moedaDoMercado("br"), "BRL");
  assert.equal(PP.moedaDoMercado("es"), "EUR");
  assert.equal(PP.moedaDoMercado("la"), "USD");
});

/* =============================== Purchase =============================== */

test("dadosDoPurchase: transaction vira o id; valor da URL só na mesma moeda do plano", () => {
  const d = (busca, moeda, valor) => dadosDoPurchase(new URLSearchParams(busca), moeda, valor);
  // id da transação: transaction, ou transaction_id; hottok nunca
  assert.equal(d("transaction=HP1&transaction_id=X", "BRL", 1).transacao, "HP1");
  assert.equal(d("transaction_id=HP2", "BRL", 1).transacao, "HP2");
  assert.equal(d("hottok=SEGREDO", "BRL", 1).transacao, undefined);
  // Brasil: o valor da URL vale sem moeda ou com BRL; vírgula vale como ponto
  assert.equal(d("price=99,98", "BRL", 149.9).total, 99.98);
  assert.equal(d("value=149.9&currency=brl", "BRL", 99.98).total, 149.9);
  assert.equal(d("price=29.99&currency=USD", "BRL", 99.98).total, 99.98);
  // fora do Brasil: só com a moeda dita e igual à do plano (em qualquer caixa)
  assert.equal(d("price=500", "USD", 29.99).total, 29.99);
  assert.equal(d("price=500&currency=MXN", "USD", 29.99).total, 29.99);
  assert.equal(d("price=31.5&currency=usd", "USD", 29.99).total, 31.5);
  assert.equal(d("full_price=29.99&currency_code=EUR", "EUR", 1).total, 29.99);
  // zero, negativo ou ilegível: o do plano
  for (const v of ["0", "-5", "abc", "1.234,56", ""]) assert.equal(d(`price=${v}`, "BRL", 99.98).total, 99.98, v);
});

/** Página no servidor com Shell e Purchase de mentira: entrega as props que cada um recebeu. */
async function renderizarPagina(estado, local, busca = {}, { cookie, ua = IPHONE, pais = null } = {}) {
  const Shell = () => null;
  const Tracking = () => null;
  const cabecalhos = new Map([["user-agent", ua], ...(pais ? [["x-vercel-ip-country", pais]] : [])]);
  const { PaginaObrigado } = carregarTs(arq("components", "PaginaObrigado.tsx"), {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "next/headers": {
      headers: async () => ({ get: (n) => cabecalhos.get(n) ?? null }),
      cookies: async () => ({ get: (n) => (n === "dm_mercado" && cookie ? { value: cookie } : undefined) }),
    },
    "@/config": { SITE: { dominio: "https://www.diariamente.app" } },
    "@/components/ObrigadoShell": { ObrigadoShell: Shell },
    "@/components/PurchaseTracking": { PurchaseTracking: Tracking },
    "@/components/PosPagamento": { textosDo: (l) => TEXTOS[l] },
    "@/lib/mercado": M,
    "@/lib/obrigado.mjs": O,
    "@/lib/pos-pagamento": PP,
    "@/config/pricing": P,
  }, { jsx: true });
  const linhas = [];
  const log = console.log;
  console.log = (...a) => linhas.push(a.join(" "));
  try {
    const el = await PaginaObrigado({ estado, local, searchParams: Promise.resolve(busca) });
    const filhos = el.type === Shell ? [el] : React.Children.toArray(el.props.children);
    return {
      shell: filhos.find((f) => f.type === Shell),
      tracking: filhos.find((f) => f.type === Tracking),
      linhas,
    };
  } finally {
    console.log = log;
  }
}

/**
 * O PurchaseTracking de verdade, com o efeito rodando na hora: devolve as
 * chamadas que iriam para o Pixel (fbq), o GA4 (gtag) e o dataLayer.
 */
function rodarPurchase(props, { busca = "", consentimento = "aceito" } = {}) {
  const chamadas = { fbq: [], gtag: [], dataLayer: [] };
  const { PurchaseTracking } = carregarTs(arq("components", "PurchaseTracking.tsx"), {
    react: { useEffect: (fn) => fn(), useRef: (v) => ({ current: v }) },
    "@/config": { PLANO: { id: "anual-br", nome: "Diariamente App" } },
    "@/components/Consentimento": { useConsentimento: () => consentimento },
    "@/lib/medicao": { quandoPronto: (nome, fn) => fn((...a) => chamadas[nome].push(a)) },
    "@/lib/obrigado.mjs": O,
  });
  const antes = globalThis.window;
  globalThis.window = { location: { search: busca }, dataLayer: { push: (x) => chamadas.dataLayer.push(x) } };
  try {
    PurchaseTracking(props);
  } finally {
    globalThis.window = antes;
  }
  return chamadas;
}

test("Purchase só na aprovada, com a moeda e o valor do mercado do pedido", async () => {
  for (const local of LOCAIS) {
    for (const estado of ESTADOS) {
      const r = await renderizarPagina(estado, local, { transaction: "HP1" });
      assert.ok(r.shell, `${local} ${estado}`);
      assert.equal(Boolean(r.tracking), estado === "aprovado", `${local} ${estado}`);
    }
  }
  const casos = [
    // [local, busca, opções, moeda, valor]
    ["es", { off: "uevhmhy2" }, {}, "USD", P.precoFinal("la")],
    ["es", { off: "iuoufnf6" }, {}, "EUR", P.precoFinal("es")],
    ["es", {}, { pais: "ES" }, "EUR", P.precoFinal("es")],
    ["pt", { off: "3n484jbe" }, {}, "EUR", P.precoFinal("pt")],
    ["pt", {}, { cookie: "rw" }, "USD", P.precoFinal("rw")],
    ["pt", {}, { pais: "US" }, "USD", P.precoFinal("rw")],
    ["pt", { off: "fhrttdh8" }, { cookie: "rw" }, "BRL", P.MERCADOS.br.anual],
    ["pt", {}, {}, "BRL", P.precoFinal("br")],
    ["pt-pt", { off: "3n484jbe" }, {}, "EUR", P.precoFinal("pt")],
    ["pt-pt", {}, { pais: "BR", cookie: "br" }, "EUR", P.precoFinal("pt")],
    ["pt-pt", { off: "uevhmhy2" }, {}, "USD", P.precoFinal("rw")],
    ["en", { off: "uevhmhy2" }, { pais: "US" }, "USD", P.precoFinal("rw")],
    ["en", {}, { cookie: "la", pais: "MX" }, "USD", P.precoFinal("rw")],
    ["en", { off: "fhrttdh8" }, {}, "BRL", P.MERCADOS.br.anual],
  ];
  for (const [local, busca, opcoes, moeda, valor] of casos) {
    const r = await renderizarPagina("aprovado", local, busca, opcoes);
    assert.deepEqual(r.tracking.props, { moeda, valor }, JSON.stringify([local, busca, opcoes]));
  }
});

test("oferta de ESTUDANTE no obrigado: o preço da fase paga (não o do mercado), mercado br e página em pt, sem o código escrito em lib/obrigado.mjs", async () => {
  const antes = { ...P.OFERTAS_DO_ESTUDANTE };
  Object.assign(P.OFERTAS_DO_ESTUDANTE, { lancamento: "estlanc1", depois: "estdep01" });
  try {
    const noLancamento = Date.parse("2026-10-28T12:00:00-03:00");
    const depois = Date.parse("2026-11-20T12:00:00-03:00");
    // o valor é o da oferta paga, em qualquer data (R$ 99,98 e R$ 149,90 inflariam o ROAS)
    for (const agora of [noLancamento, depois]) {
      assert.equal(PP.valorDoPedido("br", "estlanc1", agora), 59.9);
      assert.equal(PP.valorDoPedido("br", "ESTDEP01", agora), 79.9);
    }
    // fora do Brasil, o código não vale nada
    assert.equal(PP.valorDoPedido("la", "estlanc1"), P.precoFinal("la"));
    const extras = P.mercadosDasOfertasDoEstudante();
    // a oferta decide: navegador em espanhol, sem cookie, vindo do WhatsApp direto para o checkout
    assert.deepEqual(O.decidirObrigado({ off: "estlanc1", idiomas: "es-MX", ofertasExtras: extras }), { local: "pt", fonte: "oferta" });
    assert.equal(O.destinoDoObrigado({ pathname: "/obrigado-aprovado", busca: "?off=estdep01", idiomas: "es-AR", ofertasExtras: extras }), null);
    assert.equal(O.mercadoDoObrigado("pt", { off: "estdep01", cookie: "rw", ofertasExtras: extras }), "br");
    // sem o mapa, como antes (o navegador decide)
    assert.equal(O.decidirObrigado({ off: "estlanc1", idiomas: "es-MX" }).local, "es");
    // a página de verdade passa o mapa e manda o Purchase com o preço da fase
    const r = await renderizarPagina("aprovado", "pt", { off: "estlanc1" }, { cookie: "la" });
    assert.deepEqual(r.tracking.props, { moeda: "BRL", valor: 59.9 });
    // o código não está escrito nas regras do pós-pagamento nem no middleware
    for (const f of ["lib/obrigado.mjs", "middleware.ts", "components/PaginaObrigado.tsx"]) {
      assert.equal(/estlanc1|estdep01/.test(ler(f)), false, f);
    }
    assert.match(ler("middleware.ts"), /ofertasExtras: mercadosDasOfertasDoEstudante\(\)/);
    assert.match(ler("components/PaginaObrigado.tsx"), /ofertasExtras: mercadosDasOfertasDoEstudante\(\)/);
  } finally {
    Object.assign(P.OFERTAS_DO_ESTUDANTE, antes);
  }
});

test("PurchaseTracking de verdade: moeda e valor por mercado, transaction como eventID, nada sem a medição liberada", async () => {
  // América Latina em dólar: o price em pesos da URL não vale; o eventID é a transação.
  const la = await renderizarPagina("aprovado", "es", { off: "uevhmhy2" });
  const c1 = rodarPurchase(la.tracking.props, { busca: "?transaction=HPTESTE&price=500&currency=MXN" });
  assert.deepEqual(c1.fbq, [["track", "Purchase", { currency: "USD", value: P.precoFinal("la"), content_name: "Diariamente App" }, { eventID: "HPTESTE" }]]);
  assert.equal(c1.gtag.length, 1);
  assert.equal(c1.gtag[0][0], "event");
  assert.equal(c1.gtag[0][1], "purchase");
  assert.equal(c1.gtag[0][2].currency, "USD");
  assert.equal(c1.gtag[0][2].value, P.precoFinal("la"));
  assert.equal(c1.gtag[0][2].transaction_id, "HPTESTE");
  assert.deepEqual(c1.dataLayer, [{ event: "Purchase", plano: "anual-br", moeda: "USD", valor: P.precoFinal("la"), transacao: "HPTESTE" }]);

  // Brasil: o valor da URL em real vale (vírgula como ponto).
  const br = await renderizarPagina("aprovado", "pt", { off: "lf63bgdd" });
  const c2 = rodarPurchase(br.tracking.props, { busca: "?transaction=HP2&price=99,98" });
  assert.deepEqual(c2.fbq[0][2], { currency: "BRL", value: 99.98, content_name: "Diariamente App" });
  assert.deepEqual(c2.fbq[0][3], { eventID: "HP2" });

  // Espanha em euro, sem transação na URL: sem eventID.
  const es = await renderizarPagina("aprovado", "es", { off: "iuoufnf6" });
  const c3 = rodarPurchase(es.tracking.props, { busca: "" });
  assert.deepEqual(c3.fbq[0][2], { currency: "EUR", value: P.precoFinal("es"), content_name: "Diariamente App" });
  assert.equal(c3.fbq[0][3], undefined);

  // Recusou, ainda lendo a escolha, ou pendente: nada sai.
  for (const consentimento of ["recusado", "carregando", "pendente"]) {
    const c = rodarPurchase(br.tracking.props, { busca: "?transaction=HP3", consentimento });
    assert.deepEqual(c, { fbq: [], gtag: [], dataLayer: [] }, consentimento);
  }
});

/* ========================= consentimento em standby ========================= */

/** React de mentira, com useState e useEffect de verdade o bastante para rodar o Consentimento em dois desenhos. */
function reactComGanchos() {
  const estados = [];
  let i = 0;
  let efeitos = [];
  const R = {
    createContext: (v) => ({ Provider: "Provider", _v: v }),
    useContext: (c) => c._v,
    useState: (ini) => {
      const k = i++;
      if (!(k in estados)) estados[k] = typeof ini === "function" ? ini() : ini;
      return [estados[k], (v) => { estados[k] = typeof v === "function" ? v(estados[k]) : v; }];
    },
    useEffect: (fn) => { efeitos.push(fn); },
    useCallback: (fn) => fn,
    useRef: (v) => ({ current: v }),
  };
  const jsx = (type, props) => ({ type, props });
  return {
    R,
    runtime: { jsx, jsxs: jsx, Fragment: "Fragment" },
    desenhar(fn) { i = 0; efeitos = []; return fn(); },
    rodarEfeitos() { for (const f of efeitos) f(); },
  };
}

function consentimentoEmStandby(pathname, escolha) {
  const g = reactComGanchos();
  const Tracking = () => null;
  const { Consentimento } = carregarTs(arq("components", "Consentimento.tsx"), {
    react: g.R,
    "react/jsx-runtime": g.runtime,
    "next/navigation": { usePathname: () => pathname },
    "@/components/Tracking": { Tracking },
    "@/lib/rotas": { caminho: () => "/privacidade" },
    "@/lib/mercado": M,
    "@/lib/obrigado.mjs": O,
    "@/lib/cookies": { lerEscolha: () => escolha, gravarEscolha: () => {}, apagarCookiesDeMedicao: () => {} },
    "@/config/lancamento": { SITE_LANCADO: false },
  }, { jsx: true });
  const ver = (el) => ({
    valor: el.props.value,
    medicao: [].concat(el.props.children).some((c) => c && c.type === Tracking),
  });
  const primeiro = ver(g.desenhar(() => Consentimento({ children: "PAGINA" })));
  g.rodarEfeitos();
  const depois = ver(g.desenhar(() => Consentimento({ children: "PAGINA" })));
  return { primeiro, depois };
}

test("standby: na página de obrigado, quem recusou os cookies não monta GA4 nem Pixel, e o Purchase não sai", () => {
  for (const pathname of [...ROTAS_DO_POS_PAGAMENTO, "/obrigado"]) {
    // primeiro desenho (servidor e hidratação): nada de medição, ainda lendo a escolha
    const recusou = consentimentoEmStandby(pathname, "recusado");
    assert.deepEqual(recusou.primeiro, { valor: "carregando", medicao: false }, pathname);
    assert.deepEqual(recusou.depois, { valor: "recusado", medicao: false }, pathname);
    // aceitou, ou não escolheu: como a produção de hoje
    assert.deepEqual(consentimentoEmStandby(pathname, "aceito").depois, { valor: "aceito", medicao: true }, pathname);
    assert.deepEqual(consentimentoEmStandby(pathname, null).depois, { valor: "aceito", medicao: true }, pathname);
  }
  // fora do pós-pagamento, o standby não mudou (GA4 e Pixel direto, como a produção)
  assert.deepEqual(consentimentoEmStandby("/", null).primeiro, { valor: "aceito", medicao: true });
});

/** O aviso de cookies que aparece (chave ligada, sem escolha) no caminho: os textos e os atributos. */
function avisoDeCookies(pathname) {
  const g = reactComGanchos();
  const { Consentimento } = carregarTs(arq("components", "Consentimento.tsx"), {
    react: g.R,
    "react/jsx-runtime": g.runtime,
    "next/navigation": { usePathname: () => pathname },
    "@/components/Tracking": { Tracking: () => null },
    "@/lib/rotas": { caminho: (chave, lang) => (lang === "es" ? "/es/privacidad" : "/privacidade") },
    "@/lib/mercado": M,
    "@/lib/obrigado.mjs": O,
    "@/lib/cookies": { lerEscolha: () => null, gravarEscolha: () => {}, apagarCookiesDeMedicao: () => {} },
    "@/config/lancamento": { SITE_LANCADO: true },
  }, { jsx: true });
  g.desenhar(() => Consentimento({ children: "PAGINA" }));
  g.rodarEfeitos();
  const arvore = g.desenhar(() => Consentimento({ children: "PAGINA" }));
  const aviso = [].concat(arvore.props.children).find((c) => c && typeof c.type === "function");
  // desenha o próprio aviso e junta os textos e os atributos
  const el = g.desenhar(() => aviso.type(aviso.props));
  const textos = [];
  const attrs = [];
  const andar = (n) => {
    if (n == null || n === false) return;
    if (typeof n === "string" || typeof n === "number") return void textos.push(String(n));
    if (Array.isArray(n)) return n.forEach(andar);
    const { children, dangerouslySetInnerHTML, ...resto } = n.props || {};
    attrs.push(resto);
    andar(children);
  };
  andar(el);
  return { texto: textos.join(" "), attrs };
}

test("aviso de cookies no idioma da página de obrigado: pt-PT sem o \"você\", inglês com a Política em português dita no link", () => {
  const en = avisoDeCookies("/en/thank-you-approved");
  assert.match(en.texto, /Decline/);
  assert.match(en.texto, /Accept/);
  assert.match(en.texto, /Privacy Policy \(in Portuguese\)/);
  assert.match(en.texto, /Learn more \(in Portuguese\)/);
  assert.doesNotMatch(en.texto, /Recusar|Aceitar|você|Saiba/);
  assert.ok(en.attrs.some((a) => a.lang === "en"));
  assert.ok(en.attrs.some((a) => a.href === "/privacidade" && a.hrefLang === "pt-BR"));
  for (const r of Object.values(CAMINHOS.en)) assert.match(avisoDeCookies(r).texto, /Decline/, r);

  const ptpt = avisoDeCookies("/pt-pt/obrigado-aguardando-pagamento");
  assert.match(ptpt.texto, /só se aceitar/);
  assert.doesNotMatch(ptpt.texto, /você/);
  assert.ok(ptpt.attrs.some((a) => a.lang === "pt-PT"));
  assert.ok(ptpt.attrs.some((a) => a.href === "/privacidade"));

  // o resto do site não mudou: pt-BR na "/" e na home de Portugal, espanhol em /es
  assert.match(avisoDeCookies("/obrigado-aprovado").texto, /se você aceitar/);
  assert.match(avisoDeCookies("/pt-pt").texto, /se você aceitar/);
  const es = avisoDeCookies("/es/gracias-aprobado");
  assert.match(es.texto, /Rechazar/);
  assert.ok(es.attrs.some((a) => a.href === "/es/privacidad"));
});

/* =========================== cookie dm_mercado =========================== */

const NAVEGADOR = IPHONE;
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const pedido = (x) => ({ pathname: "/", busca: "", userAgent: NAVEGADOR, cookie: null, pais: null, idiomas: null, lancado: false, ...x });
const visita = (x) => {
  const p = pedido(x);
  return M.mercadoDaVisita(p, M.decidirRota(p));
};

test("dm_mercado: grava o mercado de cada página de venda e de cada home, nos dois estados", () => {
  const vendas = { "/vendas": "br", "/es/vendas": "la", "/es-es/vendas": "es", "/pt-pt/vendas": "pt", "/mundo/vendas": "rw" };
  for (const [pathname, m] of Object.entries(vendas)) {
    assert.equal(visita({ pathname, pais: "US" }), m, pathname);
  }
  assert.equal(visita({ pathname: "/es", pais: "MX" }), "la");
  assert.equal(visita({ pathname: "/es-es", pais: "ES" }), "es");
  assert.equal(visita({ pathname: "/pt-pt", pais: "PT" }), "pt");
  assert.equal(visita({ pathname: "/", pais: "BR" }), "br");
  assert.equal(visita({ pathname: "/" }), "br");
  // a "/" do resto do mundo: reescrita (lançado) ou, em standby, pelo país
  assert.equal(visita({ pathname: "/", pais: "US", lancado: true }), "rw");
  assert.equal(visita({ pathname: "/", pais: "US" }), "rw");
  assert.equal(visita({ pathname: "/", cookie: "rw", pais: "BR" }), "rw");
});

test("dm_mercado: redirecionamento, robô e páginas que não são de mercado não gravam", () => {
  assert.equal(visita({ pathname: "/", pais: "PT" }), null); // vai para /pt-pt, que grava
  assert.equal(visita({ pathname: "/vendas", lancado: true }), null); // vitrine redireciona com a chave ligada
  assert.equal(visita({ pathname: "/es/vendas", userAgent: GOOGLEBOT }), null);
  for (const pathname of [...ROTAS_DO_POS_PAGAMENTO, "/termos", "/estudante", "/sobre", "/mundo"]) {
    assert.equal(visita({ pathname, pais: "BR" }), null, pathname);
  }
});

test("dm_mercado: funcional, sem dado pessoal, 30 dias, Path=/, SameSite=Lax, Secure", () => {
  assert.equal(M.COOKIE_VISITA, "dm_mercado");
  assert.equal(M.COOKIE_VISITA_SEGUNDOS, 60 * 60 * 24 * 30);
  const fonte = ler("middleware.ts");
  const bloco = fonte.slice(fonte.indexOf("const visita = mercadoDaVisita(pedido, d);"));
  assert.match(bloco, /r\.cookies\.set\(COOKIE_VISITA, visita, \{\s*path: "\/",\s*maxAge: COOKIE_VISITA_SEGUNDOS,\s*sameSite: "lax",\s*secure: true,\s*\}\)/);
  // e a política de privacidade diz o que ele guarda, nos dois idiomas
  assert.match(ler("app/privacidade/page.tsx"), /<strong>dm_mercado<\/strong>/);
  assert.match(ler("app/es/privacidad/page.tsx"), /<strong>dm_mercado<\/strong>/);
});

/* =============================== aparelho =============================== */

test("aparelho pelo user-agent: iPhone, iPad e iPod são ios; Android é android; o resto, computador", () => {
  assert.equal(aparelhoDoUserAgent(IPHONE), "ios");
  assert.equal(aparelhoDoUserAgent(IPAD), "ios");
  assert.equal(aparelhoDoUserAgent(INSTAGRAM_IOS), "ios");
  assert.equal(aparelhoDoUserAgent(ANDROID), "android");
  assert.equal(aparelhoDoUserAgent(MAC), "computador");
  assert.equal(aparelhoDoUserAgent(WINDOWS), "computador");
  assert.equal(aparelhoDoUserAgent(""), "computador");
  assert.equal(aparelhoDoUserAgent(null), "computador");
});

test("/baixar e /es/descargar: celular vai para a loja do idioma (302); computador fica na página", () => {
  const L = I.LOJAS_DO_LOCAL;
  for (const local of LOCAIS_DO_BAIXAR) {
    const pathname = caminhoDoBaixar(local);
    assert.deepEqual(destinoDoBaixar({ pathname, userAgent: IPHONE }, L), { destino: L[local].appStore, status: 302 }, pathname);
    assert.deepEqual(destinoDoBaixar({ pathname, userAgent: IPAD }, L), { destino: L[local].appStore, status: 302 }, pathname);
    assert.deepEqual(destinoDoBaixar({ pathname, userAgent: ANDROID }, L), { destino: L[local].googlePlay, status: 302 }, pathname);
    assert.equal(destinoDoBaixar({ pathname, userAgent: MAC }, L), null, pathname);
    assert.equal(destinoDoBaixar({ pathname, userAgent: WINDOWS }, L), null, pathname);
  }
  assert.deepEqual(LOCAIS_DO_BAIXAR.map(caminhoDoBaixar), ["/baixar", "/es/descargar"]);
  // pt-pt e en não têm /baixar: usam o do pt (o QR code do computador abre ele)
  assert.deepEqual(LOCAIS.map(caminhoDoBaixar), ["/baixar", "/baixar", "/es/descargar", "/baixar"]);
  // ?lang=es no /baixar: loja em espanhol no celular; no computador, a página em espanhol (307, com os parâmetros)
  assert.deepEqual(destinoDoBaixar({ pathname: "/baixar", busca: "?lang=es", userAgent: IPHONE }, L), { destino: L.es.appStore, status: 302 });
  assert.deepEqual(destinoDoBaixar({ pathname: "/baixar", busca: "?lang=es&utm_source=x", userAgent: MAC }, L), { destino: "/es/descargar?lang=es&utm_source=x", status: 307 });
  assert.equal(localDoBaixar("/es/descargar", "?lang=pt"), "es");
  assert.equal(localDoBaixar("/baixar", ""), "pt");
  assert.equal(destinoDoBaixar({ pathname: "/vendas", userAgent: IPHONE }, L), null);
  assert.equal(destinoDoBaixar({ pathname: "/baixar/x", userAgent: IPHONE }, L), null);
  assert.equal(destinoDoBaixar({ pathname: "/es/baixar", userAgent: IPHONE }, L), null);
  for (const pathname of ["/pt-pt/baixar", "/en/baixar", "/en/download"]) assert.equal(destinoDoBaixar({ pathname, userAgent: IPHONE }, L), null, pathname);
});

/* ================================= lojas ================================= */

test("links das lojas: um app só, um par por local (pt, pt-pt, es e en), nos caminhos novos", () => {
  const L = I.LOJAS_DO_LOCAL;
  assert.deepEqual(L, {
    pt: {
      appStore: "https://apps.apple.com/br/app/diariamente-sa%C3%BAde-mental/id6762151251",
      googlePlay: "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=pt-BR",
    },
    "pt-pt": {
      appStore: "https://apps.apple.com/pt/app/diariamente-sa%C3%BAde-mental/id6762151251",
      googlePlay: "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=pt-PT",
    },
    es: {
      appStore: "https://apps.apple.com/mx/app/diariamente-salud-mental/id6762151251",
      googlePlay: "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=es",
    },
    en: {
      appStore: "https://apps.apple.com/us/app/diariamente-sa%C3%BAde-mental/id6762151251",
      googlePlay: "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=en",
    },
  });
  assert.deepEqual(Object.keys(L).sort(), [...LOCAIS].sort());
  // ATIVOS (homes) repassa a fonte única
  assert.deepEqual([I.ATIVOS.pt.links.appStore, I.ATIVOS.pt.links.googlePlay], [L.pt.appStore, L.pt.googlePlay]);
  assert.deepEqual([I.ATIVOS.es.links.appStore, I.ATIVOS.es.links.googlePlay], [L.es.appStore, L.es.googlePlay]);
  // config.ts (JSON-LD do layout e rodapé) repete o pt, igual
  const C = carregarTs(arq("config.ts"), { "@/config/pricing": P });
  assert.deepEqual({ ...C.LOJAS }, { ...L.pt });
});

test("nenhum link de loja escrito fora da fonte única, e nenhum caminho antigo da App Store (o do 301) no site", () => {
  const pastas = ["app", "components", "lib", "config", "public"];
  const arquivos = ["config.ts", "middleware.ts", "next.config.js"];
  const andar = (rel) => {
    for (const nome of readdirSync(arq(rel))) {
      const r = `${rel}/${nome}`;
      if (statSync(arq(r)).isDirectory()) andar(r);
      else if (/\.(tsx?|mjs|js|json|html|txt|xml)$/.test(nome)) arquivos.push(r);
    }
  };
  pastas.forEach(andar);
  for (const rel of arquivos) {
    const fonte = ler(rel);
    assert.doesNotMatch(fonte, /apps\.apple\.com\/[a-z]{2}\/app\/diariamente\/id/, rel);
    // só lib/i18n.ts monta os links e config.ts repete o pt
    if (rel !== "lib/i18n.ts" && rel !== "config.ts") {
      assert.doesNotMatch(fonte, /apps\.apple\.com|play\.google\.com\/store/, rel);
    }
  }
});

/* ================================= copy ================================= */

function chaves(o, prefixo = "") {
  return Object.entries(o)
    .flatMap(([k, v]) =>
      v && typeof v === "object" && !Array.isArray(v) ? chaves(v, `${prefixo}${k}.`) : [`${prefixo}${k}`]
    )
    .sort();
}

function textoPlano(v) {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(textoPlano).join("");
  if (v && typeof v === "object") return Object.values(v).map(textoPlano).join(" ");
  return "";
}

const EMOJI = /\p{Extended_Pictographic}/gu;
// "compra", "comprar", "compraste", "compró"... (comprovante e compromisso não contam)
const COMPRA = /\bcompr(?!ov|om)/i;
// no inglês, nem "purchase", "buy" ou "bought" (payment, subscription, access, order)
const COMPRA_EN = /\b(purchas|buy|bought)/i;

test("copy: os quatro locais, com as mesmas chaves do pt", () => {
  assert.deepEqual(Object.keys(TEXTOS).sort(), [...LOCAIS].sort());
  for (const local of LOCAIS) assert.deepEqual(chaves(TEXTOS[local]), chaves(TEXTOS.pt), local);
});

// O que cada página mostra: os textos do status e os das lojas.
const PAGINAS = [...ESTADOS, "baixar"];
for (const local of LOCAIS) {
  for (const pagina of PAGINAS) {
    const tudo = textoPlano(TEXTOS[local][pagina]) + " " + textoPlano(TEXTOS[local].lojas);

    test(`copy ${local} ${pagina}: regras da marca (sem compra, sem travessão, no máximo 1 emoji)`, () => {
      assert.doesNotMatch(tudo, COMPRA);
      assert.doesNotMatch(tudo, COMPRA_EN);
      assert.doesNotMatch(tudo, /[—–]/);
      assert.ok((tudo.match(EMOJI) || []).length <= 1);
    });

    test(`copy ${local} ${pagina}: nenhum texto vazio`, () => {
      for (const k of chaves(TEXTOS[local][pagina])) {
        const v = k.split(".").reduce((o, c) => o[c], TEXTOS[local][pagina]);
        if (Array.isArray(v) && v.length === 0) continue; // formas: vazia fora do pt
        assert.ok(textoPlano(v).trim(), `${k} vazio`);
      }
    });
  }
}

/** As frases de um texto (para conferir uma a uma). */
const frasesDe = (texto) => texto.split(/(?<=[.?!])\s+/).filter(Boolean);

/**
 * Palavra inteira, com acento: o \b do JavaScript só conhece [A-Za-z0-9_]
 * e não acharia "você" seguido de espaço.
 */
const palavras = (lista) => new RegExp(`(?<![\\p{L}\\p{N}])(${lista.join("|")})(?![\\p{L}\\p{N}])`, "iu");

test("copy: assinatura da marca; o WhatsApp sem garantia de entrega e sem dizer o idioma", () => {
  const assinatura = { pt: "Volte amanhã.", "pt-pt": "Volte amanhã.", es: "Vuelve mañana.", en: "Come back tomorrow." };
  for (const local of LOCAIS) {
    for (const pagina of PAGINAS) assert.equal(TEXTOS[local][pagina].frase, assinatura[local], `${local} ${pagina}`);
    const whats = TEXTOS[local].aprovado.whatsapp.texto;
    // condicional (pergunta) e "deve/debería/should", nunca "vai chegar"
    assert.match(whats, /\?/);
    assert.match(whats, /\bDeve\b|\bDebería\b|\bshould\b/i);
    assert.doesNotMatch(whats, /vai chegar|chegará|llegará|va a llegar|em instantes|en unos instantes|will (arrive|get|receive)|in a (moment|few)|right away|instantly/i);
    // frases curtas: nenhuma com mais de 20 palavras
    for (const f of frasesDe(whats)) assert.ok(f.split(/\s+/).length <= 20, f);
    // (o en diz, numa frase só, que o APP está em português e espanhol: teste logo abaixo)
    const semAFraseDoApp = textoPlano(TEXTOS[local]).split("The app is in Portuguese and Spanish.").join(" ");
    assert.doesNotMatch(semAFraseDoApp, /em português|en portugués|em espanhol|en español|in Portuguese|in Spanish|in English|em inglês|en inglés/i, local);
  }
});

test("copy en: uma frase honesta de que o app está em português e espanhol, sem dizer o idioma do WhatsApp nem do e-mail", () => {
  const en = TEXTOS.en;
  const frase = "The app is in Portuguese and Spanish.";
  // em toda página que manda abrir o app
  for (const rico of [en.aprovado.senha.passos[0], en["aguardando-pagamento"].app.texto, en["aguardando-analise"].app.texto, en.baixar.primeiroAcesso]) {
    assert.ok(textoPlano(rico).startsWith(frase), textoPlano(rico));
  }
  // uma vez por página, só ela fala de idioma, e nenhuma frase sobre WhatsApp ou e-mail fala de idioma
  for (const pagina of PAGINAS) {
    const tudo = textoPlano(en[pagina]);
    assert.equal(tudo.split(frase).length - 1, 1, pagina);
    for (const f of frasesDe(tudo.replace(frase, ""))) assert.doesNotMatch(f, /Portuguese|Spanish|English|language/i, f);
  }
  // pt, pt-pt e es não falam de idioma
  for (const local of ["pt", "pt-pt", "es"]) assert.doesNotMatch(textoPlano(TEXTOS[local]), /idioma|português|portugués|espanhol|español|inglês|inglés/i, local);
});

test("copy en: nada em português, a não ser os rótulos do app citados (com a tradução entre parênteses)", () => {
  // os rótulos do app que a página cita, e a marca
  const citados = [BOTAO_DO_APP.en, "Entrar", "Diariamente", "Hotmart"];
  let tudo = textoPlano(TEXTOS.en);
  for (const c of citados) tudo = tudo.split(c).join(" ");
  assert.doesNotMatch(tudo, /[ãõçàáâéêíóôú]/i);
  assert.doesNotMatch(tudo, palavras(["você", "seu", "sua", "pagamento", "senha", "aplicativo", "baixar", "obrigado", "conta", "acesso", "botão", "abaixo", "toque", "primeiro"]));
  // primeira vez em cada página: o rótulo em português e, logo depois, a tradução
  const chip = (rico) => rico[rico.findIndex((p) => p && p.b === BOTAO_DO_APP.en) + 1];
  for (const rico of [TEXTOS.en.aprovado.senha.passos[0], TEXTOS.en["aguardando-pagamento"].app.texto, TEXTOS.en["aguardando-analise"].app.texto, TEXTOS.en.baixar.primeiroAcesso]) {
    assert.match(chip(rico), /^ \(First access\? Activate account\)/, textoPlano(rico));
  }
  assert.match(textoPlano(TEXTOS.en.aprovado.senha.passos[0]), /below the Entrar \(Sign in\) button/);
});

test("copy pt-pt: português de Portugal, sem brasileirismo nem \"você\"", () => {
  const tudo = textoPlano(TEXTOS["pt-pt"]).split(BOTAO_DO_APP["pt-pt"]).join(" ");
  assert.doesNotMatch(tudo, palavras(["você", "celular", "tela", "baixar", "baixe", "cadastro", "cadastrado", "senha", "o app", "do app", "no app", "pelo app", "aba", "equipe", "contato", "câmera", "pra", "aguardando", "analisando", "ônibus", "time"]));
  for (const palavra of [/telemóvel/, /palavra-passe/, /\ba app\b/, /\bo seu\b|\ba sua\b/, /separador/, /câmara/, /Descarregar na App Store/]) {
    assert.match(textoPlano(TEXTOS["pt-pt"]), palavra, String(palavra));
  }
  // o que muda para o pt: não é uma cópia
  assert.notDeepEqual(TEXTOS["pt-pt"].aprovado, TEXTOS.pt.aprovado);
});

test("copy: o código de 6 dígitos sem garantia absoluta (sem WhatsApp, o app manda um link no e-mail)", () => {
  const passo = (l) => textoPlano(TEXTOS[l].aprovado.senha.passos[2]);
  const esperado = {
    pt: [/6 dígitos/, /link/, /e-mail/],
    "pt-pt": [/6 dígitos/, /link/, /e-mail/],
    es: [/6 dígitos/, /enlace/, /correo/],
    en: [/6-digit/, /link/, /email/],
  };
  for (const local of LOCAIS) {
    for (const r of esperado[local]) assert.match(passo(local), r, local);
    assert.doesNotMatch(passo(local), /que chega|que te llega|you will get|will arrive/, local);
  }
  // o "Não recebeu?" fala do link no e-mail
  assert.match(textoPlano(TEXTOS.pt.aprovado.naoRecebeu), /enviou um link/);
  assert.match(textoPlano(TEXTOS["pt-pt"].aprovado.naoRecebeu), /enviou um link/);
  assert.match(textoPlano(TEXTOS.es.aprovado.naoRecebeu), /envió un enlace/);
  assert.match(textoPlano(TEXTOS.en.aprovado.naoRecebeu), /sent a link/);
});

test("copy: o chip usa o rótulo EXATO do botão do app e diz onde ele fica (abaixo do Entrar)", () => {
  // o app só tem pt-BR e es: pt-pt e en citam o rótulo em português
  assert.deepEqual(BOTAO_DO_APP, {
    pt: "Primeiro acesso? Ativar conta",
    "pt-pt": "Primeiro acesso? Ativar conta",
    es: "¿Primer acceso? Activar cuenta",
    en: "Primeiro acesso? Ativar conta",
  });
  for (const local of LOCAIS) {
    const rotulo = BOTAO_DO_APP[local];
    const t = TEXTOS[local];
    for (const rico of [t.aprovado.senha.passos[0], t["aguardando-pagamento"].app.texto, t["aguardando-analise"].app.texto, t.baixar.primeiroAcesso]) {
      assert.ok(rico.some((p) => p && p.b === rotulo), `${local}: ${textoPlano(rico)}`);
    }
  }
  assert.match(textoPlano(TEXTOS.pt.aprovado.senha.passos[0]), /abaixo do botão Entrar/);
  assert.match(textoPlano(TEXTOS["pt-pt"].aprovado.senha.passos[0]), /por baixo do botão Entrar/);
  assert.match(textoPlano(TEXTOS.es.aprovado.senha.passos[0]), /debajo del botón Entrar/);
  assert.match(textoPlano(TEXTOS.en.aprovado.senha.passos[0]), /below the Entrar \(Sign in\) button/);
});

test("copy: Pix e boleto só no pt; a trilha tem 3 marcos em todo status", () => {
  assert.deepEqual(TEXTOS.pt["aguardando-pagamento"].concluir.formas.map((f) => f.id), ["pix", "boleto"]);
  for (const local of ["pt-pt", "es", "en"]) {
    assert.deepEqual(TEXTOS[local]["aguardando-pagamento"].concluir.formas, [], local);
    assert.doesNotMatch(textoPlano(TEXTOS[local]), /\bpix\b|boleto/i, local);
  }
  for (const local of LOCAIS) for (const estado of ESTADOS) assert.equal(TEXTOS[local][estado].trilha.passos.length, 3);
});

test("copy: os rótulos das lojas do /baixar são os mesmos dos botões das páginas de obrigado", () => {
  for (const local of LOCAIS) {
    assert.equal(TEXTOS[local].baixar.appStore, TEXTOS[local].lojas.appStore, local);
    assert.equal(TEXTOS[local].baixar.googlePlay, TEXTOS[local].lojas.googlePlay, local);
  }
});

/* ========================== forma de pagamento ========================== */

test("forma de pagamento na URL: Pix, boleto, outra ou nada", () => {
  assert.equal(formaDoPagamento({ payment_type: "PIX" }), "pix");
  assert.equal(formaDoPagamento({ payment_type: "BILLET" }), "boleto");
  assert.equal(formaDoPagamento({ payment_method: "boleto" }), "boleto");
  assert.equal(formaDoPagamento({ payment_type: ["pix", "BILLET"] }), "pix");
  assert.equal(formaDoPagamento({ payment_type: "CREDIT_CARD" }), "outra");
  assert.equal(formaDoPagamento({ payment_method: "PAYPAL" }), "outra");
  assert.equal(formaDoPagamento({ transaction: "HP123" }), null);
  assert.equal(formaDoPagamento({ payment_type: "  " }), null);
  assert.equal(formaDoPagamento(undefined), null);
  assert.equal(primeiro(["pt", "es"]), "pt");
  assert.equal(primeiro(undefined), "");
});

test("orientação do pagamento: com a forma, só ela; outra forma ou sem Pix e boleto, a linha geral", () => {
  const br = TEXTOS.pt["aguardando-pagamento"].concluir.formas;
  assert.deepEqual(orientacaoDoPagamento(br, null), { formas: ["pix", "boleto"], linha: "instrucoes" });
  assert.deepEqual(orientacaoDoPagamento(br, "pix"), { formas: ["pix"], linha: "instrucoes" });
  assert.deepEqual(orientacaoDoPagamento(br, "boleto"), { formas: ["boleto"], linha: "instrucoes" });
  assert.deepEqual(orientacaoDoPagamento(br, "outra"), { formas: [], linha: "instrucoesSoEmail" });
  for (const forma of [null, "pix", "boleto"]) assert.deepEqual(orientacaoDoPagamento([], forma), { formas: [], linha: "instrucoesGeral" });
  assert.deepEqual(orientacaoDoPagamento([], "outra"), { formas: [], linha: "instrucoesSoEmail" });
  for (const local of LOCAIS) {
    const c = TEXTOS[local]["aguardando-pagamento"].concluir;
    // a linha da "outra forma" e a geral não falam de Pix nem de boleto
    assert.doesNotMatch(c.instrucoesSoEmail + c.instrucoesGeral, /pix|boleto/i, local);
    assert.doesNotMatch(c.instrucoesSoEmail, /também|también|\btoo\b|\balso\b|as well/i, local);
    assert.match(c.instrucoesSoEmail, /Hotmart/, local);
  }
});

/** O ObrigadoShell de verdade, com as peças de fora de mentira (a tela do app vira <i data-tela>). */
function shellDeMentira() {
  const passa = ({ children }) => React.createElement("div", null, children);
  const nada = () => null;
  return carregarTs(arq("components", "ObrigadoShell.tsx"), {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "@/config/atendimento": { ATENDIMENTO: { email: "x@y.z", assuntoSuporte: "S", assuntoAtendimento: "A" } },
    "@/components/TelaDaLoja": { TelaDaLoja: ({ base }) => React.createElement("i", { "data-tela": base }) },
    "@/components/PosPagamento": {
      Final: nada, Hero: nada, InstalarApp: nada, Moldura: passa, Rico: nada, SeloAprovado: nada, SeloEspera: nada, Trilha: nada,
      Inteiro: ({ texto }) => texto,
      textosDo: (l) => TEXTOS[l],
    },
    "@/lib/i18n": I,
    "@/lib/obrigado.mjs": O,
  }, { jsx: true });
}

/** ObrigadoShell de verdade (peças de fora de mentira), já renderizado. */
function htmlDoShell(props) {
  const { ObrigadoShell } = shellDeMentira();
  return renderToStaticMarkup(React.createElement(ObrigadoShell, props));
}

function htmlDoPendente(local, mercado, forma = null) {
  return htmlDoShell({ estado: "aguardando-pagamento", local, aparelho: "ios", forma, mercado });
}

test("aguardando pagamento: Pix e boleto só para o mercado br; quem lê em pt e paga em dólar ou euro vê a linha geral", async () => {
  const br = htmlDoPendente("pt", "br");
  assert.match(br, /data-forma="pix"/);
  assert.match(br, /data-forma="boleto"/);
  assert.match(htmlDoPendente("pt", "br", "pix"), /data-forma="pix"/);
  assert.doesNotMatch(htmlDoPendente("pt", "br", "pix"), /data-forma="boleto"/);
  for (const [local, mercado] of [["pt", "rw"], ["pt", "pt"], ["es", "la"], ["es", "es"], ["pt-pt", "pt"], ["en", "rw"], ["pt-pt", "br"], ["en", "br"]]) {
    // (mercado br em pt-pt ou en: a oferta do Brasil aberta na rota de outro local; a copy não tem Pix nem boleto)
    const html = htmlDoPendente(local, mercado);
    assert.doesNotMatch(html, /data-forma=/, `${local} ${mercado}`);
    assert.match(html, /data-linha="instrucoesGeral"/, `${local} ${mercado}`);
  }
  // e a página entrega o mercado certo ao shell: cookie rw, oferta em dólar e país de fora
  const casos = [
    [{}, { cookie: "rw" }, "rw"],
    [{ off: "uevhmhy2" }, {}, "rw"],
    [{}, { pais: "US" }, "rw"],
    // Portugal na página pt-BR (sem oferta): o mercado do pt-BR; Portugal tem a página dele (pt-pt)
    [{}, { pais: "PT" }, "br"],
    [{}, {}, "br"],
    [{ off: "fhrttdh8" }, { pais: "US" }, "br"],
  ];
  for (const [busca, opcoes, mercado] of casos) {
    const r = await renderizarPagina("aguardando-pagamento", "pt", busca, opcoes);
    assert.equal(r.shell.props.mercado, mercado, JSON.stringify([busca, opcoes]));
  }
  // pt-pt e en: o mercado do local, sem Pix nem boleto
  for (const [local, busca, opcoes, mercado] of [["pt-pt", {}, { pais: "PT" }, "pt"], ["pt-pt", {}, { cookie: "br" }, "pt"], ["en", { off: "uevhmhy2" }, { pais: "US" }, "rw"], ["en", {}, { cookie: "la" }, "rw"]]) {
    const r = await renderizarPagina("aguardando-pagamento", local, busca, opcoes);
    assert.equal(r.shell.props.mercado, mercado, JSON.stringify([local, busca, opcoes]));
    assert.equal(r.shell.props.local, local);
  }
});

test("aprovada: a tela do app (arte das lojas) em pt, pt-pt e es; o en fica sem ela (a arte é em português) e o WhatsApp sobe para a direita", () => {
  const { telaDoApp } = shellDeMentira();
  assert.equal(telaDoApp("pt").base, "/telas/pt/leitura");
  assert.equal(telaDoApp("pt-pt").base, "/telas/pt/leitura");
  assert.equal(telaDoApp("es").base, "/telas/es/leitura");
  assert.equal(telaDoApp("pt").alt, telaDoApp("pt-pt").alt);
  assert.equal(telaDoApp("en"), null);
  for (const local of LOCAIS) {
    const html = htmlDoShell({ estado: "aprovado", local, aparelho: "ios", mercado: O.MERCADO_DO_LOCAL[local] });
    assert.equal(/data-tela=/.test(html), local !== "en", local);
    assert.equal(/class="pp-aprovado is-sem-tela"/.test(html), local === "en", local);
  }
  const css = ler("components/pos-pagamento.css");
  assert.match(css, /\.pp-aprovado\.is-sem-tela \{\s*grid-template-areas:\s*"hero\s+instalar"\s*"trilha\s+instalar"\s*"senha\s+whats";\s*\}/);
});

test("aguardando pagamento e em análise: sem prazo inventado", () => {
  for (const local of LOCAIS) {
    for (const estado of ["aguardando-pagamento", "aguardando-analise"]) {
      const tudo = textoPlano(TEXTOS[local][estado]);
      assert.doesNotMatch(tudo, /\d+\s*(dia|día|hora|minuto|day|hour|minute)/i, `${local} ${estado}`);
      assert.doesNotMatch(tudo, /úteis|hábiles|instantes|business day|instantly|right away/i, `${local} ${estado}`);
    }
  }
});

/* =================================== log =================================== */

test("log: só os NOMES dos parâmetros, ordenados e sem repetição; valor nunca", () => {
  const params = { transaction: "HP123", email: "ana@exemplo.com", name: "Ana", off: "uevhmhy2", a: ["1", "2"] };
  const linha = linhaDoLog("aprovado", "es", params);
  assert.equal(linha, "[obrigado] aprovado es parametros=a,email,name,off,transaction");
  for (const valor of ["HP123", "ana@exemplo.com", "Ana ", "uevhmhy2"]) assert.equal(linha.includes(valor), false, valor);
  assert.equal(linhaDoLog("aguardando-analise", "pt", {}), "[obrigado] aguardando-analise pt parametros=(nenhum)");
  assert.deepEqual(nomesDosParametros(new URLSearchParams("b=1&a=2&b=3")), ["a", "b"]);
  // nome estranho é limpo (nada de quebra de linha nem espaço no log)
  assert.deepEqual(nomesDosParametros({ "x\ny": "1", "a b": "2", "<script>": "3" }), ["ab", "script", "xy"]);
  assert.equal(nomesDosParametros(Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`p${String(i).padStart(2, "0")}`, "v"]))).length, 40);
});

test("a página entrega local, aparelho, forma e mercado ao shell, e registra só os nomes dos parâmetros", async () => {
  const r = await renderizarPagina("aguardando-pagamento", "pt", { payment_type: "PIX", email: "ana@exemplo.com" }, { ua: ANDROID });
  assert.deepEqual(r.shell.props, { estado: "aguardando-pagamento", local: "pt", aparelho: "android", forma: "pix", mercado: "br" });
  assert.deepEqual(r.linhas, ["[obrigado] aguardando-pagamento pt parametros=email,payment_type"]);
  const c = await renderizarPagina("aprovado", "es", {}, { ua: MAC });
  assert.equal(c.shell.props.aparelho, "computador");
});

/* ============================ rotas no app/ ============================ */

test("as 12 páginas de obrigado e os 2 /baixar existem, dinâmicos, com o status e o local do caminho", () => {
  for (const local of LOCAIS) {
    for (const estado of ESTADOS) {
      const rel = `app${caminhoDoObrigado(estado, local)}/page.tsx`;
      assert.ok(existsSync(arq(rel)), rel);
      const fonte = ler(rel);
      assert.match(fonte, /^export const dynamic = "force-dynamic";$/m, rel);
      assert.match(fonte, new RegExp(`metadataDoObrigado\\("${estado}", "${local}"\\)`), rel);
      assert.match(fonte, new RegExp(`<PaginaObrigado estado="${estado}" local="${local}"`), rel);
      assert.doesNotMatch(fonte, /lang=|PurchaseTracking/, rel);
    }
  }
  for (const local of LOCAIS_DO_BAIXAR) {
    const rel = `app${caminhoDoBaixar(local)}/page.tsx`;
    assert.ok(existsSync(arq(rel)), rel);
    assert.match(ler(rel), /^export const dynamic = "force-dynamic";$/m, rel);
    assert.match(ler(rel), new RegExp(`metadataDoBaixar\\("${local}"\\)`), rel);
    assert.match(ler(rel), new RegExp(`<BaixarApp local="${local}" />`), rel);
  }
  // o /obrigado antigo continua levando para a aprovada com os parâmetros
  assert.match(ler("app/obrigado/page.tsx"), /redirect\(comParametros\("\/obrigado-aprovado", searchParams\)\)/);
  // as rotas que nunca foram ao ar continuam fora (português dentro de /es e /es-es; /baixar de pt-pt e en)
  for (const velha of ["es/obrigado-aprovado", "es/obrigado-aguardando-pagamento", "es/obrigado-aguardando-analise", "es/baixar", "es-es/obrigado-aprovado", "es-es/gracias-aprobado", "es-es/baixar", "pt-pt/baixar", "pt-pt/descargar", "en/baixar", "en/download"]) {
    assert.equal(existsSync(arq("app", velha)), false, velha);
  }
  // em /en só as três de obrigado; em /pt-pt, as três ao lado das páginas de mercado de antes
  assert.deepEqual(readdirSync(arq("app", "en")).sort(), ["thank-you-approved", "thank-you-pending-payment", "thank-you-under-review"]);
  assert.deepEqual(readdirSync(arq("app", "pt-pt")).filter((n) => n.startsWith("obrigado")).sort(), ["obrigado-aguardando-analise", "obrigado-aguardando-pagamento", "obrigado-aprovado"]);
});

test("noindex, nofollow e canonical para si na meta; X-Robots-Tag nas 14 rotas; fora do sitemap", async () => {
  const pagina = ler("components/PaginaObrigado.tsx");
  const baixar = ler("components/BaixarApp.tsx");
  for (const fonte of [pagina, baixar]) {
    assert.match(fonte, /robots: \{ index: false, follow: false, nocache: true, googleBot: \{ index: false, follow: false \} \}/);
    assert.match(fonte, /alternates: \{ canonical: proprio \}/);
  }
  const fabrica = require(arq("next.config.js"));
  const aviso = console.warn;
  console.warn = () => {};
  let regras;
  try {
    regras = await fabrica("phase-development-server").headers();
  } finally {
    console.warn = aviso;
  }
  for (const rota of ROTAS_DO_POS_PAGAMENTO) {
    const r = regras.find((x) => x.source === rota);
    assert.ok(r, rota);
    assert.deepEqual(r.headers, [{ key: "X-Robots-Tag", value: "noindex, nofollow" }], rota);
  }
  // a lista do next.config.js é exatamente a de lib/obrigado.mjs
  const comNoindex = regras.filter((x) => x.source.match(/obrigado|baixar|gracias|descargar|thank-you/)).map((x) => x.source);
  assert.deepEqual(comNoindex.sort(), [...ROTAS_DO_POS_PAGAMENTO].sort());
  // o sitemap nasce de lib/rotas.ts: nada do pós-pagamento lá
  assert.doesNotMatch(ler("lib/rotas.ts"), /obrigado|baixar|gracias|descargar|thank-you/);
  // metadata: título, descrição, Open Graph e Twitter no idioma do local
  const pagina2 = carregarTs(arq("components", "PaginaObrigado.tsx"), {
    react: React, "react/jsx-runtime": jsxRuntime,
    "next/headers": {}, "@/config": { SITE: { dominio: "https://www.diariamente.app" } },
    "@/components/ObrigadoShell": {}, "@/components/PurchaseTracking": {},
    "@/components/PosPagamento": { textosDo: (l) => TEXTOS[l] },
    "@/lib/mercado": M, "@/lib/obrigado.mjs": O, "@/lib/pos-pagamento": PP, "@/config/pricing": P,
  }, { jsx: true });
  const og = { pt: "pt_BR", "pt-pt": "pt_PT", es: "es_LA", en: "en_US" };
  for (const local of LOCAIS) {
    for (const estado of ESTADOS) {
      const m = pagina2.metadataDoObrigado(estado, local);
      assert.equal(m.title, TEXTOS[local][estado].aba);
      assert.equal(m.alternates.canonical, `https://www.diariamente.app${CAMINHOS[local][estado]}`);
      assert.equal(m.openGraph.locale, og[local]);
      assert.equal(m.twitter.title, TEXTOS[local][estado].aba);
      assert.equal(m.robots.index, false);
    }
  }
});

test("QR codes: um SVG por idioma em public/qr, só os dois", async () => {
  assert.deepEqual(readdirSync(arq("public", "qr")).sort(), ["baixar.svg", "descargar.svg"]);
  for (const nome of ["baixar.svg", "descargar.svg"]) {
    assert.match(ler(`public/qr/${nome}`), /^<\?xml[^>]*\?><!DOCTYPE svg[^>]*><svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 (\d+) \1"/, nome);
  }
  const PC = pecasComuns();
  assert.equal(PC.qrDoLocal("pt"), "/qr/baixar.svg");
  assert.equal(PC.qrDoLocal("es"), "/qr/descargar.svg");
  assert.equal(PC.urlDoBaixar("pt"), "https://www.diariamente.app/baixar");
  assert.equal(PC.urlDoBaixar("es"), "https://www.diariamente.app/es/descargar");
  // pt-pt e en reaproveitam o QR do /baixar (no celular, o middleware manda direto para a loja)
  for (const local of ["pt-pt", "en"]) {
    assert.equal(PC.qrDoLocal(local), "/qr/baixar.svg", local);
    assert.equal(PC.urlDoBaixar(local), "https://www.diariamente.app/baixar", local);
  }
});

test("lojas por local nas páginas de obrigado: o botão do aparelho abre a loja do local", () => {
  const PC = pecasComuns();
  for (const local of LOCAIS) {
    const L = I.LOJAS_DO_LOCAL[local];
    const href = (u) => `href="${u.replace(/&/g, "&amp;")}"`;
    const ios = renderToStaticMarkup(React.createElement(PC.InstalarApp, { local, aparelho: "ios" }));
    assert.ok(ios.includes(href(L.appStore)), local);
    assert.ok(ios.includes(href(L.googlePlay)), local);
    assert.ok(ios.includes(TEXTOS[local].lojas.iphone.botao), local);
    const android = renderToStaticMarkup(React.createElement(PC.InstalarApp, { local, aparelho: "android" }));
    assert.ok(android.includes(TEXTOS[local].lojas.android.botao), local);
  }
});

test("o <html lang> vira o do local na hidratação (o do layout raiz é sempre pt-BR)", () => {
  const PC = pecasComuns();
  for (const local of LOCAIS) {
    const html = renderToStaticMarkup(React.createElement(PC.Moldura, { local }, "x"));
    assert.match(html, new RegExp(`^<main class="pp" lang="${LANG_HTML[local]}"><i data-idioma="${LANG_HTML[local]}"></i>`), local);
  }
  const fonte = ler("components/IdiomaDoDocumento.tsx");
  assert.match(fonte, /^"use client";/);
  assert.match(fonte, /document\.documentElement\.lang = lang;/);
});

/* =============================== atendimento =============================== */

test("atendimento: constante única, assunto Suporte na aprovada e Atendimento nas outras duas", () => {
  const atendimento = ler("config/atendimento.ts");
  assert.equal((atendimento.match(/^\s*email:/gm) || []).length, 1);
  assert.match(atendimento, /assuntoSuporte: "Suporte Diariamente App"/);
  assert.match(atendimento, /assuntoAtendimento: "Atendimento Diariamente App"/);
  const shell = ler("components/ObrigadoShell.tsx");
  const comum = ler("components/PosPagamento.tsx");
  for (const fonte of [shell, comum]) {
    assert.doesNotMatch(fonte, /suporteEmail|contatoEmail|@scienceplay\.com/);
    assert.doesNotMatch(fonte, /href=\{`mailto:/, "todo mailto passa por linkDoAtendimento");
  }
  assert.match(comum, /ATENDIMENTO\.email/);
  const aprovado = shell.slice(shell.indexOf("function Aprovado"), shell.indexOf("function AguardandoPagamento"));
  assert.match(aprovado, /assunto=\{ATENDIMENTO\.assuntoSuporte\}/);
  assert.doesNotMatch(aprovado, /assuntoAtendimento/);
  const resto = shell.slice(shell.indexOf("function AguardandoPagamento"));
  assert.equal((resto.match(/assunto=\{ATENDIMENTO\.assuntoAtendimento\}/g) || []).length, 2);
  assert.doesNotMatch(resto, /assuntoSuporte/);
});

/* ============================== versão web ============================== */

/** components/PosPagamento.tsx de verdade, com o que ele importa de mentira. */
function pecasComuns() {
  return carregarTs(arq("components", "PosPagamento.tsx"), {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "@/config": { SITE: { dominio: "https://www.diariamente.app", appUrl: "https://app.diariamente.club" }, EMPRESA: {} },
    "@/config/atendimento": { ATENDIMENTO: { email: "x@y.z" }, linkDoAtendimento: () => "mailto:x@y.z" },
    "@/components/Brand": { OfficialLogo: () => null },
    "@/components/IdiomaDoDocumento": { IdiomaDoDocumento: ({ lang }) => React.createElement("i", { "data-idioma": lang }) },
    "@/components/StoreBadges": { AppleGlyph: () => null, PlayGlyph: () => null, StoreBadges: () => null },
    "@/lib/i18n": I,
    "@/lib/obrigado.mjs": O,
    "@/lib/obrigado-textos.mjs": { TEXTOS },
    "./pos-pagamento.css": {},
  }, { jsx: true });
}

test("versão web: nas páginas de obrigado, a ativação do app (/ativar); no /baixar, a raiz; espanhol com ?lang=es", () => {
  const PC = pecasComuns();
  assert.equal(PC.linkDaVersaoWeb("pt"), "https://app.diariamente.club/ativar");
  assert.equal(PC.linkDaVersaoWeb("es"), "https://app.diariamente.club/ativar?lang=es");
  assert.equal(PC.linkDaVersaoWeb("pt", "raiz"), "https://app.diariamente.club/");
  assert.equal(PC.linkDaVersaoWeb("es", "raiz"), "https://app.diariamente.club/?lang=es");
  // pt-pt e en sem lang: o app só tem pt-BR e es e decide sozinho
  assert.equal(PC.linkDaVersaoWeb("pt-pt"), "https://app.diariamente.club/ativar");
  assert.equal(PC.linkDaVersaoWeb("en"), "https://app.diariamente.club/ativar");
  assert.match(ler("components/BaixarApp.tsx"), /<Final [^>]*web="raiz"/);
  assert.doesNotMatch(ler("components/ObrigadoShell.tsx"), /web="raiz"/);
});

test("aprovada no computador: a versão web (/ativar) no fim do cartão de instalar, sem repetir no rodapé (revisão de 28/10/2026)", () => {
  const PC = pecasComuns();
  for (const local of LOCAIS) {
    const t = TEXTOS[local].aprovado;
    const props = { local, versaoWeb: { antes: t.webAquiAntes, link: t.webLink } };
    const comp = renderToStaticMarkup(React.createElement(PC.InstalarApp, { ...props, aparelho: "computador" }));
    assert.ok(comp.includes(`<a href="${PC.linkDaVersaoWeb(local)}">${t.webLink}</a>`), comp);
    assert.ok(comp.includes(t.webAquiAntes));
    // no celular, o cartão é o botão da loja; a versão web fica no rodapé, como antes
    for (const aparelho of ["ios", "android"]) {
      assert.equal(renderToStaticMarkup(React.createElement(PC.InstalarApp, { ...props, aparelho })).includes(t.webAquiAntes), false, aparelho);
    }
    const final = (semWeb) => renderToStaticMarkup(React.createElement(PC.Final, { local, webAntes: t.webAntes, webLink: t.webLink, semWeb, frase: t.frase }));
    assert.equal(final(true).includes(t.webLink), false);
    assert.ok(final(false).includes(t.webLink));
  }
  assert.match(ler("components/ObrigadoShell.tsx"), /semWeb=\{aparelho === "computador"\}/);
});

test("aprovada: o subtítulo não conta passos (a trilha e os cartões numeram: Passo 2 e Passo 3)", () => {
  const passo2 = { pt: "Passo 2", "pt-pt": "Passo 2", es: "Paso 2", en: "Step 2" };
  for (const local of LOCAIS) {
    const t = TEXTOS[local].aprovado;
    assert.doesNotMatch(t.sub, /dois passos|dos pasos|two steps|\bdois\b|\bdos\b|\btwo\b/i, t.sub);
    assert.equal(t.app.selo, passo2[local]);
    assert.equal(t.trilha.passos.length, 3);
  }
});

test("o chip é igual ao botão do app: só o texto, sem borda, fundo nem ponto de toque", () => {
  const PC = pecasComuns();
  assert.equal(renderToStaticMarkup(React.createElement(PC.ChipDoApp, { rotulo: "Primeiro acesso? Ativar conta" })), '<span class="pp-chip">Primeiro acesso? Ativar conta</span>');
  const css = ler("components/pos-pagamento.css");
  const regra = css.match(/\.pp-chip \{([^}]*)\}/)[1];
  assert.match(regra, /color: var\(--p-400\)/);
  assert.match(regra, /font-size: 14px/);
  assert.match(regra, /font-weight: 600/);
  assert.doesNotMatch(regra, /border|background|box-shadow|padding/);
  assert.doesNotMatch(css, /pp-chip-toque/);
});
