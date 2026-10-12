/* =====================================================================
   PREÇOS E MERCADOS · fonte única
   ---------------------------------------------------------------------
   Handoff de Precificação v2, seções 1 e 2. NENHUM valor de preço mora
   dentro de componente: tudo que o visitante lê de moeda, número e
   condição nasce aqui (bloco de oferta, barra fixa, CTA final, /sobre,
   /estudante, dados estruturados e eventos de medição).

   Regra que não se quebra: o preço visível é o preço pago. Nada de
   conversão na tela, nada de duas moedas, nada de cupom para digitar.

   ESTE ARQUIVO NÃO IMPORTA NADA, de propósito. A trava de publicação
   (scripts/checar-precos.js) e os testes o carregam sozinho, fora do
   Next, para conferir links, cupom e data antes do build de produção.
   ===================================================================== */

/* ---------------------------------------------------------------------
   PREENCHER ANTES DO GO-LIVE · o build de produção TRAVA sem estes três
   ---------------------------------------------------------------------
   Enquanto algum deles tiver "[PREENCHER", o `next build` para com a
   explicação (mesmo mecanismo da trava do endereço). Para testar o build
   sem eles: DM_ENDERECO_TESTE="Rua de Teste, 123" npm run build (recusado
   em produção na Vercel).

   CHECKOUT_BRL       link do plano "Diariamente Anual · BR" (R$ 149,90),
                      do produto 7448309 na Hotmart, SEM parâmetro de cupom:
                      o cupom de lançamento entra sozinho pelo código.
                      O link antigo (L107085210M sem off, R$ 137,90) é
                      recusado.
   CUPOM_LANCAMENTO   código do cupom de 20%, restrito ao plano BRL,
                      escrito igual ao cadastro na Hotmart.
   FIM_DO_LANCAMENTO  último dia do preço de lançamento, AAAA-MM-DD, no
                      horário de Brasília. A página mostra a data em texto
                      e, passado esse dia, volta sozinha para R$ 149,90 e
                      tira o cupom do link. Na Hotmart, deixe o cupom
                      valendo até pelo menos 02:00 do dia seguinte: quem
                      abriu o checkout perto da meia-noite ainda paga.

   Preenchidos os três, a página CONTINUA em R$ 149,90: o cupom só liga
   com `ativo: true` no mercado br, depois do teste do link (abaixo).

   CHECKOUT_USD também é exigido no go-live: o resto do mundo (rw) abre
   junto com o Brasil (handoff, seção 13, passo 6). Para lançar só o
   Brasil, vire rw para vendaAberta: false; o build lista os mercados
   fechados em todo build, para a decisão ficar à vista.
   --------------------------------------------------------------------- */
export const PRODUTO_HOTMART = "7448309";
const CHECKOUT_BRL = "[PREENCHER: link do plano BRL do produto 7448309]";
const CUPOM_LANCAMENTO = "[PREENCHER: código do cupom de lançamento]";
const FIM_DO_LANCAMENTO = "[PREENCHER: último dia do lançamento, AAAA-MM-DD]";

/* Mercados fora do Brasil. Só são exigidos quando o mercado tiver
   vendaAberta: true (a trava confere). Hoje rw está aberto, então o
   CHECKOUT_USD trava o build de produção até o link existir. */
const CHECKOUT_USD = "[PREENCHER: link do plano USD]";
const CHECKOUT_EUR = "[PREENCHER: link do plano EUR]";

/** Parâmetro de cupom do checkout da Hotmart. É o mesmo que o botão do
    WhatsApp do estudante usa (lib/whatsapp.js): o checkout abre com o
    desconto aplicado e ninguém digita código. */
export const PARAMETRO_CUPOM = "offDiscount";

/** Cupom de estudante, em %, sobre o plano BRL (handoff, seção 1).
    O dono ainda decide entre 40 e 44: trocar aqui muda a home, a
    /estudante e a /sobre juntas. O desconto que a Hotmart aplica de fato
    vem da variável STUDENT_DISCOUNT na Vercel (0.40 para 40%); a trava
    avisa se as duas divergirem. */
export const ESTUDANTE_DESCONTO = 40;

export type Mercado = "br" | "la" | "es" | "pt" | "rw";
export type Idioma = "pt" | "es";

export type Formato = {
  simbolo: string;
  /** true: "29,99 €". false: "R$ 149,90". */
  simboloDepois: boolean;
  /** es-419 usa ponto decimal: o México lê vírgula como separador de milhar. */
  decimal: "," | ".";
};

export type Oferta = {
  idioma: Idioma;
  locale: "pt-BR" | "pt-PT" | "es-ES" | "es-419";
  /** País de referência do mercado (DDI padrão do formulário da lista de espera). */
  ddi: string;
  moeda: "BRL" | "USD" | "EUR";
  formato: Formato;
  /** Preço cheio do plano na Hotmart, na moeda do plano. */
  anual: number;
  /** Cupom de lançamento, só no plano BRL. null = não existe neste mercado. */
  lancamento: null | {
    percentual: number;
    codigo: string;
    /** Último dia do preço de lançamento (AAAA-MM-DD, horário de Brasília). */
    terminaEm: string;
    /** false = encerrado: R$ 149,90 e link sem cupom, mesmo antes da data. */
    ativo: boolean;
  };
  /** Link do plano na Hotmart (seção 4 do handoff), sem cupom. */
  checkout: string;
  /** Impostos: "dentro" (UE) · "fora" (alguns países LATAM) · "na" (Brasil). */
  imposto: "dentro" | "fora" | "na";
  /** Parcelamento existe só em BRL, COP e MXN. Nunca escrever valor de parcela. */
  parcela: boolean;
  /** "renova pelo mesmo valor" só entra onde a promessa é verdadeira. */
  renovaMesmoValor: boolean;
  /**
   * CHAVE PARA LIGAR O MERCADO. true: o bloco vende (exige o link do
   * plano; a trava confere). false: o bloco vira a lista de espera.
   */
  vendaAberta: boolean;
  /**
   * Com a venda fechada, o que a home mostra:
   *   "bloco"   a página de vendas inteira, com o bloco de oferta trocado
   *             pela lista de espera do mercado (o produto já existe no
   *             idioma; só falta o plano na moeda)
   *   "pagina"  a home inteira vira a lista de espera (EmBreve), como /es
   *             já era: o acervo em espanhol ainda não está revisado
   *             (handoff, seção 9)
   */
  semVenda: "bloco" | "pagina";
  textos: {
    titulo: string;
    proposta: string;
    mes: string;
    /** Junto da manchete quando o cupom de lançamento vale. */
    mesLancamento?: string;
    totalSufixo: string;
    cupomAplicado?: string;
    precoCheio?: string;
    pagamento: string;
    botao: string;
    renovacao: string;
    renovacaoMesmoValor?: string;
    impostoNota?: string;
    prazo?: string;
    estudante?: string;
    /** Linha curta da barra fixa e do CTA final, depois do preço. */
    nota: string;
  };
  /** Linhas de confiança sob o botão. Meio de pagamento muda por
      mercado: Pix e boleto não existem fora do Brasil. */
  confianca: string[];
  /** Lista de espera, enquanto vendaAberta for false. */
  espera: {
    selo: string;
    texto: string;
    botao: string;
    /** Linha curta da barra fixa. */
    nota: string;
  };
};

export const MERCADOS: Record<Mercado, Oferta> = {
  /* ---------------------------------------------------------------- BR */
  br: {
    idioma: "pt",
    locale: "pt-BR",
    ddi: "55",
    moeda: "BRL",
    formato: { simbolo: "R$", simboloDepois: false, decimal: "," },
    anual: 149.9,
    lancamento: {
      percentual: 20,
      codigo: CUPOM_LANCAMENTO,
      terminaEm: FIM_DO_LANCAMENTO,
      // Vire para true só depois de o cupom existir na Hotmart e o link
      // abrir o checkout já em R$ 119,92 (a trava mostra o link exato
      // para o teste). Com false, a página mostra R$ 149,90 e o botão vai
      // sem o parâmetro de cupom. Encerrado antes da data? Volte a false.
      ativo: false,
    },
    checkout: CHECKOUT_BRL,
    imposto: "na",
    parcela: true,
    // Pendência da seção 14: o cupom vale nas renovações? Enquanto o
    // dono não confirmar, a página não promete "pelo mesmo valor".
    renovaMesmoValor: false,
    vendaAberta: true,
    semVenda: "bloco",
    textos: {
      titulo: "Seu Diariamente por um ano",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      mes: "/mês",
      mesLancamento: "no lançamento",
      totalSufixo: "por ano",
      cupomAplicado: "com o cupom de lançamento já aplicado pelo botão",
      precoCheio: "Preço cheio:",
      pagamento: "Em até 12x no cartão",
      botao: "Começar meu ano",
      renovacao: "Renova a cada ano. Cancele quando quiser.",
      renovacaoMesmoValor: "Renova a cada ano pelo mesmo valor. Cancele quando quiser.",
      prazo: "Preço de lançamento até",
      estudante: "Sou estudante",
      nota: "por um ano · Garantia de 7 dias",
    },
    confianca: [
      "Garantia incondicional de 7 dias",
      "Pagamento seguro via Hotmart · Pix, cartão ou boleto",
      "iPhone e Android, o mesmo acesso nos dois",
    ],
    espera: {
      selo: "Em breve",
      texto: "A assinatura abre em breve. Deixe seu contato e avisamos no dia em que abrir.",
      botao: "Me avise quando abrir",
      nota: "Avisamos no dia em que abrir",
    },
  },

  /* -------------------------------------------------------------- LATAM */
  la: {
    idioma: "es",
    locale: "es-419",
    ddi: "",
    moeda: "USD",
    formato: { simbolo: "US$", simboloDepois: false, decimal: "." },
    anual: 24.99,
    lancamento: null,
    checkout: CHECKOUT_USD,
    imposto: "fora",
    parcela: false,
    renovaMesmoValor: true,
    // Lista de espera até o plano em dólar existir e os 365 textos em
    // espanhol estarem revisados (handoff, seção 9).
    vendaAberta: false,
    semVenda: "pagina",
    textos: {
      titulo: "Tu Diariamente por un año",
      proposta: "Una provocación, una reflexión, una acción posible. Todos los días.",
      mes: "/mes",
      totalSufixo: "al año, en un solo pago",
      pagamento: "El pago se realiza en tu moneda local",
      botao: "Empezar mi año",
      renovacao: "Se renueva cada año por el mismo valor. Cancela cuando quieras.",
      impostoNota: "En algunos países se agregan impuestos locales en el pago.",
      nota: "por un año · Garantía de 7 días",
    },
    confianca: [
      "Garantía incondicional de 7 días",
      "Pago seguro vía Hotmart",
      "iPhone y Android, el mismo acceso en ambos",
    ],
    espera: {
      selo: "Próximamente",
      texto: "La suscripción para América Latina abre pronto. Déjanos tu contacto y te avisamos el día que abra.",
      botao: "Avísame cuando abra",
      nota: "Te avisamos el día que abra",
    },
  },

  /* ------------------------------------------------------------ ESPANHA */
  es: {
    idioma: "es",
    locale: "es-ES",
    ddi: "34",
    moeda: "EUR",
    formato: { simbolo: "€", simboloDepois: true, decimal: "," },
    anual: 29.99,
    lancamento: null,
    checkout: CHECKOUT_EUR,
    imposto: "dentro",
    parcela: false,
    renovaMesmoValor: true,
    vendaAberta: false,
    semVenda: "pagina",
    textos: {
      titulo: "Tu Diariamente por un año",
      proposta: "Una provocación, una reflexión, una acción posible. Todos los días.",
      mes: "/mes",
      totalSufixo: "al año, en un solo pago",
      pagamento: "Pago en euros, IVA incluido",
      botao: "Empezar mi año",
      renovacao: "Se renueva cada año por el mismo valor. Cancela cuando quieras.",
      nota: "al año · Garantía de 7 días",
    },
    confianca: [
      "Garantía incondicional de 7 días",
      "Pago seguro vía Hotmart · Tarjeta",
      "iPhone y Android, el mismo acceso en ambos",
    ],
    espera: {
      selo: "Próximamente",
      texto: "La suscripción para España abre pronto. Déjanos tu contacto y te avisamos el día que abra.",
      botao: "Avísame cuando abra",
      nota: "Te avisamos el día que abra",
    },
  },

  /* ----------------------------------------------------------- PORTUGAL */
  pt: {
    idioma: "pt",
    locale: "pt-PT",
    ddi: "351",
    moeda: "EUR",
    formato: { simbolo: "€", simboloDepois: true, decimal: "," },
    anual: 29.99,
    lancamento: null,
    checkout: CHECKOUT_EUR,
    imposto: "dentro",
    parcela: false,
    renovaMesmoValor: true,
    // Lista de espera até o plano em euro existir na Hotmart.
    vendaAberta: false,
    semVenda: "bloco",
    textos: {
      titulo: "O seu Diariamente por um ano",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      mes: "/mês",
      totalSufixo: "por ano, num único pagamento",
      pagamento: "Pagamento em euros, IVA incluído",
      botao: "Começar o meu ano",
      renovacao: "Renova todos os anos pelo mesmo valor. Cancele quando quiser.",
      nota: "por ano · 7 dias de garantia",
    },
    confianca: [
      "Garantia incondicional de 7 dias",
      "Pagamento seguro via Hotmart · Cartão",
      "iPhone e Android, o mesmo acesso nos dois",
    ],
    espera: {
      selo: "Em breve",
      texto: "A assinatura para Portugal abre em breve. Deixa o teu contacto e avisamos-te no dia em que abrir.",
      botao: "Avisem-me quando abrir",
      nota: "Avisamos-te no dia em que abrir",
    },
  },

  /* ------------------------------------------------------ RESTO DO MUNDO */
  rw: {
    idioma: "pt",
    locale: "pt-BR",
    ddi: "",
    moeda: "USD",
    // Página em português: vírgula decimal (US$ 24,99).
    formato: { simbolo: "US$", simboloDepois: false, decimal: "," },
    anual: 24.99,
    lancamento: null,
    checkout: CHECKOUT_USD,
    imposto: "fora",
    parcela: false,
    renovaMesmoValor: true,
    // Aberto, como no arquivo do dono e no handoff (seção 13, passo 6:
    // Brasil e resto do mundo primeiro). Sem CHECKOUT_USD o build de
    // produção trava. Para lançar só o Brasil, vire para false: o bloco
    // vira a lista de espera e o build avisa que rw ficou fechado.
    vendaAberta: true,
    semVenda: "bloco",
    textos: {
      titulo: "Seu Diariamente por um ano",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      mes: "/mês",
      totalSufixo: "por ano, em um único pagamento",
      pagamento: "Pagamento em dólar; o seu banco converte para a sua moeda",
      botao: "Começar meu ano",
      renovacao: "Renova a cada ano pelo mesmo valor. Cancele quando quiser.",
      nota: "por um ano · Garantia de 7 dias",
    },
    confianca: [
      "Garantia incondicional de 7 dias",
      "Pagamento seguro via Hotmart · Cartão",
      "iPhone e Android, o mesmo acesso nos dois",
    ],
    espera: {
      selo: "Em breve",
      texto: "A assinatura para quem está fora do Brasil abre em breve. Deixe seu contato e avisamos no dia em que abrir.",
      botao: "Me avise quando abrir",
      nota: "Avisamos no dia em que abrir",
    },
  },
};

export const LISTA_MERCADOS = Object.keys(MERCADOS) as Mercado[];

/* ------------------------------ cálculo ------------------------------
   Tudo em centavos inteiros: 89,94 / 12 em ponto flutuante dá 7,4949...
   e arredondaria para 7,49; em centavos, 8994 / 12 = 749,5 vira 750. */

const centavos = (v: number) => Math.round(v * 100);

/** Marcador de campo ainda não preenchido (link, cupom, data). */
export function pendente(valor: string | null | undefined): boolean {
  return !valor || /\[PREENCHER/i.test(valor);
}

/** AAAA-MM-DD que existe no calendário. Date.parse aceita 2026-11-31 e
    passa para 1º/12; a ida e volta pelo toISOString recusa. */
function dataReal(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T12:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Instante em que o preço de lançamento acaba: o dia seguinte ao
    terminaEm, à meia-noite de Brasília (sem horário de verão desde 2019). */
export function fimDoLancamento(m: Mercado): number | null {
  const l = MERCADOS[m].lancamento;
  if (!l || !dataReal(l.terminaEm)) return null;
  const t = Date.parse(`${l.terminaEm}T23:59:59.999-03:00`);
  return Number.isFinite(t) ? t + 1 : null;
}

/**
 * O cupom de lançamento vale agora? Precisa estar ativo, ter código e
 * data preenchidos e a data não ter passado. `agora` vem do servidor
 * (prop `momento`) para o HTML e a hidratação concordarem.
 */
export function lancamentoVigente(m: Mercado, agora: number = Date.now()): boolean {
  const l = MERCADOS[m].lancamento;
  if (!l || !l.ativo || pendente(l.codigo)) return false;
  const fim = fimDoLancamento(m);
  return fim !== null && agora < fim;
}

/** Preço efetivamente cobrado: aplica o cupom de lançamento quando vale. */
export function precoFinal(m: Mercado, agora: number = Date.now()): number {
  const o = MERCADOS[m];
  if (o.lancamento && lancamentoVigente(m, agora)) {
    return Math.round((centavos(o.anual) * (100 - o.lancamento.percentual)) / 100) / 100;
  }
  return o.anual;
}

/** Equivalente mensal: anual dividido por 12, duas casas. Nunca é um plano. */
export function mensal(anual: number): number {
  return Math.round(centavos(anual) / 12) / 100;
}

export function porMes(m: Mercado, agora: number = Date.now()): number {
  return mensal(precoFinal(m, agora));
}

/** Formata no padrão do mercado: R$ 149,90 · US$ 24.99 (es-419) · US$ 24,99 · 29,99 €. */
export function formatar(m: Mercado, valor: number): string {
  const f = MERCADOS[m].formato;
  const [int, dec] = (Math.round(valor * 100) / 100).toFixed(2).split(".");
  const milhar = f.decimal === "," ? "." : ",";
  const inteiro = int.replace(/\B(?=(\d{3})+(?!\d))/g, milhar);
  const numero = `${inteiro}${f.decimal}${dec}`;
  // Espaço que não quebra: o símbolo nunca fica sozinho no fim da linha.
  return f.simboloDepois ? `${numero}\u00A0${f.simbolo}` : `${f.simbolo}\u00A0${numero}`;
}

/** Junta o cupom ao link do checkout com o parâmetro da Hotmart. */
export function linkComCupom(base: string, codigo: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${PARAMETRO_CUPOM}=${encodeURIComponent(codigo)}`;
}

/**
 * Link do botão. No Brasil, com o cupom de lançamento valendo, o código
 * vai embutido para o checkout abrir já com o desconto. Encerrado, o
 * link perde o parâmetro.
 */
export function linkCheckout(m: Mercado, agora: number = Date.now()): string {
  const o = MERCADOS[m];
  if (pendente(o.checkout) || !o.lancamento || !lancamentoVigente(m, agora)) return o.checkout;
  return linkComCupom(o.checkout, o.lancamento.codigo);
}

/** O mercado vende agora: chave ligada e link de verdade. */
export function vendeAgora(m: Mercado): boolean {
  return MERCADOS[m].vendaAberta && !pendente(MERCADOS[m].checkout);
}

/** Preço cheio riscado: só existe enquanto o cupom de lançamento vale. */
export function precoCheio(m: Mercado, agora: number = Date.now()): string | null {
  return lancamentoVigente(m, agora) ? formatar(m, MERCADOS[m].anual) : null;
}

const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "31 de outubro", para a linha "Preço de lançamento até ...". */
export function dataDoLancamento(m: Mercado): string | null {
  const l = MERCADOS[m].lancamento;
  if (!l || !dataReal(l.terminaEm)) return null;
  const r = l.terminaEm.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!r) return null;
  const mes = MESES_PT[Number(r[2]) - 1];
  return mes ? `${Number(r[3])} de ${mes}` : null;
}

/* ---------------------------- estudante ----------------------------
   Cupom de uso único sobre o plano BRL (handoff, seção 1). Existe só no
   Brasil: a validação usa CPF e o cobro é em real. Piso interno de
   R$ 47, nunca público. */

export function precoEstudante(): number {
  return Math.round((centavos(MERCADOS.br.anual) * (100 - ESTUDANTE_DESCONTO)) / 100) / 100;
}

export function porMesEstudante(): number {
  return mensal(precoEstudante());
}
