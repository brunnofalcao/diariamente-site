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

   O lançamento NÃO é cupom (decisão do dono, 12/10/2026): é uma oferta
   própria da Hotmart. Nenhum link de venda leva offDiscount; só o
   estudante usa cupom, e o dele é pessoal, criado pela API.

   Avisos (não travam, saem em todo build):
     - lançamento ligado: até quando, para qual link, e o lembrete de
       desativar a oferta na Hotmart depois da data (o link é aberto);
     - lançamento desligado (ativo: false) ou já vencido;
     - mercados em lista de espera (vendaAberta: false), para a decisão
       de deixar um mercado de fora ficar à vista no log;
     - link do plano BRL fora do checkout conhecido do produto 7448309;
     - estudante FECHADO ou ABERTO neste build (estadoDoEstudante, logo
       abaixo) e, aberto ou não, HOTMART_OFFER_IDS vazio (o cupom pessoal
       valeria em qualquer oferta do produto, inclusive a de lançamento).

   ESTUDANTE ABERTO OU FECHADO (estadoDoEstudante). O fluxo do cupom
   pessoal só funciona com três coisas na Vercel: o modelo v2 do WhatsApp
   em WA_TEMPLATE_ESTUDANTE (ou DM_TEMPLATE_ESTUDANTE_OK=1), o
   HOTMART_PRODUCT_ID=7448309 e o STUDENT_DISCOUNT igual ao anunciado.
   Faltando qualquer uma, o next.config.js grava DM_ESTUDANTE_ABERTO vazio
   no build e o site fecha o fluxo sozinho: a home não leva à /estudante,
   a /estudante mostra a lista de espera no lugar do formulário e a
   /api/estudante/solicitar responde 503 SEM gravar nada (nenhum cupom
   nasce, nenhum CPF fica preso, nenhuma mensagem sai). Com as três, o
   próximo deploy abre o fluxo.

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

/* Modelo de WhatsApp aprovado hoje para o estudante. O botão dele foi
   aprovado com a base do checkout antigo (produto 8280315): o cupom
   pessoal, criado no 7448309, não abre ali. O v2, com o botão
   https://diariamente.app/estudante/ativar?cupom={{1}}, é criado pelo
   app; o nome dele vai em WA_TEMPLATE_ESTUDANTE (lib/whatsapp.js). */
const MODELO_ESTUDANTE_ANTIGO = "diariamente_estudante_aprovado";

/** Produto da Hotmart do site (o mesmo PRODUTO_HOTMART de config/pricing.ts). */
const PRODUTO_DO_SITE = "7448309";

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

/** HOTMART_OFFER_IDS como a lib/hotmart.js lê: só ids numéricos valem. */
function idsDeOfertaValidos(bruto) {
  return String(bruto || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
}

/**
 * O fluxo do cupom pessoal do estudante pode abrir neste build?
 *   env           process.env (o da Vercel no build)
 *   estudantePct  ESTUDANTE_DESCONTO (em %), o que a página anuncia
 *   produto       PRODUTO_HOTMART de config/pricing.ts
 * Devolve { aberto, faltas[], modelo, nomeInvalido }.
 *
 * Cada falta é um caso em que o estudante pediria o código e não
 * conseguiria ativar, com o CPF já preso pela regra "1 CPF = 1 lead":
 *   - modelo antigo: o botão do WhatsApp abre o checkout do 8280315;
 *   - HOTMART_PRODUCT_ID de outro produto: o cupom nasce lá, e o
 *     checkout K105072021O (7448309) não o reconhece;
 *   - STUDENT_DISCOUNT diferente do anunciado (ou vazio, quando a API já
 *     respondia 503): o checkout cobraria outro valor que o da página.
 * HOTMART_OFFER_IDS NÃO fecha o fluxo: sem ele o estudante paga o valor
 * certo, e o risco (o cupom valer também na oferta de lançamento) foi
 * aceito pelo dono. Ele continua no aviso.
 */
function estadoDoEstudante(env = {}, estudantePct = 40, produto = PRODUTO_DO_SITE) {
  const faltas = [];
  // Mesma regra de lib/whatsapp.js: nome fora do padrão da Meta (só
  // minúsculas, números e _) faz o envio voltar ao modelo antigo.
  const nomeEnv = String(env.WA_TEMPLATE_ESTUDANTE || "").trim();
  const modelo = /^[a-z0-9_]{1,512}$/.test(nomeEnv) ? nomeEnv : MODELO_ESTUDANTE_ANTIGO;
  // O botão do WhatsApp mora no painel da Meta, que nada aqui consegue
  // ler: o nome do modelo diz qual vai, e DM_TEMPLATE_ESTUDANTE_OK=1
  // confirma à mão (por exemplo, se o próprio modelo antigo for editado).
  const confirmado = String(env.DM_TEMPLATE_ESTUDANTE_OK || "").trim() === "1";
  if (modelo === MODELO_ESTUDANTE_ANTIGO && !confirmado) {
    faltas.push(
      "WA_TEMPLATE_ESTUDANTE com o nome do modelo v2 aprovado na Meta, cujo botão é " +
        `https://diariamente.app/estudante/ativar?cupom={{1}} (o ${MODELO_ESTUDANTE_ANTIGO} abre o checkout ` +
        "antigo, do produto 8280315, onde o cupom pessoal não vale)"
    );
  }
  const produtoEnv = String(env.HOTMART_PRODUCT_ID || "").trim();
  if (produtoEnv !== produto) {
    faltas.push(
      `HOTMART_PRODUCT_ID=${produto} (hoje ${produtoEnv ? `HOTMART_PRODUCT_ID=${produtoEnv}` : "vazio"}): ` +
        "o cupom nasce no produto dessa variável, e o checkout da oferta oficial é do " + produto
    );
  }
  const descontoEnv = String(env.STUDENT_DISCOUNT || "").trim();
  const esperado = estudantePct / 100;
  if (!descontoEnv || !(Math.abs(Number(descontoEnv) - esperado) <= 0.0001)) {
    faltas.push(
      `STUDENT_DISCOUNT=${esperado.toFixed(2)}, o ${estudantePct}% que a página anuncia ` +
        `(hoje ${descontoEnv ? `STUDENT_DISCOUNT=${descontoEnv}` : "vazio"})`
    );
  }
  return { aberto: faltas.length === 0, faltas, modelo, nomeInvalido: Boolean(nomeEnv) && modelo !== nomeEnv };
}

/**
 * Decide se o build pode seguir.
 *   mercados       o MERCADOS do config/pricing.ts
 *   estudantePct   ESTUDANTE_DESCONTO (em %)
 *   env            process.env
 *   agora          ms (para o aviso de data vencida)
 *   produto        PRODUTO_HOTMART de config/pricing.ts
 * Devolve { ok, teste, problemas[], avisos[], mensagem, estudante }.
 */
function checarPrecos({
  mercados, estudantePct, env = {}, agora = Date.now(), estudanteMostraPreco = false, produto = PRODUTO_DO_SITE,
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

  const fechados = [];
  for (const [m, o] of Object.entries(mercados || {})) {
    if (o.vendaAberta && m !== "br") {
      const p = problemaDoLink(o.checkout, `Mercado ${m} com vendaAberta: true`);
      if (p) problemas.push(p);
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
        `Na Vercel (Production), este build só passa com DM_WEBHOOK_V2_OK=1, que o dono põe depois de: ${passo}.`
      );
    }
  }

  /* ----------------------------- estudante ----------------------------- */
  if (!(estudantePct > 0 && estudantePct < 99)) {
    problemas.push(`ESTUDANTE_DESCONTO inválido: ${estudantePct}.`);
  }
  const estudante = estadoDoEstudante(env, estudantePct, produto);
  if (estudante.nomeInvalido) {
    avisos.push(
      `WA_TEMPLATE_ESTUDANTE="${String(env.WA_TEMPLATE_ESTUDANTE).trim()}" não é um nome de modelo da Meta ` +
        `(só minúsculas, números e _): o envio usa ${MODELO_ESTUDANTE_ANTIGO}.`
    );
  }
  if (!estudante.aberto) {
    avisos.push(
      "Estudante FECHADO neste build: a home não leva à /estudante, a /estudante mostra a lista de espera no lugar " +
        "do formulário e /api/estudante/solicitar responde 503 sem gravar nada (nenhum cupom, nenhum CPF preso). " +
        `Para abrir, na Vercel: ${estudante.faltas.join("; ")}. Depois, um novo deploy.` +
        (estudanteMostraPreco ? " A /estudante continua mostrando o preço de estudante (ESTUDANTE.mostrarPreco), com o aviso de que a solicitação abre em breve." : "")
    );
  } else {
    avisos.push(
      `Estudante ABERTO neste build (modelo ${estudante.modelo}, produto ${produto}, desconto ${estudantePct}%). ` +
        `Confira que o webhook do site (https://diariamente.app/api/webhooks/hotmart) está cadastrado no ${produto}: ` +
        "é ele que apaga o cupom usado."
    );
  }

  // Sem id numérico de oferta, lib/hotmart.js cria o cupom sem restrição:
  // ele vale em QUALQUER oferta do produto, inclusive a de lançamento.
  if (!idsDeOfertaValidos(env.HOTMART_OFFER_IDS).length) {
    const bruto = String(env.HOTMART_OFFER_IDS || "").trim();
    avisos.push(
      (bruto ? `HOTMART_OFFER_IDS="${bruto}" não tem nenhum id numérico` : "HOTMART_OFFER_IDS está vazio") +
        `: o cupom pessoal do estudante vale em qualquer oferta do produto ${produto}, inclusive a de lançamento. ` +
        `Na Vercel, ponha ali o id NUMÉRICO da oferta ${ofertaDoLink(br && br.checkout) || "do CHECKOUT_BRL"} ` +
        "(Hotmart, produto, Ofertas; o código off não serve)."
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

/** Atalho usado pelo next.config.js. Erro ao ler o config também trava. */
function checarPrecosDoProjeto(env = process.env) {
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
    mercados: cfg.MERCADOS, estudantePct: cfg.ESTUDANTE_DESCONTO, env, estudanteMostraPreco,
    produto: cfg.PRODUTO_HOTMART || PRODUTO_DO_SITE,
  });
}

/**
 * Atalho do next.config.js para gravar DM_ESTUDANTE_ABERTO no build.
 * Erro ao ler o config/pricing.ts FECHA o fluxo (a trava de preços já
 * para o build de produção nesse caso).
 */
function estudanteDoProjeto(env = process.env) {
  try {
    const cfg = carregarPrecos();
    return estadoDoEstudante(env, cfg.ESTUDANTE_DESCONTO, cfg.PRODUTO_HOTMART || PRODUTO_DO_SITE);
  } catch (e) {
    return { aberto: false, faltas: [`config/pricing.ts ilegível (${e && e.message})`], modelo: MODELO_ESTUDANTE_ANTIGO, nomeInvalido: false };
  }
}

module.exports = {
  checarPrecos, checarPrecosDoProjeto, carregarPrecos, problemaDoLink, dataReal, idsDeOfertaValidos,
  estudanteMostraPrecoNoConfig, estadoDoEstudante, estudanteDoProjeto,
  LINK_ANTIGO, CHECKOUT_DO_7448309, MODELO_ESTUDANTE_ANTIGO, PRODUTO_DO_SITE,
};
