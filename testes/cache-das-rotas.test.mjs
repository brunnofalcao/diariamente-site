// Toda rota de app/api declara que nenhum fetch dela entra no Data Cache
// do Next 14. Sem isso, numa rota só com GET, o fetch sem opção de cache
// fica guardado por 1 ano e a consulta de URL fixa deixa de chegar ao
// banco (foi o que travou a limpeza do cron de manutenção).
// Roda com: npm test   (node --test, sem dependência nova)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const pastaApi = join(raiz, "app", "api");

function rotas(pasta) {
  const achadas = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) achadas.push(...rotas(caminho));
    else if (/^route\.(js|mjs|ts)$/.test(nome)) achadas.push(caminho);
  }
  return achadas;
}

const todas = rotas(pastaApi);

test("existe pelo menos uma rota em app/api", () => {
  assert.ok(todas.length > 0);
});

for (const arquivo of todas) {
  const nome = relative(raiz, arquivo);
  const codigo = readFileSync(arquivo, "utf8");

  test(`${nome}: fetchCache = 'force-no-store'`, () => {
    assert.match(codigo, /^export const fetchCache = ["']force-no-store["'];?/m);
  });

  test(`${nome}: revalidate = 0`, () => {
    assert.match(codigo, /^export const revalidate = 0;?/m);
  });

  test(`${nome}: dynamic = 'force-dynamic'`, () => {
    assert.match(codigo, /^export const dynamic = ["']force-dynamic["'];?/m);
  });
}
