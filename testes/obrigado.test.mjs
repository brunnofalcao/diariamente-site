// Pós-pagamento: páginas de obrigado (aprovado, aguardando pagamento, em
// análise) nos quatro locais (pt, es, es-es, pt-pt) e o /baixar.
// Confere a decisão de idioma das URLs da Hotmart, o mercado do Purchase,
// a detecção de aparelho, os links das lojas por idioma, a copy (chaves e
// regras da marca), o log só com nomes de parâmetros, as rotas e o noindex.
// Roda com: npm test   (node --test, sem dependência nova)
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as O from "../lib/obrigado.mjs";
import { TEXTOS } from "../lib/obrigado-textos.mjs";

const {
  LOCAIS,
  ESTADOS,
  BOTAO_DO_APP,
  IDIOMA_DO_APP,
  MERCADOS_DA_OFERTA,
  aparelhoDoUserAgent,
  caminhoDoBaixar,
  caminhoDoObrigado,
  decidirObrigado,
  destinoDoBaixar,
  destinoDoObrigado,
  formaDoPagamento,
  linhaDoLog,
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

/* =========================== decisão de idioma =========================== */

test("etiqueta de idioma vira local: es-ES e pt-PT têm o seu; o resto do es e do pt, o geral", () => {
  assert.equal(localDoIdioma("es-ES"), "es-es");
  assert.equal(localDoIdioma("es_es"), "es-es");
  assert.equal(localDoIdioma("pt-PT"), "pt-pt");
  assert.equal(localDoIdioma("es"), "es");
  assert.equal(localDoIdioma("es-419"), "es");
  assert.equal(localDoIdioma("es-MX"), "es");
  assert.equal(localDoIdioma("pt-BR"), "pt");
  assert.equal(localDoIdioma("pt"), "pt");
  assert.equal(localDoIdioma("en-US"), null);
  assert.equal(localDoIdioma("est"), null);
  assert.equal(localDoIdioma(""), null);
});

test("Accept-Language: peso (q) e ordem; idioma que não é pt nem es é pulado", () => {
  assert.equal(localDoNavegador("es-ES,es;q=0.9"), "es-es");
  assert.equal(localDoNavegador("es-MX,es;q=0.9,en;q=0.8"), "es");
  assert.equal(localDoNavegador("pt-PT,pt;q=0.9"), "pt-pt");
  assert.equal(localDoNavegador("pt-BR,pt;q=0.9,es;q=0.8"), "pt");
  assert.equal(localDoNavegador("en-US,en;q=0.9,es;q=0.8,pt;q=0.7"), "es");
  assert.equal(localDoNavegador("pt;q=0.5, es-ES;q=0.9"), "es-es");
  assert.equal(localDoNavegador("es;q=0, pt-BR"), "pt");
  assert.equal(localDoNavegador("en-US"), null);
  assert.equal(localDoNavegador(""), null);
});

test("ordem 1: o cookie dm_mercado vence tudo (oferta, ?lang= e navegador)", () => {
  const casos = { br: "pt", rw: "pt", la: "es", es: "es-es", pt: "pt-pt" };
  for (const [cookie, local] of Object.entries(casos)) {
    assert.deepEqual(decidirObrigado({ cookie, off: "iuoufnf6", lang: "pt", idiomas: "es-ES" }), { local, fonte: "cookie" }, cookie);
  }
  // cookie inválido é ignorado
  assert.equal(decidirObrigado({ cookie: "xx", idiomas: "es-MX" }).local, "es");
});

test("ordem 2: a oferta decide quando é de um mercado só", () => {
  assert.deepEqual(decidirObrigado({ off: "iuoufnf6", idiomas: "pt-BR" }), { local: "es-es", fonte: "oferta" });
  assert.deepEqual(decidirObrigado({ off: "3n484jbe", lang: "es" }), { local: "pt-pt", fonte: "oferta" });
  assert.deepEqual(decidirObrigado({ off: "fhrttdh8", idiomas: "es-MX" }), { local: "pt", fonte: "oferta" });
  assert.deepEqual(decidirObrigado({ off: "lf63bgdd", idiomas: "es-ES" }), { local: "pt", fonte: "oferta" });
  // maiúsculas e espaços não atrapalham; oferta desconhecida é ignorada
  assert.equal(decidirObrigado({ off: " IUOUFNF6 " }).local, "es-es");
  assert.equal(decidirObrigado({ off: "zzz", idiomas: "es-MX" }).local, "es");
});

test("a oferta em dólar (uevhmhy2) é da América Latina e do mundo: o idioma escolhe entre es e pt", () => {
  assert.deepEqual(decidirObrigado({ off: "uevhmhy2", idiomas: "es-MX,es;q=0.9" }), { local: "es", fonte: "navegador" });
  // es-ES e pt-PT pagam em euro, por outra oferta: com a do dólar, viram es e pt
  assert.equal(decidirObrigado({ off: "uevhmhy2", idiomas: "es-ES" }).local, "es");
  assert.equal(decidirObrigado({ off: "uevhmhy2", idiomas: "pt-PT" }).local, "pt");
  assert.equal(decidirObrigado({ off: "uevhmhy2", lang: "es" }).local, "es");
  assert.equal(decidirObrigado({ off: "uevhmhy2", idiomas: "en-US" }).local, "pt");
  assert.equal(decidirObrigado({ off: "uevhmhy2" }).local, "pt");
  // com o cookie, o cookie decide
  assert.equal(decidirObrigado({ off: "uevhmhy2", cookie: "la", idiomas: "pt-BR" }).local, "es");
  assert.equal(decidirObrigado({ off: "uevhmhy2", cookie: "rw", idiomas: "es-MX" }).local, "pt");
});

test("ordem 3 e 4: ?lang= (links antigos do app) e depois o Accept-Language; sem nada, pt", () => {
  assert.deepEqual(decidirObrigado({ lang: "es", idiomas: "pt-BR" }), { local: "es", fonte: "lang" });
  assert.deepEqual(decidirObrigado({ lang: ["es", "pt"] }), { local: "es", fonte: "lang" });
  assert.deepEqual(decidirObrigado({ lang: "fr", idiomas: "es-ES" }), { local: "es-es", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ idiomas: "pt-PT" }), { local: "pt-pt", fonte: "navegador" });
  assert.deepEqual(decidirObrigado({ idiomas: "en-US,en;q=0.9" }), { local: "pt", fonte: "padrao" });
  assert.deepEqual(decidirObrigado({}), { local: "pt", fonte: "padrao" });
  assert.deepEqual(decidirObrigado(), { local: "pt", fonte: "padrao" });
});

test("middleware: as URLs sem prefixo levam ao prefixo do idioma com TODOS os parâmetros", () => {
  const busca = "?transaction=HPTESTE&off=uevhmhy2&utm_source=ig&lang=es";
  const casos = { la: "/es", es: "/es-es", pt: "/pt-pt" };
  for (const estado of ESTADOS) {
    for (const [cookie, prefixo] of Object.entries(casos)) {
      assert.equal(
        destinoDoObrigado({ pathname: `/obrigado-${estado}`, busca, cookie }),
        `${prefixo}/obrigado-${estado}${busca}`,
        `${estado} ${cookie}`,
      );
    }
    // pt-BR (br, rw, sem nada): fica onde está
    for (const cookie of ["br", "rw", null]) {
      assert.equal(destinoDoObrigado({ pathname: `/obrigado-${estado}`, busca: "?transaction=HPTESTE&off=fhrttdh8", cookie }), null);
    }
  }
  // ?lang=es dos links antigos do app ainda leva ao /es
  assert.equal(destinoDoObrigado({ pathname: "/obrigado-aprovado", busca: "?lang=es" }), "/es/obrigado-aprovado?lang=es");
  // o /obrigado antigo vai direto para a aprovada do idioma
  assert.equal(destinoDoObrigado({ pathname: "/obrigado", busca: "?transaction=HP1", cookie: "es" }), "/es-es/obrigado-aprovado?transaction=HP1");
  // parâmetro repetido e caracteres especiais seguem iguais
  assert.equal(
    destinoDoObrigado({ pathname: "/obrigado-aprovado", busca: "?a=1&a=2&email=x%40y.com", idiomas: "pt-PT" }),
    "/pt-pt/obrigado-aprovado?a=1&a=2&email=x%40y.com",
  );
  // sem busca
  assert.equal(destinoDoObrigado({ pathname: "/obrigado-aprovado", idiomas: "es-AR" }), "/es/obrigado-aprovado");
});

test("middleware: nas rotas com prefixo o caminho manda (nada de redirecionar de novo)", () => {
  for (const local of LOCAIS) {
    for (const estado of ESTADOS) {
      const caminho = caminhoDoObrigado(estado, local);
      if (local === "pt") continue;
      assert.equal(destinoDoObrigado({ pathname: caminho, busca: "?lang=pt", cookie: "br", idiomas: "pt-BR" }), null, caminho);
    }
  }
  assert.equal(destinoDoObrigado({ pathname: "/termos", busca: "?lang=es" }), null);
});

test("o middleware aplica as duas regras do pós-pagamento antes da decisão das homes", () => {
  const fonte = ler("middleware.ts");
  assert.match(fonte, /destinoDoObrigado\(\{/);
  assert.match(fonte, /cookie: req\.cookies\.get\(COOKIE_VISITA\)\?\.value/);
  assert.match(fonte, /NextResponse\.redirect\(new URL\(obrigado, req\.url\)\)/);
  assert.match(fonte, /destinoDoBaixar\(pathname, userAgent, LOJAS_DO_LOCAL\)/);
  assert.match(fonte, /NextResponse\.redirect\(loja, 302\)/);
  assert.match(fonte, /if \(!ehRobo\(userAgent\)\)/);
  assert.ok(fonte.indexOf("destinoDoObrigado({") < fonte.indexOf("decidirRota(pedido)"));
});

/* =============================== mercado =============================== */

test("mercado do Purchase: a oferta manda; a do dólar segue o idioma da página", () => {
  assert.equal(mercadoDoObrigado("pt", { off: "iuoufnf6" }), "es");
  assert.equal(mercadoDoObrigado("es", { off: "3n484jbe" }), "pt");
  assert.equal(mercadoDoObrigado("pt", { off: "lf63bgdd" }), "br");
  assert.equal(mercadoDoObrigado("pt", { off: "uevhmhy2" }), "rw");
  assert.equal(mercadoDoObrigado("es", { off: "uevhmhy2" }), "la");
  assert.equal(mercadoDoObrigado("es-es", { off: "uevhmhy2" }), "la");
});

test("mercado do Purchase sem oferta: o cookie do mesmo idioma, senão o mercado do caminho", () => {
  assert.equal(mercadoDoObrigado("pt", { cookie: "rw" }), "rw");
  assert.equal(mercadoDoObrigado("pt", { cookie: "br" }), "br");
  assert.equal(mercadoDoObrigado("pt", { cookie: "la" }), "br");
  assert.equal(mercadoDoObrigado("es", { cookie: "la" }), "la");
  assert.equal(mercadoDoObrigado("es", { cookie: "br" }), "la");
  assert.equal(mercadoDoObrigado("es-es", {}), "es");
  assert.equal(mercadoDoObrigado("pt-pt"), "pt");
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

test("PurchaseTracking: moeda do plano; valor da URL só na mesma moeda", () => {
  const fonte = ler("components/PurchaseTracking.tsx");
  assert.match(fonte, /currency: moeda/);
  assert.doesNotMatch(fonte, /currency: "BRL"/);
  assert.match(fonte, /const mesmaMoeda = moeda === "BRL" \? !moedaDaUrl \|\| moedaDaUrl === "BRL" : moedaDaUrl === moeda;/);
  assert.match(fonte, /eventID: transacao/);
  assert.doesNotMatch(fonte.replace(/\/\/.*$/gm, ""), /hottok/);
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
  for (const pathname of ["/obrigado-aprovado", "/es/obrigado-aprovado", "/termos", "/estudante", "/baixar", "/sobre", "/mundo"]) {
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

test("/baixar: celular vai para a loja do idioma; computador fica na página", () => {
  const L = I.LOJAS_DO_LOCAL;
  for (const local of LOCAIS) {
    const caminho = caminhoDoBaixar(local);
    assert.equal(destinoDoBaixar(caminho, IPHONE, L), L[local].appStore, caminho);
    assert.equal(destinoDoBaixar(caminho, IPAD, L), L[local].appStore, caminho);
    assert.equal(destinoDoBaixar(caminho, ANDROID, L), L[local].googlePlay, caminho);
    assert.equal(destinoDoBaixar(caminho, MAC, L), null, caminho);
    assert.equal(destinoDoBaixar(caminho, WINDOWS, L), null, caminho);
  }
  assert.deepEqual(LOCAIS.map(caminhoDoBaixar), ["/baixar", "/es/baixar", "/es-es/baixar", "/pt-pt/baixar"]);
  assert.equal(destinoDoBaixar("/vendas", IPHONE, L), null);
  assert.equal(destinoDoBaixar("/baixar/x", IPHONE, L), null);
});

/* ================================= lojas ================================= */

test("links das lojas por idioma: um app só, a vitrine de cada idioma", () => {
  const L = I.LOJAS_DO_LOCAL;
  assert.deepEqual(Object.keys(L).sort(), ["es", "es-es", "pt", "pt-pt"]);
  assert.equal(L.pt.appStore, "https://apps.apple.com/br/app/diariamente-sa%C3%BAde-mental/id6762151251");
  assert.equal(L["pt-pt"].appStore, "https://apps.apple.com/pt/app/diariamente-sa%C3%BAde-mental/id6762151251");
  assert.equal(L.es.appStore, "https://apps.apple.com/mx/app/diariamente-salud-mental/id6762151251");
  assert.equal(L["es-es"].appStore, "https://apps.apple.com/es/app/diariamente-salud-mental/id6762151251");
  assert.equal(L.pt.googlePlay, "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=pt-BR");
  assert.equal(L["pt-pt"].googlePlay, "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=pt-PT");
  assert.equal(L.es.googlePlay, "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=es");
  assert.equal(L["es-es"].googlePlay, "https://play.google.com/store/apps/details?id=club.diariamente.app&hl=es");
  // ATIVOS repassa a fonte única
  assert.deepEqual([I.ATIVOS.pt.links.appStore, I.ATIVOS.pt.links.googlePlay], [L.pt.appStore, L.pt.googlePlay]);
  assert.deepEqual([I.ATIVOS.es.links.appStore, I.ATIVOS.es.links.googlePlay], [L.es.appStore, L.es.googlePlay]);
  // config.ts (JSON-LD do layout e rodapé) repete o pt, igual
  const C = carregarTs(arq("config.ts"), { "@/config/pricing": P });
  assert.deepEqual({ ...C.LOJAS }, { ...L.pt });
});

test("nenhum link antigo da App Store (o que dava 301) sobrou no código", () => {
  for (const rel of ["config.ts", "lib/i18n.ts", "components/StoreBadges.tsx", "components/Rodape.tsx", "components/PosPagamento.tsx", "middleware.ts"]) {
    assert.doesNotMatch(ler(rel), /apps\.apple\.com\/br\/app\/diariamente\/id/, rel);
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

test("copy: os quatro locais, com as mesmas chaves", () => {
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
      assert.doesNotMatch(tudo, /[—–]/);
      assert.ok((tudo.match(EMOJI) || []).length <= 1);
    });

    test(`copy ${local} ${pagina}: nenhum texto vazio`, () => {
      for (const k of chaves(TEXTOS[local][pagina])) {
        const v = k.split(".").reduce((o, c) => o[c], TEXTOS[local][pagina]);
        if (Array.isArray(v) && v.length === 0) continue; // formas: vazia fora do Brasil
        assert.ok(textoPlano(v).trim(), `${k} vazio`);
      }
    });
  }
}

test("copy: assinatura da marca e a ponte do WhatsApp sem garantia de entrega", () => {
  for (const local of LOCAIS) {
    const frase = local.startsWith("es") ? "Vuelve mañana." : "Volte amanhã.";
    for (const pagina of PAGINAS) assert.equal(TEXTOS[local][pagina].frase, frase, `${local} ${pagina}`);
    // o WhatsApp depende de um número válido no pagamento: a copy diz "se"
    assert.match(TEXTOS[local].aprovado.whatsapp.texto, /^Si |^Se /);
    // e não diz em que idioma ele chega
    assert.doesNotMatch(textoPlano(TEXTOS[local]), /em português|en portugués|em espanhol|en español/i);
  }
});

test("copy: o chip usa o rótulo EXATO do botão do app no idioma da interface (Portugal vê pt-BR)", () => {
  assert.equal(BOTAO_DO_APP.pt, "Primeiro acesso? Ativar conta");
  assert.equal(BOTAO_DO_APP.es, "¿Primer acceso? Activar cuenta");
  for (const local of LOCAIS) {
    const rotulo = BOTAO_DO_APP[IDIOMA_DO_APP[local]];
    const t = TEXTOS[local];
    for (const rico of [t.aprovado.senha.passos[0], t["aguardando-pagamento"].app.texto, t["aguardando-analise"].app.texto, t.baixar.primeiroAcesso]) {
      assert.ok(rico.some((p) => p && p.b === rotulo), `${local}: ${textoPlano(rico)}`);
    }
  }
});

test("copy: Pix e boleto só no Brasil; a trilha tem 3 marcos em todo status", () => {
  assert.deepEqual(TEXTOS.pt["aguardando-pagamento"].concluir.formas.map((f) => f.id), ["pix", "boleto"]);
  for (const local of ["es", "es-es", "pt-pt"]) {
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

test("aguardando pagamento: Pix e boleto só no Brasil; outra forma, só a linha geral", () => {
  const br = TEXTOS.pt["aguardando-pagamento"].concluir.formas;
  assert.deepEqual(orientacaoDoPagamento(br, null), { formas: ["pix", "boleto"], linha: "instrucoes" });
  assert.deepEqual(orientacaoDoPagamento(br, "pix"), { formas: ["pix"], linha: "instrucoes" });
  assert.deepEqual(orientacaoDoPagamento(br, "boleto"), { formas: ["boleto"], linha: "instrucoes" });
  assert.deepEqual(orientacaoDoPagamento(br, "outra"), { formas: [], linha: "instrucoesSoEmail" });
  for (const forma of [null, "pix", "boleto"]) assert.deepEqual(orientacaoDoPagamento([], forma), { formas: [], linha: "instrucoesGeral" });
  assert.deepEqual(orientacaoDoPagamento([], "outra"), { formas: [], linha: "instrucoesSoEmail" });
  for (const local of LOCAIS) {
    const c = TEXTOS[local]["aguardando-pagamento"].concluir;
    // a linha da "outra forma" não fala de Pix nem de boleto e não diz "também"
    assert.doesNotMatch(c.instrucoesSoEmail, /pix|boleto|também|también/i, local);
    assert.match(c.instrucoesSoEmail, /Hotmart/, local);
  }
});

test("aguardando pagamento e em análise: sem prazo inventado", () => {
  for (const local of LOCAIS) {
    for (const estado of ["aguardando-pagamento", "aguardando-analise"]) {
      const tudo = textoPlano(TEXTOS[local][estado]);
      assert.doesNotMatch(tudo, /\d+\s*(dia|día|hora|minuto)/i, `${local} ${estado}`);
      assert.doesNotMatch(tudo, /úteis|hábiles|instantes/i, `${local} ${estado}`);
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

/* ============================ página no servidor ============================ */

async function renderizarPagina(estado, local, busca = {}, { cookie, ua = IPHONE } = {}) {
  const jsx = require("react/jsx-runtime");
  const React = require("react");
  const Shell = () => null;
  const Tracking = () => null;
  const { PaginaObrigado } = carregarTs(arq("components", "PaginaObrigado.tsx"), {
    react: React,
    "react/jsx-runtime": jsx,
    "next/headers": {
      headers: async () => new Map([["user-agent", ua]]),
      cookies: async () => ({ get: (n) => (n === "dm_mercado" && cookie ? { value: cookie } : undefined) }),
    },
    "@/config": { SITE: { dominio: "https://www.diariamente.app" } },
    "@/components/ObrigadoShell": { ObrigadoShell: Shell },
    "@/components/PurchaseTracking": { PurchaseTracking: Tracking },
    "@/components/PosPagamento": { textosDo: (l) => TEXTOS[l] },
    "@/lib/mercado": M,
    "@/lib/obrigado.mjs": O,
    "@/lib/pos-pagamento": PP,
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

test("Purchase só na aprovada, com a moeda e o valor do mercado do pedido", async () => {
  for (const local of LOCAIS) {
    for (const estado of ESTADOS) {
      const r = await renderizarPagina(estado, local, { transaction: "HP1" });
      assert.ok(r.shell, `${local} ${estado}`);
      assert.equal(Boolean(r.tracking), estado === "aprovado", `${local} ${estado}`);
    }
  }
  const usd = await renderizarPagina("aprovado", "es", { off: "uevhmhy2" });
  assert.deepEqual(usd.tracking.props, { moeda: "USD", valor: P.precoFinal("la") });
  const eur = await renderizarPagina("aprovado", "pt-pt", {});
  assert.deepEqual(eur.tracking.props, { moeda: "EUR", valor: P.precoFinal("pt") });
  const mundo = await renderizarPagina("aprovado", "pt", {}, { cookie: "rw" });
  assert.deepEqual(mundo.tracking.props, { moeda: "USD", valor: P.precoFinal("rw") });
  const br = await renderizarPagina("aprovado", "pt", { off: "fhrttdh8" });
  assert.deepEqual(br.tracking.props, { moeda: "BRL", valor: P.MERCADOS.br.anual });
});

test("a página entrega local, aparelho e forma ao shell, e registra só os nomes dos parâmetros", async () => {
  const r = await renderizarPagina("aguardando-pagamento", "pt", { payment_type: "PIX", email: "ana@exemplo.com" }, { ua: ANDROID });
  assert.deepEqual(r.shell.props, { estado: "aguardando-pagamento", local: "pt", aparelho: "android", forma: "pix" });
  assert.deepEqual(r.linhas, ["[obrigado] aguardando-pagamento pt parametros=email,payment_type"]);
  const c = await renderizarPagina("aprovado", "es-es", {}, { ua: MAC });
  assert.equal(c.shell.props.aparelho, "computador");
});

/* ================================= rotas ================================= */

test("as 12 páginas de obrigado e os 4 /baixar existem, dinâmicos, com o status e o local do caminho", () => {
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
    const rel = `app${caminhoDoBaixar(local)}/page.tsx`;
    assert.ok(existsSync(arq(rel)), rel);
    assert.match(ler(rel), new RegExp(`metadataDoBaixar\\("${local}"\\)`), rel);
    assert.match(ler(rel), new RegExp(`<BaixarApp local="${local}" />`), rel);
  }
  // o /obrigado antigo continua levando para a aprovada com os parâmetros
  assert.match(ler("app/obrigado/page.tsx"), /redirect\(comParametros\("\/obrigado-aprovado", searchParams\)\)/);
});

test("noindex, nofollow e canonical para si; fora do sitemap", () => {
  const pagina = ler("components/PaginaObrigado.tsx");
  const baixar = ler("components/BaixarApp.tsx");
  for (const fonte of [pagina, baixar]) {
    assert.match(fonte, /robots: \{ index: false, follow: false, nocache: true, googleBot: \{ index: false, follow: false \} \}/);
    assert.match(fonte, /alternates: \{ canonical: proprio \}/);
  }
  // o sitemap nasce de lib/rotas.ts: nada de obrigado nem baixar lá
  assert.doesNotMatch(ler("lib/rotas.ts"), /obrigado|baixar/);
});

test("QR codes: um SVG por local, em public/qr, apontando para o /baixar do idioma", () => {
  for (const local of LOCAIS) {
    const rel = `public/qr/baixar-${local}.svg`;
    assert.ok(existsSync(arq(rel)), rel);
    const svg = ler(rel);
    assert.match(svg, /^<\?xml[^>]*\?><!DOCTYPE svg[^>]*><svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 (\d+) \1"/, rel);
  }
  assert.match(ler("components/PosPagamento.tsx"), /return `\/qr\/baixar-\$\{local\}\.svg`;/);
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

test("versão web: os locais em espanhol abrem o app com ?lang=es", () => {
  const comum = ler("components/PosPagamento.tsx");
  assert.match(comum, /return IDIOMA_DO_APP\[local\] === "es" \? `\$\{SITE\.appUrl\}\/\?lang=es` : SITE\.appUrl;/);
  assert.deepEqual(IDIOMA_DO_APP, { pt: "pt", es: "es", "es-es": "es", "pt-pt": "pt" });
});
