/* =====================================================================
   PÓS-PAGAMENTO · idioma, mercado, aparelho e forma de pagamento
   ---------------------------------------------------------------------
   As regras das páginas de obrigado (/obrigado-aprovado,
   /obrigado-aguardando-pagamento, /obrigado-aguardando-analise) e do
   /baixar. Fica em .mjs, sem nada do Next, para o `npm test` (node
   --test) conferir tudo sem build: testes/obrigado.test.mjs.
   Passo a passo para quem opera: docs/POS-PAGAMENTO.md.

   QUATRO LOCAIS, COM O IDIOMA NA FRENTE DO ENDEREÇO (regra do dono:
   "sempre o idioma vira primeiro"):
     pt     /obrigado-aprovado          Brasil e "mundo" (pt-BR)
     es     /es/obrigado-aprovado       América Latina
     es-es  /es-es/obrigado-aprovado    Espanha
     pt-pt  /pt-pt/obrigado-aprovado    Portugal
   Nas rotas com prefixo, o CAMINHO manda: nada de ?lang= nem navegador.

   AS TRÊS URLs DA HOTMART são as sem prefixo. A "Página de obrigado
   externa" é configurada por PRODUTO (7448309), não por oferta nem por
   idioma: uma URL por status para todos os mercados. Por isso a URL sem
   prefixo descobre o idioma (decidirObrigado) e, se não for pt-BR, o
   middleware redireciona (307, com TODOS os parâmetros) para a versão
   com prefixo (destinoDoObrigado). Ordem:
     1. cookie dm_mercado: o mercado da última página de mercado que a
        pessoa visitou (homes e páginas de venda; lib/mercado.ts,
        mercadoDaVisita). É o sinal mais fiel do idioma em que ela leu.
     2. ?off= da oferta, se vier: iuoufnf6 → es-es, 3n484jbe → pt-pt,
        fhrttdh8 e lf63bgdd → pt. A uevhmhy2 (dólar) é de DOIS mercados,
        América Latina (es) e "mundo" (pt): sozinha não decide, só
        restringe a escolha a es ou pt, que o ?lang= ou o navegador fazem.
     3. ?lang= (links antigos do app: /obrigado-aprovado?lang=es)
     4. Accept-Language: es-ES → es-es; outro es → es; pt-PT → pt-pt;
        o resto → pt
   O mercado "mundo" (rw) lê as páginas em pt-BR.

   MERCADO (moeda e valor do Purchase na aprovada): mercadoDoObrigado.
   A oferta, quando vem, é a verdade sobre a moeda paga; sem ela, o
   cookie (se for do mesmo idioma da página) e, por fim, o mercado
   natural do caminho.

   APARELHO: pelo user-agent, no servidor (aparelhoDoUserAgent). iPhone,
   iPad e iPod → ios; Android → android; o resto → computador. O iPad com
   iPadOS 13 ou mais novo se apresenta como Mac no Safari e cai em
   "computador": vê o QR code e as duas lojas, o que também funciona.

   LOG DE APRENDIZADO: não se sabe quais parâmetros a Hotmart acrescenta
   na URL de obrigado. Cada página registra no log do servidor SÓ os
   NOMES dos parâmetros, ordenados (linhaDoLog). Valor nunca: pode ter
   e-mail, nome ou telefone.

   FORMA DE PAGAMENTO. Não há confirmação de que a Hotmart mande a forma
   de pagamento na URL. Se um dia vier payment_type ou payment_method
   com Pix ou boleto (os nomes que o webhook usa: PIX, BILLET), a página
   do Brasil mostra só a orientação daquela forma. Outra forma (cartão,
   PayPal, meio local de fora do Brasil): só a linha geral. Sem
   parâmetro, Pix e boleto. Fora do Brasil não existe Pix nem boleto: a
   lista de formas dos outros locais é vazia (lib/obrigado-textos.mjs).
   ===================================================================== */

import { TEXTOS } from "./obrigado-textos.mjs";

export { TEXTOS };

/** @typedef {"pt" | "es" | "es-es" | "pt-pt"} Local */
/** @typedef {"br" | "la" | "es" | "pt" | "rw"} Mercado */
/** @typedef {"aprovado" | "aguardando-pagamento" | "aguardando-analise"} Estado */
/** @typedef {"ios" | "android" | "computador"} Aparelho */
/** @typedef {"pix" | "boleto" | "outra"} Forma */

/** @type {readonly Local[]} */
export const LOCAIS = ["pt", "es", "es-es", "pt-pt"];

/** @type {readonly Estado[]} */
export const ESTADOS = ["aprovado", "aguardando-pagamento", "aguardando-analise"];

/** Prefixo do endereço de cada local. pt-BR não tem prefixo. */
export const PREFIXO = { pt: "", es: "/es", "es-es": "/es-es", "pt-pt": "/pt-pt" };

/** Atributo lang do HTML de cada local. */
export const LANG_HTML = { pt: "pt-BR", es: "es", "es-es": "es-ES", "pt-pt": "pt-PT" };

/** Idioma da interface do app (só pt-BR e es; Portugal vê pt-BR). */
export const IDIOMA_DO_APP = { pt: "pt", es: "es", "es-es": "es", "pt-pt": "pt" };

/**
 * Rótulo EXATO do botão da tela de login do app (login.primeiro_acesso_btn
 * em public/i18n/pt-BR.json e es.json do app). Na página, esse trecho vira
 * o "chip" que imita o botão.
 */
export const BOTAO_DO_APP = {
  pt: "Primeiro acesso? Ativar conta",
  es: "¿Primer acceso? Activar cuenta",
};

/** Mercado → local das páginas. rw ("mundo") lê em pt-BR. */
export const LOCAL_DO_MERCADO = { br: "pt", rw: "pt", la: "es", es: "es-es", pt: "pt-pt" };

/** Local → mercado natural daquele caminho, quando nada mais diz. */
export const MERCADO_DO_LOCAL = { pt: "br", es: "la", "es-es": "es", "pt-pt": "pt" };

/** @type {readonly Mercado[]} */
const MERCADOS = ["br", "la", "es", "pt", "rw"];

/**
 * Oferta da Hotmart (?off=) → mercados possíveis. Os mesmos códigos dos
 * links de config/pricing.ts (o teste confere que batem). A uevhmhy2, em
 * dólar, serve a América Latina E o "mundo": ambígua.
 * @type {Record<string, readonly Mercado[]>}
 */
export const MERCADOS_DA_OFERTA = {
  fhrttdh8: ["br"],
  lf63bgdd: ["br"],
  uevhmhy2: ["la", "rw"],
  iuoufnf6: ["es"],
  "3n484jbe": ["pt"],
};

/* ------------------------------ caminhos ------------------------------ */

/**
 * @param {Estado} estado
 * @param {Local} local
 */
export function caminhoDoObrigado(estado, local) {
  return `${PREFIXO[local]}/obrigado-${estado}`;
}

/** @param {Local} local */
export function caminhoDoBaixar(local) {
  return `${PREFIXO[local]}/baixar`;
}

/**
 * Os três endereços sem prefixo, os da Hotmart, e o /obrigado antigo (que
 * leva à aprovada). Só eles descobrem o idioma.
 * @type {Record<string, Estado>}
 */
export const OBRIGADO_SEM_PREFIXO = {
  "/obrigado": "aprovado",
  "/obrigado-aprovado": "aprovado",
  "/obrigado-aguardando-pagamento": "aguardando-pagamento",
  "/obrigado-aguardando-analise": "aguardando-analise",
};

/** /baixar de cada local. @type {Record<string, Local>} */
export const BAIXAR = Object.fromEntries(LOCAIS.map((l) => [caminhoDoBaixar(l), l]));

/* ------------------------------- idioma ------------------------------- */

/**
 * Primeiro valor de um parâmetro de busca (o Next entrega string ou lista).
 * @param {string | string[] | undefined | null} v
 * @returns {string}
 */
export function primeiro(v) {
  if (Array.isArray(v)) return String(v[0] ?? "");
  return v == null ? "" : String(v);
}

/** @param {string | null | undefined} v @returns {Mercado | null} */
function mercadoValido(v) {
  return v && MERCADOS.includes(/** @type {Mercado} */ (v)) ? /** @type {Mercado} */ (v) : null;
}

/**
 * Uma etiqueta de idioma vira local: "es-ES" e "es_es" → es-es; "pt-PT" →
 * pt-pt; qualquer outro espanhol (es, es-419, es-MX) → es; qualquer outro
 * português (pt, pt-BR) → pt; o resto, nada.
 * @param {string | null | undefined} etiqueta
 * @returns {Local | null}
 */
export function localDoIdioma(etiqueta) {
  const t = String(etiqueta || "").trim().toLowerCase().replace(/_/g, "-");
  if (/^es-es(-|$)/.test(t)) return "es-es";
  if (/^pt-pt(-|$)/.test(t)) return "pt-pt";
  if (/^es(-|$)/.test(t)) return "es";
  if (/^pt(-|$)/.test(t)) return "pt";
  return null;
}

/**
 * Local pelo Accept-Language, respeitando o peso (q) e, no empate, a
 * ordem. Idioma que não é pt nem es é pulado.
 * @param {string | null | undefined} cabecalho
 * @returns {Local | null}
 */
export function localDoNavegador(cabecalho) {
  if (!cabecalho) return null;
  const itens = String(cabecalho)
    .split(",")
    .map((parte, ordem) => {
      const [tag, ...params] = parte.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag, ordem, q: q ? parseFloat(q.split("=")[1]) : 1 };
    })
    .filter((i) => i.tag && !Number.isNaN(i.q) && i.q > 0)
    .sort((a, b) => b.q - a.q || a.ordem - b.ordem);
  for (const { tag } of itens) {
    const l = localDoIdioma(tag);
    if (l) return l;
  }
  return null;
}

/** @param {string | null | undefined} off */
function mercadosDaOferta(off) {
  const chave = String(off || "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(MERCADOS_DA_OFERTA, chave) ? MERCADOS_DA_OFERTA[chave] : null;
}

/** @param {Local | null} l */
const ehEspanhol = (l) => l === "es" || l === "es-es";

/**
 * O idioma das páginas sem prefixo (as URLs da Hotmart). Ordem no
 * cabeçalho do arquivo. `fonte` diz o que decidiu (vai para o log).
 * @param {{ cookie?: string | null, off?: string | null, lang?: string | string[] | null, idiomas?: string | null }} p
 * @returns {{ local: Local, fonte: "cookie" | "oferta" | "lang" | "navegador" | "padrao" }}
 */
export function decidirObrigado({ cookie, off, lang, idiomas } = {}) {
  const doCookie = mercadoValido(cookie);
  if (doCookie) return { local: /** @type {Local} */ (LOCAL_DO_MERCADO[doCookie]), fonte: "cookie" };

  const daOferta = mercadosDaOferta(off);
  if (daOferta && daOferta.length === 1) {
    return { local: /** @type {Local} */ (LOCAL_DO_MERCADO[daOferta[0]]), fonte: "oferta" };
  }

  const doLang = localDoIdioma(primeiro(lang));
  const doNavegador = doLang ? null : localDoNavegador(idiomas);
  const idioma = doLang ?? doNavegador;
  const fonte = doLang ? "lang" : doNavegador ? "navegador" : "padrao";

  // Oferta em dólar: América Latina (es) ou "mundo" (pt). O idioma escolhe
  // entre os dois; es-ES vira es e pt-PT vira pt (Espanha e Portugal pagam
  // em euro, por outra oferta).
  if (daOferta) return { local: ehEspanhol(idioma) ? "es" : "pt", fonte };

  return { local: idioma ?? "pt", fonte };
}

/**
 * Mercado do pedido, para a moeda e o valor do Purchase. A oferta, quando
 * vem, manda (é a moeda paga); a do dólar fica com a América Latina nas
 * páginas em espanhol e com o "mundo" nas em português. Sem oferta, o
 * cookie dm_mercado, se for do idioma desta página; senão, o mercado
 * natural do caminho.
 * @param {Local} local
 * @param {{ cookie?: string | null, off?: string | null }} [p]
 * @returns {Mercado}
 */
export function mercadoDoObrigado(local, { cookie, off } = {}) {
  const daOferta = mercadosDaOferta(off);
  if (daOferta) {
    if (daOferta.length === 1) return daOferta[0];
    return ehEspanhol(local) ? "la" : "rw";
  }
  const doCookie = mercadoValido(cookie);
  if (doCookie && LOCAL_DO_MERCADO[doCookie] === local) return doCookie;
  return /** @type {Mercado} */ (MERCADO_DO_LOCAL[local]);
}

/**
 * Para o middleware: nas três URLs sem prefixo (e no /obrigado antigo),
 * o endereço com o prefixo do idioma, com a busca INTEIRA (transaction,
 * off, utm, lang...). null: fica onde está (pt-BR, ou não é página de
 * obrigado sem prefixo). O /obrigado antigo em pt segue para a página
 * dele, que leva a /obrigado-aprovado com os parâmetros.
 * @param {{ pathname: string, busca?: string, cookie?: string | null, idiomas?: string | null }} p
 * @returns {string | null}
 */
export function destinoDoObrigado({ pathname, busca = "", cookie, idiomas }) {
  const estado = OBRIGADO_SEM_PREFIXO[pathname];
  if (!estado) return null;
  const q = new URLSearchParams(busca.replace(/^\?/, ""));
  const { local } = decidirObrigado({ cookie, off: q.get("off"), lang: q.get("lang"), idiomas });
  if (local === "pt") return null;
  const resto = busca.replace(/^\?/, "");
  return caminhoDoObrigado(estado, local) + (resto ? `?${resto}` : "");
}

/* ------------------------------- aparelho ------------------------------- */

/**
 * @param {string | null | undefined} userAgent
 * @returns {Aparelho}
 */
export function aparelhoDoUserAgent(userAgent) {
  const ua = String(userAgent || "");
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "computador";
}

/**
 * Para o middleware: no /baixar de cada local, o celular vai direto para a
 * loja do idioma (302); computador ou aparelho desconhecido vê a página
 * (QR code, as duas lojas e a versão web). Robô: o middleware nem chama.
 * `lojas` é LOJAS_DO_LOCAL (lib/i18n.ts), a fonte única dos links.
 * @param {string} pathname
 * @param {string | null | undefined} userAgent
 * @param {Record<Local, { appStore: string, googlePlay: string }>} lojas
 * @returns {string | null}
 */
export function destinoDoBaixar(pathname, userAgent, lojas) {
  const local = BAIXAR[pathname];
  if (!local) return null;
  const aparelho = aparelhoDoUserAgent(userAgent);
  if (aparelho === "ios") return lojas[local].appStore;
  if (aparelho === "android") return lojas[local].googlePlay;
  return null;
}

/* -------------------------------- log -------------------------------- */

/**
 * Nomes dos parâmetros da URL, sem repetição e em ordem alfabética. Nome
 * estranho é limpo (só letras, números, ponto, hífen e sublinhado; até 40
 * caracteres) e a lista para em 40 nomes: o log não vira canal de
 * injeção. VALOR NUNCA ENTRA.
 * @param {Record<string, string | string[] | undefined> | URLSearchParams | null | undefined} params
 * @returns {string[]}
 */
export function nomesDosParametros(params) {
  if (!params) return [];
  const brutos = params instanceof URLSearchParams ? [...params.keys()] : Object.keys(params);
  const limpos = brutos
    .map((n) => String(n).replace(/[^\w.-]/g, "").slice(0, 40))
    .filter(Boolean);
  return [...new Set(limpos)].sort().slice(0, 40);
}

/**
 * Uma linha curta para o log do servidor: status, idioma e os NOMES dos
 * parâmetros. Ex.: "[obrigado] aprovado es-es parametros=off,transaction".
 * @param {Estado} estado
 * @param {Local} local
 * @param {Record<string, string | string[] | undefined> | URLSearchParams | null | undefined} params
 */
export function linhaDoLog(estado, local, params) {
  const nomes = nomesDosParametros(params);
  return `[obrigado] ${estado} ${local} parametros=${nomes.length ? nomes.join(",") : "(nenhum)"}`;
}

/* --------------------------- forma de pagamento --------------------------- */

/**
 * Forma de pagamento, se a URL disser: "pix", "boleto" ou "outra" (cartão,
 * PayPal, meio local...). Sem parâmetro, null.
 * @param {Record<string, string | string[] | undefined> | null | undefined} params
 * @returns {Forma | null}
 */
export function formaDoPagamento(params) {
  if (!params) return null;
  const bruto = primeiro(params.payment_type) || primeiro(params.payment_method);
  const v = bruto.trim().toLowerCase();
  if (!v) return null;
  if (v === "pix") return "pix";
  if (v === "billet" || v === "boleto" || v === "bank_slip") return "boleto";
  return "outra";
}

/**
 * O que o cartão "Conclua o pagamento" mostra, a partir da forma na URL e
 * das formas que o local tem (Pix e boleto só no Brasil):
 *   - formas: as orientações (Pix, boleto) a mostrar
 *   - linha: qual texto geral vai embaixo
 *       "instrucoes"        com as orientações de Pix ou boleto
 *       "instrucoesSoEmail" a URL disse outra forma: sem Pix nem boleto
 *       "instrucoesGeral"   local sem Pix nem boleto (fora do Brasil)
 * @param {readonly { id: string }[]} formasDoLocal
 * @param {Forma | null} forma
 * @returns {{ formas: string[], linha: "instrucoes" | "instrucoesSoEmail" | "instrucoesGeral" }}
 */
export function orientacaoDoPagamento(formasDoLocal, forma) {
  if (forma === "outra") return { formas: [], linha: "instrucoesSoEmail" };
  const ids = formasDoLocal.map((f) => f.id).filter((id) => !forma || id === forma);
  if (!ids.length) return { formas: [], linha: "instrucoesGeral" };
  return { formas: ids, linha: "instrucoes" };
}
