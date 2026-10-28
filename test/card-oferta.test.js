// Card de oferta do Brasil (pedido do dono, 27/10/2026: "o card de venda,
// de oferta, ele pode ser melhor trabalhado, essa copy"), renderizado de
// verdade (react-dom/server) com os componentes e o config reais:
//   - cada linha do card no lançamento, na ordem e com a conta certa;
//   - o card depois de 16/11 (sem riscado, quadro nem selo);
//   - os outros mercados (la, es, pt, rw) com o card de sempre, sem
//     mudança de texto;
//   - barra fixa e CTA final;
//   - a /estudante com o mesmo texto de antes;
//   - nenhuma palavra vetada no HTML da vitrine.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const jsx = require("react/jsx-runtime");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { carregarTs } = require("../scripts/carregar-ts");

const raiz = path.join(__dirname, "..");
const arq = (...p) => path.join(raiz, ...p);
const P = carregarTs(arq("config", "pricing.ts"));
const M = carregarTs(arq("lib", "mercado.ts"));
const R = carregarTs(arq("lib", "rotas.ts"));
const I = carregarTs(arq("lib", "i18n.ts"));

const LANCAMENTO = Date.parse("2026-10-20T12:00:00-03:00");
const ULTIMO_MINUTO = Date.parse("2026-11-16T23:59:00-03:00");
const DEPOIS = Date.parse("2026-11-17T00:00:00-03:00");

/** Sem o espaço que não quebra e sem os marcadores de texto do React. */
const limpo = (h) => h.replace(/\u00a0/g, " ").replace(/<!-- -->/g, "");
/** Só o texto, como a pessoa (e o leitor de tela) lê. */
const texto = (h) => limpo(h).replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** config.ts carregado com DM_ESTUDANTE_ABERTO como o build gravaria. */
function config(aberto) {
  const antes = process.env.DM_ESTUDANTE_ABERTO;
  if (aberto) process.env.DM_ESTUDANTE_ABERTO = "1";
  else delete process.env.DM_ESTUDANTE_ABERTO;
  try {
    return carregarTs(arq("config.ts"), { "@/config/pricing": P });
  } finally {
    if (antes === undefined) delete process.env.DM_ESTUDANTE_ABERTO;
    else process.env.DM_ESTUDANTE_ABERTO = antes;
  }
}

function componentes(aberto = false) {
  const C = config(aberto);
  const medicao = { registrarInicioDeCheckout() {} };
  const Seletor = carregarTs(arq("components", "SeletorMercado.tsx"), { "@/lib/mercado": M, "react/jsx-runtime": jsx }, { jsx: true });
  const Bloco = carregarTs(arq("components", "BlocoOferta.tsx"), {
    "@/config": C, "@/config/pricing": P, "@/lib/rotas": R, "@/lib/medicao": medicao,
    "@/components/ListaEsperaForm": { ListaEsperaForm: (p) => React.createElement("form", { "data-lista": p.mercado }) },
    "react/jsx-runtime": jsx,
  }, { jsx: true });
  const { Home } = carregarTs(arq("components", "Home.tsx"), {
    react: React, "react/jsx-runtime": jsx, "@/lib/i18n": I, "@/lib/rotas": R, "@/config": C,
    "@/lib/medicao": medicao, "@/components/CnpjsDoGrupo": { RodapeDoGrupo: () => null },
    "@/components/BlocoOferta": Bloco, "@/components/TelaDaLoja": { TelaDaLoja: () => null, RAIO_DA_TELA: 40 },
    "@/components/SeletorMercado": Seletor, "@/lib/mercado": M, "@/config/pricing": P,
  }, { jsx: true });
  return {
    C,
    bloco: (mercado, momento = LANCAMENTO, props = {}) =>
      limpo(renderToStaticMarkup(React.createElement(Bloco.BlocoOferta, { mercado, momento, vitrine: true, ...props }))),
    home: (mercado, momento = LANCAMENTO) =>
      limpo(renderToStaticMarkup(React.createElement(Home, { lang: P.MERCADOS[mercado].idioma, mercado, momento, vitrine: true }))),
  };
}

/** Confere que os trechos aparecem no HTML, nesta ordem. */
function emOrdem(h, trechos, rotulo) {
  let desde = 0;
  for (const t of trechos) {
    const i = h.indexOf(t, desde);
    assert.ok(i >= 0, `${rotulo}: "${t}" fora de ordem ou ausente`);
    desde = i + t.length;
  }
}

/* ------------------------------ no lançamento ------------------------------ */

test("card do Brasil no lançamento: cada linha da especificação, na ordem, com a conta de config/pricing.ts", () => {
  for (const aberto of [false, true]) {
    const { bloco } = componentes(aberto);
    for (const momento of [LANCAMENTO, ULTIMO_MINUTO]) {
      const h = bloco("br", momento);
      const rotulo = `aberto=${aberto} ${new Date(momento).toISOString()}`;
      emOrdem(h, [
        // cabeçalho sem "por um ano", e o selo
        '<span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#27BDBE">Seu Diariamente</span>',
        ">33% OFF</span>",
        // âncora: o rótulo não riscado, só o valor
        "Preço oficial: <s",
        ">R$ 149,90 por ano</s>",
        // manchete anual
        ">R$ 99,98</span>",
        ">por ano</span>",
        // regra
        '<strong style="color:#fff;font-weight:600">33% a menos</strong>, travado nos 3 primeiros anos. Depois, R$ 149,90 por ano.',
        // valor por mês e por dia
        'Equivale a <strong style="color:#fff;font-weight:600">R$ 8,33</strong> por mês. Por dia, cerca de <strong style="color:#fff;font-weight:600">R$ 0,27</strong> e três minutos.',
        // quadro (lista de definição)
        "<dl",
        '<dt style="color:#AAB2B2;text-wrap:balance">3 anos no preço oficial</dt><dd style="margin:0;color:#8A9494;white-space:nowrap">R$ 449,70</dd>',
        '<dt style="color:#AAB2B2;text-wrap:balance">3 anos no lançamento</dt><dd style="margin:0;color:#fff;font-weight:600;white-space:nowrap">R$ 299,94</dd>',
        '<dt style="color:#fff;text-wrap:balance">Em 3 anos, você deixa de pagar</dt><dd style="margin:0;color:#27BDBE;font-weight:700;white-space:nowrap">R$ 149,76</dd>',
        "</dl>",
        ">Quase o preço oficial de um ano inteiro.</p>",
        // prazo, com o à vista, logo acima do botão
        '<span>Preço de lançamento, à vista, para quem assinar até <span style="white-space:nowrap">16 de novembro</span>.</span></p><a href="https://pay.hotmart.com/K105072021O?off=lf63bgdd"',
        ">Começar meu ano</a>",
        ">Renova a cada ano. Cancele quando quiser.</p>",
        ...(aberto ? [">Sou estudante: R$ 7,49/mês · R$ 89,90 por ano · cobrança anual</a>"] : []),
        // confiança: a garantia em branco, a linha de destaque
        '<li style="display:flex;gap:10px;align-items:center;color:#fff">',
        "Garantia incondicional de 7 dias. Decida com o app na mão.</li>",
        "Pagamento seguro via Hotmart · Pix ou cartão</li>",
        "iPhone e Android, o mesmo acesso nos dois</li>",
      ], rotulo);
      // o quadro e o prazo nos estilos da especificação
      assert.match(h, /<div style="margin-top:16px;padding:14px;border-radius:12px;background:rgba\(39,189,190,\.07\);border:1px solid rgba\(39,189,190,\.2\)"><dl style="[^"]*font-variant-numeric:tabular-nums">/, rotulo);
      assert.match(h, /<p style="display:flex;align-items:flex-start;gap:8px;margin:16px 0 0;font-size:13.5px;line-height:1.45;color:#F5B731;text-wrap:pretty"><svg [^>]*stroke="#F5B731"/, rotulo);
      assert.match(h, /height:54px;margin-top:18px;width:100%/, rotulo);
      // um botão só, um riscado só (o R$ 449,70 não é riscado), nenhuma pílula
      assert.equal((h.match(/<a /g) || []).length, aberto ? 2 : 1, rotulo);
      assert.equal((h.match(/href="https:\/\/pay\.hotmart\.com/g) || []).length, 1, rotulo);
      assert.equal((h.match(/<s[ >]/g) || []).length, 1, rotulo);
      assert.equal(/<s[^>]*>[^<]*449,70/.test(h), false, rotulo);
      // saíram do card do Brasil: a frase de proposta, a pílula, o mensal na manchete
      assert.equal(h.includes(P.MERCADOS.br.textos.proposta), false, rotulo);
      assert.equal(/Pagamento à vista|no lançamento<\/span>|\/mês<\/span>|só até|por um ano/.test(h), false, rotulo);
      // o teal só no número da economia (e no escudo e no cabeçalho)
      assert.equal((h.match(/color:#27BDBE;font-weight:700/g) || []).length, 1, rotulo);
      // nada de marcador nem asterisco na tela
      assert.equal(/[{}*]/.test(texto(h)), false, rotulo);
    }
  }
});

test("card do Brasil: acessibilidade (rótulo do riscado lido, quadro em lista de definição, contraste AA)", () => {
  const { bloco } = componentes(true);
  const h = bloco("br");
  // "Preço oficial:" fica FORA do <s> (o leitor de tela anuncia o rótulo)
  assert.match(h, />Preço oficial: <s [^>]*>R\$ 149,90 por ano<\/s>/);
  // o quadro lido como texto: rótulo e valor em pares <dt>/<dd>
  const dl = h.slice(h.indexOf("<dl"), h.indexOf("</dl>"));
  assert.equal((dl.match(/<dt /g) || []).length, 3);
  assert.equal((dl.match(/<dd /g) || []).length, 3);
  assert.equal(/<p|<span/.test(dl), false, "só dt e dd dentro do dl");
  assert.equal(texto(dl + "</dl>"), "3 anos no preço oficial R$ 449,70 3 anos no lançamento R$ 299,94 Em 3 anos, você deixa de pagar R$ 149,76");
  // ícones decorativos fora do leitor de tela
  for (const svg of h.match(/<svg [^>]*>/g)) assert.match(svg, /aria-hidden="true"/);
  // contraste (WCAG 2.x) de toda cor de texto do card sobre o fundo do
  // card e sobre o fundo do quadro, que é o mais claro dos dois
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mistura = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
  const lum = (c) => {
    const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contraste = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  const fundo = hex("#181D1D");
  const quadro = mistura(hex("#27BDBE"), 0.07, fundo);
  const cores = new Set((h.match(/(?:^|[;"])color:#[0-9A-Fa-f]{3,6}/g) || []).map((x) => x.replace(/^[;"]?color:/, "").toUpperCase()));
  cores.delete("#131918"); // texto do botão, sobre o teal (abaixo)
  assert.ok(cores.size >= 6, [...cores].join(" "));
  for (const c of cores) {
    const cor = hex(c.length === 4 ? "#" + [...c.slice(1)].map((x) => x + x).join("") : c);
    for (const bg of [fundo, quadro]) assert.ok(contraste(cor, bg) >= 4.5, `${c}: ${contraste(cor, bg).toFixed(2)}`);
  }
  assert.ok(contraste(hex("#131918"), hex("#27BDBE")) >= 4.5);
});

test("card do Brasil: a legenda some quando a economia sai da faixa de 95% a menos de 100%", () => {
  const { bloco } = componentes(false);
  const br = P.MERCADOS.br;
  const original = br.lancamento.anual;
  try {
    for (const preco of [99.9, 99.93, 110]) {
      br.lancamento.anual = preco;
      const h = bloco("br");
      assert.equal(/ano inteiro/.test(h), false, String(preco));
      // o quadro continua, com a conta do preço fictício
      assert.match(h, new RegExp(`Em 3 anos, você deixa de pagar</dt><dd [^>]*>${P.formatar("br", P.economiaDoLancamento("br", LANCAMENTO)).replace(/\u00a0/g, " ").replace("$", "\\$")}</dd>`), String(preco));
    }
  } finally {
    br.lancamento.anual = original;
  }
});

/* ------------------------------ depois de 16/11 ------------------------------ */

test("card do Brasil depois de 16/11 (ou desligado): mesmo esqueleto, sem riscado, quadro, selo nem regra", () => {
  for (const aberto of [false, true]) {
    const { bloco } = componentes(aberto);
    const depois = bloco("br", DEPOIS);
    const br = P.MERCADOS.br;
    const ativo = br.lancamento.ativo;
    let desligado;
    try {
      br.lancamento.ativo = false;
      desligado = bloco("br", LANCAMENTO);
    } finally {
      br.lancamento.ativo = ativo;
    }
    for (const h of [depois, desligado]) {
      emOrdem(h, [
        ">Seu Diariamente por um ano</span></div>",
        ">R$ 149,90</span>",
        ">por ano</span>",
        'Equivale a <strong style="color:#fff;font-weight:600">R$ 12,49</strong> por mês. Por dia, cerca de <strong style="color:#fff;font-weight:600">R$ 0,41</strong> e três minutos.',
        '<p style="display:flex;align-items:flex-start;gap:8px;margin:16px 0 0;font-size:13.5px;line-height:1.45;color:#CDD2D2;text-wrap:pretty">',
        "<span>À vista, ou em até 12x no cartão com acréscimo.</span></p>",
        '<a href="https://pay.hotmart.com/K105072021O?off=fhrttdh8"',
        ">Começar meu ano</a>",
        ">Renova a cada ano. Cancele quando quiser.</p>",
        "Garantia incondicional de 7 dias. Decida com o app na mão.</li>",
      ], `aberto=${aberto}`);
      // a manchete é o primeiro elemento do miolo
      assert.match(h, /<div style="padding:clamp\(20px,3vw,28px\)"><div style="display:flex;align-items:baseline;gap:8px;margin-top:0;flex-wrap:wrap">/);
      assert.equal(/<s[ >]|Preço oficial|OFF<|a menos|travado|<dl|deixa de pagar|ano inteiro|Preço de lançamento|16 de novembro|\/mês<\/span>/.test(h), false);
      assert.equal((h.match(/href="https:\/\/pay\.hotmart\.com/g) || []).length, 1);
      // nunca valor de parcela
      assert.equal(/\d+\s*x\s*de\s*R\$/i.test(h), false);
    }
  }
});

/* --------------------------- os outros mercados --------------------------- */

test("la, es, pt e rw: o card de sempre, sem mudança de texto (proposta, manchete mensal, pílula de pagamento)", () => {
  const { bloco } = componentes(true);
  for (const m of ["la", "es", "pt", "rw"]) {
    const o = P.MERCADOS[m];
    const t = o.textos;
    const f = (v) => P.formatar(m, v).replace(/\u00a0/g, " ");
    // o texto inteiro do card de sempre, montado do config
    const esperado = [
      t.titulo, t.proposta, f(P.porMes(m, LANCAMENTO)), t.mes, `${f(o.anual)} ${t.totalSufixo}`, t.pagamento, t.botao,
      o.renovaMesmoValor && t.renovacaoMesmoValor ? t.renovacaoMesmoValor : t.renovacao,
      ...(o.imposto === "fora" && t.impostoNota ? [t.impostoNota] : []),
      ...o.confianca,
    ].join(" ");
    for (const momento of [LANCAMENTO, DEPOIS]) {
      const h = bloco(m, momento);
      assert.equal(texto(h), esperado, `${m} ${momento === LANCAMENTO ? "no lançamento" : "depois"}`);
      // a estrutura de sempre: manchete mensal em serifa, pílula, botão a 22 px
      assert.match(h, /<span style="font-family:var\(--font-serif\);font-size:24px;line-height:1;color:#AAB2B2">\/m[eê]s<\/span>/, m);
      assert.match(h, /min-height:30px;padding:4px 12px;border-radius:999px/, m);
      assert.match(h, /height:54px;margin-top:22px;width:100%/, m);
      assert.equal(/<dl|<s[ >]|Equivale|app na mão|Decida|travado|<li [^>]*color:#fff/.test(h), false, m);
    }
    // nenhum texto do card novo nos textos deles
    for (const k of ["tituloLancamento", "linhaValor", "quadroOficial", "notaLancamento", "notaBarraLancamento", "lancamentoRegra"]) {
      assert.equal(k in t, false, `${m}.${k}`);
    }
  }
});

test("la, es, pt e rw: barra fixa e CTA final como sempre", () => {
  const { home } = componentes(false);
  for (const m of ["la", "es", "pt", "rw"]) {
    const h = home(m);
    const preco = P.formatar(m, P.precoFinal(m, LANCAMENTO)).replace(/\u00a0/g, " ");
    const t = I.dicionario(P.MERCADOS[m].idioma, m);
    assert.ok(h.includes(`>${preco} ${P.MERCADOS[m].textos.nota}</span>`), m);
    assert.ok(h.includes(`>${preco}</div><div style="margin-top:4px;font-size:12px;font-weight:500;color:#8A9494;white-space:nowrap">${t.stickyNote}</div>`), m);
    assert.equal(/por ano durante|para quem assinar/.test(h), false, m);
  }
});

/* ------------------------- barra fixa e CTA final ------------------------- */

test("Brasil: barra fixa \"por ano durante 3 anos\" e CTA final com a condição dos 3 anos, só no lançamento", () => {
  const { home } = componentes(false);
  const h = home("br");
  // barra: preço oficial riscado só para leitor de tela, o de lançamento e a condição
  assert.match(h, /<div data-sticky="1"[\s\S]*?<span style="position:absolute;[^"]*">Preço oficial: <\/span><s [^>]*>R\$ 149,90<\/s>R\$ 99,98<\/div><div [^>]*>por ano durante 3 anos<\/div>[\s\S]*?>Quero meu acesso<\/button>/);
  assert.equal(/1 ano · 7 dias de garantia/.test(h), false);
  // CTA final: nunca "só até" colado aos 3 anos
  assert.match(h, /<s style="text-decoration-thickness:1.5px">R\$ 149,90<\/s> R\$ 99,98 por ano à vista nos 3 primeiros anos, para quem assinar até 16 de novembro · Garantia de 7 dias<\/span>/);
  assert.equal(/só até|por um ano · Garantia/.test(h), false);
  // a data não se parte no fim da linha (espaços que não quebram)
  assert.equal(P.notaDoLancamento("br", LANCAMENTO).includes("16\u00a0de\u00a0novembro"), true);
  // depois de 16/11: as de sempre
  const d = home("br", DEPOIS);
  assert.match(d, /R\$ 149,90<\/div><div [^>]*>1 ano · 7 dias de garantia<\/div>/);
  assert.match(d, />R\$ 149,90 por um ano · Garantia de 7 dias<\/span>/);
  assert.equal(/por ano durante|para quem assinar|<s[ >]/.test(d), false);
});

/* ------------------------------- /estudante ------------------------------- */

function comRelogio(agora, fn) {
  const real = Date.now;
  Date.now = () => agora;
  try {
    return fn();
  } finally {
    Date.now = real;
  }
}

test("/estudante: a regra do lançamento com o texto de antes, sem nada do card novo", () => {
  // o texto que a /estudante mostrava antes do card novo
  assert.equal(P.regraDoLancamento("br", LANCAMENTO, { semPercentual: true }).replace(/\u00a0/g, " "), "nos 3 primeiros anos. Depois, R$ 149,90 por ano.");
  for (const aberto of [true, false]) {
    const C = config(aberto);
    const BlocoPreco = carregarTs(arq("components", "BlocoPreco.tsx"), { "@/config": C, "@/config/pricing": P, "react/jsx-runtime": jsx }, { jsx: true }).BlocoPreco;
    const h = comRelogio(LANCAMENTO, () => limpo(renderToStaticMarkup(React.createElement(BlocoPreco))));
    assert.match(h, /<span class="ed-econ-d">Por ano nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\.<\/span>/);
    assert.equal(/travado|Travado|a menos,|Equivale a|deixa de pagar|Quase o preço oficial|app na mão|\*/.test(h), false);
    const d = comRelogio(DEPOIS, () => limpo(renderToStaticMarkup(React.createElement(BlocoPreco))));
    assert.equal(/primeiros anos/.test(d), false);
  }
});

/* ---------------------------- palavras vetadas ---------------------------- */

test("vitrine: nenhum travessão, \"compra\", \"cashback\", \"grátis\" nem promessa vetada, no lançamento e depois", () => {
  const { home } = componentes(true);
  for (const m of Object.keys(M.VENDAS_DO_MERCADO)) {
    for (const momento of [LANCAMENTO, DEPOIS]) {
      const h = home(m, momento);
      const rotulo = `${M.VENDAS_DO_MERCADO[m]} ${momento === LANCAMENTO ? "no lançamento" : "depois"}`;
      assert.equal(/[\u2013\u2014]/.test(h), false, `${rotulo}: travessão`);
      assert.equal(/\bcompr(a|as|ar|e|ou)\b/i.test(h), false, `${rotulo}: compra`);
      assert.equal(/cashback|grátis|gratis|de graça|pague 2|leve 3|fundador/i.test(h), false, `${rotulo}: promessa vetada`);
      // nenhum marcador de texto escapou para a tela
      assert.equal(/\{(pct|anos|cheio|mes|dia|data|preco)\}/.test(h), false, `${rotulo}: marcador`);
    }
  }
});
