// Testes da trava do endereço da empresa (scripts/checar-endereco.js).
// Rodar com: npm test   (ou node --test test/*.test.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { lerEndereco, checarEndereco } = require("../scripts/checar-endereco");

const comMarcador = 'const ENDERECO_DA_EMPRESA = "[TROCAR: endereço completo]";';
const comEndereco = 'const ENDERECO_DA_EMPRESA = "Rua Exemplo, 100, Centro, Cidade/UF, 00000-000";';

test("o config.ts real tem a constante no formato que a trava lê", () => {
  const texto = fs.readFileSync(path.join(__dirname, "..", "config.ts"), "utf8");
  assert.notEqual(lerEndereco(texto), null);
  // Fonte única: o endereço não pode estar escrito em outro campo do config.
  assert.equal((texto.match(/const\s+ENDERECO_DA_EMPRESA\s*=/g) || []).length, 1);
  assert.match(texto, /endereco:\s*process\.env\.DM_ENDERECO_TESTE\s*\|\|\s*ENDERECO_DA_EMPRESA/);
});

test("com o marcador [TROCAR, a trava bloqueia e explica o que fazer", () => {
  const r = checarEndereco({ textoDoConfig: comMarcador, env: {} });
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /ENDERECO_DA_EMPRESA/);
  assert.match(r.mensagem, /config\.ts/);
});

test("endereço preenchido pela metade, com [TROCAR no meio ou no fim, bloqueia", () => {
  for (const v of [
    "Rua Exemplo, 100, Centro, Cidade/UF, CEP [TROCAR]",
    "Rua Exemplo, [trocar: número], Centro, Cidade/UF",
  ]) {
    const r = checarEndereco({ textoDoConfig: `const ENDERECO_DA_EMPRESA = "${v}";`, env: {} });
    assert.equal(r.ok, false, v);
  }
});

test("vazio também bloqueia", () => {
  const r = checarEndereco({ textoDoConfig: 'const ENDERECO_DA_EMPRESA = "  ";', env: {} });
  assert.equal(r.ok, false);
});

test("sem a constante, bloqueia em vez de passar calado", () => {
  const r = checarEndereco({ textoDoConfig: "export const EMPRESA = {};", env: {} });
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /Não encontrei/);
});

test("com o endereço real, libera", () => {
  const r = checarEndereco({ textoDoConfig: comEndereco, env: {} });
  assert.equal(r.ok, true);
  assert.equal(r.teste, false);
  assert.equal(r.endereco, "Rua Exemplo, 100, Centro, Cidade/UF, 00000-000");
});

test("DM_ENDERECO_TESTE libera o build local e avisa que é fictício", () => {
  const r = checarEndereco({ textoDoConfig: comMarcador, env: { DM_ENDERECO_TESTE: "Rua de Teste, 123" } });
  assert.equal(r.ok, true);
  assert.equal(r.teste, true);
  assert.match(r.mensagem, /FICTÍCIO/);
});

test("DM_ENDERECO_TESTE é recusada em produção na Vercel", () => {
  const r = checarEndereco({
    textoDoConfig: comEndereco,
    env: { DM_ENDERECO_TESTE: "Rua de Teste, 123", VERCEL: "1", VERCEL_ENV: "production" },
  });
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /Vercel/);
});

test("DM_ENDERECO_TESTE é recusada na Vercel sem VERCEL_ENV", () => {
  const r = checarEndereco({ textoDoConfig: comMarcador, env: { DM_ENDERECO_TESTE: "x", VERCEL: "1" } });
  assert.equal(r.ok, false);
});

test("DM_ENDERECO_TESTE é aceita em preview da Vercel", () => {
  const r = checarEndereco({
    textoDoConfig: comMarcador,
    env: { DM_ENDERECO_TESTE: "Rua de Teste, 123", VERCEL: "1", VERCEL_ENV: "preview" },
  });
  assert.equal(r.ok, true);
  assert.equal(r.teste, true);
});
