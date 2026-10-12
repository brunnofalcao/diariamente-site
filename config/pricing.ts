/* =====================================================================
   PREÇOS E MERCADOS · fonte única
   ---------------------------------------------------------------------
   Handoff de Precificação v2, seções 1 e 2. NENHUM valor de preço mora
   dentro de componente: tudo que o visitante lê de moeda, número e
   condição nasce aqui.

   Regra que não se quebra: o preço visível é o preço pago. Nada de
   conversão na tela, nada de duas moedas, nada de cupom para digitar.
   ===================================================================== */

export type Mercado = "br" | "la" | "es" | "pt" | "rw";
export type Idioma = "pt" | "es";

export type Oferta = {
  idioma: Idioma;
  /** Locale de formatação. es-419 usa ponto decimal: o México lê vírgula como milhar. */
  locale: string;
  moeda: "BRL" | "USD" | "EUR";
  /** Preço cheio do plano na Hotmart, na moeda do plano. */
  anual: number;
  /** Cupom de lançamento, só no plano BRL. null = não existe neste mercado. */
  lancamento: null | {
    percentual: number;
    /** Data de término anunciada na página. [PREENCHER] antes do go-live. */
    terminaEm: string;
    /** Código do cupom embutido no link do botão. [PREENCHER] */
    codigo: string;
    ativo: boolean;
  };
  /** Link do plano na Hotmart. [PREENCHER] com os links da seção 4. */
  checkout: string;
  /** Impostos: "dentro" (UE) · "fora" (alguns países LATAM) · "na" (Brasil). */
  imposto: "dentro" | "fora" | "na";
  /** Parcelamento existe só em BRL, COP e MXN. Nunca escrever valor de parcela. */
  parcela: boolean;
  /** "renova pelo mesmo valor" só entra onde a promessa é verdadeira. */
  renovaMesmoValor: boolean;
  /** Venda aberta. la e es ficam na lista de espera até o acervo em espanhol existir. */
  vendaAberta: boolean;
  textos: {
    titulo: string;
    proposta: string;
    totalSufixo: string;
    pagamento: string;
    botao: string;
    renovacao: string;
    mes: string;
    impostoNota?: string;
    prazo?: string;
    estudante?: string;
  };
  /** Três linhas de confiança sob o botão. Meio de pagamento muda por
      mercado: Pix e boleto não existem fora do Brasil. */
  confianca: string[];
};

export const MERCADOS: Record<Mercado, Oferta> = {
  /* ---------------------------------------------------------------- BR */
  br: {
    idioma: "pt",
    locale: "pt-BR",
    moeda: "BRL",
    anual: 149.9,
    lancamento: {
      percentual: 20,
      terminaEm: "[PREENCHER: data de término]",
      codigo: "[PREENCHER: código do cupom]",
      // Vire para true só depois de o cupom existir na Hotmart e o link
      // abrir o checkout já em R$ 119,92. Com false, a página mostra
      // R$ 149,90 e o botão vai sem o parâmetro de cupom.
      ativo: false,
    },
    checkout: "[PREENCHER: link do plano BRL]",
    imposto: "na",
    parcela: true,
    // Depende da pendência da seção 14: o cupom vale nas renovações?
    renovaMesmoValor: false,
    vendaAberta: true,
    textos: {
      titulo: "Seu Diariamente por um ano",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      totalSufixo: "por ano",
      pagamento: "Em até 12x no cartão",
      botao: "Começar meu ano",
      renovacao: "Renova a cada ano. Cancele quando quiser.",
      mes: "/mês",
      prazo: "Preço de lançamento até",
      estudante: "Sou estudante",
    },
    confianca: [
      "Garantia incondicional de 7 dias",
      "Pagamento seguro via Hotmart · Pix, cartão ou boleto",
      "iPhone e Android, o mesmo acesso nos dois",
    ],
  },

  /* -------------------------------------------------------------- LATAM */
  la: {
    idioma: "es",
    locale: "es-419",
    moeda: "USD",
    anual: 24.99,
    lancamento: null,
    checkout: "[PREENCHER: link do plano USD]",
    imposto: "fora",
    parcela: false,
    renovaMesmoValor: true,
    // Lista de espera até os 365 textos em espanhol estarem revisados.
    vendaAberta: false,
    textos: {
      titulo: "Tu Diariamente por un año",
      proposta: "Una provocación, una reflexión, una acción posible. Todos los días.",
      totalSufixo: "al año, en un solo pago",
      pagamento: "El pago se realiza en tu moneda local",
      botao: "Empezar mi año",
      renovacao: "Se renueva cada año por el mismo valor. Cancela cuando quieras.",
      mes: "/mes",
      impostoNota: "En algunos países se agregan impuestos locales en el pago.",
    },
    confianca: [
      "Garantía incondicional de 7 días",
      "Pago seguro vía Hotmart",
      "iPhone y Android, el mismo acceso en ambos",
    ],
  },

  /* ------------------------------------------------------------ ESPANHA */
  es: {
    idioma: "es",
    locale: "es-ES",
    moeda: "EUR",
    anual: 29.99,
    lancamento: null,
    checkout: "[PREENCHER: link do plano EUR]",
    imposto: "dentro",
    parcela: false,
    renovaMesmoValor: true,
    vendaAberta: false,
    textos: {
      titulo: "Tu Diariamente por un año",
      proposta: "Una provocación, una reflexión, una acción posible. Todos los días.",
      totalSufixo: "al año, en un solo pago",
      pagamento: "Pago en euros, IVA incluido",
      botao: "Empezar mi año",
      renovacao: "Se renueva cada año por el mismo valor. Cancela cuando quieras.",
      mes: "/mes",
      impostoNota: "IVA incluido",
    },
    confianca: [
      "Garantía incondicional de 7 días",
      "Pago seguro vía Hotmart · Tarjeta",
      "iPhone y Android, el mismo acceso en ambos",
    ],
  },

  /* ----------------------------------------------------------- PORTUGAL */
  pt: {
    idioma: "pt",
    locale: "pt-PT",
    moeda: "EUR",
    anual: 29.99,
    lancamento: null,
    checkout: "[PREENCHER: link do plano EUR]",
    imposto: "dentro",
    parcela: false,
    renovaMesmoValor: true,
    vendaAberta: true,
    textos: {
      titulo: "O seu Diariamente por um ano",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      totalSufixo: "por ano, num único pagamento",
      pagamento: "Pagamento em euros, IVA incluído",
      botao: "Começar o meu ano",
      renovacao: "Renova todos os anos pelo mesmo valor. Cancele quando quiser.",
      mes: "/mês",
      impostoNota: "IVA incluído",
    },
    confianca: [
      "Garantia incondicional de 7 dias",
      "Pagamento seguro via Hotmart · Cartão",
      "iPhone e Android, o mesmo acesso nos dois",
    ],
  },

  /* ------------------------------------------------------ RESTO DO MUNDO */
  rw: {
    idioma: "pt",
    locale: "pt-BR",
    moeda: "USD",
    anual: 24.99,
    lancamento: null,
    checkout: "[PREENCHER: link do plano USD]",
    imposto: "fora",
    parcela: false,
    renovaMesmoValor: true,
    vendaAberta: true,
    textos: {
      titulo: "Seu Diariamente por um ano",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      totalSufixo: "por ano, em um único pagamento",
      pagamento: "Pagamento em dólar; o seu banco converte para a sua moeda",
      botao: "Começar meu ano",
      renovacao: "Renova a cada ano pelo mesmo valor. Cancele quando quiser.",
      mes: "/mês",
    },
    confianca: [
      "Garantia incondicional de 7 dias",
      "Pagamento seguro via Hotmart · Cartão",
      "iPhone e Android, o mesmo acesso nos dois",
    ],
  },
};

/* ------------------------------ cálculo ------------------------------ */

/** Preço efetivamente cobrado: aplica o cupom de lançamento quando ativo. */
export function precoFinal(m: Mercado): number {
  const o = MERCADOS[m];
  if (o.lancamento?.ativo) {
    return Math.round(o.anual * (1 - o.lancamento.percentual / 100) * 100) / 100;
  }
  return o.anual;
}

/** Equivalente mensal: anual dividido por 12, duas casas. Nunca é um plano. */
export function porMes(m: Mercado): number {
  return Math.round((precoFinal(m) / 12) * 100) / 100;
}

/**
 * Formata na moeda e no locale do mercado.
 * es-419 sai com ponto decimal (US$ 24.99) porque o México lê vírgula
 * como separador de milhar; pt-BR, pt-PT e es-ES saem com vírgula.
 */
export function formatar(m: Mercado, valor: number): string {
  const o = MERCADOS[m];
  if (o.moeda === "USD") {
    const n = valor.toFixed(2);
    return o.locale === "es-419" ? `US$ ${n}` : `US$ ${n.replace(".", ",")}`;
  }
  if (o.moeda === "EUR") return `${valor.toFixed(2).replace(".", ",")} €`;
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

/**
 * Link do botão. No Brasil, com o cupom de lançamento ativo, o parâmetro
 * vai embutido para o checkout abrir já com o desconto: ninguém digita.
 */
export function linkCheckout(m: Mercado): string {
  const o = MERCADOS[m];
  if (!o.lancamento?.ativo || o.checkout.startsWith("[")) return o.checkout;
  const sep = o.checkout.includes("?") ? "&" : "?";
  return `${o.checkout}${sep}off=${encodeURIComponent(o.lancamento.codigo)}`;
}

/**
 * CONDIÇÃO DE ESTUDANTE · cupom de 40% sobre o plano BRL (handoff,
 * seção 1). Existe só no Brasil: a validação usa CPF e o cobro é em
 * real. Piso interno de R$ 47, nunca público.
 */
export const ESTUDANTE_DESCONTO = 40;

export function precoEstudante(): number {
  return Math.round(MERCADOS.br.anual * (1 - ESTUDANTE_DESCONTO / 100) * 100) / 100;
}

/** Preço cheio riscado: só existe onde há cupom ativo. */
export function precoCheio(m: Mercado): string | null {
  const o = MERCADOS[m];
  return o.lancamento?.ativo ? formatar(m, o.anual) : null;
}
