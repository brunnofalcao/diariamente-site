// O HTML que o visitante lê, renderizado de verdade (react-dom/server) a
// partir dos componentes e do config real, fora do Next. Cobre:
//   - o comparativo da /estudante durante e depois do lançamento;
//   - a linha "Sou estudante" e o parcelamento do bloco de oferta;
//   - a /estudante com o fluxo do cupom pessoal aberto e fechado.
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
const rotas = carregarTs(arq("lib", "rotas.ts"));
const i18n = carregarTs(arq("lib", "i18n.ts"));

const LANCAMENTO = Date.parse("2026-10-20T12:00:00-03:00");
const DEPOIS = Date.parse("2026-11-20T12:00:00-03:00");

/** Espaço que não quebra vira espaço comum, para comparar texto. */
const txt = (html) => html.replace(/\u00a0/g, " ");

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

function comRelogio(agora, fn) {
  const real = Date.now;
  Date.now = () => agora;
  try {
    return fn();
  } finally {
    Date.now = real;
  }
}

function blocoPreco(C) {
  return carregarTs(arq("components", "BlocoPreco.tsx"), {
    "@/config": C, "@/config/pricing": P, "react/jsx-runtime": jsx,
  }, { jsx: true }).BlocoPreco;
}

function blocoOferta(C) {
  return carregarTs(arq("components", "BlocoOferta.tsx"), {
    "@/config": C, "@/config/pricing": P, "@/lib/rotas": rotas,
    "@/lib/medicao": { registrarInicioDeCheckout() {} },
    "@/components/ListaEsperaForm": { ListaEsperaForm: () => null },
    "react/jsx-runtime": jsx,
  }, { jsx: true }).BlocoOferta;
}

const html = (Componente, props = {}) => txt(renderToStaticMarkup(React.createElement(Componente, props)));

/* ------------------------- comparativo da /estudante ------------------------- */

/** Texto do estudante, sem a regra do LANÇAMENTO (que é do checkout da
    oferta de lançamento e continua na página para o estudante comparar). */
const semRegraDoLancamento = (h) =>
  h.replace(/nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\./g, "");

/** Promessa de que o preço dura a graduação inteira: é duração do cupom
    com outras palavras (o cupom é de uso único e a renovação dele não se
    sabe). Vale para o português e o espanhol. */
const DURACAO_DA_GRADUACAO =
  /enquanto (você )?(ainda )?(está|estiver|estuda|estudar)|durante toda a (sua )?graduação|até (você )?se formar|mientras (estás|estés|sigas|sigues) (cursando|estudiando)|mientras estudias|durante toda tu carrera/i;

/** O que o texto do estudante NÃO pode dizer (decisão do dono, 12/10/2026):
    duração do desconto ou renovação pelo mesmo valor. */
function semDuracaoDoEstudante(h, rotulo) {
  const s = semRegraDoLancamento(h);
  assert.equal(/primeiro ano/.test(s), false, `${rotulo}: "primeiro ano"`);
  assert.equal(/3 anos|três anos|3 primeiros anos/.test(s), false, `${rotulo}: "3 anos"`);
  assert.equal(/mesmo valor/.test(s), false, `${rotulo}: "mesmo valor"`);
  assert.equal(DURACAO_DA_GRADUACAO.test(s), false, `${rotulo}: duração pela graduação`);
  assert.equal(/89,94|7,50|40%/.test(s.replace(/40% a menos|40% de diferença/g, "")), false, `${rotulo}: preço antigo`);
}

/** A nota do card de estudante: só o estudante, com sujeito, e como ele paga. */
const NOTA_DO_ESTUDANTE =
  /Para você, estudante: R\$ 7,49\/mês, por um ano inteiro de provocação diária\. R\$ 89,90 à vista, ou em até 12x no cartão com acréscimo\. Cobrança anual\. Cancele quando quiser\./;

test("/estudante no lançamento: R$ 89,90 por ano, cobrança anual, e a regra dos 3 anos só na coluna do lançamento", () => {
  const h = comRelogio(LANCAMENTO, () => html(blocoPreco(config(true))));
  assert.match(h, /R\$ 10,08 OFF<\/span>/);
  assert.match(h, /<small>R\$<\/small>89,90/);
  assert.match(h, /10% a menos que o valor que qualquer pessoa paga hoje/);
  assert.match(h, /Quem entra hoje pelo site<\/span><span class="ed-econ-v">R\$ 99,98<\/span><span class="ed-econ-d">R\$ 8,33\/mês<\/span><span class="ed-econ-d">Por ano nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\.<\/span>/);
  assert.match(h, /Sua condição de estudante<\/span><span class="ed-econ-v">R\$ 89,90<\/span><span class="ed-econ-d">R\$ 7,49\/mês · cobrança anual<\/span>/);
  assert.match(h, /Você economiza<\/span><span class="ed-econ-v">R\$ 10,08<\/span><span class="ed-econ-d">10% de diferença<\/span>/);
  assert.match(h, NOTA_DO_ESTUDANTE);
  // A regra do lançamento aparece UMA vez, na coluna do lançamento, e
  // nunca dentro do card de estudante (lá ela era lida como duração do cupom).
  assert.equal((h.match(/3 primeiros anos/g) || []).length, 1);
  const card = h.slice(h.indexOf('class="ed-price"'), h.indexOf('class="ed-econ"'));
  assert.equal(/3 primeiros anos|preço de lançamento|Depois, R\$ 149,90/.test(card), false);
  // Parcelado com acréscimo, sem valor de parcela, e longe do equivalente mensal.
  assert.equal(/\d+\s*x\s*de\s*R\$/i.test(h), false);
  assert.equal(/\/mês\)?,? (ou )?em até 12x/.test(h), false);
  semDuracaoDoEstudante(h, "lançamento");
});

test("/estudante depois do lançamento: base R$ 149,90, R$ 60,00 OFF, sem regra de 3 anos nenhuma", () => {
  const h = comRelogio(DEPOIS, () => html(blocoPreco(config(true))));
  assert.match(h, /R\$ 60,00 OFF<\/span>/);
  assert.match(h, /40% a menos que o valor que qualquer pessoa paga hoje/);
  assert.match(h, NOTA_DO_ESTUDANTE);
  assert.equal(/3 primeiros anos/.test(h), false);
  assert.equal(/preço de lançamento/.test(h), false);
  semDuracaoDoEstudante(h, "depois");
});

test("config.ts: o estudante não tem mais a chave de renovação; o texto é só de cobrança anual", () => {
  const C = config(true);
  assert.equal("renovaMesmoValor" in C.ESTUDANTE, false);
  assert.equal("renovacaoMesmoValor" in C.ESTUDANTE, false);
  assert.equal(C.ESTUDANTE.periodo, "por ano · cobrança anual");
  assert.equal(C.ESTUDANTE.renovacao, "Cobrança anual. Cancele quando quiser.");
  assert.equal(C.periodoEstudante(), "por ano · cobrança anual");
  assert.equal(C.ESTUDANTE.preco, "89,90");
  assert.equal(C.ESTUDANTE.porMes, "7,49");
  assert.equal(C.ESTUDANTE.desconto, 0.40027);
  // O estudante paga na oferta OFICIAL: a mesma linha de pagamento dela.
  assert.equal(C.ESTUDANTE.pagamento, "à vista, ou em até 12x no cartão com acréscimo");
  assert.equal(C.ESTUDANTE.pagamento.toLowerCase(), P.MERCADOS.br.textos.pagamento.toLowerCase());
});

test("/estudante com o fluxo fechado: o card avisa que a solicitação abre em breve", () => {
  const h = comRelogio(LANCAMENTO, () => html(blocoPreco(config(false))));
  assert.match(h, /A solicitação do código abre em breve/);
  assert.equal(/o botão da mensagem abre o pagamento/.test(h), false);
  const aberto = comRelogio(LANCAMENTO, () => html(blocoPreco(config(true))));
  assert.match(aberto, /o botão da mensagem abre o pagamento com o\s+desconto já aplicado/);
});

/* --------------------------- bloco de oferta (home) --------------------------- */

test("home do Brasil com o estudante aberto: \"Sou estudante\" com R$ 89,90 por ano, cobrança anual, e o link para a /estudante", () => {
  const h = html(blocoOferta(config(true)), { mercado: "br", momento: LANCAMENTO });
  assert.match(h, /href="\/estudante"/);
  assert.match(h, /Sou estudante: R\$ 7,49\/mês · R\$ 89,90 por ano · cobrança anual/);
  // A duração de 3 anos é do LANÇAMENTO (a regra e o quadro do card, antes
  // do botão); a linha do estudante, depois do botão, não diz duração.
  const regra = /<strong [^>]*>33% a menos<\/strong>, travado nos 3 primeiros anos\. Depois, R\$ 149,90 por ano\./;
  assert.match(h, regra);
  assert.match(h, /<dt [^>]*>3 anos no preço oficial<\/dt>/);
  const depoisDoBotao = h.slice(h.indexOf(">Começar meu ano</a>"));
  assert.match(depoisDoBotao, /Sou estudante/);
  semDuracaoDoEstudante(depoisDoBotao, "home");
});

test("home do Brasil com o estudante FECHADO: nenhum link nem preço de estudante", () => {
  for (const momento of [LANCAMENTO, DEPOIS]) {
    const h = html(blocoOferta(config(false)), { mercado: "br", momento });
    assert.equal(/estudante/i.test(h), false);
    assert.equal(/89,90|7,49|89,94|7,50/.test(h), false);
  }
});

test("home: ESTUDANTE.mostrarPreco = false também esconde o preço de estudante na home", () => {
  const C = config(true);
  C.ESTUDANTE.mostrarPreco = false;
  const h = html(blocoOferta(C), { mercado: "br", momento: LANCAMENTO });
  assert.match(h, /Sou estudante: ver a condição/);
  assert.equal(/89,90|7,49|89,94|7,50/.test(h), false);
});

test("home depois do lançamento: o parcelamento diz que tem acréscimo e fica separado do equivalente mensal", () => {
  const h = html(blocoOferta(config(true)), { mercado: "br", momento: DEPOIS });
  assert.match(h, /R\$ 12,49/);
  assert.match(h, /À vista, ou em até 12x no cartão com acréscimo/);
  assert.equal(/12x(?! no cartão com acréscimo)/.test(h), false);
  // nunca valor de parcela
  assert.equal(/\d+\s*x\s*de\s*R\$/i.test(h), false);
  // no lançamento, só à vista, dito no prazo, antes do botão
  const l = html(blocoOferta(config(true)), { mercado: "br", momento: LANCAMENTO });
  assert.match(l, /<span>Preço de lançamento, à vista, para quem assinar até <span style="white-space:nowrap">16 de novembro<\/span>\.<\/span><\/p><a [^>]*>Começar meu ano<\/a>/);
  assert.equal(/12x/.test(l), false);
});

test("/sobre: o equivalente mensal não encosta no parcelamento, e o parcelado diz que tem acréscimo", () => {
  const fonte = require("fs").readFileSync(arq("app", "sobre", "page.tsx"), "utf8");
  assert.equal(/\/mês\), em até 12x/.test(fonte), false);
  assert.equal(/12x no cartão(?! com acréscimo)/.test(fonte), false);
  assert.match(fonte, /à vista \(equivale a \{cheioMes\}\/mês\), ou em até 12x no cartão com acréscimo/);
});

/* ------------------------- /estudante, página inteira ------------------------- */

function paginaEstudante(C, lancado = true) {
  const Brand = carregarTs(arq("components", "Brand.tsx"), { "react/jsx-runtime": jsx }, { jsx: true });
  const ListaEsperaForm = carregarTs(arq("components", "ListaEsperaForm.tsx"), {
    react: React, "react/jsx-runtime": jsx, "@/components/Brand": Brand,
    "@/lib/consentimento": carregarTs(arq("lib", "consentimento.ts")),
    "@/lib/rotas": rotas, "@/config/pricing": P, "@/config/lancamento": { SITE_LANCADO: lancado },
  }, { jsx: true });
  const EstudanteEspera = carregarTs(arq("components", "EstudanteEspera.tsx"), {
    "@/config/pricing": P, "@/components/ListaEsperaForm": ListaEsperaForm, "react/jsx-runtime": jsx,
  }, { jsx: true });
  const EstudanteSticky = carregarTs(arq("components", "EstudanteSticky.tsx"), { react: React, "react/jsx-runtime": jsx }, { jsx: true });
  return carregarTs(arq("app", "estudante", "page.tsx"), {
    "@/lib/seo": { metadataDaPagina: () => ({}) },
    "@/config": C, "@/config/pricing": P,
    "@/config/lancamento": { SITE_LANCADO: lancado },
    // standby: a /estudante da produção (components/estudante-atual)
    "@/components/estudante-atual/BlocoPrecoAtual": carregarTs(arq("components", "estudante-atual", "BlocoPrecoAtual.tsx"), {
      "@/config": C, "react/jsx-runtime": jsx,
    }, { jsx: true }),
    "@/components/Brand": Brand,
    // a arte Hoje das lojas no hero, nos dois estados (components/TelaDaLoja.tsx)
    "@/components/TelaDaLoja": carregarTs(arq("components", "TelaDaLoja.tsx"), {
      "@/lib/i18n": i18n, "react/jsx-runtime": jsx,
    }, { jsx: true }),
    "@/lib/i18n": i18n,
    "@/components/BlocoPreco": { BlocoPreco: blocoPreco(C) },
    // o formulário real usa o roteador do Next; aqui basta saber se ele
    // entra, e com qual subtítulo
    "@/components/EstudanteForm": { EstudanteForm: (p) => React.createElement("div", { id: "formulario-cpf" }, p.subtitulo || "") },
    "@/components/EstudanteEspera": EstudanteEspera,
    "@/components/EstudanteSticky": EstudanteSticky,
    // rodapé com a linha curta do grupo Science Play (decisão de 26/10/2026)
    "@/components/CnpjsDoGrupo": carregarTs(arq("components", "CnpjsDoGrupo.tsx"), {
      react: React, "@/config": C, "react/jsx-runtime": jsx,
    }, { jsx: true }),
    "./estudante.css": {},
    "react/jsx-runtime": jsx,
  }, { jsx: true }).default;
}

test("/estudante FECHADA: lista de espera no lugar do formulário, botões \"Me avise quando abrir\"", () => {
  const h = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(false))));
  assert.equal(/formulario-cpf/.test(h), false, "sem o formulário que pede CPF");
  assert.match(h, /A solicitação do código abre em breve/);
  assert.match(h, /Me avise quando abrir/);
  assert.match(h, /quando a solicitação da condição de estudante abrir/);
  assert.equal(/Solicitar minha condição|Solicitar meu código/.test(h), false);
  assert.equal(/Por que pedimos esses dados/.test(h), false);
});

test("/estudante FECHADA: sem prazo, sem \"código\" no topo e sem garantir que o WhatsApp chega (revisão de 28/10/2026)", () => {
  const h = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(false))));
  assert.match(h, /Abre em breve/);
  assert.match(h, /Quando abrir, são três passos\./);
  assert.equal(/Leva cerca de um minuto<\/span>|Código pelo WhatsApp|Código enviado no WhatsApp/.test(h), false, "chips do topo de quem pede o código");
  assert.equal(/em até \d+ minutos/i.test(h), false, "sem prazo com a solicitação fechada");
  assert.equal(/código chega|chega no WhatsApp/i.test(h), false);
  // aberta: o prazo do config, com o sistema enviando (não \"chega\")
  const aberta = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(true))));
  assert.match(aberta, /enviamos o código para o número que você informou/);
  assert.equal(/código chega|chega no WhatsApp/i.test(aberta), false);
});

test("home: nada de garantir que o WhatsApp chega nem de acesso imediato por e-mail (pt, es e pt-PT)", () => {
  for (const [lang, mercado] of [["pt", "br"], ["es", "la"], ["pt", "pt"]]) {
    const t = i18n.dicionario(lang, mercado);
    const tudo = JSON.stringify(t);
    assert.equal(/chega no horário|Llega a la hora|Chega à hora|te encontra todo dia|te encuentra cada día|encontra-te/i.test(tudo), false, `${lang}/${mercado}: WhatsApp`);
    assert.equal(/Acesso imediato|Acceso inmediato|acesso chega por e-mail|acceso llega por e-mail|Por e-mail, assim|Por e-mail, en cuanto/i.test(tudo), false, `${lang}/${mercado}: e-mail`);
    assert.equal(/código chega|código llega/i.test(tudo), false, `${lang}/${mercado}: código`);
  }
  assert.match(i18n.dicionario("pt", "br").v5d, /Cadastre seu WhatsApp no app/);
  assert.match(i18n.dicionario("pt", "br").faq.find(([q]) => q === "Como recebo o acesso?")[1], /Primeiro acesso\? Ativar conta/);
});

test("/estudante ABERTA: o formulário de sempre e os botões de solicitar", () => {
  const h = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(true))));
  assert.match(h, /formulario-cpf/);
  assert.match(h, /Solicitar minha condição/);
  assert.match(h, /Solicitar meu código/);
  assert.equal(/abre em breve/.test(h), false);
  // o tempo prometido é o do config, e o resumo diz só que a cobrança é anual
  assert.match(h, /em até 10 minutos/);
  assert.match(h, /R\$ 89,90 por ano · cobrança anual \(equivale a R\$ 7,49\/mês; valor cheio R\$ 149,90\)/);
  assert.match(h, /Pagamento<\/span><span class="ed-review-v">R\$ 89,90 à vista, ou em até 12x no cartão com acréscimo<\/span>/);
  assert.match(h, /O que muda é o preço\s+de entrada\./);
  assert.match(h, /Essa condição é <b>para quem ainda está na graduação<\/b>/);
  semDuracaoDoEstudante(h, "/estudante");
});

test("standby: a /estudante é a da produção (R$ 77,00 sobre R$ 137,90, formulário aberto), com a arte Hoje das lojas", () => {
  // Em standby o fluxo da produção abre mesmo sem as chaves do estudante.
  for (const aberto of [false, true]) {
    const h = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(aberto), false)));
    assert.match(h, /R\$ 77,00/);
    assert.match(h, /R\$ 137,90/);
    assert.match(h, /<small>R\$<\/small>77,00/);
    assert.match(h, /R\$ 60,90 OFF/);
    assert.match(h, /44% a menos que o valor que qualquer pessoa paga hoje\. menos de R\$ 0,22 por dia, por um ano inteiro de provocação diária\./);
    assert.match(h, /Quem entra hoje pelo site<\/span><span class="ed-econ-v">R\$ 137,90<\/span><span class="ed-econ-d">menos de R\$ 0,38 por dia<\/span>/);
    assert.match(h, /Preço estudante<\/span><span class="ed-review-v">R\$ 77,00 no ano \(valor cheio R\$ 137,90\)<\/span>/);
    assert.equal(/Pagamento<\/span>/.test(h), false, "sem a linha de pagamento do lançamento");
    assert.match(h, /Solicitar minha condição/);
    assert.match(h, /Solicitar meu código/);
    assert.match(h, /formulario-cpf/);
    assert.match(h, /O código chega no seu WhatsApp e é aplicado no campo de cupom da tela de pagamento\./);
    // a imagem do hero é a mesma do lançamento (pedido do dono, 27/10/2026)
    assert.match(h, /<div class="ed-phone"><picture/);
    assert.match(h, /src="\/telas\/pt\/hoje-560\.jpg"/);
    assert.equal(/ed-phone-moldura|Tela_HOJE|cloudinary/i.test(h), false, "sem o mockup antigo");
    assert.equal(/abre em breve|Me avise quando abrir|89,90|99,98|149,90/.test(h), false);
    // as decisões do dono no PR #3 valem também aqui
    semDuracaoDoEstudante(h, "/estudante em standby");
    assert.equal(/\bcompra(r|s)?\b/i.test(h), false);
    assert.match(h, /em até 10 minutos/);
  }
  // ligada a chave, volta a ser a do lançamento
  const lancada = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(true), true)));
  assert.match(lancada, /<small>R\$<\/small>89,90/);
  assert.equal(/77,00|137,90|cloudinary/.test(lancada), false);
});

test("standby: o HTML da /estudante não tem nenhum Tela_* do Cloudinary e tem /telas/pt/hoje, com o preço e o formulário da produção", () => {
  for (const aberto of [false, true]) {
    const h = comRelogio(LANCAMENTO, () => html(paginaEstudante(config(aberto), false)));
    assert.equal(/Tela_[A-Z]+_Diariamente/.test(h), false, "nenhum mockup Tela_* do Cloudinary");
    assert.equal(/res\.cloudinary\.com[^"]*Tela_/.test(h), false);
    // a arte Hoje das lojas, em WebP e com o JPEG de reserva, com prioridade
    assert.match(h, /srcSet="\/telas\/pt\/hoje-360\.webp 360w, \/telas\/pt\/hoje-560\.webp 560w, \/telas\/pt\/hoje-840\.webp 840w"/);
    assert.match(h, /<img src="\/telas\/pt\/hoje-560\.jpg" alt="[^"]+" width="1320" height="2868" loading="eager" fetchPriority="high"/);
    assert.equal((h.match(/\/telas\/pt\/hoje-560\.jpg/g) || []).length, 1, "uma tela só no hero");
    // o resto, como a produção
    assert.match(h, /R\$ 77,00/);
    assert.match(h, /R\$ 137,90/);
    assert.match(h, /Solicitar minha condição/);
    assert.match(h, /Sua provocação de hoje\. <b>Só a de hoje\.<\/b>/);
  }
});

test("/estudante aberta e fechada, no lançamento e depois: nenhuma promessa de duração pela graduação", () => {
  for (const momento of [LANCAMENTO, DEPOIS]) {
    for (const aberto of [true, false]) {
      const h = comRelogio(momento, () => html(paginaEstudante(config(aberto))));
      semDuracaoDoEstudante(h, `/estudante ${aberto ? "aberta" : "fechada"} ${momento === LANCAMENTO ? "no lançamento" : "depois"}`);
    }
  }
});

test("fonte: nenhum texto de estudante promete o preço pela graduação inteira (pt e es, inclusive o que não está em uso)", () => {
  const fs = require("fs");
  // Comentários fora: só o que pode chegar ao visitante.
  const semComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  for (const f of [
    ["app", "estudante", "page.tsx"], ["app", "es", "estudiantes", "page.tsx"],
    ["components", "Oferta.tsx"], ["components", "CtaEstudante.tsx"], ["components", "BlocoPreco.tsx"],
    ["components", "BlocoOferta.tsx"], ["components", "EstudanteEspera.tsx"], ["config.ts"], ["lib", "i18n.ts"], ["lib", "seo.ts"],
    ["components", "estudante-atual", "BlocoPrecoAtual.tsx"],
    ["components", "EstudanteForm.tsx"],
  ]) {
    const t = semComentarios(fs.readFileSync(arq(...f), "utf8"));
    const achou = t.match(DURACAO_DA_GRADUACAO);
    assert.equal(achou, null, `${f.join("/")}: "${achou && achou[0]}"`);
  }
  // O exemplo do problema, de verdade, é pego pela regra.
  for (const frase of [
    "O que muda é quanto você paga por ele enquanto está na graduação.",
    "Uma provocação por dia durante toda a sua graduação",
    "Lo que cambia es cuánto pagas por ella mientras estás cursando.",
    "por R$ 89,90, enquanto você ainda estuda.",
  ]) assert.match(frase, DURACAO_DA_GRADUACAO, frase);
});

/* ------------------------- home: card do estudante ------------------------- */

test("Home.tsx: o card do estudante depende de ESTUDANTE.aberto e o preço, de ESTUDANTE.mostrarPreco", () => {
  const fonte = require("fs").readFileSync(arq("components", "Home.tsx"), "utf8");
  assert.match(fonte, /\{mkt === "br" && ESTUDANTE\.aberto && \(/);
  assert.match(fonte, /ESTUDANTE\.mostrarPreco \? t\.stH\.replace\("\{preco\}"/);
  // o único outro link da home para a /estudante é o do bloco de oferta
  const links = fonte.match(/caminho\("estudante"/g) || [];
  assert.equal(links.length, 1);
});

test("barra fixa sem venda: rótulo curto numa linha só; selo do Google Play sem corte (revisão de 28/10/2026)", () => {
  const fs = require("fs");
  for (const m of P.LISTA_MERCADOS) {
    const e = P.MERCADOS[m].espera;
    assert.ok(e.botaoCurto && e.botaoCurto.length <= 10, `${m}: ${e.botaoCurto}`);
    assert.ok(e.botao.startsWith(e.botaoCurto.replace(/-me$/, "")), `${m}: o curto é o começo do inteiro`);
  }
  const home = fs.readFileSync(arq("components", "Home.tsx"), "utf8");
  assert.match(home, /whiteSpace: "nowrap", cursor: "pointer" \}\}>\{vende \? ctaLabel : oferta\.espera\.botaoCurto\}<\/button>/);
  const gp = home.match(/<a href=\{LINKS\.googlePlay\}[^>]*>/)[0];
  assert.equal(/overflow/.test(gp), false, gp);
});
