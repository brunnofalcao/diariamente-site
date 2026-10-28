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
  formasParaMostrar,
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
  assert.match(shell, /const formas = formasParaMostrar\(forma, lang\);/);
  assert.match(shell, /t\.instrucoesSoEmail/);
  for (const lang of ["pt", "es"]) {
    assert.deepEqual(formasParaMostrar("outra", lang), { pix: false, boleto: false, soEmail: true });
    assert.deepEqual(formasParaMostrar("pix", lang), { pix: true, boleto: false, soEmail: false });
    assert.deepEqual(formasParaMostrar("boleto", lang), { pix: false, boleto: true, soEmail: false });
  }
  for (const lang of ["pt", "es"]) {
    const t = TEXTOS["aguardando-pagamento"][lang];
    // A linha geral não fala de Pix nem de boleto e não diz "também".
    assert.doesNotMatch(t.instrucoesSoEmail, /pix|boleto|também|también/i);
    assert.match(t.instrucoesSoEmail, /Hotmart/);
  }
});

test("aguardando pagamento sem a forma na URL: Pix e boleto em português; em espanhol, só a linha geral", () => {
  // A Hotmart não manda a forma na URL: é o caso normal. Pix, boleto e "casa lotérica" só
  // existem no Brasil, e em espanhol a página fala só das instruções no e-mail.
  assert.deepEqual(formasParaMostrar(null, "pt"), { pix: true, boleto: true, soEmail: false });
  assert.deepEqual(formasParaMostrar(null, "es"), { pix: false, boleto: false, soEmail: true });
  assert.deepEqual(formasParaMostrar(undefined, "es"), { pix: false, boleto: false, soEmail: true });
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

/* ---------------- em análise: pt e es ---------------- */

test("em análise: o pt é o texto de sempre", () => {
  const t = TEXTOS["aguardando-analise"].pt;
  assert.equal(t.aba, "Pagamento em análise");
  assert.equal(t.descricao, "Seu pagamento do Diariamente está sendo analisado.");
  assert.deepEqual(t.titulo, ["Seu pagamento está", "sendo analisado."]);
  assert.equal(textoPlano(t.sub), "A operadora do cartão está confirmando a transação. Assim que for aprovada, você recebe o e-mail de acesso. Isso costuma levar poucos minutos, mas pode demorar algumas horas.");
  assert.equal(t.esperaTitulo, "Você não precisa fazer nada");
  assert.equal(t.lista.length, 3);
  assert.equal(t.frase, "Volte amanhã.");
  assert.equal(t.suporteAntes, "Precisa de ajuda?");
});

test("em análise: ?lang=es em espanhol, sem palavra em português", () => {
  const es = textoPlano(TEXTOS["aguardando-analise"].es);
  assert.doesNotMatch(es, /você|pagamento|está sendo|Volte|não|operadora|e-mail/i);
  assert.equal(TEXTOS["aguardando-analise"].es.frase, "Vuelve mañana.");
  const pagina = ler("app/obrigado-aguardando-analise/page.tsx");
  assert.match(pagina, /idiomaDoObrigado\(busca\.lang, cabecalhos\.get\("accept-language"\)\)/);
  assert.match(pagina, /<ObrigadoShell estado="aguardando-analise" lang=\{lang\} \/>/);
  const shell = ler("components/ObrigadoShell.tsx");
  const analise = shell.slice(shell.indexOf("function AguardandoAnalise"));
  assert.match(analise, /<Moldura lang=\{lang\}>/);
  assert.match(analise, /<StoreBadges variant="link" lang=\{lang\} \/>/);
  assert.doesNotMatch(analise, />\s*(Em análise|Enquanto isso|Você não precisa|Volte amanhã|Precisa de ajuda)/, "nenhum texto fixo em pt");
});

/* ---------------- em análise: espanhol natural ---------------- */

test("em análise (es): futuro no aviso e o exercício do dia como leitura", () => {
  const t = TEXTOS["aguardando-analise"].es;
  assert.match(textoPlano(t.sub), /recibirás el correo de acceso\. Suele tardar unos minutos/);
  assert.equal(t.lista[2].t, "Empieza tu recorrido");
  assert.equal(t.lista[2].d, "Lees la provocación del Día 1 y la constancia empieza a construirse.");
  assert.doesNotMatch(textoPlano(t), /Haces la provocación|se libere|No necesitas estar/);
  // A frase do app é a mesma nas duas páginas que esperam a confirmação.
  assert.match(t.appTexto, /Cuando tu acceso esté activo, solo tienes que entrar con el correo que usaste para pagar\.$/);
  assert.equal(TEXTOS["aguardando-pagamento"].es.appTexto, "Cuando tu acceso esté activo, solo tienes que entrar con el correo que usaste para pagar.");
});

test("espanhol: selo sem a lei brasileira e lojas sem o /br/", () => {
  const i18n = ler("lib/i18n.ts");
  assert.match(i18n, /tr4: "Datos protegidos",/);
  assert.doesNotMatch(i18n, /Datos protegidos · LGPD/);
  assert.match(i18n, /appStore: "https:\/\/apps\.apple\.com\/app\/diariamente\/id6762151251"/);
  assert.match(i18n, /googlePlay: "https:\/\/play\.google\.com\/store\/apps\/details\?id=club\.diariamente\.app&hl=es"/);
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
