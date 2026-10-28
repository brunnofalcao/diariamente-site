/* =====================================================================
   PÓS-PAGAMENTO · idioma, mercado, aparelho e forma de pagamento
   ---------------------------------------------------------------------
   As regras das páginas de obrigado e do /baixar. Fica em .mjs, sem nada
   do Next, para o `npm test` (node --test) conferir tudo sem build:
   testes/obrigado.test.mjs. Passo a passo para quem opera:
   docs/POS-PAGAMENTO.md.

   DOIS IDIOMAS, COM O ENDEREÇO NO IDIOMA DA PÁGINA (decisão do dono,
   28/10/2026: o projeto é só em português e espanhol, e a URL em
   espanhol é em espanhol, "/es/gracias-aprobado", não
   "/es/obrigado-aprovado"):
     pt (pt-BR)                     es (espanhol da América Latina)
     /obrigado-aprovado             /es/gracias-aprobado
     /obrigado-aguardando-pagamento /es/gracias-pago-pendiente
     /obrigado-aguardando-analise   /es/gracias-en-analisis
     /baixar                        /es/descargar
   pt atende Brasil, Portugal e o "mundo" (quem paga em dólar e lê em
   português); es atende a América Latina e a Espanha. Nas rotas em
   espanhol, o CAMINHO manda: nada de ?lang= nem navegador.

   AS TRÊS URLs DA HOTMART são as pt, sem prefixo. A "Página de obrigado
   externa" é configurada por PRODUTO (7448309), não por oferta nem por
   idioma: uma URL por status para todos os mercados. Por isso a URL sem
   prefixo descobre o idioma (decidirObrigado) e, se for espanhol, o
   middleware redireciona (307, com TODOS os parâmetros) para a rota em
   espanhol do mesmo status (destinoDoObrigado). Ordem:
     a. ?off= de uma oferta de UM mercado só: fhrttdh8 e lf63bgdd (real),
        3n484jbe (euro, Portugal) → pt; iuoufnf6 (euro, Espanha) → es.
        A oferta diz o que foi pago AGORA; o cookie pode ser de uma
        visita antiga. A uevhmhy2 (dólar) é da América Latina (es) E do
        "mundo" (pt): sozinha não decide, e os passos seguintes decidem.
     b. cookie dm_mercado: o mercado da última página de mercado que a
        pessoa abriu (lib/mercado.ts, mercadoDaVisita). br, pt e rw → pt;
        la e es → es.
     c. ?lang= (links antigos do app: /obrigado-aprovado?lang=es)
     d. Accept-Language: es* → es; pt* → pt; outro idioma é pulado
     e. país do IP (x-vercel-ip-country), pelas listas de lib/mercado.ts
        (mercadoDoPais): América Latina e Espanha → es; o resto → pt
     f. pt
   O middleware calcula o mercado do país (lib/mercado.ts, que é .ts e
   não entra aqui) e entrega pronto em `mercadoDoIp`.

   MERCADO (moeda e valor do Purchase na aprovada; Pix e boleto só no
   Brasil no pendente): mercadoDoObrigado. A oferta, quando vem, é a
   verdade sobre a moeda paga; sem ela, o cookie e depois o país, se
   forem do idioma da página; por fim, o mercado natural do idioma.

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
   parâmetro, Pix e boleto. Pix e boleto só existem no mercado br: quem
   lê em português e paga em dólar ou euro vê a linha geral.
   ===================================================================== */

// Os textos moram em lib/obrigado-textos.mjs e NÃO são importados aqui:
// este arquivo roda também no middleware (Edge), que não precisa da copy.

/** @typedef {"pt" | "es"} Local */
/** @typedef {"br" | "la" | "es" | "pt" | "rw"} Mercado */
/** @typedef {"aprovado" | "aguardando-pagamento" | "aguardando-analise"} Estado */
/** @typedef {"ios" | "android" | "computador"} Aparelho */
/** @typedef {"pix" | "boleto" | "outra"} Forma */

/** @type {readonly Local[]} */
export const LOCAIS = ["pt", "es"];

/** @type {readonly Estado[]} */
export const ESTADOS = ["aprovado", "aguardando-pagamento", "aguardando-analise"];

/**
 * O endereço de cada página em cada idioma. O espanhol tem o caminho em
 * espanhol, como /es/privacidad e /es/estudiantes.
 */
export const CAMINHOS = {
  pt: {
    aprovado: "/obrigado-aprovado",
    "aguardando-pagamento": "/obrigado-aguardando-pagamento",
    "aguardando-analise": "/obrigado-aguardando-analise",
    baixar: "/baixar",
  },
  es: {
    aprovado: "/es/gracias-aprobado",
    "aguardando-pagamento": "/es/gracias-pago-pendiente",
    "aguardando-analise": "/es/gracias-en-analisis",
    baixar: "/es/descargar",
  },
};

/**
 * As 8 rotas do pós-pagamento: noindex (meta e cabeçalho X-Robots-Tag,
 * next.config.js) e, em standby, medição só depois de ler a escolha de
 * cookies (components/Consentimento.tsx).
 */
export const ROTAS_DO_POS_PAGAMENTO = LOCAIS.flatMap((l) => Object.values(CAMINHOS[l]));

/**
 * Uma das 8 rotas do pós-pagamento, ou o /obrigado antigo.
 * @param {string} pathname
 */
export function ehPosPagamento(pathname) {
  return pathname === "/obrigado" || ROTAS_DO_POS_PAGAMENTO.includes(pathname);
}

/** Atributo lang do HTML de cada local. */
export const LANG_HTML = { pt: "pt-BR", es: "es" };

/**
 * Rótulo EXATO do botão da tela de login do app (login.primeiro_acesso_btn
 * em public/i18n/pt-BR.json e es.json do app). Na página, esse trecho vira
 * o "chip" que imita o botão. O app tem os mesmos dois idiomas do site.
 */
export const BOTAO_DO_APP = {
  pt: "Primeiro acesso? Ativar conta",
  es: "¿Primer acceso? Activar cuenta",
};

/** Mercado → idioma das páginas. Portugal e o "mundo" leem em pt-BR; a Espanha, em es. */
export const LOCAL_DO_MERCADO = { br: "pt", pt: "pt", rw: "pt", la: "es", es: "es" };

/** Local → mercado natural daquele idioma, quando nada mais diz. */
export const MERCADO_DO_LOCAL = { pt: "br", es: "la" };

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
  return CAMINHOS[local][estado];
}

/** @param {Local} local */
export function caminhoDoBaixar(local) {
  return CAMINHOS[local].baixar;
}

/**
 * Os três endereços da Hotmart, sem prefixo, e o /obrigado antigo (que
 * leva à aprovada). Só eles descobrem o idioma.
 * @type {Record<string, Estado>}
 */
export const OBRIGADO_SEM_PREFIXO = {
  "/obrigado": "aprovado",
  "/obrigado-aprovado": "aprovado",
  "/obrigado-aguardando-pagamento": "aguardando-pagamento",
  "/obrigado-aguardando-analise": "aguardando-analise",
};

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
 * Uma etiqueta de idioma vira local: qualquer espanhol (es, es-ES,
 * es-419, es-MX) → es; qualquer português (pt, pt-BR, pt-PT) → pt; o
 * resto, nada.
 * @param {string | null | undefined} etiqueta
 * @returns {Local | null}
 */
export function localDoIdioma(etiqueta) {
  const t = String(etiqueta || "").trim().toLowerCase().replace(/_/g, "-");
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

/**
 * O idioma das páginas sem prefixo (as URLs da Hotmart). Ordem no
 * cabeçalho do arquivo (a a f). `fonte` diz o que decidiu.
 * @param {{ off?: string | null, cookie?: string | null, lang?: string | string[] | null, idiomas?: string | null, mercadoDoIp?: string | null }} p
 * @returns {{ local: Local, fonte: "oferta" | "cookie" | "lang" | "navegador" | "pais" | "padrao" }}
 */
export function decidirObrigado({ off, cookie, lang, idiomas, mercadoDoIp } = {}) {
  const daOferta = mercadosDaOferta(off);
  if (daOferta && daOferta.length === 1) {
    return { local: /** @type {Local} */ (LOCAL_DO_MERCADO[daOferta[0]]), fonte: "oferta" };
  }

  const doCookie = mercadoValido(cookie);
  if (doCookie) return { local: /** @type {Local} */ (LOCAL_DO_MERCADO[doCookie]), fonte: "cookie" };

  const doLang = localDoIdioma(primeiro(lang));
  if (doLang) return { local: doLang, fonte: "lang" };

  const doNavegador = localDoNavegador(idiomas);
  if (doNavegador) return { local: doNavegador, fonte: "navegador" };

  const doPais = mercadoValido(mercadoDoIp);
  if (doPais) return { local: /** @type {Local} */ (LOCAL_DO_MERCADO[doPais]), fonte: "pais" };

  return { local: "pt", fonte: "padrao" };
}

/**
 * Mercado do pedido: a moeda e o valor do Purchase e, no pendente, se
 * Pix e boleto aparecem (só br). A oferta, quando vem, manda (é a moeda
 * paga); a do dólar fica com a América Latina na página em espanhol e com
 * o "mundo" na em português. Sem oferta: o cookie dm_mercado, se for do
 * idioma desta página; depois o país do IP, se for do idioma desta
 * página (um brasileiro nos Estados Unidos lendo em pt paga em dólar);
 * por fim, o mercado natural do idioma (pt → br, es → la).
 * @param {Local} local
 * @param {{ cookie?: string | null, off?: string | null, mercadoDoIp?: string | null }} [p]
 * @returns {Mercado}
 */
export function mercadoDoObrigado(local, { cookie, off, mercadoDoIp } = {}) {
  const daOferta = mercadosDaOferta(off);
  if (daOferta) {
    if (daOferta.length === 1) return daOferta[0];
    return local === "es" ? "la" : "rw";
  }
  for (const m of [mercadoValido(cookie), mercadoValido(mercadoDoIp)]) {
    if (m && LOCAL_DO_MERCADO[m] === local) return m;
  }
  return /** @type {Mercado} */ (MERCADO_DO_LOCAL[local]);
}

/**
 * Para o middleware: nas três URLs da Hotmart (e no /obrigado antigo), a
 * rota em espanhol do mesmo status, com a busca INTEIRA (transaction,
 * off, utm, lang...). null: fica onde está (pt-BR, ou não é página de
 * obrigado sem prefixo). O /obrigado antigo em pt segue para a página
 * dele, que leva a /obrigado-aprovado com os parâmetros.
 * @param {{ pathname: string, busca?: string, cookie?: string | null, idiomas?: string | null, mercadoDoIp?: string | null }} p
 * @returns {string | null}
 */
export function destinoDoObrigado({ pathname, busca = "", cookie, idiomas, mercadoDoIp }) {
  const estado = OBRIGADO_SEM_PREFIXO[pathname];
  if (!estado) return null;
  const resto = busca.replace(/^\?/, "");
  const q = new URLSearchParams(resto);
  const { local } = decidirObrigado({ off: q.get("off"), cookie, lang: q.get("lang"), idiomas, mercadoDoIp });
  if (local === "pt") return null;
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
 * O idioma de um /baixar: /es/descargar é es; /baixar é pt, ou es com
 * ?lang=es (o mesmo atalho das URLs da Hotmart). null: não é /baixar.
 * @param {string} pathname
 * @param {string} [busca]
 * @returns {Local | null}
 */
export function localDoBaixar(pathname, busca = "") {
  if (pathname === CAMINHOS.es.baixar) return "es";
  if (pathname !== CAMINHOS.pt.baixar) return null;
  const lang = new URLSearchParams(busca.replace(/^\?/, "")).get("lang");
  return localDoIdioma(lang) === "es" ? "es" : "pt";
}

/**
 * Para o middleware, no /baixar e no /es/descargar: o celular vai direto
 * para a loja do idioma (302); o computador que abriu /baixar?lang=es vai
 * para /es/descargar (307, com os parâmetros); o resto vê a página (QR
 * code, as duas lojas e a versão web). Robô: o middleware nem chama.
 * `lojas` é LOJAS_DO_LOCAL (lib/i18n.ts), a fonte única dos links.
 * @param {{ pathname: string, busca?: string, userAgent?: string | null }} p
 * @param {Record<Local, { appStore: string, googlePlay: string }>} lojas
 * @returns {{ destino: string, status: 302 | 307 } | null}
 */
export function destinoDoBaixar({ pathname, busca = "", userAgent }, lojas) {
  const local = localDoBaixar(pathname, busca);
  if (!local) return null;
  const aparelho = aparelhoDoUserAgent(userAgent);
  if (aparelho === "ios") return { destino: lojas[local].appStore, status: 302 };
  if (aparelho === "android") return { destino: lojas[local].googlePlay, status: 302 };
  if (pathname !== caminhoDoBaixar(local)) {
    const resto = busca.replace(/^\?/, "");
    return { destino: caminhoDoBaixar(local) + (resto ? `?${resto}` : ""), status: 307 };
  }
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
 * parâmetros. Ex.: "[obrigado] aprovado es parametros=off,transaction".
 * @param {Estado} estado
 * @param {Local} local
 * @param {Record<string, string | string[] | undefined> | URLSearchParams | null | undefined} params
 */
export function linhaDoLog(estado, local, params) {
  const nomes = nomesDosParametros(params);
  return `[obrigado] ${estado} ${local} parametros=${nomes.length ? nomes.join(",") : "(nenhum)"}`;
}

/* ------------------------------- Purchase ------------------------------- */

/**
 * O que o Purchase manda (components/PurchaseTracking.tsx), a partir da
 * busca da URL, da moeda do plano e do valor do pedido (config/pricing.ts,
 * lib/pos-pagamento.ts):
 *   - transacao: ?transaction= (ou transaction_id). Vira o eventID do
 *     Pixel e o transaction_id do GA4 (dedupe com o evento da Hotmart).
 *     hottok NUNCA entra: é o segredo do webhook.
 *   - total: o valor da URL (value, price, full_price, transaction_value;
 *     vírgula vale como ponto) SÓ quando dá para saber que está na mesma
 *     moeda do plano: no Brasil, que só cobra em real, a não ser que a URL
 *     diga outra moeda; fora dele, só se a URL disser a moeda e ela for a
 *     do plano (a oferta em dólar da América Latina é paga "na moeda
 *     local": um price em pesos lido como dólar inflaria o ROAS). Valor
 *     zero, negativo ou ilegível: o do plano.
 * @param {URLSearchParams} params
 * @param {"BRL" | "USD" | "EUR"} moeda
 * @param {number} valor
 * @returns {{ transacao: string | undefined, total: number }}
 */
export function dadosDoPurchase(params, moeda, valor) {
  const ler = (nome) => String(params.get(nome) || "").trim();
  const transacao = ler("transaction") || ler("transaction_id") || undefined;
  const bruto = ler("value") || ler("price") || ler("full_price") || ler("transaction_value");
  const lido = bruto ? Number(bruto.replace(",", ".")) : NaN;
  const moedaDaUrl = (ler("currency") || ler("currency_code")).toUpperCase();
  const mesmaMoeda = moeda === "BRL" ? !moedaDaUrl || moedaDaUrl === "BRL" : moedaDaUrl === moeda;
  const total = mesmaMoeda && Number.isFinite(lido) && lido > 0 ? lido : valor;
  return { transacao, total };
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
 * das formas que o pedido pode ter (Pix e boleto só no mercado br; nos
 * outros, lista vazia):
 *   - formas: as orientações (Pix, boleto) a mostrar
 *   - linha: qual texto geral vai embaixo
 *       "instrucoes"        com as orientações de Pix ou boleto
 *       "instrucoesSoEmail" a URL disse outra forma: sem Pix nem boleto
 *       "instrucoesGeral"   pedido sem Pix nem boleto (fora do Brasil)
 * @param {readonly { id: string }[]} formasDoPedido
 * @param {Forma | null} forma
 * @returns {{ formas: string[], linha: "instrucoes" | "instrucoesSoEmail" | "instrucoesGeral" }}
 */
export function orientacaoDoPagamento(formasDoPedido, forma) {
  if (forma === "outra") return { formas: [], linha: "instrucoesSoEmail" };
  const ids = formasDoPedido.map((f) => f.id).filter((id) => !forma || id === forma);
  if (!ids.length) return { formas: [], linha: "instrucoesGeral" };
  return { formas: ids, linha: "instrucoes" };
}
