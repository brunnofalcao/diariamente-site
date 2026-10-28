/* =====================================================================
   TRAVA DE PREÇOS E CHECKOUT
   ---------------------------------------------------------------------
   Mesmo padrão da trava do endereço (scripts/checar-endereco.js): o
   `next build` de produção FALHA, com a explicação, enquanto:

     1. o link da oferta oficial do Brasil (CHECKOUT_BRL) faltar, sair do
        checkout da Hotmart, for o link antigo de R$ 137,90 ou levar cupom;
     2. a oferta de lançamento estiver incompleta: link (CHECKOUT_LANCAMENTO)
        faltando, fora da Hotmart, com cupom ou IGUAL ao do preço cheio
        (a página mostraria R$ 99,98 e o checkout cobraria R$ 149,90),
        data de término (FIM_DO_LANCAMENTO) faltando ou inexistente,
        preço ou número de anos inválidos;
     3. algum mercado estiver com vendaAberta: true sem o link do plano
        daquela moeda: o botão abriria para lugar nenhum;
     4. o build é de PRODUÇÃO na Vercel (VERCEL_ENV=production), algum
        mercado vende (vendaAberta: true) e falta DM_WEBHOOK_V2_OK=1. É a
        ordem que o dono exigiu: o site só vende depois de o webhook do
        produto 7448309 estar reconfigurado para o app e a
        HOTMART_WEBHOOK_V2 na posição 1 no Railway (senão quem paga fica
        sem conta). Feito esse passo, o dono põe DM_WEBHOOK_V2_OK=1 nas
        variáveis de Production da Vercel. Preview e build local não
        travam por isso (só avisam).

   STANDBY (chave de lançamento desligada; decisão do dono, 27/10/2026).
   Tudo o que está acima trava o LANÇAMENTO. Enquanto DM_SITE_LANCADO não
   for "1" (config/lancamento.ts), as homes mostram a lista de espera e o
   site de vendas fica na vitrine (/vendas, /es/vendas, /es-es/vendas,
   /pt-pt/vendas e /mundo/vendas, noindex): nada disso para o build de
   produção, que precisa continuar publicando em standby. O que travaria
   o lançamento sai como aviso no log ("ao ligar a chave, o build de
   produção TRAVARIA por isto"), com o mesmo texto (emStandby, mais
   abaixo). Ligada a chave, as travas voltam a valer exatamente como
   estão aqui: o build de produção da Vercel com venda aberta e sem
   DM_WEBHOOK_V2_OK=1 falha, e o deploy anterior (standby) continua no ar.
   checarPrecos, a regra em si, não muda: a chave entra só no
   checarPrecosDoProjeto, que o next.config.js chama.

   CHECKOUT NA VITRINE (decisão do dono, 27/10/2026: "Já pode colocar o
   link do checkout. Quero testar a jornada inteira."): em standby, os
   botões da vitrine abrem o checkout de verdade da Hotmart, em todos os
   mercados, sem esperar DM_WEBHOOK_V2_OK=1. A ordem do item 4 acima
   continua valendo para o LANÇAMENTO público: com a chave ligada, o
   build de produção sem DM_WEBHOOK_V2_OK=1 para. A trava do endereço
   (scripts/checar-endereco.js) não depende da chave: os Termos e a
   Política são públicos nos dois estados.

   O lançamento NÃO é cupom (decisão do dono, 12/10/2026): é uma oferta
   própria da Hotmart. Nenhum link de venda leva offDiscount. O estudante
   também não (decisão do dono, 28/10/2026): a API de cupons da Hotmart
   não aceita produto de assinatura, e o preço de estudante é uma OFERTA
   por fase (ESTUDANTE_OFERTA_LANCAMENTO e ESTUDANTE_OFERTA).

   Avisos (não travam, saem em todo build):
     - lançamento ligado: até quando, para qual link, e o lembrete de
       desativar a oferta na Hotmart depois da data (o link é aberto);
     - lançamento desligado (ativo: false) ou já vencido;
     - mercados em lista de espera (vendaAberta: false), para a decisão
       de deixar um mercado de fora ficar à vista no log;
     - link do plano BRL fora do checkout conhecido do produto 7448309;
     - estudante FECHADO ou ABERTO neste build (estadoDoEstudante, logo
       abaixo), a oferta de estudante da fase SEGUINTE faltando e o
       e-mail do estudante (RESEND_API_KEY).

   ESTUDANTE ABERTO OU FECHADO (estadoDoEstudante). O fluxo do link
   pessoal precisa de duas coisas:
     - na Vercel, o modelo v2 do WhatsApp em WA_TEMPLATE_ESTUDANTE (ou
       DM_TEMPLATE_ESTUDANTE_OK=1): o botão dele abre /estudante/ativar.
       Sem ele, o next.config.js grava DM_ESTUDANTE_ABERTO vazio;
     - em config/pricing.ts, o código da oferta de estudante da FASE
       VIGENTE: ESTUDANTE_OFERTA_LANCAMENTO (R$ 59,90) até 16/11/2026 e
       ESTUDANTE_OFERTA (R$ 79,90) depois, com a mesma virada do card do
       Brasil (lancamentoVigente). Este é conferido também NA HORA, a cada
       página e pedido (config.ts, estudanteAberto): na virada, sem o
       código da fase nova, o site fecha sozinho.
   Fechado: a home não leva à /estudante, a /estudante mostra a lista de
   espera no lugar do formulário, a /api/estudante/solicitar responde 503
   SEM gravar nada (nenhum link nasce, nenhum CPF fica preso, nenhuma
   mensagem sai) e o /estudante/ativar volta para a /estudante.
   STUDENT_DISCOUNT, HOTMART_OFFER_IDS e HOTMART_PRODUCT_ID não contam
   mais (eram do cupom pela API, que só existe em standby).

   Tudo é lido do config/pricing.ts de verdade (scripts/carregar-ts.js),
   não de uma cópia.

   Build de teste: a mesma variável da trava do endereço,
   DM_ENDERECO_TESTE, libera o build com aviso. Ela é RECUSADA em build
   de produção da Vercel (só preview aceita), então não vai ao ar por
   engano. Com ela, a página mostra o botão desabilitado onde falta link.

   CommonJS puro, sem dependência nova. Testes em test/checar-precos.test.js.
   ===================================================================== */

const fs = require("fs");
const path = require("path");
const { carregarTs } = require("./carregar-ts");

/* Códigos de checkout da Hotmart (pay.hotmart.com/CODIGO?off=OFERTA).
   O código é do PRODUTO, não da oferta: a oferta vem no parâmetro off.
   - L107085210M: checkout do produto 8280315. Sem off, abre a oferta
     antiga de R$ 137,90 (handoff, seção 4), hoje fechada com o erro 049.
     Só esse caso é recusado; com off, é uma oferta escolhida de propósito.
   - K105072021O: checkout do produto 7448309 (confirmado pelo dono em
     12/10/2026). Outro código gera aviso, nunca bloqueio. */
const LINK_ANTIGO = "L107085210M";
const CHECKOUT_DO_7448309 = "K105072021O";

/* Modelo de WhatsApp antigo do estudante. O botão dele foi aprovado com
   a base do checkout antigo (produto 8280315). O v2
   (diariamente_estudante_aprovado_v2, aprovado), com o botão
   https://www.diariamente.app/estudante/ativar?cupom={{1}}, vai em
   WA_TEMPLATE_ESTUDANTE (lib/whatsapp.js). */
const MODELO_ESTUDANTE_ANTIGO = "diariamente_estudante_aprovado";

/** Produto da Hotmart do site (o mesmo PRODUTO_HOTMART de config/pricing.ts). */
const PRODUTO_DO_SITE = "7448309";

/* Endereço técnico do site: o mesmo SITE.dominio do config.ts, com www.
   Sem www, a Vercel responde 308 para cá. O navegador segue o 308 (o
   botão do WhatsApp é um GET), mas o POST do webhook da Hotmart pode não
   seguir, e aí o cupom usado não é apagado. Por isso os avisos dizem o
   endereço com www (o webhook marca o link do estudante como usado). O
   config.ts importa o pricing e não é carregado aqui;
   test/checar-precos.test.js confere que os dois valores batem. */
const SITE_DOMINIO = "https://www.diariamente.app";

function pendente(v) {
  return !v || /\[PREENCHER/i.test(String(v));
}

/** Data AAAA-MM-DD que existe no calendário (2026-11-31 não existe). */
function dataReal(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return false;
  const d = new Date(`${v}T12:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Primeiro trecho do caminho do link: o código de checkout do produto. */
function codigoDoCheckout(url) {
  return url.pathname.split("/").filter(Boolean)[0] || "";
}

/** "17/11" a partir de "2026-11-16": o dia seguinte ao fim. */
function diaSeguinte(aaaammdd) {
  const d = new Date(`${aaaammdd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** "16/11/2026" a partir de "2026-11-16". */
function dataBr(aaaammdd) {
  const [a, m, d] = aaaammdd.split("-");
  return `${d}/${m}/${a}`;
}

/** Formata R$ para as mensagens (só o Brasil tem lançamento). */
function reais(v) {
  return `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
}

/** Problema com o link de um plano, ou null se ele está bom. */
function problemaDoLink(link, rotulo) {
  if (pendente(link)) return `${rotulo}: link de checkout ainda é "[PREENCHER...]".`;
  let url;
  try {
    url = new URL(link);
  } catch {
    return `${rotulo}: "${link}" não é um endereço válido.`;
  }
  if (url.protocol !== "https:" || !/(^|\.)hotmart\.com$/.test(url.hostname)) {
    return `${rotulo}: o link precisa ser do checkout da Hotmart (https://pay.hotmart.com/...).`;
  }
  if (codigoDoCheckout(url) === LINK_ANTIGO && !url.searchParams.has("off")) {
    return `${rotulo}: ${LINK_ANTIGO} sem o parâmetro off é a oferta antiga de R$ 137,90. Use o link da oferta nova.`;
  }
  if (url.searchParams.has("offDiscount")) {
    return `${rotulo}: tire o offDiscount do link. Link de venda não leva cupom (o lançamento é uma oferta própria).`;
  }
  return null;
}

/** "fhrttdh8" de https://pay.hotmart.com/K105072021O?off=fhrttdh8 (ou ""). */
function ofertaDoLink(link) {
  try {
    return new URL(link).searchParams.get("off") || "";
  } catch {
    return "";
  }
}

/* ----------------------------- estudante -----------------------------
   Duas ofertas, uma por fase, lidas do config/pricing.ts de verdade. */

const CONSTANTE_DA_FASE = { lancamento: "ESTUDANTE_OFERTA_LANCAMENTO", depois: "ESTUDANTE_OFERTA" };

/** Código de oferta da Hotmart (o off): só letras e números. */
function codigoDeOfertaValido(v) {
  return typeof v === "string" && /^[A-Za-z0-9]{4,20}$/.test(v);
}

/**
 * O que a página anuncia ao estudante, lido do config/pricing.ts:
 *   anual       preço oficial do Brasil (R$ 149,90), o de depois dos anos
 *   precos      ESTUDANTE_PRECO_FINAL { lancamento: 59.9, depois: 79.9 }
 *   ofertas     OFERTAS_DO_ESTUDANTE { lancamento, depois }: os códigos
 *   anos        ESTUDANTE_ANOS (3)
 *   lancamento  o lançamento do Brasil (ativo, checkout, terminaEm): a
 *               virada da fase é a mesma do card
 */
function alvoDoEstudante(cfg) {
  const br = cfg && cfg.MERCADOS && cfg.MERCADOS.br;
  return {
    anual: br ? br.anual : undefined,
    precos: cfg ? cfg.ESTUDANTE_PRECO_FINAL : undefined,
    ofertas: cfg ? cfg.OFERTAS_DO_ESTUDANTE : undefined,
    anos: cfg ? cfg.ESTUDANTE_ANOS : undefined,
    lancamento: br ? br.lancamento : undefined,
  };
}

/** Fim do preço de lançamento em ms (dia seguinte ao terminaEm, 00:00 de
    Brasília), ou null. Igual ao fimDoLancamento de config/pricing.ts. */
function fimDoLancamentoEm(l) {
  if (!l || !dataReal(l.terminaEm)) return null;
  const t = Date.parse(`${l.terminaEm}T23:59:59.999-03:00`);
  return Number.isFinite(t) ? t + 1 : null;
}

/** A fase do estudante em `agora`: a mesma regra do lancamentoVigente de
    config/pricing.ts (ativo, link preenchido e a data não passada). Um
    teste confere que as duas concordam. */
function faseDoEstudanteEm(l, agora = Date.now()) {
  const fim = fimDoLancamentoEm(l);
  return l && l.ativo && !pendente(l.checkout) && fim !== null && agora < fim ? "lancamento" : "depois";
}

/** As ofertas (off) dos links de venda de todos os mercados: a do
    estudante não pode ser nenhuma delas. */
function ofertasDeVenda(mercados) {
  const r = [];
  for (const [m, o] of Object.entries(mercados || {})) {
    const off = ofertaDoLink(o && o.checkout);
    if (off) r.push([off, m === "br" ? "CHECKOUT_BRL" : `o mercado ${m}`]);
    const offL = ofertaDoLink(o && o.lancamento && o.lancamento.checkout);
    if (offL) r.push([offL, "CHECKOUT_LANCAMENTO"]);
  }
  return r;
}

/** Problemas do estudante no config/pricing.ts (travam o build de
    produção com a chave ligada). Código vazio NÃO é problema: só fecha a
    fase dele. */
function problemasDoAlvo(alvo, mercados) {
  const a = alvo || {};
  const p = [];
  if (!(typeof a.anual === "number" && a.anual > 0)) return ["Estudante: preço oficial do Brasil ausente no config/pricing.ts."];
  const precos = a.precos || {};
  for (const f of ["lancamento", "depois"]) {
    const v = precos[f];
    if (!(typeof v === "number" && v > 0 && v < a.anual)) {
      p.push(`ESTUDANTE_PRECO_FINAL.${f} inválido: ${v} (precisa ser maior que zero e menor que ${reais(a.anual)}).`);
    }
  }
  if (!(Number.isInteger(a.anos) && a.anos >= 1)) p.push(`ESTUDANTE_ANOS inválido: ${a.anos}.`);
  const ofertas = a.ofertas || {};
  const vendas = ofertasDeVenda(mercados);
  for (const f of ["lancamento", "depois"]) {
    const c = String(ofertas[f] || "").trim();
    if (!c) continue;
    if (!codigoDeOfertaValido(c)) {
      p.push(
        `${CONSTANTE_DA_FASE[f]}="${c}" não é um código de oferta da Hotmart: ponha só o valor do off do link ` +
          "(8 letras e números, como lf63bgdd), sem o endereço nem o nome do cupom."
      );
      continue;
    }
    const igual = vendas.find(([off]) => off === c);
    if (igual) {
      p.push(
        `${CONSTANTE_DA_FASE[f]}=${c} é a oferta de ${igual[1]}: a página mostraria ${reais(precos[f])} ao estudante ` +
          "e o checkout cobraria outro preço. Use o código da oferta criada com o cupom de estudante dessa fase."
      );
    }
  }
  const l = String(ofertas.lancamento || "").trim();
  const d = String(ofertas.depois || "").trim();
  if (l && d && l === d) {
    p.push(
      `ESTUDANTE_OFERTA_LANCAMENTO e ESTUDANTE_OFERTA são a mesma oferta (${l}): uma das fases cobraria o preço da outra ` +
        `(${reais(precos.lancamento)} e ${reais(precos.depois)}). Cada fase tem a sua oferta.`
    );
  }
  return p;
}

/**
 * O fluxo do estudante pode abrir neste build?
 *   env    process.env (o da Vercel no build)
 *   alvo   alvoDoEstudante: preços, ofertas, anos e o lançamento do br
 *   agora  ms (a fase vigente no build)
 * Devolve { aberto, configurado, faltas[], fase, oferta, faltaProxima,
 * modelo, nomeInvalido }:
 *   configurado  a Vercel está pronta (o modelo v2) e o config não tem
 *                erro: é o que o next.config.js grava em
 *                DM_ESTUDANTE_ABERTO. A oferta da fase é conferida na
 *                hora (config.ts, estudanteAberto).
 *   aberto       configurado E a fase vigente com o código da oferta.
 *   faltaProxima no lançamento, o ESTUDANTE_OFERTA vazio: em 17/11 o
 *                fluxo fecha sozinho (aviso, não fecha agora).
 */
function estadoDoEstudante(env = {}, alvo = {}, agora = Date.now(), mercados = undefined) {
  const faltas = [];
  // Mesma regra de lib/whatsapp.js: nome fora do padrão da Meta (só
  // minúsculas, números e _) faz o envio voltar ao modelo antigo.
  const nomeEnv = String(env.WA_TEMPLATE_ESTUDANTE || "").trim();
  const modelo = /^[a-z0-9_]{1,512}$/.test(nomeEnv) ? nomeEnv : MODELO_ESTUDANTE_ANTIGO;
  // O botão do WhatsApp mora no painel da Meta, que nada aqui consegue
  // ler: o nome do modelo diz qual vai, e DM_TEMPLATE_ESTUDANTE_OK=1
  // confirma à mão.
  const confirmado = String(env.DM_TEMPLATE_ESTUDANTE_OK || "").trim() === "1";
  if (modelo === MODELO_ESTUDANTE_ANTIGO && !confirmado) {
    faltas.push(
      "na Vercel, WA_TEMPLATE_ESTUDANTE=diariamente_estudante_aprovado_v2 (o modelo aprovado, cujo botão é " +
        `${SITE_DOMINIO}/estudante/ativar?cupom={{1}}; o ${MODELO_ESTUDANTE_ANTIGO} abre o checkout antigo, do produto 8280315)`
    );
  }
  const a = alvo || {};
  const erros = problemasDoAlvo(a, mercados);
  for (const e of erros) faltas.push(`config/pricing.ts: ${e}`);
  const configurado = faltas.length === 0;

  const fase = faseDoEstudanteEm(a.lancamento, agora);
  const ofertas = a.ofertas || {};
  const precos = a.precos || {};
  const oferta = String(ofertas[fase] || "").trim();
  const ofertaOk = codigoDeOfertaValido(oferta);
  if (!ofertaOk && !oferta) {
    faltas.push(
      `em config/pricing.ts, ${CONSTANTE_DA_FASE[fase]} com o código (off) da oferta de estudante de ` +
        `${reais(precos[fase])} por ano nos ${a.anos} primeiros anos, criada pelo dono na Hotmart (docs/ESTUDANTE.md)`
    );
  }
  let faltaProxima = null;
  if (fase === "lancamento" && !String(ofertas.depois || "").trim()) {
    const fim = a.lancamento && a.lancamento.terminaEm;
    faltaProxima =
      `ESTUDANTE_OFERTA, em config/pricing.ts: a partir de ${fim ? diaSeguinte(fim) : "o fim do lançamento"} o estudante paga ` +
      `${reais(precos.depois)} por ano nos ${a.anos} primeiros anos, e sem o código dessa oferta a /estudante fecha sozinha ` +
      "nessa data (lista de espera, API em 503, home sem o card).";
  }
  return {
    aberto: configurado && ofertaOk, configurado, faltas, fase, oferta: ofertaOk ? oferta : "", faltaProxima,
    modelo, nomeInvalido: Boolean(nomeEnv) && modelo !== nomeEnv,
  };
}

/**
 * Decide se o build pode seguir.
 *   mercados       o MERCADOS do config/pricing.ts
 *   alvoEstudante  { precos, ofertas, anos } (alvoDoEstudante): o anual e
 *                  o lançamento vêm do mercados.br
 *   env            process.env
 *   agora          ms (para o aviso de data vencida)
 *   produto        PRODUTO_HOTMART de config/pricing.ts
 * Devolve { ok, teste, problemas[], avisos[], mensagem, estudante }.
 */
function checarPrecos({
  mercados, alvoEstudante = {}, env = {}, agora = Date.now(), estudanteMostraPreco = false, produto = PRODUTO_DO_SITE,
}) {
  const problemas = [];
  // Problemas que não estão no config/pricing.ts (a ordem do lançamento):
  // travam igual, com outra explicação.
  const ordem = [];
  const avisos = [];
  const br = mercados && mercados.br;

  if (!br) {
    problemas.push("config/pricing.ts não tem o mercado br.");
  } else {
    const p = problemaDoLink(br.checkout, "CHECKOUT_BRL (oferta oficial do Brasil, produto 7448309)");
    if (p) problemas.push(p);
    else if (codigoDoCheckout(new URL(br.checkout)) !== CHECKOUT_DO_7448309) {
      avisos.push(
        `CHECKOUT_BRL usa o checkout ${codigoDoCheckout(new URL(br.checkout))}, e o do produto 7448309 é ` +
          `${CHECKOUT_DO_7448309}. Confira na Hotmart se a oferta é mesmo desse produto.`
      );
    }

    const l = br.lancamento;
    if (!l) {
      avisos.push("O mercado br está sem oferta de lançamento: a página mostra só o preço cheio.");
    } else {
      const pl = problemaDoLink(l.checkout, "CHECKOUT_LANCAMENTO (oferta de lançamento)");
      if (pl) problemas.push(pl);
      else if (!p && (l.checkout === br.checkout || (ofertaDoLink(l.checkout) && ofertaDoLink(l.checkout) === ofertaDoLink(br.checkout)))) {
        problemas.push(
          "CHECKOUT_LANCAMENTO é a mesma oferta do CHECKOUT_BRL: a página mostraria o preço de lançamento " +
            "e o checkout cobraria o preço cheio. Use o link da oferta de lançamento."
        );
      }
      if (!(typeof l.anual === "number" && l.anual > 0 && l.anual < br.anual)) {
        problemas.push(`Preço da oferta de lançamento inválido: ${l.anual} (precisa ser maior que zero e menor que ${br.anual}).`);
      }
      if (!(Number.isInteger(l.anos) && l.anos >= 1)) {
        problemas.push(`Anos do preço de lançamento inválidos: ${l.anos}.`);
      }
      let vencido = false;
      if (pendente(l.terminaEm)) {
        problemas.push('FIM_DO_LANCAMENTO: data de término ainda é "[PREENCHER...]".');
      } else if (!dataReal(l.terminaEm)) {
        problemas.push(`FIM_DO_LANCAMENTO: "${l.terminaEm}" não é uma data que existe, no formato AAAA-MM-DD.`);
      } else if (Date.parse(`${l.terminaEm}T23:59:59.999-03:00`) < agora) {
        vencido = true;
        avisos.push(
          `O lançamento terminou em ${dataBr(l.terminaEm)}: a página mostra o preço cheio e o botão abre o CHECKOUT_BRL. ` +
            "Confira se a oferta de lançamento já está desativada na Hotmart (o link dela é aberto)."
        );
      }
      if (!l.ativo) {
        const teste = !pl ? ` Antes de ligar, abra ${l.checkout} e confira ${reais(l.anual)} no checkout.` : "";
        avisos.push(
          `Lançamento desligado (ativo: false em config/pricing.ts): a página mostra ${reais(br.anual)} ` +
            "e o botão abre o CHECKOUT_BRL." + teste
        );
      } else if (!vencido && dataReal(l.terminaEm) && !pl) {
        avisos.push(
          `Lançamento ligado até ${dataBr(l.terminaEm)}: a página mostra ${reais(l.anual)} por ano e o botão abre ` +
            `${l.checkout}. Na Hotmart, mantenha essa oferta ativa até 02:00 de ${diaSeguinte(l.terminaEm)} e depois desative-a ` +
            "(o link dela é aberto: quem o guardou pagaria o preço de lançamento)."
        );
      }
    }
  }

  // O link de TODO mercado passa pela mesma conferência (o do Brasil já
  // passou acima). Mercado aberto: trava, como sempre. Mercado fechado:
  // aviso, porque na vitrine (/es/vendas, /pt-pt/vendas...) o botão já
  // abre esse link (decisão do dono, 27/10/2026), mas o lançamento
  // público não vende nele.
  const fechados = [];
  for (const [m, o] of Object.entries(mercados || {})) {
    if (m !== "br") {
      if (o.vendaAberta) {
        const p = problemaDoLink(o.checkout, `Mercado ${m} com vendaAberta: true`);
        if (p) problemas.push(p);
      } else {
        const p = problemaDoLink(o.checkout, `Mercado ${m} (venda fechada; na vitrine o botão já abre este link)`);
        if (p) avisos.push(p);
      }
    }
    if (!o.vendaAberta) fechados.push(m);
  }
  if (fechados.length) {
    avisos.push(
      `Mercados em lista de espera (vendaAberta: false): ${fechados.join(", ")}. ` +
        "Decisão do dono: para abrir um deles, vire vendaAberta para true (o link de cada um já está no config)."
    );
  }

  /* ------------------ webhook do 7448309 antes de vender ------------------ */
  const vendendo = Object.entries(mercados || {}).filter(([, o]) => o && o.vendaAberta).map(([m]) => m);
  const webhookOk = String(env.DM_WEBHOOK_V2_OK || "").trim() === "1";
  if (vendendo.length && !webhookOk) {
    const passo =
      "o webhook do produto 7448309 reconfigurado para o app e a HOTMART_WEBHOOK_V2 na posição 1 no Railway " +
      "(docs/HOTMART-WEBHOOK-V2.md, no repositório do app); sem isso, quem paga fica sem conta";
    if (String(env.VERCEL_ENV || "").trim() === "production") {
      ordem.push(
        `Build de produção com venda aberta (${vendendo.join(", ")}) e sem DM_WEBHOOK_V2_OK=1. Antes de o site vender: ` +
          `${passo}. Feito esse passo, ponha DM_WEBHOOK_V2_OK=1 nas variáveis de Production da Vercel e faça um novo deploy.`
      );
    } else {
      avisos.push(
        "Na Vercel (Production), com a chave de lançamento ligada (DM_SITE_LANCADO=1), este build só passa com " +
          `DM_WEBHOOK_V2_OK=1, que o dono põe depois de: ${passo}.`
      );
    }
  }

  /* ----------------------------- estudante ----------------------------- */
  const alvo = { ...alvoEstudante, anual: br ? br.anual : undefined, lancamento: br ? br.lancamento : undefined };
  if (br) for (const e of problemasDoAlvo(alvo, mercados)) problemas.push(e);
  const estudante = estadoDoEstudante(env, alvo, agora, mercados);
  if (estudante.nomeInvalido) {
    avisos.push(
      `WA_TEMPLATE_ESTUDANTE="${String(env.WA_TEMPLATE_ESTUDANTE).trim()}" não é um nome de modelo da Meta ` +
        `(só minúsculas, números e _): o envio usa ${MODELO_ESTUDANTE_ANTIGO}.`
    );
  }
  const precos = alvo.precos || {};
  const ofertasEst = alvo.ofertas || {};
  const fimL = br && br.lancamento && dataReal(br.lancamento.terminaEm) ? br.lancamento.terminaEm : null;
  const faseTexto = estudante.fase === "lancamento"
    ? `no lançamento, até ${fimL ? dataBr(fimL) : "o fim dele"}: ${reais(precos.lancamento)} por ano nos ${alvo.anos} primeiros anos`
    : `depois do lançamento: ${reais(precos.depois)} por ano nos ${alvo.anos} primeiros anos`;
  if (!estudante.aberto) {
    avisos.push(
      `Estudante FECHADO neste build (fase ${faseTexto}): a home não leva à /estudante, a /estudante mostra a lista de ` +
        "espera no lugar do formulário, /api/estudante/solicitar responde 503 sem gravar nada (nenhum link, nenhum CPF preso) " +
        `e /estudante/ativar volta para a /estudante. Para abrir: ${estudante.faltas.join("; ")}. Depois, um novo deploy.` +
        (estudanteMostraPreco ? " A /estudante continua mostrando o preço de estudante (ESTUDANTE.mostrarPreco), com o aviso de que a solicitação abre em breve." : "")
    );
  } else {
    avisos.push(
      `Estudante ABERTO neste build (modelo ${estudante.modelo}; fase ${faseTexto}; oferta off=${estudante.oferta}: o link ` +
        `pessoal abre https://pay.hotmart.com/${CHECKOUT_DO_7448309}?off=${estudante.oferta}). Confira que o webhook do site ` +
        `(${SITE_DOMINIO}/api/webhooks/hotmart, com www) está cadastrado no ${produto} com compra aprovada: é ele que marca o link ` +
        "como usado. E confira o PRIMEIRO checkout real da oferta: o preço da fase à vista, parcelamento em até 12x com acréscimo " +
        "e o cupom só nas 3 primeiras recorrências, no plano Anual."
    );
  }
  if (estudante.faltaProxima) avisos.push(`Estudante: falta o código da fase seguinte. ${estudante.faltaProxima}`);
  const ofertaL = String(ofertasEst.lancamento || "").trim();
  if (ofertaL && codigoDeOfertaValido(ofertaL)) {
    avisos.push(
      estudante.fase === "lancamento" && fimL
        ? `Estudante: na Hotmart, mantenha a oferta de estudante do lançamento (off=${ofertaL}) ativa até 02:00 de ${diaSeguinte(fimL)} ` +
            "e depois desative-a (o link dela é aberto: quem o guardou pagaria o preço de lançamento)."
        : `Estudante: o lançamento acabou; desative na Hotmart a oferta de estudante do lançamento (off=${ofertaL}), se ainda não fez: o link dela é aberto.`
    );
  }
  if (!String(env.RESEND_API_KEY || "").trim()) {
    avisos.push(
      "Estudante, e-mail: sem RESEND_API_KEY na Vercel, o site não manda o e-mail de aprovação; o link pessoal vai pelo " +
        "WhatsApp e no campo cf_link_estudante da conversão do RD Station, para a automação de lá usar (docs/ESTUDANTE.md)."
    );
  }

  const comAvisos = (texto) => (avisos.length ? `${texto} Avisos: ${avisos.join(" ")}` : texto);
  const deOrdem = ordem.length
    ? " O site ainda não pode vender em produção (ordem do lançamento): " + ordem.join(" ")
    : "";

  // A ordem do lançamento só vale na produção da Vercel, onde
  // DM_ENDERECO_TESTE já é recusada: trava sempre.
  if (ordem.length) {
    const doConfig = problemas.length
      ? "Faltam ou estão errados dados de preço e checkout em config/pricing.ts (bloco \"LINKS DA HOTMART\"): " +
        problemas.join(" ")
      : "";
    return {
      ok: false, teste: Boolean(String(env.DM_ENDERECO_TESTE || "").trim()), problemas: [...problemas, ...ordem], avisos, estudante,
      mensagem: comAvisos((doConfig + deOrdem).trim()),
    };
  }

  const teste = String(env.DM_ENDERECO_TESTE || "").trim();
  if (problemas.length && teste) {
    if (env.VERCEL && env.VERCEL_ENV !== "preview") {
      return {
        ok: false, teste: true, problemas, avisos, estudante,
        mensagem: comAvisos(
          "DM_ENDERECO_TESTE existe neste build da Vercel e ela serve só para teste. " +
            "Corrija em config/pricing.ts: " + problemas.join(" ")
        ),
      };
    }
    return {
      ok: true, teste: true, problemas, avisos, estudante,
      mensagem: comAvisos("Build de TESTE com preços pendentes (não publique): " + problemas.join(" ")),
    };
  }

  if (problemas.length) {
    return {
      ok: false, teste: false, problemas, avisos, estudante,
      mensagem: comAvisos(
        "Faltam ou estão errados dados de preço e checkout, e o site não pode vender assim. Abra config/pricing.ts " +
          "e confira o bloco \"LINKS DA HOTMART\": " + problemas.join(" ") +
          ' Para só testar o build na sua máquina, rode com DM_ENDERECO_TESTE="Rua de Teste, 123".'
      ),
    };
  }
  return { ok: true, teste: false, problemas, avisos, estudante, mensagem: avisos.join(" ") };
}

/**
 * A chave de lançamento: DM_SITE_LANCADO=1. Qualquer outro valor (ou
 * nenhum) é standby. Mesma regra do next.config.js, que grava o valor no
 * build, e do config/lancamento.ts, que o lê.
 */
function siteLancado(env = {}) {
  return String(env.DM_SITE_LANCADO || "").trim() === "1";
}

/**
 * Standby: o resultado da trava vira aviso. O build passa; o log diz o
 * que travaria o build de produção quando a chave for ligada.
 */
function emStandby(r) {
  const base =
    "Site em STANDBY (DM_SITE_LANCADO desligada): as homes mostram a lista de espera e o site de vendas " +
    "fica na vitrine: /vendas, /es/vendas, /es-es/vendas, /pt-pt/vendas e /mundo/vendas (noindex). A trava de " +
    "preços e a do webhook (DM_WEBHOOK_V2_OK) não param este build; voltam a valer quando a chave for ligada " +
    "(docs/LANCAMENTO.md). Na vitrine, todos os mercados aparecem com a venda aberta e os botões abrem o " +
    "checkout de verdade da Hotmart (decisão do dono, 27/10/2026), e a /estudante é a da produção (formulário " +
    "aberto, R$ 77,00); o que vem abaixo sobre o estudante vale para o fluxo novo, com a chave ligada.";
  if (r.ok) return { ...r, standby: true, mensagem: r.mensagem ? `${base} ${r.mensagem}` : base };
  return {
    ...r, ok: true, standby: true,
    mensagem: `${base} Ao ligar a chave, o build de produção TRAVARIA por isto: ${r.mensagem}`,
  };
}

function carregarPrecos() {
  return carregarTs(path.join(__dirname, "..", "config", "pricing.ts"));
}

/** ESTUDANTE.mostrarPreco, lido do texto do config.ts (que importa o
    pricing e o Next, e por isso não é carregado inteiro aqui). */
function estudanteMostraPrecoNoConfig() {
  const texto = fs.readFileSync(path.join(__dirname, "..", "config.ts"), "utf8");
  const bloco = texto.match(/export\s+const\s+ESTUDANTE\s*=\s*\{([\s\S]*?)\n\};/);
  return Boolean(bloco && /^\s*mostrarPreco:\s*true\b/m.test(bloco[1]));
}

/** Atalho usado pelo next.config.js. Erro ao ler o config também trava
    (com a chave de lançamento ligada; em standby, avisa). */
function checarPrecosDoProjeto(env = process.env) {
  const r = checarPrecosDoConfig(env);
  return siteLancado(env) ? r : emStandby(r);
}

/** A trava do lançamento sobre o config/pricing.ts real, sem a chave. */
function checarPrecosDoConfig(env) {
  let cfg;
  try {
    cfg = carregarPrecos();
  } catch (e) {
    return {
      ok: false, teste: false, problemas: [], avisos: [],
      mensagem: `Não consegui ler config/pricing.ts (${e && e.message}).`,
    };
  }
  let estudanteMostraPreco = false;
  try {
    estudanteMostraPreco = estudanteMostraPrecoNoConfig();
  } catch {
    // Sem o config.ts legível, o aviso do estudante só não sai: a trava do
    // endereço (scripts/checar-endereco.js) já para o build nesse caso.
  }
  return checarPrecos({
    mercados: cfg.MERCADOS, alvoEstudante: alvoDoEstudante(cfg), env, estudanteMostraPreco,
    produto: cfg.PRODUTO_HOTMART || PRODUTO_DO_SITE,
  });
}

/**
 * Atalho do next.config.js para gravar DM_ESTUDANTE_ABERTO no build (o
 * `configurado` do resultado). Erro ao ler o config/pricing.ts FECHA o
 * fluxo (a trava de preços já para o build de produção nesse caso).
 */
function estudanteDoProjeto(env = process.env, agora = Date.now()) {
  try {
    const cfg = carregarPrecos();
    return estadoDoEstudante(env, alvoDoEstudante(cfg), agora, cfg.MERCADOS);
  } catch (e) {
    return {
      aberto: false, configurado: false, faltas: [`config/pricing.ts ilegível (${e && e.message})`], fase: "depois", oferta: "",
      faltaProxima: null, modelo: MODELO_ESTUDANTE_ANTIGO, nomeInvalido: false,
    };
  }
}

module.exports = {
  checarPrecos, checarPrecosDoProjeto, carregarPrecos, problemaDoLink, dataReal, siteLancado, emStandby,
  estudanteMostraPrecoNoConfig, estadoDoEstudante, estudanteDoProjeto, alvoDoEstudante, faseDoEstudanteEm,
  problemasDoAlvo, codigoDeOfertaValido,
  LINK_ANTIGO, CHECKOUT_DO_7448309, MODELO_ESTUDANTE_ANTIGO, PRODUTO_DO_SITE, SITE_DOMINIO,
};
