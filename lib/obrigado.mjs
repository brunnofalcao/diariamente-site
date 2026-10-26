/* =====================================================================
   PÓS-PAGAMENTO · idioma, forma de pagamento e textos
   ---------------------------------------------------------------------
   Usado por /obrigado-aprovado, /obrigado-aguardando-pagamento e
   /obrigado-aguardando-analise (components/ObrigadoShell.tsx). Fica em .mjs, sem nada do Next, para
   o `npm test` (node --test) conferir as regras sem build:
   testes/obrigado.test.mjs.

   IDIOMA. As páginas antigas do app (app.diariamente.club/obrigado-*.html)
   tinham português e espanhol, escolhidos por ?lang= ou pelo idioma do
   navegador. Agora elas levam para cá com a mesma query string, e aqui
   vale a mesma regra: ?lang= manda; sem ele, o Accept-Language; sem
   nenhum dos dois, português.

   FORMA DE PAGAMENTO. Não há confirmação de que a Hotmart mande a forma
   de pagamento na URL da página de obrigado (a ajuda dela fala só de uma
   URL por status). Se um dia vier payment_type ou payment_method com Pix
   ou boleto (os nomes que o webhook usa: PIX, BILLET), a página mostra só
   a orientação daquela forma. Se vier outra forma (cartão, PayPal, um meio
   local de fora do Brasil...), a orientação de Pix e boleto estaria errada:
   a página mostra só a linha geral (instruções no e-mail da Hotmart).
   Sem parâmetro nenhum, mostra Pix e boleto em português; em espanhol,
   só a linha geral (formasParaMostrar): Pix e boleto só existem no
   Brasil, e quem paga da América Latina ou da Espanha via "casa
   lotérica" (27/10/2026).

   TEXTOS. Regras da marca para o que o cliente lê: nunca "compra" ou
   "comprar" (vale também no espanhol), sem travessão, no máximo um emoji
   por página, pt-BR claro e curto, e as duas línguas com as mesmas
   chaves. O teste confere tudo isso.
   ===================================================================== */

/** @typedef {"pt" | "es"} Idioma */
/** @typedef {"pix" | "boleto" | "outra"} Forma */

/**
 * Primeiro valor de um parâmetro de busca (o Next entrega string ou lista).
 * @param {string | string[] | undefined | null} v
 * @returns {string}
 */
export function primeiro(v) {
  if (Array.isArray(v)) return String(v[0] ?? "");
  return v == null ? "" : String(v);
}

/**
 * "es", "es-419", "es_MX" viram es; "pt", "pt-BR" viram pt; o resto, nada.
 * @param {string} v
 * @returns {Idioma | null}
 */
function normalizar(v) {
  const t = String(v || "").trim().toLowerCase();
  if (t.startsWith("es")) return "es";
  if (t.startsWith("pt")) return "pt";
  return null;
}

/**
 * Idioma pelo Accept-Language, respeitando o peso (q). Só pt ou es contam.
 * @param {string | null | undefined} cabecalho
 * @returns {Idioma | null}
 */
export function idiomaDoNavegador(cabecalho) {
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
    const l = normalizar(tag);
    if (l) return l;
  }
  return null;
}

/**
 * ?lang= manda; sem ele (ou com um valor que não é pt nem es), o navegador;
 * sem nenhum dos dois, português.
 * @param {string | string[] | undefined | null} lang
 * @param {string | null | undefined} acceptLanguage
 * @returns {Idioma}
 */
export function idiomaDoObrigado(lang, acceptLanguage) {
  return normalizar(primeiro(lang)) || idiomaDoNavegador(acceptLanguage) || "pt";
}

/**
 * Forma de pagamento, se a URL disser: "pix", "boleto" ou "outra" (cartão,
 * PayPal, meio local...). Sem parâmetro, null: a página mostra Pix e boleto.
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
 * Endereço de /obrigado-aprovado com a mesma query string de /obrigado (a
 * rota antiga). Parâmetro repetido continua repetido; vazio sai.
 * @param {Record<string, string | string[] | undefined> | null | undefined} params
 * @returns {string}
 */
export function paraObrigadoAprovado(params) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    for (const x of Array.isArray(v) ? v : [v]) if (x != null && x !== "") q.append(k, String(x));
  }
  const busca = q.toString();
  return "/obrigado-aprovado" + (busca ? "?" + busca : "");
}

/**
 * Quais orientações a página de pagamento pendente mostra.
 * Pix ou boleto na URL: só a daquela forma. Outra forma: nenhuma das duas
 * (só a linha das instruções no e-mail). Sem a forma na URL (o caso normal,
 * a Hotmart não manda): Pix e boleto em português; em espanhol, nenhuma,
 * porque os dois só existem no Brasil.
 * @param {Forma | null} forma
 * @param {Idioma} lang
 * @returns {{ pix: boolean, boleto: boolean, soEmail: boolean }}
 */
export function formasParaMostrar(forma, lang) {
  const outra = forma === "outra" || (forma == null && lang === "es");
  return { pix: !outra && forma !== "boleto", boleto: !outra && forma !== "pix", soEmail: outra };
}

/* ---------------------------------------------------------------------
   TEXTOS
   Trecho em negrito: { b: "..." }; em destaque teal: { teal: "..." }.
   Título: uma linha por item da lista.
   --------------------------------------------------------------------- */
export const TEXTOS = {
  aprovado: {
    pt: {
      aba: "Pagamento aprovado · Diariamente",
      descricao: "Seu pagamento foi aprovado. Veja como ativar o seu acesso ao Diariamente.",
      selo: "Pagamento aprovado",
      titulo: ["Boas-vindas ao", "Diariamente."],
      sub: "Seu pagamento foi aprovado. Agora falta só ativar o seu acesso ao app.",
      passo1Selo: "Passo 1",
      passo1Titulo: "Confira o seu e-mail",
      passo1Texto: [
        "Os seus dados de acesso serão enviados para o ",
        { b: "e-mail usado no pagamento" },
        ". Se não encontrar, confira também o spam e a aba Promoções.",
      ],
      passo2Selo: "Passo 2",
      passo2Titulo: "Baixe o app",
      passo2Texto: "Instale o Diariamente no celular e entre com o e-mail usado no pagamento.",
      webAntes: "Prefere usar no navegador?",
      webLink: "Abrir a versão web",
      agoraSelo: "Se quiser entrar agora",
      agoraTexto: [
        "Abra o app, toque em ",
        { b: "Primeiro acesso? Ativar conta" },
        ", use o e-mail do pagamento, crie uma senha e confirme com o código que chega no WhatsApp.",
      ],
      suporteAntes: "Dificuldade para acessar? Escreva para",
      frase: "Volte amanhã.",
    },
    es: {
      aba: "Pago aprobado · Diariamente",
      descricao: "Tu pago fue aprobado. Mira cómo activar tu acceso a Diariamente.",
      selo: "Pago aprobado",
      titulo: ["Te damos la bienvenida", "a Diariamente."],
      sub: "Tu pago fue aprobado. Ahora solo falta activar tu acceso a la app.",
      passo1Selo: "Paso 1",
      passo1Titulo: "Revisa tu correo",
      passo1Texto: [
        "Tus datos de acceso se enviarán al ",
        { b: "correo que usaste en el pago" },
        ". Si no lo encuentras, revisa también la carpeta de spam y la pestaña Promociones.",
      ],
      passo2Selo: "Paso 2",
      passo2Titulo: "Descarga la app",
      passo2Texto: "Instala Diariamente en tu celular y entra con el correo que usaste en el pago.",
      webAntes: "¿Prefieres usarla en el navegador?",
      webLink: "Abrir la versión web",
      agoraSelo: "Si quieres entrar ahora",
      agoraTexto: [
        "Abre la app, toca ",
        { b: "¿Primer acceso? Activar cuenta" },
        ", usa el correo del pago, crea una contraseña y confirma con el código que llega por WhatsApp.",
      ],
      suporteAntes: "¿Problemas para entrar? Escribe a",
      frase: "Vuelve mañana.",
    },
  },

  "aguardando-pagamento": {
    pt: {
      aba: "Aguardando pagamento · Diariamente",
      descricao: "Recebemos o seu pedido do Diariamente. Falta a confirmação do pagamento.",
      selo: "Pedido recebido",
      titulo: ["Falta só confirmar", "o pagamento."],
      sub: "Recebemos o seu pedido. O seu acesso ao Diariamente é liberado assim que o pagamento for confirmado.",
      concluirSelo: "Para concluir",
      concluirTitulo: "Conclua o pagamento",
      pixTitulo: "Pix",
      pixTexto: "Pague com o QR Code ou o código copia e cola gerado ao finalizar o pedido.",
      boletoTitulo: "Boleto",
      boletoTexto: "Pague o boleto gerado ao finalizar o pedido, no app do seu banco ou em uma lotérica, até o vencimento.",
      instrucoes: "As instruções de pagamento também estão no e-mail que a Hotmart enviou.",
      // Forma que não é Pix nem boleto: sem os dois cartões, só esta linha.
      instrucoesSoEmail: "As instruções de pagamento estão no e-mail que a Hotmart enviou.",
      jaPagou: "Se você já pagou, não precisa fazer mais nada.",
      emailSelo: "Depois da confirmação",
      emailTitulo: "Acompanhe o seu e-mail",
      emailTexto: [
        "O acesso é liberado depois da confirmação do pagamento, e os dados de acesso chegam no ",
        { b: "e-mail usado no pagamento" },
        ". Confira também o spam.",
      ],
      appSelo: "Enquanto isso",
      appTitulo: "Já deixe o app instalado",
      appTexto: "Quando o acesso for liberado, é só entrar com o e-mail usado no pagamento.",
      webAntes: "Prefere usar no navegador?",
      webLink: "Abrir a versão web",
      suporteAntes: "Dúvidas? Escreva para",
      frase: "Volte amanhã.",
    },
    es: {
      aba: "Pago pendiente · Diariamente",
      descricao: "Recibimos tu pedido de Diariamente. Falta la confirmación del pago.",
      selo: "Pedido recibido",
      titulo: ["Solo falta confirmar", "el pago."],
      sub: "Recibimos tu pedido. Tu acceso a Diariamente se libera en cuanto se confirme el pago.",
      concluirSelo: "Para terminar",
      concluirTitulo: "Completa el pago",
      pixTitulo: "Pix",
      pixTexto: "Paga con el código QR o con el código Pix copia y pega que se generó al finalizar el pedido.",
      boletoTitulo: "Boleto",
      boletoTexto: "Paga el boleto que se generó al finalizar el pedido, en la app de tu banco o en una casa lotérica, antes del vencimiento.",
      instrucoes: "Las instrucciones de pago también están en el correo que te envió Hotmart.",
      instrucoesSoEmail: "Las instrucciones de pago están en el correo que te envió Hotmart.",
      jaPagou: "Si ya pagaste, no necesitas hacer nada más.",
      emailSelo: "Después de la confirmación",
      emailTitulo: "Revisa tu correo",
      emailTexto: [
        "El acceso se libera después de la confirmación del pago, y los datos de acceso llegan al ",
        { b: "correo que usaste en el pago" },
        ". Revisa también la carpeta de spam.",
      ],
      appSelo: "Mientras tanto",
      appTitulo: "Deja la app instalada",
      appTexto: "Cuando se libere el acceso, solo tienes que entrar con el correo que usaste en el pago.",
      webAntes: "¿Prefieres usarla en el navegador?",
      webLink: "Abrir la versión web",
      suporteAntes: "¿Dudas? Escribe a",
      frase: "Vuelve mañana.",
    },
  },

  // Pagamento em análise (cartão sendo confirmado pela operadora). O pt é o
  // texto que a página sempre teve; o es entrou em 27/10/2026 (antes a
  // página saía em português com ?lang=es).
  "aguardando-analise": {
    pt: {
      aba: "Pagamento em análise",
      descricao: "Seu pagamento do Diariamente está sendo analisado.",
      selo: "Em análise",
      titulo: ["Seu pagamento está", "sendo analisado."],
      sub: [
        "A operadora do cartão está confirmando a transação. Assim que for aprovada, você recebe o ",
        { teal: "e-mail de acesso" },
        ". Isso costuma levar poucos minutos, mas pode demorar algumas horas.",
      ],
      esperaSelo: "Enquanto isso",
      esperaTitulo: "Você não precisa fazer nada",
      esperaTexto: "Assim que a confirmação chegar, disparamos seu e-mail de acesso automaticamente. Pode fechar esta página.",
      appTexto: "Se preferir, já deixe o app instalado. Quando o acesso liberar, é só entrar com o e-mail usado no pagamento.",
      lista: [
        { t: "A confirmação do pagamento", d: "Você recebe um aviso assim que for compensado. Não precisa ficar conferindo." },
        { t: "O e-mail de acesso", d: "Chega automaticamente na sequência, com o passo a passo pra entrar no app." },
        { t: "Sua jornada começa", d: "Você faz a provocação do Dia 1 e a constância começa a se construir." },
      ],
      frase: "Volte amanhã.",
      suporteAntes: "Precisa de ajuda?",
    },
    es: {
      aba: "Pago en análisis",
      descricao: "Tu pago de Diariamente está en análisis.",
      selo: "En análisis",
      titulo: ["Tu pago está", "en análisis."],
      sub: [
        "El banco emisor de la tarjeta está confirmando la transacción. En cuanto se apruebe, recibes el ",
        { teal: "correo de acceso" },
        ". Suele tardar pocos minutos, pero puede demorar algunas horas.",
      ],
      esperaSelo: "Mientras tanto",
      esperaTitulo: "No necesitas hacer nada",
      esperaTexto: "En cuanto llegue la confirmación, te enviamos el correo de acceso automáticamente. Puedes cerrar esta página.",
      appTexto: "Si prefieres, deja la app instalada. Cuando se libere el acceso, solo tienes que entrar con el correo que usaste en el pago.",
      lista: [
        { t: "La confirmación del pago", d: "Recibes un aviso en cuanto se acredite. No necesitas estar revisando." },
        { t: "El correo de acceso", d: "Llega automáticamente después, con los pasos para entrar a la app." },
        { t: "Tu recorrido empieza", d: "Haces la provocación del Día 1 y la constancia empieza a construirse." },
      ],
      frase: "Vuelve mañana.",
      suporteAntes: "¿Necesitas ayuda?",
    },
  },
};
