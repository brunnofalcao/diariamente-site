// Páginas de pós-pagamento: /obrigado-aprovado e /obrigado-aguardando-pagamento.
// Confere idioma, forma de pagamento, as regras da marca nos textos (pt e es)
// e que o Purchase continua só na página de aprovado.
// Roda com: npm test   (node --test, sem dependência nova)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  TEXTOS,
  formaDoPagamento,
  idiomaDoNavegador,
  idiomaDoObrigado,
  primeiro,
} from "../lib/obrigado.mjs";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const ler = (rel) => readFileSync(join(raiz, rel), "utf8");

/* ---------------- idioma ---------------- */

test("?lang= manda: es, es-419 e es_MX viram es; pt-BR vira pt", () => {
  assert.equal(idiomaDoObrigado("es", "pt-BR"), "es");
  assert.equal(idiomaDoObrigado("es-419", null), "es");
  assert.equal(idiomaDoObrigado("ES_mx", null), "es");
  assert.equal(idiomaDoObrigado("pt-BR", "es-ES,es;q=0.9"), "pt");
});

test("?lang= repetido: vale o primeiro, como no navegador", () => {
  assert.equal(idiomaDoObrigado(["es", "pt-BR"], null), "es");
  assert.equal(primeiro(["pt", "es"]), "pt");
  assert.equal(primeiro(undefined), "");
});

test("sem ?lang= (ou com valor estranho), vale o Accept-Language", () => {
  assert.equal(idiomaDoObrigado(undefined, "es-MX,es;q=0.9,en;q=0.8"), "es");
  assert.equal(idiomaDoObrigado("fr", "es-AR"), "es");
  assert.equal(idiomaDoObrigado(undefined, "pt-BR,pt;q=0.9,es;q=0.8"), "pt");
});

test("Accept-Language respeita o peso e pula idiomas que não são pt nem es", () => {
  assert.equal(idiomaDoNavegador("en-US,en;q=0.9,es;q=0.8,pt;q=0.7"), "es");
  assert.equal(idiomaDoNavegador("pt;q=0.5, es;q=0.9"), "es");
  assert.equal(idiomaDoNavegador("es;q=0, pt-BR"), "pt");
  assert.equal(idiomaDoNavegador("en-US"), null);
  assert.equal(idiomaDoNavegador(""), null);
});

test("sem nada, português", () => {
  assert.equal(idiomaDoObrigado(undefined, undefined), "pt");
  assert.equal(idiomaDoObrigado("", "en-US,en;q=0.9"), "pt");
});

/* ---------------- forma de pagamento ---------------- */

test("forma de pagamento na URL: Pix e boleto", () => {
  assert.equal(formaDoPagamento({ payment_type: "PIX" }), "pix");
  assert.equal(formaDoPagamento({ payment_type: "BILLET" }), "boleto");
  assert.equal(formaDoPagamento({ payment_method: "boleto" }), "boleto");
  assert.equal(formaDoPagamento({ payment_type: ["pix", "BILLET"] }), "pix");
});

test("forma que não é Pix nem boleto (cartão, meio local): outra", () => {
  assert.equal(formaDoPagamento({ payment_type: "CREDIT_CARD" }), "outra");
  assert.equal(formaDoPagamento({ payment_type: "CASH_PAYMENT" }), "outra");
  assert.equal(formaDoPagamento({ payment_method: "PAYPAL" }), "outra");
});

test("sem a forma na URL: null (a página mostra Pix e boleto)", () => {
  assert.equal(formaDoPagamento({ transaction: "HP123" }), null);
  assert.equal(formaDoPagamento({ payment_type: "  " }), null);
  assert.equal(formaDoPagamento({}), null);
  assert.equal(formaDoPagamento(undefined), null);
});

test("aguardando pagamento: com outra forma, só a linha geral, sem Pix nem boleto", () => {
  const shell = ler("components/ObrigadoShell.tsx");
  assert.match(shell, /const mostraPix = !outra && forma !== "boleto";/);
  assert.match(shell, /const mostraBoleto = !outra && forma !== "pix";/);
  assert.match(shell, /t\.instrucoesSoEmail/);
  for (const lang of ["pt", "es"]) {
    const t = TEXTOS["aguardando-pagamento"][lang];
    // A linha geral não fala de Pix nem de boleto e não diz "também".
    assert.doesNotMatch(t.instrucoesSoEmail, /pix|boleto|também|también/i);
    assert.match(t.instrucoesSoEmail, /Hotmart/);
  }
});

/* ---------------- textos: regras da marca ---------------- */

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

for (const [estado, porIdioma] of Object.entries(TEXTOS)) {
  test(`${estado}: pt e es têm as mesmas chaves`, () => {
    assert.deepEqual(Object.keys(porIdioma).sort(), ["es", "pt"]);
    assert.deepEqual(chaves(porIdioma.es), chaves(porIdioma.pt));
  });

  for (const [lang, t] of Object.entries(porIdioma)) {
    const tudo = textoPlano(t);

    test(`${estado} (${lang}): nenhum texto vazio`, () => {
      for (const [k, v] of Object.entries(t)) assert.ok(textoPlano(v).trim(), `${k} vazio`);
    });

    test(`${estado} (${lang}): sem "compra" nem "comprar"`, () => {
      assert.doesNotMatch(tudo, /compr[ao]/i);
    });

    test(`${estado} (${lang}): sem travessão`, () => {
      assert.doesNotMatch(tudo, /[—–]/);
    });

    test(`${estado} (${lang}): no máximo um emoji`, () => {
      assert.ok((tudo.match(EMOJI) || []).length <= 1);
    });
  }
}

test("aprovado: o caminho que já funciona, com o rótulo exato do botão do app", () => {
  // public/i18n/pt-BR.json e es.json do app: login.primeiro_acesso_btn
  assert.match(textoPlano(TEXTOS.aprovado.pt.agoraTexto), /Primeiro acesso\? Ativar conta/);
  assert.match(textoPlano(TEXTOS.aprovado.es.agoraTexto), /¿Primer acceso\? Activar cuenta/);
  assert.match(textoPlano(TEXTOS.aprovado.pt.agoraTexto), /WhatsApp/);
});

test("aprovado: o caminho de agora fala de criar a senha (a ativação pede e-mail e senha)", () => {
  // server.js, /api/auth/activate-by-email: sem senha, 400 EMAIL_SENHA_OBRIGATORIOS.
  assert.match(textoPlano(TEXTOS.aprovado.pt.agoraTexto), /crie uma senha/);
  assert.match(textoPlano(TEXTOS.aprovado.es.agoraTexto), /crea una contraseña/);
  assert.match(textoPlano(TEXTOS.aprovado.es.agoraTexto), /WhatsApp/);
});

test("aguardando pagamento: sem prazo inventado para Pix ou boleto", () => {
  for (const lang of ["pt", "es"]) {
    const tudo = textoPlano(TEXTOS["aguardando-pagamento"][lang]);
    assert.doesNotMatch(tudo, /\d+\s*(dia|día|hora|minuto)/i);
    assert.doesNotMatch(tudo, /úteis|hábiles|instantes/i);
  }
});

/* ---------------- páginas ---------------- */

test("Purchase continua só em /obrigado-aprovado", () => {
  assert.match(ler("app/obrigado-aprovado/page.tsx"), /<PurchaseTracking \/>/);
  assert.doesNotMatch(ler("app/obrigado-aguardando-pagamento/page.tsx"), /PurchaseTracking/);
  assert.doesNotMatch(ler("app/obrigado-aguardando-analise/page.tsx"), /PurchaseTracking/);
  assert.doesNotMatch(ler("components/ObrigadoShell.tsx"), /PurchaseTracking|fbq|gtag/);
});

test("atendimento: as três páginas usam a constante única", () => {
  const shell = ler("components/ObrigadoShell.tsx");
  assert.doesNotMatch(shell, /suporteEmail|contatoEmail|@scienceplay\.com/);
  assert.match(shell, /ATENDIMENTO\.email/);
  const atendimento = ler("config/atendimento.ts");
  assert.equal((atendimento.match(/^\s*email:/gm) || []).length, 1);
});

test("atendimento: assunto já preenchido, Suporte no aprovado e Atendimento nas outras duas", () => {
  const atendimento = ler("config/atendimento.ts");
  assert.match(atendimento, /assuntoSuporte: "Suporte Diariamente App"/);
  assert.match(atendimento, /assuntoAtendimento: "Atendimento Diariamente App"/);
  assert.match(atendimento, /mailto:\$\{ATENDIMENTO\.email\}\?subject=\$\{encodeURIComponent\(assunto\)\}/);
  const shell = ler("components/ObrigadoShell.tsx");
  const aprovado = shell.slice(shell.indexOf("function Aprovado"), shell.indexOf("function AguardandoPagamento"));
  assert.match(aprovado, /assunto=\{ATENDIMENTO\.assuntoSuporte\}/);
  assert.doesNotMatch(aprovado, /assuntoAtendimento/);
  const resto = shell.slice(shell.indexOf("function AguardandoPagamento"));
  assert.equal((resto.match(/assuntoAtendimento/g) || []).length, 2, "aguardando pagamento e em análise");
  assert.doesNotMatch(resto, /assuntoSuporte/);
  assert.doesNotMatch(shell, /href=\{`mailto:/, "todo mailto passa por linkDoAtendimento");
});
