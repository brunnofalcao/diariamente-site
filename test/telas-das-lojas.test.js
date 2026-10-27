// As telas do site de vendas e da /estudante são as artes das lojas (App
// Store, iPhone 6,9"), em português e em espanhol (decisão do dono,
// 27/10/2026: "Já temos as telas das lojas. Coloque-as no site de vendas").
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const jsx = require("react/jsx-runtime");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { carregarTs } = require("../scripts/carregar-ts");

const raiz = path.join(__dirname, "..");
const I = carregarTs(path.join(raiz, "lib", "i18n.ts"));
const TELAS = ["hoje", "dias", "acoes", "ritmo", "leitura"];

/** Largura e altura de um JPEG (marcador SOF). */
function tamanhoDoJpeg(buf) {
  assert.equal(buf[0], 0xff);
  assert.equal(buf[1], 0xd8);
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marca = buf[i + 1];
    const tam = buf.readUInt16BE(i + 2);
    if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) {
      return { altura: buf.readUInt16BE(i + 5), largura: buf.readUInt16BE(i + 7) };
    }
    i += 2 + tam;
  }
  throw new Error("JPEG sem SOF");
}

/** Largura e altura de um WebP (VP8, VP8L ou VP8X). */
function tamanhoDoWebp(buf) {
  assert.equal(buf.toString("ascii", 0, 4), "RIFF");
  assert.equal(buf.toString("ascii", 8, 12), "WEBP");
  const tipo = buf.toString("ascii", 12, 16);
  if (tipo === "VP8 ") return { largura: buf.readUInt16LE(26) & 0x3fff, altura: buf.readUInt16LE(28) & 0x3fff };
  if (tipo === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { largura: (b & 0x3fff) + 1, altura: ((b >> 14) & 0x3fff) + 1 };
  }
  if (tipo === "VP8X") return { largura: buf.readUIntLE(24, 3) + 1, altura: buf.readUIntLE(27, 3) + 1 };
  throw new Error("WebP desconhecido: " + tipo);
}

const alturaEsperada = (w) => Math.round((w * I.TELA_PROPORCAO.altura) / I.TELA_PROPORCAO.largura);

test("as cinco telas existem em pt e es: WebP nas três larguras e JPEG de reserva, na proporção das artes", () => {
  assert.deepEqual([I.TELA_PROPORCAO.largura, I.TELA_PROPORCAO.altura], [1320, 2868]);
  assert.deepEqual([...I.TELA_LARGURAS], [360, 560, 840]);
  assert.equal(I.TELA_FALLBACK, 560);
  for (const lang of ["pt", "es"]) {
    for (const tela of TELAS) {
      for (const w of I.TELA_LARGURAS) {
        const arquivo = path.join(raiz, "public", "telas", lang, `${tela}-${w}.webp`);
        assert.ok(fs.existsSync(arquivo), arquivo);
        const t = tamanhoDoWebp(fs.readFileSync(arquivo));
        assert.equal(t.largura, w, arquivo);
        assert.ok(Math.abs(t.altura - alturaEsperada(w)) <= 1, `${arquivo}: ${t.altura}`);
        // meta do web designer: até ~80 KB na de 560
        const limite = w === 560 ? 80 : w === 840 ? 120 : 50;
        assert.ok(fs.statSync(arquivo).size <= limite * 1024, `${arquivo} pesado demais`);
      }
      const jpg = path.join(raiz, "public", "telas", lang, `${tela}-${I.TELA_FALLBACK}.jpg`);
      assert.ok(fs.existsSync(jpg), jpg);
      const t = tamanhoDoJpeg(fs.readFileSync(jpg));
      assert.equal(t.largura, I.TELA_FALLBACK, jpg);
      assert.ok(Math.abs(t.altura - alturaEsperada(I.TELA_FALLBACK)) <= 1, `${jpg}: ${t.altura}`);
      assert.ok(fs.statSync(jpg).size <= 90 * 1024, `${jpg} pesado demais`);
    }
  }
  // Só o que o site usa: nada de PNG original nem largura antiga.
  for (const lang of ["pt", "es"]) {
    const sobra = fs.readdirSync(path.join(raiz, "public", "telas", lang)).filter((f) => {
      const m = f.match(/^([a-z]+)-(\d+)\.(webp|jpg)$/);
      if (!m || !TELAS.includes(m[1])) return true;
      return m[3] === "webp" ? !I.TELA_LARGURAS.includes(Number(m[2])) : Number(m[2]) !== I.TELA_FALLBACK;
    });
    assert.deepEqual(sobra, [], `public/telas/${lang}`);
  }
});

test("o site em português usa as telas pt e o espanhol, as telas es (sem os mockups antigos do Cloudinary)", () => {
  for (const lang of ["pt", "es"]) {
    for (const tela of TELAS) assert.equal(I.ATIVOS[lang].img[tela], `/telas/${lang}/${tela}`, `${lang} ${tela}`);
  }
  // Nenhum mockup antigo no código, nem na /estudante em standby
  // (pedido do dono em 27/10/2026: atualizar todas as telas do app).
  for (const f of [["lib", "i18n.ts"], ["components", "Home.tsx"], ["app", "estudante", "page.tsx"], ["config.ts"]]) {
    const fonte = fs.readFileSync(path.join(raiz, ...f), "utf8");
    assert.equal(/Tela_(HOJE|DIAS|ACOES|RITMO)_Diariamente_[a-z0-9]+\.png/.test(fonte), false, f.join("/"));
    assert.equal(/SCREENSHOTS\./.test(fonte), false, f.join("/"));
  }
  const config = fs.readFileSync(path.join(raiz, "config.ts"), "utf8");
  assert.equal(/SCREENSHOTS/.test(config.replace(/\/\/.*$/gm, "")), false);
  assert.equal(/telaHoje/.test(config), false, "sem ESTUDANTE_ATUAL.telaHoje");
  assert.equal(fs.existsSync(path.join(raiz, "components", "estudante-atual", "TelaHojeAtual.tsx")), false);
  const fonte = fs.readFileSync(path.join(raiz, "lib", "i18n.ts"), "utf8");
  assert.equal(/\[TROCAR\] prints com a interface em espanhol/.test(fonte), false);
});

test("texto alternativo: a legenda da arte e o texto da loja, em pt-BR, pt-PT e es, sem travessão", () => {
  const pt = I.dicionario("pt", "br");
  const ptPt = I.dicionario("pt", "pt");
  const es = I.dicionario("es", "la");
  const esEs = I.dicionario("es", "es");
  assert.equal(pt.t1alt, "Saúde mental todo dia. Três minutos para ler, refletir e agir. Tela Hoje do Diariamente com a data, o anel Seu dia e a provocação do dia.");
  assert.match(pt.t2alt, /^Seu ano em leituras\. .*Calendário Dias com os dias lidos, recuperados e os favoritos\.$/);
  // pt: Ações é a arte 03 (Sua vez); es: a 08 (Centro de acciones).
  assert.match(pt.t3alt, /^Da reflexão à ação\. .*Cartão Sua vez com uma ação escrita/);
  assert.match(pt.t4alt, /^Constância sem culpa\. .*Tela Ritmo com voltas acumuladas/);
  assert.match(pt.finAlt, /^Uma provocação por dia\. .*Leitura em modo foco/);
  assert.equal(es.t1alt, "Salud mental cada día. Tres minutos para leer, reflexionar y actuar. Pantalla Hoy de Diariamente con la fecha, el anillo Tu día y la provocación del día.");
  assert.match(es.t3alt, /^De la decisión al hecho\. .*Centro de acciones con las acciones pendientes, las hechas y los recordatorios\.$/);
  assert.match(es.finAlt, /^Una provocación al día\. .*Lectura en modo enfoque/);
  assert.equal(esEs.t1alt, es.t1alt);
  assert.match(ptPt.t1alt, /Ecrã Hoje/);
  assert.match(ptPt.t4alt, /Ecrã Ritmo/);
  for (const d of [pt, ptPt, es]) {
    for (const k of ["t1alt", "t2alt", "t3alt", "t4alt", "finAlt"]) {
      assert.ok(d[k] && d[k].length > 40 && d[k].length < 250, k);
      assert.equal(/[\u2013\u2014]/.test(d[k]), false, k);
      assert.equal(/\bcompr(a|ar)\b/i.test(d[k]), false, k);
      if (d === ptPt) assert.equal(/\btela\b/i.test(d[k]), false, `pt-PT diz ecrã: ${k}`);
    }
  }
  for (const k of ["t1alt", "t2alt", "t3alt", "t4alt", "finAlt"]) {
    assert.equal(/\b(Tela|Calendário|Cartão|Leitura)\b/.test(es[k]), false, `es em espanhol: ${k}`);
  }
});

function telaDaLoja() {
  return carregarTs(path.join(raiz, "components", "TelaDaLoja.tsx"), {
    "@/lib/i18n": I, "react/jsx-runtime": jsx,
  }, { jsx: true });
}

test("TelaDaLoja: <picture> com WebP do próprio domínio, JPEG de reserva, espaço reservado e lazy fora da primeira dobra", () => {
  const { TelaDaLoja } = telaDaLoja();
  const h = renderToStaticMarkup(React.createElement(TelaDaLoja, { base: "/telas/es/hoje", alt: "Pantalla Hoy", sizes: "240px" }));
  assert.match(h, /^<picture/);
  assert.match(h, /<source type="image\/webp" srcSet="\/telas\/es\/hoje-360\.webp 360w, \/telas\/es\/hoje-560\.webp 560w, \/telas\/es\/hoje-840\.webp 840w" sizes="240px"\/>/);
  assert.match(h, /<img src="\/telas\/es\/hoje-560\.jpg" alt="Pantalla Hoy" width="1320" height="2868" loading="lazy" decoding="async"/);
  assert.match(h, /aspect-ratio:1320 \/ 2868/);
  assert.match(h, /border-radius:16px/);
  assert.equal(/fetchpriority|cloudinary/i.test(h), false);
  const p = renderToStaticMarkup(React.createElement(TelaDaLoja, { base: "/telas/pt/hoje", alt: "x", sizes: "300px", prioridade: true }));
  assert.match(p, /loading="eager" fetchPriority="high"/);
});

test("Home: as quatro telas do tour e a do fim da página são artes das lojas, com o texto alternativo do idioma", () => {
  const fonte = fs.readFileSync(path.join(raiz, "components", "Home.tsx"), "utf8");
  assert.match(fonte, /import \{ TelaDaLoja, RAIO_DA_TELA \} from "@\/components\/TelaDaLoja"/);
  // O "Hoje" do tour ("a provocação do dia, limpa") é a arte da leitura em
  // modo foco; a arte Hoje, com o painel do dia, fica no fim da página.
  assert.match(fonte, /\[IMG\.leitura, t\.t1t, t\.t1d, t\.finAlt\], \[IMG\.dias, t\.t2t, t\.t2d, t\.t2alt\], \[IMG\.acoes, t\.t3t, t\.t3d, t\.t3alt\], \[IMG\.ritmo, t\.t4t, t\.t4d, t\.t4alt\]/);
  // colunas de 260px no computador: a grade na largura da página
  assert.match(fonte, /<TelaDaLoja base=\{src\} alt=\{alt\} sizes="\(min-width:900px\) 260px, \(min-width:375px\) 240px, 64vw" \/>/);
  assert.match(fonte, /\[data-tour\]\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\);gap:24px;overflow:visible;padding:0;margin:0\}/);
  assert.equal(/\[data-tour\][^}]*max-width/.test(fonte), false, "a grade do tour não fica recuada");
  assert.match(fonte, /<TelaDaLoja base=\{IMG\.hoje\} alt=\{t\.t1alt\}/);
  // o corte do fim cai no vão entre o aviso "Semana passada" e o cartão da semana (y 1662 a 1686 de 2868)
  assert.match(fonte, /paddingTop: `\$\{\(58\.4 \* TELA_PROPORCAO\.altura\) \/ TELA_PROPORCAO\.largura\}%`/);
  const corte = 0.584 * 2868;
  assert.ok(corte > 1662 && corte < 1686, String(corte));
  // nenhuma tela com prioridade na Home: todas estão abaixo da primeira dobra
  assert.equal(/<TelaDaLoja[^>]*prioridade/.test(fonte), false);
  assert.equal(/function Tela\(/.test(fonte), false);
});

test("/estudante: a arte Hoje em português, com prioridade (primeira dobra) e sem a moldura antiga, nos dois estados da chave", () => {
  const fonte = fs.readFileSync(path.join(raiz, "app", "estudante", "page.tsx"), "utf8");
  assert.match(fonte, /const telaHoje = ATIVOS\.pt\.img\.hoje;/);
  assert.match(fonte, /<TelaDaLoja\s+base=\{telaHoje\}\s+alt=\{altTelaHoje\}\s+sizes="\(min-width: 1024px\) 300px, \(min-width: 400px\) 280px, 70vw"\s+prioridade\s+\/>/);
  // Um hero só, sem ramo de standby: a .ed-phone, sem moldura.
  assert.match(fonte, /<div className="ed-phone">/);
  assert.equal(/TelaHojeAtual|ed-phone-moldura/.test(fonte), false);
  assert.equal(/className=\{ATUAL[^}]*ed-phone/.test(fonte), false);
  const css = fs.readFileSync(path.join(raiz, "app", "estudante", "estudante.css"), "utf8");
  assert.equal(/\.ed-phone-shot|ed-phone-moldura/.test(css), false);
  // 280px no celular, 300px no computador, sem borda, recuo nem sombra
  // (os cantos e o filete vêm do TelaDaLoja)
  const regra = css.match(/\n\.ed-phone \{[^}]*\}/)[0];
  assert.match(regra, /width: min\(280px, 70vw\)/);
  assert.equal(/border|padding|box-shadow/.test(regra), false, regra);
  assert.match(css, /@media \(min-width: 1024px\) \{ \.ed-phone \{ width: 300px; \} \}/);
  // nenhuma proporção do mockup antigo (1170 x 2532)
  assert.equal(/aspect-ratio:\s*1170\s*\/\s*2532/.test(css), false);
  // a pílula: numa linha em tela estreita, limitada pela tela
  assert.match(css, /\.ed-phone-tag \{\s*white-space: normal; text-align: center; width: max-content; max-width: calc\(100vw - 40px\);/);
});

/* ----------------------------- foto da manhã ------------------------------ */
// Decisão do dono, 27/10/2026: "Precisamos trocar essa foto por outra que faça
// sentido". Saiu a foto do caderno (Cloudinary); entrou a mão com o celular e a
// provocação do dia aberta no app, uma versão por idioma (só a tela muda).

const FOTOS = ["pt", "es"].flatMap((lang) => [
  ...[600, 900, 1200].map((w) => `manha-${lang}-${w}.webp`),
  `manha-${lang}-900.jpg`,
]);

test("foto da manhã: WebP nas três larguras e JPEG de reserva, em pt e es, no quadro 4:5 e leves", () => {
  assert.deepEqual([...I.FOTO_LARGURAS], [600, 900, 1200]);
  assert.equal(I.FOTO_FALLBACK, 900);
  assert.deepEqual([I.FOTO_PROPORCAO.largura, I.FOTO_PROPORCAO.altura], [1200, 1500]);
  const altura = (w) => Math.round((w * I.FOTO_PROPORCAO.altura) / I.FOTO_PROPORCAO.largura);
  for (const lang of ["pt", "es"]) {
    assert.equal(I.ATIVOS[lang].img.manha, `/fotos/manha-${lang}`);
    for (const w of I.FOTO_LARGURAS) {
      const arquivo = path.join(raiz, "public", "fotos", `manha-${lang}-${w}.webp`);
      assert.ok(fs.existsSync(arquivo), arquivo);
      const t = tamanhoDoWebp(fs.readFileSync(arquivo));
      assert.deepEqual([t.largura, t.altura], [w, altura(w)], arquivo);
      const limite = w === 1200 ? 130 : w === 900 ? 90 : 50;
      assert.ok(fs.statSync(arquivo).size <= limite * 1024, `${arquivo} pesado demais`);
    }
    const jpg = path.join(raiz, "public", "fotos", `manha-${lang}-${I.FOTO_FALLBACK}.jpg`);
    assert.ok(fs.existsSync(jpg), jpg);
    const t = tamanhoDoJpeg(fs.readFileSync(jpg));
    assert.deepEqual([t.largura, t.altura], [I.FOTO_FALLBACK, altura(I.FOTO_FALLBACK)], jpg);
    assert.ok(fs.statSync(jpg).size <= 110 * 1024, `${jpg} pesado demais`);
  }
  // só o que o site usa: nada de PNG original
  assert.deepEqual(fs.readdirSync(path.join(raiz, "public", "fotos")).sort(), [...FOTOS].sort());
});

test("foto da manhã: sem a foto antiga do Cloudinary e com o texto alternativo da cena nova, sem travessão", () => {
  for (const f of [["lib", "i18n.ts"], ["components", "Home.tsx"]]) {
    // o código, sem os comentários (o de lib/i18n.ts conta a troca)
    const fonte = fs.readFileSync(path.join(raiz, ...f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.equal(/Lifestyle_Diariamente|lifestyle/i.test(fonte), false, f.join("/"));
  }
  const pt = I.dicionario("pt", "br");
  const ptPt = I.dicionario("pt", "pt");
  const es = I.dicionario("es", "la");
  const esEs = I.dicionario("es", "es");
  assert.equal(pt.photoAlt, "Uma mão segura o celular com a provocação do dia aberta no Diariamente, ao lado de uma xícara de café, na luz da manhã.");
  assert.equal(ptPt.photoAlt, "Uma mão segura o telemóvel com a provocação do dia aberta no Diariamente, ao lado de uma chávena de café, à luz da manhã.");
  assert.equal(es.photoAlt, "Una mano sostiene un teléfono con la provocación del día abierta en Diariamente, junto a una taza de café, con la luz de la mañana.");
  assert.equal(esEs.photoAlt, es.photoAlt);
  assert.equal(I.dicionario("pt", "rw").photoAlt, pt.photoAlt);
  for (const d of [pt, ptPt, es]) {
    assert.equal(/[–—]/.test(d.photoAlt), false, d.photoAlt);
    assert.equal(/\bcompr(a|ar)\b|caderno|cuaderno/i.test(d.photoAlt), false, d.photoAlt);
  }
});
