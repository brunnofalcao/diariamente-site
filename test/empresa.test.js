// Decisão de Brunno (26/10/2026), que substitui a de 12/10/2026: o
// Diariamente é um produto Science Play®, operado pelas empresas do grupo.
// Razão social e CNPJ de cada empresa moram SÓ em EMPRESA.grupo
// (config.ts) e chegam às páginas por components/CnpjsDoGrupo.tsx; os
// testes de testes/empresas-do-grupo.test.mjs e
// testes/cnpjs-sem-quebra.test.mjs conferem os números e o texto. Aqui:
// o endereço e a cláusula de titularidade ficam nos Termos e na Política.
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");

/** Os únicos arquivos que podem mostrar o endereço e a cláusula de titularidade. */
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

test("o endereço só aparece nos Termos e na Política", () => {
  const fora = [];
  for (const rel of [...arquivos("app"), ...arquivos("components"), ...arquivos("lib")]) {
    if (PERMITIDOS.has(rel)) continue;
    const texto = fs.readFileSync(path.join(raiz, rel), "utf8");
    if (/EMPRESA\.(razaoSocial|cnpj|endereco)\b|33\.612\.911|SRTVN|Science Play Cursos/i.test(texto)) fora.push(rel);
  }
  assert.deepEqual(fora, []);
});

test("os quatro documentos usam a cláusula de titularidade, que abre com a linha do grupo", () => {
  const config = fs.readFileSync(path.join(raiz, "config.ts"), "utf8");
  // Uma titular só (a decisão de 12/10/2026) não volta: é o grupo.
  assert.equal(/^\s*razaoSocial:\s*"SCIENCE PLAY CURSOS LTDA"/m.test(config), false);
  assert.match(config, /grupo:\s*\[/);
  for (const rel of [...PERMITIDOS].filter((r) => r.startsWith("app/"))) {
    const texto = fs.readFileSync(path.join(raiz, rel), "utf8");
    assert.match(texto, /<Titularidade lang="(pt|es)" doc="(termos|privacidade)" \/>/, rel);
  }
});

test("a cláusula de titularidade identifica o grupo e diz o que o dono pediu", () => {
  const texto = fs.readFileSync(path.join(raiz, "components", "Titularidade.tsx"), "utf8");
  // A linha de identificação aprovada, em pt e es, vinda de EMPRESA.grupo.
  assert.match(texto, /<IdentificacaoDoGrupo lang="pt" \/>/);
  assert.match(texto, /<IdentificacaoDoGrupo lang="es" \/>/);
  assert.match(texto, /Hotmart/);
  assert.match(texto, /grupo econômico/);
  assert.match(texto, /lojas de aplicativos/);
  assert.match(texto, /documento fiscal/);
  assert.match(texto, /não altera a titularidade/);
  assert.match(texto, /no cambia la titularidad/);
  // Nenhum nome empresarial nem CNPJ escrito à mão: os do grupo vêm do
  // config (EMPRESA.grupo), pela IdentificacaoDoGrupo.
  assert.equal(/\bLTDA\b/i.test(texto), false);
  assert.equal(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(texto), false);
  // Não afirma quem contratou a Hotmart: a frase seguinte (vendedora "na
  // plataforma de pagamento") já cobre o caso.
  assert.equal(/contratad[ao]/i.test(texto), false);
  assert.match(texto, /processados pela Hotmart, que atua como\s+intermediária na cobrança/);
  assert.match(texto, /procesados por Hotmart, que actúa como\s+intermediaria en el cobro/);
  assert.match(texto, /na plataforma\s+de pagamento/);
  assert.match(texto, /en la\s+plataforma de pago/);
});
