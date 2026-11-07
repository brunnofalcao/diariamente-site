// Cadastro de convidado pelo site (lib/convidado.mjs), 07/11/2026.
import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { normalizarCupom, montarWhatsapp, mensagemDoErro, erroDoCupom, mesesDeAcesso, PAISES_DO_WHATSAPP } from "../lib/convidado.mjs";

const RAIZ = path.join(import.meta.dirname, "..");

test("cupom: sem acento, maiúsculo, só letras e números, de 3 a 32", () => {
  assert.equal(normalizarCupom("nbgoiania"), "NBGOIANIA");
  assert.equal(normalizarCupom(" NB-Goiânia "), "NBGOIANIA");
  assert.equal(normalizarCupom("ab"), "");
  assert.equal(normalizarCupom(null), "");
});

test("WhatsApp: Brasil com DDD; 0, operadora, 00 e 55 saem; DDD 55 fica; fora do Brasil o DDI só sai quando digitado", () => {
  for (const d of ["62 99999-1234", "(62) 9 9999-1234", "062 99999-1234", "0xx62 99999-1234", "015 62 99999-1234", "+55 62 99999-1234", "5562999991234", "0055 62 99999 1234"]) {
    assert.equal(montarWhatsapp("55", d), "5562999991234", d);
  }
  assert.equal(montarWhatsapp("55", "55 99999-1234"), "5555999991234", "DDD 55 (RS)");
  assert.equal(montarWhatsapp("55", "99999-1234"), "", "sem DDD");
  assert.equal(montarWhatsapp("55", ""), "");
  assert.equal(montarWhatsapp("351", "912 345 678"), "351912345678");
  assert.equal(montarWhatsapp("351", "+351 912 345 678"), "351912345678");
  assert.equal(montarWhatsapp("34", "0034 612 345 678"), "34612345678");
  assert.equal(montarWhatsapp("1", "+1 202 555 1234"), "12025551234");
  assert.equal(montarWhatsapp("54", "11 15 2345 6789"), "541123456789", "Argentina sem o 15");
  assert.equal(montarWhatsapp("351", "123"), "");
  assert.ok(PAISES_DO_WHATSAPP[0].ddi === "55", "Brasil primeiro");
});

test("erros do app em português; os do cupom ficam no campo do cupom", () => {
  assert.match(mensagemDoErro("CONVITE_INVALIDO"), /cupom não existe/);
  assert.match(mensagemDoErro("CONVITE_ESGOTADO"), /vagas/);
  assert.match(mensagemDoErro("QUALQUER"), /Algo deu errado/);
  assert.ok(erroDoCupom("CONVITE_ENCERRADO") && !erroDoCupom("CONVITE_EMAIL_JA_CADASTRADO"));
  assert.equal(mesesDeAcesso(365), 12);
  for (const t of Object.values({ a: mensagemDoErro("CONVITE_EMAIL_JA_CADASTRADO"), b: mensagemDoErro("ERRO_INTERNO") })) {
    assert.ok(!/compra|comprar|—/i.test(t));
  }
});

test("página: noindex, cupom obrigatório conferido no app, sem guardar o token", () => {
  const pagina = fs.readFileSync(path.join(RAIZ, "app", "convidado", "page.tsx"), "utf8");
  const form = fs.readFileSync(path.join(RAIZ, "components", "ConvidadoForm.tsx"), "utf8");
  assert.match(pagina, /robots: \{ index: false, follow: false \}/);
  assert.match(form, /\$\{API_DO_APP\}\/api\/convite\/\$\{encodeURIComponent\(codigo\)\}`/, "confere o cupom no app");
  assert.match(form, /\/api\/convite\/\$\{encodeURIComponent\(c\.codigo\)\}\/cadastro`/, "cadastra só com o cupom conferido");
  assert.match(form, /if \(!normalizarCupom\(cupom\)\) e\.cupom = "Digite o cupom\."/);
  assert.ok(!/localStorage|sessionStorage|document\.cookie/.test(form), "o token do app não fica no site");
  assert.ok(!/compra|comprar|—/i.test(pagina + form), "sem compra e sem travessão no texto");
});
