/* =====================================================================
   TRAVA DE PREÇOS E CHECKOUT
   ---------------------------------------------------------------------
   Mesmo padrão da trava do endereço (scripts/checar-endereco.js): o
   `next build` de produção FALHA, com a explicação, enquanto faltar
   alguma das três peças que o dono ainda vai passar:

     1. o link de checkout do plano BRL do produto 7448309 (CHECKOUT_BRL)
     2. o código do cupom de lançamento (CUPOM_LANCAMENTO)
     3. a data de término do lançamento (FIM_DO_LANCAMENTO)

   E também quando algum mercado estiver com vendaAberta: true sem o link
   do plano daquela moeda: o botão abriria para lugar nenhum.

   Avisos (não travam, saem em todo build):
     - cupom de lançamento desligado (ativo: false), com o link exato
       para conferir R$ 119,92 no checkout antes de ligar;
     - mercados em lista de espera (vendaAberta: false), para a decisão
       de deixar um mercado de fora ficar à vista no log;
     - link do plano BRL fora do checkout conhecido do produto 7448309;
     - /estudante mostrando preço sem a confirmação de que o botão do
       WhatsApp já abre o plano novo (DM_TEMPLATE_ESTUDANTE_OK=1), e
       HOTMART_PRODUCT_ID diferente de 7448309.

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
   - K105072021O: checkout do produto 7448309, segundo
     docs/HOTMART-7448309-PASSO-A-PASSO.md do app. Ainda sem confirmação
     do dono, então outro código só gera aviso, nunca bloqueio. */
const LINK_ANTIGO = "L107085210M";
const CHECKOUT_DO_7448309 = "K105072021O";

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

/** Mesmo cálculo do linkComCupom de config/pricing.ts, para o teste do dono. */
function linkComCupom(base, codigo) {
  return `${base}${base.includes("?") ? "&" : "?"}offDiscount=${encodeURIComponent(codigo)}`;
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
    return `${rotulo}: ${LINK_ANTIGO} sem o parâmetro off é a oferta antiga de R$ 137,90. Use o link do plano novo.`;
  }
  if (url.searchParams.has("offDiscount")) {
    return `${rotulo}: tire o offDiscount do link. O cupom de lançamento entra sozinho pelo CUPOM_LANCAMENTO.`;
  }
  return null;
}

/**
 * Decide se o build pode seguir.
 *   mercados       o MERCADOS do config/pricing.ts
 *   estudantePct   ESTUDANTE_DESCONTO (em %)
 *   env            process.env
 *   agora          ms (para o aviso de data vencida)
 * Devolve { ok, teste, problemas[], avisos[], mensagem }.
 */
function checarPrecos({ mercados, estudantePct, env = {}, agora = Date.now(), estudanteMostraPreco = false }) {
  const problemas = [];
  const avisos = [];
  const br = mercados && mercados.br;

  if (!br) {
    problemas.push("config/pricing.ts não tem o mercado br.");
  } else {
    const p = problemaDoLink(br.checkout, "CHECKOUT_BRL (plano BRL do produto 7448309)");
    if (p) problemas.push(p);
    else if (codigoDoCheckout(new URL(br.checkout)) !== CHECKOUT_DO_7448309) {
      avisos.push(
        `CHECKOUT_BRL usa o checkout ${codigoDoCheckout(new URL(br.checkout))}, e o do produto 7448309 é ` +
          `${CHECKOUT_DO_7448309}. Confira na Hotmart se o plano BRL é mesmo desse produto.`
      );
    }

    const l = br.lancamento;
    if (!l) {
      problemas.push("O mercado br perdeu o bloco `lancamento` (cupom de lançamento).");
    } else {
      if (pendente(l.codigo)) {
        problemas.push('CUPOM_LANCAMENTO: código do cupom ainda é "[PREENCHER...]".');
      } else if (!/^[A-Za-z0-9_-]{1,25}$/.test(l.codigo)) {
        problemas.push(`CUPOM_LANCAMENTO: "${l.codigo}" não serve. Use só letras, números, - ou _, até 25 caracteres, igual ao cadastro na Hotmart.`);
      }
      if (pendente(l.terminaEm)) {
        problemas.push('FIM_DO_LANCAMENTO: data de término ainda é "[PREENCHER...]".');
      } else if (!dataReal(l.terminaEm)) {
        problemas.push(`FIM_DO_LANCAMENTO: "${l.terminaEm}" não é uma data que existe, no formato AAAA-MM-DD.`);
      } else if (Date.parse(`${l.terminaEm}T23:59:59.999-03:00`) < agora) {
        avisos.push(`O lançamento terminou em ${l.terminaEm}: a página mostra o preço cheio e o link vai sem cupom.`);
      }
      if (!(l.percentual > 0 && l.percentual < 99)) {
        problemas.push(`Percentual do cupom de lançamento inválido: ${l.percentual}.`);
      }
      if (!l.ativo) {
        const teste = !pendente(br.checkout) && !pendente(l.codigo) && !problemaDoLink(br.checkout, "")
          ? ` Antes de ligar, abra ${linkComCupom(br.checkout, l.codigo)} e confira R$ 119,92 no checkout.`
          : "";
        avisos.push(
          "Cupom de lançamento desligado (ativo: false em config/pricing.ts): a página mostra R$ 149,90 " +
            "e o botão vai sem cupom." + teste
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
        "Decisão do dono: para abrir um deles, vire vendaAberta para true e preencha o link do plano."
    );
  }

  if (!(estudantePct > 0 && estudantePct < 99)) {
    problemas.push(`ESTUDANTE_DESCONTO inválido: ${estudantePct}.`);
  }
  const envEst = String(env.STUDENT_DISCOUNT || "").trim();
  if (envEst && Math.abs(Number(envEst) - estudantePct / 100) > 0.0001) {
    avisos.push(
      `STUDENT_DISCOUNT=${envEst} na Vercel, mas a página mostra ${estudantePct}% (ESTUDANTE_DESCONTO). ` +
        "O cupom do estudante sairia com um valor diferente do anunciado."
    );
  }

  // Fluxo do estudante: a /estudante anuncia o preço de config/pricing.ts,
  // mas quem leva ao checkout é o botão do template do WhatsApp, cuja base
  // mora no painel da Meta. Nada aqui consegue ler a Meta: o dono confirma
  // com DM_TEMPLATE_ESTUDANTE_OK=1 depois de trocar a base do botão.
  if (estudanteMostraPreco && String(env.DM_TEMPLATE_ESTUDANTE_OK || "").trim() !== "1") {
    avisos.push(
      "A /estudante mostra o preço de estudante (ESTUDANTE.mostrarPreco em config.ts), mas falta confirmar " +
        "o caminho até o checkout novo: (1) trocar a base do botão do template diariamente_estudante_aprovado " +
        "para https://diariamente.app/estudante/ativar?cupom={{1}} e reaprovar na Meta; (2) HOTMART_PRODUCT_ID=7448309 " +
        "e o id numérico da oferta do plano BRL em HOTMART_OFFER_IDS, na Vercel. Feito isso, DM_TEMPLATE_ESTUDANTE_OK=1."
    );
  }
  const produtoEnv = String(env.HOTMART_PRODUCT_ID || "").trim();
  if (produtoEnv && produtoEnv !== "7448309") {
    avisos.push(
      `HOTMART_PRODUCT_ID=${produtoEnv} na Vercel: o cupom de estudante nasce nesse produto, e não no 7448309 do plano BRL.`
    );
  }

  const comAvisos = (texto) => (avisos.length ? `${texto} Avisos: ${avisos.join(" ")}` : texto);

  const teste = String(env.DM_ENDERECO_TESTE || "").trim();
  if (problemas.length && teste) {
    if (env.VERCEL && env.VERCEL_ENV !== "preview") {
      return {
        ok: false, teste: true, problemas, avisos,
        mensagem: comAvisos(
          "DM_ENDERECO_TESTE existe neste build da Vercel e ela serve só para teste. " +
            "Preencha em config/pricing.ts: " + problemas.join(" ")
        ),
      };
    }
    return {
      ok: true, teste: true, problemas, avisos,
      mensagem: comAvisos("Build de TESTE com preços pendentes (não publique): " + problemas.join(" ")),
    };
  }

  if (problemas.length) {
    return {
      ok: false, teste: false, problemas, avisos,
      mensagem: comAvisos(
        "Faltam dados de preço e checkout, e o site não pode vender sem eles. Abra config/pricing.ts " +
          "e preencha o bloco \"PREENCHER ANTES DO GO-LIVE\": " + problemas.join(" ") +
          ' Para só testar o build na sua máquina, rode com DM_ENDERECO_TESTE="Rua de Teste, 123".'
      ),
    };
  }
  return { ok: true, teste: false, problemas, avisos, mensagem: avisos.join(" ") };
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
  return checarPrecos({ mercados: cfg.MERCADOS, estudantePct: cfg.ESTUDANTE_DESCONTO, env, estudanteMostraPreco });
}

module.exports = {
  checarPrecos, checarPrecosDoProjeto, carregarPrecos, problemaDoLink, dataReal,
  estudanteMostraPrecoNoConfig, LINK_ANTIGO, CHECKOUT_DO_7448309,
};
