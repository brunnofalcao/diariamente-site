/* =====================================================================
   PÓS-PAGAMENTO · idioma, mercado, aparelho e forma de pagamento
   ---------------------------------------------------------------------
   As regras das páginas de obrigado e do /baixar. Fica em .mjs, sem nada
   do Next, para o `npm test` (node --test) conferir tudo sem build:
   testes/obrigado.test.mjs. Passo a passo para quem opera:
   docs/POS-PAGAMENTO.md.

   UMA PÁGINA DE OBRIGADO POR MERCADO (pedido do dono, 29/10/2026: "Preciso
   das URL's criar uma versão de página de obrigado, aguardando
   pagamento… para cada idioma e colocarei dentro de cada oferta delas.
   Brasil: português BR; Portugal: português PT; Espanha: espanhol;
   América Latina: espanhol; EUA / demais países: inglês"). Quatro locais,
   com o endereço no idioma da página (como já era o espanhol desde
   28/10/2026: "/es/gracias-aprobado", não "/es/obrigado-aprovado"):
     pt (pt-BR)                     pt-pt (português de Portugal)
     /obrigado-aprovado             /pt-pt/obrigado-aprovado
     /obrigado-aguardando-pagamento /pt-pt/obrigado-aguardando-pagamento
     /obrigado-aguardando-analise   /pt-pt/obrigado-aguardando-analise
     /baixar                        (usa o /baixar)
     es (espanhol)                  en (inglês dos Estados Unidos)
     /es/gracias-aprobado           /en/thank-you-approved
     /es/gracias-pago-pendiente     /en/thank-you-pending-payment
     /es/gracias-en-analisis        /en/thank-you-under-review
     /es/descargar                  (usa o /baixar)
   A Espanha e a América Latina usam as mesmas páginas es ("Espanha:
   espanhol"); não existe es-ES. Só pt e es têm /baixar: pt-pt e en
   reaproveitam o QR code do /baixar (no celular, o middleware manda
   direto para a loja). Nas rotas COM PREFIXO o CAMINHO manda o idioma:
   nada de ?lang=, navegador, cookie nem país.

   AS URLs SEM PREFIXO são as automáticas. Vão na oferta do Brasil e na
   oferta em dólar (uevhmhy2), que serve a América Latina E os Estados
   Unidos e demais países: por isso descobrem o idioma (decidirObrigado)
   e, se não for pt-BR, o middleware redireciona (307, com TODOS os
   parâmetros) para a rota do mesmo status no local escolhido
   (destinoDoObrigado). Ordem:
     a. ?off= de uma oferta de UM mercado só: fhrttdh8 e lf63bgdd (real)
        → pt; 3n484jbe (euro, Portugal) → pt-pt; iuoufnf6 (euro, Espanha)
        → es. A oferta diz o que foi pago AGORA; o cookie pode ser de uma
        visita antiga. A uevhmhy2 (dólar) é da América Latina (es) E do
        resto do mundo (en): sozinha não decide, e os passos seguintes
        decidem.
     b. cookie dm_mercado: o mercado da última página de mercado que a
        pessoa abriu (lib/mercado.ts, mercadoDaVisita). br → pt; pt →
        pt-pt; es e la → es. rw NÃO decide: o site do resto do mundo é em
        português com preço em dólar, então o cookie não diz em que idioma
        a pessoa lê. Segue para os próximos passos.
     c. ?lang= (links antigos do app: /obrigado-aprovado?lang=es): es →
        es; pt → pt; pt-pt (ou pt-PT) → pt-pt; en → en
     d. Accept-Language, pelo peso (q) e depois pela ordem: es* → es; da
        família pt, a etiqueta pt-PT → pt-pt, e o pt simples com o país do
        IP em Portugal → pt-pt, senão pt. Inglês e outros idiomas são
        PULADOS: navegador em inglês não prova que a pessoa não está na
        América Latina nem no Brasil.
     e. país do IP (x-vercel-ip-country), pelas listas de lib/mercado.ts
        (mercadoDoPais): Brasil → pt; Portugal → pt-pt; Espanha e
        América Latina → es; o resto (rw) → en
     f. pt
   O middleware calcula o mercado do país (lib/mercado.ts, que é .ts e
   não entra aqui) e entrega pronto em `mercadoDoIp`.

   MERCADO (moeda e valor do Purchase na aprovada; Pix e boleto só no
   Brasil no pendente): mercadoDoObrigado. A oferta, quando vem, é a
   verdade sobre a moeda paga (a do dólar fica com a América Latina na
   página es e com o resto do mundo nas páginas pt e en); sem ela, o
   cookie e depois o país, se forem mercados do local da página
   (MERCADOS_DO_LOCAL); por fim, o mercado natural do local.

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
   lê em português e paga em dólar ou euro vê a linha geral, e pt-pt e
   en nunca os veem.
   ===================================================================== */

// Os textos moram em lib/obrigado-textos.mjs e NÃO são importados aqui:
// este arquivo roda também no middleware (Edge), que não precisa da copy.

/** @typedef {"pt" | "pt-pt" | "es" | "en"} Local */
/** @typedef {"pt" | "es"} LocalDoBaixar */
/** @typedef {"br" | "la" | "es" | "pt" | "rw"} Mercado */
/** @typedef {"aprovado" | "aguardando-pagamento" | "aguardando-analise"} Estado */
/** @typedef {"ios" | "android" | "computador"} Aparelho */
/** @typedef {"pix" | "boleto" | "outra"} Forma */

/** @type {readonly Local[]} */
export const LOCAIS = ["pt", "pt-pt", "es", "en"];

/** Só estes têm /baixar próprio (pt-pt e en usam o do pt). @type {readonly LocalDoBaixar[]} */
export const LOCAIS_DO_BAIXAR = ["pt", "es"];

/** @type {readonly Estado[]} */
export const ESTADOS = ["aprovado", "aguardando-pagamento", "aguardando-analise"];

/**
 * O endereço de cada página em cada local, com o caminho no idioma da
 * página, como /es/privacidad e /es/estudiantes. pt-pt e en não têm
 * /baixar (BAIXAR_DO_LOCAL).
 */
export const CAMINHOS = {
  pt: {
    aprovado: "/obrigado-aprovado",
    "aguardando-pagamento": "/obrigado-aguardando-pagamento",
    "aguardando-analise": "/obrigado-aguardando-analise",
    baixar: "/baixar",
  },
  "pt-pt": {
    aprovado: "/pt-pt/obrigado-aprovado",
    "aguardando-pagamento": "/pt-pt/obrigado-aguardando-pagamento",
    "aguardando-analise": "/pt-pt/obrigado-aguardando-analise",
  },
  es: {
    aprovado: "/es/gracias-aprobado",
    "aguardando-pagamento": "/es/gracias-pago-pendiente",
    "aguardando-analise": "/es/gracias-en-analisis",
    baixar: "/es/descargar",
  },
  en: {
    aprovado: "/en/thank-you-approved",
    "aguardando-pagamento": "/en/thank-you-pending-payment",
    "aguardando-analise": "/en/thank-you-under-review",
  },
};

/**
 * O /baixar que cada local usa (o QR code do computador abre ele). pt-pt e
 * en usam o do pt: no celular a pessoa nem vê a página, o middleware manda
 * direto para a loja, que abre na vitrine do país dela.
 * @type {Record<Local, LocalDoBaixar>}
 */
export const BAIXAR_DO_LOCAL = { pt: "pt", "pt-pt": "pt", es: "es", en: "pt" };

/**
 * As 14 rotas do pós-pagamento (12 de obrigado e os 2 /baixar): noindex
 * (meta e cabeçalho X-Robots-Tag, next.config.js) e, em standby, medição
 * só depois de ler a escolha de cookies (components/Consentimento.tsx).
 */
export const ROTAS_DO_POS_PAGAMENTO = LOCAIS.flatMap((l) => Object.values(CAMINHOS[l]));

/**
 * Uma das 14 rotas do pós-pagamento, ou o /obrigado antigo.
 * @param {string} pathname
 */
export function ehPosPagamento(pathname) {
  return pathname === "/obrigado" || ROTAS_DO_POS_PAGAMENTO.includes(pathname);
}

/**
 * O local de uma rota do pós-pagamento (o caminho manda), ou null. O
 * aviso de cookies usa para falar o idioma da página de obrigado.
 * @param {string} pathname
 * @returns {Local | null}
 */
export function localDoPosPagamento(pathname) {
  return LOCAIS.find((l) => Object.values(CAMINHOS[l]).includes(pathname)) ?? null;
}

/** Atributo lang do HTML de cada local. */
export const LANG_HTML = { pt: "pt-BR", "pt-pt": "pt-PT", es: "es", en: "en" };

/**
 * Rótulo EXATO do botão da tela de login do app (login.primeiro_acesso_btn
 * em public/i18n/pt-BR.json e es.json do app). Na página, esse trecho vira
 * o "chip" que imita o botão. O APP SÓ TEM pt-BR E es: abre em espanhol
 * num aparelho em espanhol e em português num em português; num aparelho
 * em inglês, decide pelo fuso (país de língua espanhola, es; o resto,
 * como os Estados Unidos, pt-BR). Por isso pt-pt e en citam o rótulo em
 * português, exatamente como o app mostra; o en põe a tradução entre
 * parênteses logo depois.
 */
export const BOTAO_DO_APP = {
  pt: "Primeiro acesso? Ativar conta",
  "pt-pt": "Primeiro acesso? Ativar conta",
  es: "¿Primer acceso? Activar cuenta",
  en: "Primeiro acesso? Ativar conta",
};

/**
 * Mercado → local das páginas, quando o mercado diz o idioma (oferta de
 * um mercado só e país do IP; no cookie, rw é pulado, ver decidirObrigado).
 * @type {Record<Mercado, Local>}
 */
export const LOCAL_DO_MERCADO = { br: "pt", pt: "pt-pt", es: "es", la: "es", rw: "en" };

/**
 * Local → mercados que a página aceita do cookie e do país do IP, no
 * mercadoDoObrigado. pt aceita br e rw: o brasileiro no exterior lê em
 * português e paga em dólar.
 * @type {Record<Local, readonly Mercado[]>}
 */
export const MERCADOS_DO_LOCAL = { pt: ["br", "rw"], "pt-pt": ["pt"], es: ["la", "es"], en: ["rw"] };

/** Local → mercado natural daquele local, quando nada mais diz. */
export const MERCADO_DO_LOCAL = { pt: "br", "pt-pt": "pt", es: "la", en: "rw" };

/** @type {readonly Mercado[]} */
const MERCADOS = ["br", "la", "es", "pt", "rw"];

/**
 * Oferta da Hotmart (?off=) → mercados possíveis. Os mesmos códigos dos
 * links de config/pricing.ts (o teste confere que batem). A uevhmhy2, em
 * dólar, serve a América Latina E o resto do mundo: ambígua.
 * @type {Record<string, readonly Mercado[]>}
 */
export const MERCADOS_DA_OFERTA = {
  fhrttdh8: ["br"],
  lf63bgdd: ["br"],
  uevhmhy2: ["la", "rw"],
  iuoufnf6: ["es"],
  "3n484jbe": ["pt"],
};

/* As ofertas de ESTUDANTE (do Brasil, em real) não estão escritas acima:
   o código delas fica só no servidor (config/pricing.ts,
   mercadosDasOfertasDoEstudante). O middleware e a página de obrigado
   passam o mapa delas em `ofertasExtras`, com a mesma forma de
   MERCADOS_DA_OFERTA. Sem ele, o estudante que veio direto do WhatsApp
   (sem o cookie dm_mercado) e lê o navegador em espanhol cairia na
   página em espanhol, com o mercado e a moeda errados. */

/* ------------------------------ caminhos ------------------------------ */

/**
 * @param {Estado} estado
 * @param {Local} local
 */
export function caminhoDoObrigado(estado, local) {
  return CAMINHOS[local][estado];
}

/**
 * O /baixar que o local usa: o próprio em pt e es; o do pt em pt-pt e en
 * (BAIXAR_DO_LOCAL).
 * @param {Local} local
 */
export function caminhoDoBaixar(local) {
  return CAMINHOS[BAIXAR_DO_LOCAL[local]].baixar;
}

/**
 * Os três endereços automáticos, sem prefixo, e o /obrigado antigo (que
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

/** Etiqueta em minúsculas e com hífen (pt_PT → pt-pt). */
function normalizar(etiqueta) {
  return String(etiqueta || "").trim().toLowerCase().replace(/_/g, "-");
}

/**
 * O ?lang= vira local: qualquer espanhol (es, es-ES, es-419) → es;
 * pt-PT → pt-pt; o resto do português (pt, pt-BR) → pt; qualquer inglês
 * (en, en-US) → en; o resto, nada. Só o ?lang= decide inglês: no
 * navegador o inglês é pulado (localDoNavegador).
 * @param {string | null | undefined} etiqueta
 * @returns {Local | null}
 */
export function localDoIdioma(etiqueta) {
  const t = normalizar(etiqueta);
  if (/^es(-|$)/.test(t)) return "es";
  if (/^pt-pt(-|$)/.test(t)) return "pt-pt";
  if (/^pt(-|$)/.test(t)) return "pt";
  if (/^en(-|$)/.test(t)) return "en";
  return null;
}

/**
 * Local pelo Accept-Language, respeitando o peso (q) e, no empate, a
 * ordem. es* → es. Da família pt: a etiqueta pt-PT → pt-pt; o pt simples,
 * sem país, → pt-pt se o IP for de Portugal (mercadoDoIp "pt"), senão pt;
 * pt-BR e os outros países → pt. Inglês e outros idiomas são PULADOS: o
 * navegador em inglês não prova que a pessoa não está na América Latina
 * ou no Brasil, e o país do IP decide depois.
 * @param {string | null | undefined} cabecalho
 * @param {string | null} [mercadoDoIp]
 * @returns {Local | null}
 */
export function localDoNavegador(cabecalho, mercadoDoIp = null) {
  if (!cabecalho) return null;
  const itens = String(cabecalho)
    .split(",")
    .map((parte, ordem) => {
      const [tag, ...params] = parte.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: normalizar(tag), ordem, q: q ? parseFloat(q.split("=")[1]) : 1 };
    })
    .filter((i) => i.tag && !Number.isNaN(i.q) && i.q > 0)
    .sort((a, b) => b.q - a.q || a.ordem - b.ordem);
  for (const { tag } of itens) {
    if (/^es(-|$)/.test(tag)) return "es";
    if (/^pt-pt(-|$)/.test(tag)) return "pt-pt";
    if (tag === "pt") return mercadoDoIp === "pt" ? "pt-pt" : "pt";
    if (/^pt-/.test(tag)) return "pt";
  }
  return null;
}

/**
 * @param {string | null | undefined} off
 * @param {Record<string, readonly Mercado[]>} [ofertasExtras] as de estudante (ver MERCADOS_DA_OFERTA)
 */
function mercadosDaOferta(off, ofertasExtras) {
  const chave = String(off || "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(MERCADOS_DA_OFERTA, chave)) return MERCADOS_DA_OFERTA[chave];
  if (chave && ofertasExtras && Object.prototype.hasOwnProperty.call(ofertasExtras, chave)) return ofertasExtras[chave];
  return null;
}

/**
 * O idioma das páginas sem prefixo (as automáticas). Ordem no cabeçalho
 * do arquivo (a a f). `fonte` diz o que decidiu.
 * `ofertasExtras`: as ofertas de estudante (ver MERCADOS_DA_OFERTA).
 * @param {{ off?: string | null, cookie?: string | null, lang?: string | string[] | null, idiomas?: string | null, mercadoDoIp?: string | null, ofertasExtras?: Record<string, readonly Mercado[]> }} p
 * @returns {{ local: Local, fonte: "oferta" | "cookie" | "lang" | "navegador" | "pais" | "padrao" }}
 */
export function decidirObrigado({ off, cookie, lang, idiomas, mercadoDoIp, ofertasExtras } = {}) {
  const daOferta = mercadosDaOferta(off, ofertasExtras);
  if (daOferta && daOferta.length === 1) {
    return { local: LOCAL_DO_MERCADO[daOferta[0]], fonte: "oferta" };
  }

  // rw não decide: o site do resto do mundo é em português, com preço em
  // dólar. O cookie diz onde a pessoa pagou, não em que idioma ela lê.
  const doCookie = mercadoValido(cookie);
  if (doCookie && doCookie !== "rw") return { local: LOCAL_DO_MERCADO[doCookie], fonte: "cookie" };

  const doLang = localDoIdioma(primeiro(lang));
  if (doLang) return { local: doLang, fonte: "lang" };

  const doPais = mercadoValido(mercadoDoIp);
  const doNavegador = localDoNavegador(idiomas, doPais);
  if (doNavegador) return { local: doNavegador, fonte: "navegador" };

  if (doPais) return { local: LOCAL_DO_MERCADO[doPais], fonte: "pais" };

  return { local: "pt", fonte: "padrao" };
}

/**
 * Mercado do pedido: a moeda e o valor do Purchase e, no pendente, se
 * Pix e boleto aparecem (só br). A oferta, quando vem, manda (é a moeda
 * paga); a do dólar fica com a América Latina na página es e com o resto
 * do mundo nas páginas pt, pt-pt e en. Sem oferta: o cookie dm_mercado e
 * depois o país do IP, se forem mercados do local da página
 * (MERCADOS_DO_LOCAL: pt aceita br e rw, porque o brasileiro no exterior
 * lê em português e paga em dólar; pt-pt, só pt; es, la e es; en, só rw);
 * por fim, o mercado natural do local (pt → br, pt-pt → pt, es → la,
 * en → rw).
 * `ofertasExtras`: as ofertas de estudante (ver MERCADOS_DA_OFERTA).
 * @param {Local} local
 * @param {{ cookie?: string | null, off?: string | null, mercadoDoIp?: string | null, ofertasExtras?: Record<string, readonly Mercado[]> }} [p]
 * @returns {Mercado}
 */
export function mercadoDoObrigado(local, { cookie, off, mercadoDoIp, ofertasExtras } = {}) {
  const daOferta = mercadosDaOferta(off, ofertasExtras);
  if (daOferta) {
    if (daOferta.length === 1) return daOferta[0];
    return local === "es" ? "la" : "rw";
  }
  const aceitos = MERCADOS_DO_LOCAL[local];
  for (const m of [mercadoValido(cookie), mercadoValido(mercadoDoIp)]) {
    if (m && aceitos.includes(m)) return m;
  }
  return /** @type {Mercado} */ (MERCADO_DO_LOCAL[local]);
}

/**
 * Para o middleware: nas três URLs automáticas (e no /obrigado antigo), a
 * rota do mesmo status no local decidido, com a busca INTEIRA
 * (transaction, off, utm, lang...). null: fica onde está (pt-BR, ou não é
 * página de obrigado sem prefixo). O /obrigado antigo em pt segue para a
 * página dele, que leva a /obrigado-aprovado com os parâmetros.
 * @param {{ pathname: string, busca?: string, cookie?: string | null, idiomas?: string | null, mercadoDoIp?: string | null, ofertasExtras?: Record<string, readonly Mercado[]> }} p
 * @returns {string | null}
 */
export function destinoDoObrigado({ pathname, busca = "", cookie, idiomas, mercadoDoIp, ofertasExtras }) {
  const estado = OBRIGADO_SEM_PREFIXO[pathname];
  if (!estado) return null;
  const resto = busca.replace(/^\?/, "");
  const q = new URLSearchParams(resto);
  const { local } = decidirObrigado({ off: q.get("off"), cookie, lang: q.get("lang"), idiomas, mercadoDoIp, ofertasExtras });
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
 * Só pt e es têm /baixar (LOCAIS_DO_BAIXAR).
 * @param {string} pathname
 * @param {string} [busca]
 * @returns {LocalDoBaixar | null}
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
 * @param {Record<LocalDoBaixar, { appStore: string, googlePlay: string }>} lojas
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
 * parâmetros. Ex.: "[obrigado] aprovado es parametros=off,transaction" ou
 * "[obrigado] aguardando-pagamento pt-pt parametros=(nenhum)".
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
