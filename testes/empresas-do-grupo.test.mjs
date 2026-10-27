// O Diariamente é um produto Science Play®, operado por um grupo de
// empresas (decisão de 26/10/2026). Razão social e CNPJ moram SÓ no
// config.ts (EMPRESA.grupo) e chegam às páginas pelas funções de lá.
// Este teste segura duas coisas:
//   1. os três CNPJs do grupo são os dos cartões e têm dígitos válidos;
//   2. nenhuma página ou componente volta a escrever razão social ou
//      CNPJ à mão (o rodapé da home citava uma empresa só, fixo no JSX).
// Roda com: npm test   (node --test, sem dependência nova)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const config = readFileSync(join(raiz, "config.ts"), "utf8");

const ESPERADO = [
  ["Science Play Audiobook LTDA", "33.619.144/0001-80"],
  ["Science Play Cursos LTDA", "33.612.911/0001-29"],
  ["Falcão14 Organização de Feiras LTDA", "33.616.206/0001-08"],
];

function cnpjValido(cnpj) {
  const d = cnpj.replace(/\D/g, "").split("").map(Number);
  if (d.length !== 14 || d.every((n) => n === d[0])) return false;
  const dv = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = base.reduce((s, n, i) => s + n * pesos[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return dv(d.slice(0, 12)) === d[12] && dv(d.slice(0, 13)) === d[13];
}

test("EMPRESA.grupo lista as três empresas dos cartões CNPJ, na ordem aprovada", () => {
  const achadas = [...config.matchAll(/\{\s*razaoSocial:\s*"([^"]+)",\s*cnpj:\s*"([^"]+)"\s*\}/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(achadas, ESPERADO);
});

for (const [nome, cnpj] of ESPERADO) {
  test(`CNPJ de ${nome} tem dígitos verificadores válidos`, () => {
    assert.ok(cnpjValido(cnpj), cnpj);
  });
}

test("EMPRESA.endereco está preenchido (não é nota interna)", () => {
  // O endereço mora na constante ENDERECO_DA_EMPRESA (a trava de
  // scripts/checar-endereco.js lê a mesma constante) e o EMPRESA.endereco
  // aponta para ela.
  assert.match(config, /endereco:\s*process\.env\.DM_ENDERECO_TESTE\s*\|\|\s*ENDERECO_DA_EMPRESA/);
  const m = config.match(/const\s+ENDERECO_DA_EMPRESA\s*=\s*"([^"]*)"/);
  assert.ok(m, "ENDERECO_DA_EMPRESA não encontrado no config.ts");
  assert.ok(!m[1].startsWith("["), m[1]);
});

function arquivos(pasta) {
  const achados = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) achados.push(...arquivos(caminho));
    else if (/\.(ts|tsx|js|mjs)$/.test(nome)) achados.push(caminho);
  }
  return achados;
}

const CNPJ = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/;
const RAZAO = /\bLTDA\b/;

test("nenhum arquivo de app/, components/, lib/ ou config/ escreve razão social ou CNPJ à mão", () => {
  const todos = ["app", "components", "lib", "config"].flatMap((p) => arquivos(join(raiz, p)));
  assert.ok(todos.length > 0);
  const fora = todos
    .filter((a) => {
      const codigo = readFileSync(a, "utf8");
      return CNPJ.test(codigo) || RAZAO.test(codigo);
    })
    .map((a) => relative(raiz, a));
  assert.deepEqual(fora, [], "use EMPRESA.grupo e as funções do config.ts");
});
