import { ESTUDANTE_PRECO_FINAL, MERCADOS, faseDaOfertaDoEstudante, precoFinal, type Mercado } from "@/config/pricing";

/* =====================================================================
   PÓS-PAGAMENTO · valor do pedido para o Purchase
   ---------------------------------------------------------------------
   O valor que o PurchaseTracking manda quando a URL não traz um valor
   confiável (components/PurchaseTracking.tsx). Vem de config/pricing.ts,
   a fonte única dos preços, nunca de um número escrito aqui:

     - com a oferta na URL (?off=), o preço DAQUELA oferta: a oficial do
       Brasil (fhrttdh8) é o preço cheio, a de lançamento (lf63bgdd) é o
       de lançamento, mesmo que o lançamento já tenha acabado quando a
       página abre (o pedido foi pago nela);
     - uma oferta de ESTUDANTE do Brasil (config/pricing.ts,
       faseDaOfertaDoEstudante): o preço da fase DAQUELA oferta, R$ 59,90
       ou R$ 79,90, e não o do mercado (que inflaria o ROAS);
     - sem oferta, o preço cobrado agora no mercado (precoFinal).

   SÓ NO SERVIDOR (components/PaginaObrigado.tsx): lê o código da oferta
   de estudante, que não pode ir ao navegador. O PurchaseTracking recebe
   só o número.

   O código da oferta sai do próprio link do checkout em config/pricing.ts
   (parâmetro off): trocar uma oferta lá já vale aqui.
   ===================================================================== */

function ofertaDoLink(link: string | null | undefined): string | null {
  if (!link) return null;
  try {
    return new URL(link).searchParams.get("off");
  } catch {
    return null;
  }
}

/** Valor do pedido no mercado, na moeda do plano (MERCADOS[m].moeda). */
export function valorDoPedido(m: Mercado, off?: string | null, agora: number = Date.now()): number {
  const o = MERCADOS[m];
  const codigo = String(off || "").trim().toLowerCase();
  if (codigo) {
    if (o.lancamento && ofertaDoLink(o.lancamento.checkout) === codigo) return o.lancamento.anual;
    if (ofertaDoLink(o.checkout) === codigo) return o.anual;
    const fase = m === "br" ? faseDaOfertaDoEstudante(codigo) : null;
    if (fase) return ESTUDANTE_PRECO_FINAL[fase];
  }
  return precoFinal(m, agora);
}

/** Moeda do plano do mercado. */
export function moedaDoMercado(m: Mercado): "BRL" | "USD" | "EUR" {
  return MERCADOS[m].moeda;
}

/* ---------------------------------------------------------------------
   TIPOS das páginas (as regras moram em lib/obrigado.mjs, e os textos em
   lib/obrigado-textos.mjs; aqui só a forma, para os componentes).
   --------------------------------------------------------------------- */
/**
 * Os quatro locais do pós-pagamento (pedido do dono, 29/10/2026): pt
 * (pt-BR, Brasil), pt-pt (Portugal), es (América Latina e Espanha) e en
 * (Estados Unidos e demais países). Regras em lib/obrigado.mjs.
 */
export type Local = "pt" | "pt-pt" | "es" | "en";
/** Só pt e es têm /baixar próprio; pt-pt e en usam o do pt (lib/obrigado.mjs, BAIXAR_DO_LOCAL). */
export type LocalDoBaixar = "pt" | "es";
export type Estado = "aprovado" | "aguardando-pagamento" | "aguardando-analise";
export type Aparelho = "ios" | "android" | "computador";
export type Forma = "pix" | "boleto" | "outra";

/** Trecho de texto rico: texto, negrito (ou o chip do botão do app) ou o e-mail do atendimento. */
export type Trecho = string | { b: string } | { atendimento: true };
export type Rico = readonly Trecho[];

type Trilha = { rotulo: string; resumo: string; passos: readonly string[]; feito: string; agora: string; depois: string };
type Selo = { selo: string; titulo: string; texto: Rico };
type Rodape = { webAntes: string; webLink: string; suporteAntes: string; frase: string };
type Topo = { aba: string; descricao: string; selo: string; titulo: readonly string[]; sub: string; trilha: Trilha };

export type TextosDoLocal = {
  aprovado: Topo & Rodape & {
    /** No computador, no fim do cartão de instalar: a versão web logo ali. */
    webAquiAntes: string;
    app: { selo: string; titulo: string; jaInstalado: string };
    senha: { selo: string; titulo: string; passos: readonly Rico[] };
    whatsapp: { selo: string; titulo: string; texto: string };
    naoRecebeu: { titulo: string; itens: readonly { p: string; r: Rico }[] };
  };
  "aguardando-pagamento": Topo & Rodape & {
    concluir: {
      selo: string;
      titulo: string;
      formas: readonly { id: string; titulo: string; texto: string }[];
      instrucoes: string;
      instrucoesGeral: string;
      instrucoesSoEmail: string;
      jaPagou: string;
    };
    acesso: Selo;
    app: Selo;
  };
  "aguardando-analise": Topo & Rodape & {
    calma: Selo;
    app: Selo;
  };
  baixar: {
    aba: string;
    descricao: string;
    titulo: readonly string[];
    texto: string;
    qrTitulo: string;
    qrTexto: string;
    lojasAntes: string;
    appStore: string;
    googlePlay: string;
    primeiroAcesso: Rico;
    webAntes: string;
    webLink: string;
    frase: string;
  };
  lojas: {
    iphone: { botao: string; nota: string; outroAntes: string; outroLink: string };
    android: { botao: string; nota: string; outroAntes: string; outroLink: string };
    computador: { titulo: string; texto: string; lojasAntes: string };
    appStore: string;
    googlePlay: string;
    appStoreAria: string;
    googlePlayAria: string;
    qrAlt: string;
  };
};

/** Locale do Open Graph de cada local (es_LA, como o resto do site em espanhol latino). */
export const OG_LOCALE: Record<Local, string> = { pt: "pt_BR", "pt-pt": "pt_PT", es: "es_LA", en: "en_US" };
