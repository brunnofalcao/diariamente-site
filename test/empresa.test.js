// Decisão do dono (12/10/2026): no que é visível e exposto (rodapé de
// todas as páginas, páginas de venda), só "Diariamente App by Science
// Play". Razão social, CNPJ e endereço só nos Termos e na Política.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");

/** Os únicos arquivos que podem mostrar os dados completos da titular. */
const PERMITIDOS = new Set([
  "components/Titularidade.tsx",
  "app/termos/page.tsx",
  "app/privacidade/page.tsx",
  "app/es/condicionesdeuso/page.tsx",
  "app/es/privacidad/page.tsx",
]);

function arquivos(dir) {
  const fora = [];
  for (const nome of fs.readdirSync(path.join(raiz, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, nome.name);
    if (nome.isDirectory()) fora.push(...arquivos(rel));
    else if (/\.(tsx?|jsx?)$/.test(nome.name)) fora.push(rel);
  }
  return fora;
}

test("razão social, CNPJ e endereço só aparecem nos Termos e na Política", () => {
  const fora = [];
  for (const rel of [...arquivos("app"), ...arquivos("components"), ...arquivos("lib")]) {
    if (PERMITIDOS.has(rel)) continue;
    const texto = fs.readFileSync(path.join(raiz, rel), "utf8");
    if (/EMPRESA\.(razaoSocial|cnpj|endereco)\b|33\.612\.911|SRTVN|Science Play Cursos/i.test(texto)) fora.push(rel);
  }
  assert.deepEqual(fora, []);
});

test("a assinatura visível é \"Diariamente App by Science Play\" e os quatro documentos usam a cláusula de titularidade", () => {
  const config = fs.readFileSync(path.join(raiz, "config.ts"), "utf8");
  assert.match(config, /assinatura:\s*"Diariamente App by Science Play"/);
  assert.match(config, /razaoSocial:\s*"SCIENCE PLAY CURSOS LTDA"/);
  assert.match(config, /cnpj:\s*"33\.612\.911\/0001-29"/);
  for (const rel of [...PERMITIDOS].filter((r) => r.startsWith("app/"))) {
    const texto = fs.readFileSync(path.join(raiz, rel), "utf8");
    assert.match(texto, /<Titularidade lang="(pt|es)" doc="(termos|privacidade)" \/>/, rel);
  }
});

test("a cláusula de titularidade diz o que o dono pediu, sem citar a outra empresa", () => {
  const texto = fs.readFileSync(path.join(raiz, "components", "Titularidade.tsx"), "utf8");
  assert.match(texto, /Hotmart/);
  assert.match(texto, /mesmo grupo econômico/);
  assert.match(texto, /lojas de aplicativos/);
  assert.match(texto, /documento fiscal/);
  assert.match(texto, /não altera a titularidade/);
  assert.match(texto, /no cambia la titularidad/);
  // Nenhum nome empresarial nem CNPJ escrito à mão: só os da titular, que
  // vêm do config (EMPRESA.razaoSocial e EMPRESA.cnpj).
  assert.equal(/\bLTDA\b/i.test(texto), false);
  assert.equal(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(texto), false);
  // Não afirma quem contratou a Hotmart: a conta de produtor do 7448309
  // pode estar no nome de outra empresa do grupo, e a frase seguinte
  // (vendedora "na plataforma de pagamento") já cobre esse caso.
  assert.equal(/contratad[ao]/i.test(texto), false);
  assert.match(texto, /processados pela Hotmart, que atua como\s+intermediária na cobrança/);
  assert.match(texto, /procesados por Hotmart, que actúa como\s+intermediaria en el cobro/);
  assert.match(texto, /na plataforma\s+de pagamento/);
  assert.match(texto, /en la\s+plataforma de pago/);
});

/* ------------------- a OUTRA empresa não aparece em lugar nenhum -------------------
   O dono pediu para NÃO citar a outra empresa do grupo (a que aparece na
   App Store e no cartão CNPJ que ele anexou). O repositório é público,
   então nem este teste escreve os nomes: guarda só o SHA-256 (com o
   prefixo SAL) de cada termo normalizado (sem acento, minúsculo, só
   letras e números, palavras vizinhas juntas). Não é segredo para quem
   já desconfia do nome; serve para o nome não ficar escrito aqui.
   Para acrescentar um termo:
     node -e 'console.log(require("crypto").createHash("sha256").update("diariamente:" + process.argv[1]).digest("hex"))' termonormalizado
   ------------------------------------------------------------------------------ */
const crypto = require("crypto");
const SAL = "diariamente:";
const resumo = (t) => crypto.createHash("sha256").update(SAL + t).digest("hex");

/** Nome do app na loja, nome empresarial e nome de fantasia do cartão
    anexado, e a raiz (8 primeiros dígitos) do CNPJ dele. */
const OUTRA_EMPRESA = new Set([
  "13d3aa39a2154f0fe3a295d455f7c58b524dd87f43596333c1bec7e32591e207",
  "bcfa978bca3045538a6ec30e3d2413be795c0ee5e4177c35e721968972c26544",
  "a4d76315344daeb1e5462c567b4ba60f69e86402c29fe83d23e12b3bb4f4bdfc",
  "fd7dc40a48ff5e36d4eee3c10fbf02c4f451edf4e7916700f4eb26ad3b16f0bd",
  "7a75ab84641eec2038acf2217951b086b059b3c3d982a50dd2a323b083643b90",
]);

/** Cada palavra e cada par e trio de palavras vizinhas, juntos, e a raiz
    de 8 dígitos de toda sequência numérica longa (CNPJ sem pontuação). */
function trechos(texto) {
  const palavras = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const out = new Set();
  for (let i = 0; i < palavras.length; i++) {
    let junto = "";
    for (let n = 0; n < 3 && i + n < palavras.length; n++) {
      junto += palavras[i + n];
      out.add(junto);
    }
    if (/^\d{8,}$/.test(palavras[i])) out.add(palavras[i].slice(0, 8));
  }
  return out;
}

function achados(texto, proibidos) {
  return [...trechos(texto)].filter((t) => proibidos.has(resumo(t)));
}

const FORA = new Set(["node_modules", ".next", ".git", "out", ".vercel"]);
const TEXTO = /\.(tsx?|jsx?|mjs|cjs|json|md|css|sql|txt|html|svg|xml|ya?ml|example)$|^\.gitignore$/;

/** Todo arquivo de texto do projeto, inclusive os PERMITIDOS, o LEIA-ME,
    config, scripts, sql, public e os próprios testes. */
function todosOsArquivos(dir = "") {
  const lista = [];
  for (const nome of fs.readdirSync(path.join(raiz, dir), { withFileTypes: true })) {
    if (FORA.has(nome.name)) continue;
    const rel = dir ? path.posix.join(dir, nome.name) : nome.name;
    if (nome.isDirectory()) lista.push(...todosOsArquivos(rel));
    else if (TEXTO.test(nome.name) && !nome.name.endsWith(".tsbuildinfo")) lista.push(rel);
  }
  return lista;
}

test("o detector acha o termo com acento, maiúscula, espaço, hífen e CNPJ com ou sem pontuação", () => {
  // Termos de mentira, para provar o mecanismo sem escrever os de verdade.
  const falsos = new Set([resumo("palavrateste"), resumo("empresa9"), resumo("12345678")]);
  for (const amostra of [
    "Vendido por PALAVRA TESTE LTDA", "palavra-teste", "Palavra  Teste", "palavrateste",
    "EMPRESA 9 EVENTOS", "Empresa9", "Émpresa 9",
    "CNPJ 12.345.678/0001-00", "cnpj 12345678000100", "12 345 678",
  ]) {
    assert.ok(achados(amostra, falsos).length > 0, amostra);
  }
  for (const limpa of ["palavra de teste", "empresa 90", "12.345.679/0001-00", "1234567", "Diariamente App by Science Play"]) {
    assert.deepEqual(achados(limpa, falsos), [], limpa);
  }
});

test("nenhum arquivo do projeto cita a outra empresa do grupo (nome, fantasia ou CNPJ), nem os Termos e a Política", () => {
  const arquivosVistos = todosOsArquivos();
  for (const obrigatorio of [
    "LEIA-ME.md", "config.ts", "config/pricing.ts", "components/Titularidade.tsx", "app/termos/page.tsx",
    "app/privacidade/page.tsx", "app/es/condicionesdeuso/page.tsx", "app/es/privacidad/page.tsx",
    "scripts/checar-precos.js", "components/Rodape.tsx",
  ]) {
    assert.ok(arquivosVistos.includes(obrigatorio), `a varredura precisa passar por ${obrigatorio}`);
  }
  const fora = [];
  for (const rel of arquivosVistos) {
    const encontrados = achados(fs.readFileSync(path.join(raiz, rel), "utf8"), OUTRA_EMPRESA);
    if (encontrados.length) fora.push(`${rel}: ${encontrados.length} ocorrência(s)`);
  }
  assert.deepEqual(fora, []);
});
