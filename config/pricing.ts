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
   Next, para conferir links e data antes do build de produção.
   ===================================================================== */

/* ---------------------------------------------------------------------
   LINKS DA HOTMART · decisões do dono em 12/10/2026
   ---------------------------------------------------------------------
   Produto 7448309, checkout K105072021O. Cada mercado é uma OFERTA
   (parâmetro off). Nenhum link daqui leva cupom: o lançamento é uma
   oferta própria, e só o estudante usa cupom (pessoal, criado pela API
   da Hotmart na aprovação; ver app/api/estudante/solicitar).

   CHECKOUT_BRL         oferta oficial do Brasil, R$ 149,90 por ano à
                        vista ou em até 12x no cartão com acréscimo. É
                        também a base do cupom
                        pessoal do estudante (/estudante/ativar).
   CHECKOUT_LANCAMENTO  oferta "Lançamento App": R$ 99,98 por ano nos 3
                        primeiros anos e, depois, R$ 149,90 por ano (é o
                        que o checkout diz). Só à vista, sem parcelas.
   FIM_DO_LANCAMENTO    último dia do preço de lançamento, AAAA-MM-DD, no
                        horário de Brasília. A página mostra a data em
                        texto e, passado esse dia, volta sozinha para
                        R$ 149,90 e o botão passa a abrir o CHECKOUT_BRL.
                        Na Hotmart, deixe a oferta de lançamento ativa
                        até pelo menos 02:00 do dia seguinte (quem abriu o
                        checkout perto da meia-noite ainda paga) e só
                        então a desative: o link dela é aberto, e quem o
                        tiver guardado pagaria o preço de lançamento.

   O build de produção TRAVA se algum deles voltar a "[PREENCHER", se um
   link sair do checkout da Hotmart ou se o link do lançamento for o
   mesmo do preço cheio. Build de teste: DM_ENDERECO_TESTE="Rua de
   Teste, 123" npm run build (recusado em produção na Vercel).

   Mercados de fora (la, rw, pt, es): links prontos, venda FECHADA
   (vendaAberta: false) até o dono confirmar a abertura. Fechado, o
   mercado não exige link; aberto, a trava confere o link dele. Todo
   build lista os mercados fechados, para a decisão ficar à vista.
   --------------------------------------------------------------------- */
export const PRODUTO_HOTMART = "7448309";
const CHECKOUT_BRL = "https://pay.hotmart.com/K105072021O?off=fhrttdh8";
const CHECKOUT_LANCAMENTO = "https://pay.hotmart.com/K105072021O?off=lf63bgdd";
const FIM_DO_LANCAMENTO = "2026-11-16";

/* América Latina e resto do mundo usam a MESMA oferta em dólar
   (US$ 29,99 por ano). O checkout dela abre em espanhol: conferir antes
   de abrir o rw, que é a página em português. */
const CHECKOUT_USD = "https://pay.hotmart.com/K105072021O?off=uevhmhy2";
const CHECKOUT_EUR_PT = "https://pay.hotmart.com/K105072021O?off=3n484jbe";
const CHECKOUT_EUR_ES = "https://pay.hotmart.com/K105072021O?off=iuoufnf6";

/** Parâmetro de cupom do checkout da Hotmart. Só o estudante usa: o link
    de /estudante/ativar leva o cupom pessoal nele, o checkout abre com o
    desconto aplicado e ninguém digita código. */
export const PARAMETRO_CUPOM = "offDiscount";

/** Preço FINAL do estudante, em reais por ano (decisão do dono,
    12/10/2026, terceira rodada): R$ 89,90 por ano exatos (R$ 7,49/mês),
    pagos na oferta oficial do Brasil (R$ 149,90) com o cupom pessoal de
    uso único. O número que manda é este; o desconto do cupom NASCE dele
    (ESTUDANTE_DESCONTO, no fim do arquivo: 1 - 89,90/149,90, cerca de
    0,40027). Trocar aqui muda a home e a /estudante juntas, e a trava do
    build diz o STUDENT_DISCOUNT novo a pôr na Vercel. */
export const ESTUDANTE_PRECO_FINAL = 89.9;

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
  /** Oferta de lançamento (outra oferta da Hotmart, não cupom), só no
      Brasil. null = não existe neste mercado. */
  lancamento: null | {
    /** Preço anual da oferta de lançamento, na moeda do plano. */
    anual: number;
    /** Anos em que o preço de lançamento vale. Depois, o checkout cobra
        o `anual` do plano a cada ano. */
    anos: number;
    /** Link da oferta de lançamento na Hotmart, sem cupom. */
    checkout: string;
    /** Último dia do preço de lançamento (AAAA-MM-DD, horário de Brasília). */
    terminaEm: string;
    /** false = encerrado: preço cheio e link do plano, mesmo antes da data. */
    ativo: boolean;
    /** A oferta de lançamento parcela? false: só à vista. */
    parcela: boolean;
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
    /** Junto da manchete quando o preço de lançamento vale. */
    mesLancamento?: string;
    totalSufixo: string;
    /** Depois do total, com o lançamento valendo. {anos} e {cheio} saem
        do config (anos do lançamento e preço cheio formatado). */
    lancamentoRegra?: string;
    pagamento: string;
    /** No lugar de `pagamento` com o lançamento valendo. */
    pagamentoLancamento?: string;
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
      mercado: Pix não existe fora do Brasil. */
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
      anual: 99.98,
      anos: 3,
      checkout: CHECKOUT_LANCAMENTO,
      terminaEm: FIM_DO_LANCAMENTO,
      // Ligado: até o FIM_DO_LANCAMENTO a página mostra R$ 99,98 e o botão
      // abre a oferta de lançamento. Encerrado antes da data? Vire para
      // false: a página volta a R$ 149,90 e o botão, ao CHECKOUT_BRL.
      ativo: true,
      // O checkout da oferta de lançamento não tem seletor de parcelas.
      parcela: false,
    },
    checkout: CHECKOUT_BRL,
    imposto: "na",
    parcela: true,
    // O checkout do lançamento diz que, depois de 3 anos, o valor passa a
    // R$ 149,90: "pelo mesmo valor" não vale aqui. O texto do lançamento
    // (lancamentoRegra) já conta a regra inteira.
    renovaMesmoValor: false,
    vendaAberta: true,
    semVenda: "bloco",
    textos: {
      titulo: "Seu Diariamente por um ano",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      mes: "/mês",
      mesLancamento: "no lançamento",
      totalSufixo: "por ano",
      lancamentoRegra: "nos {anos} primeiros anos. Depois, {cheio} por ano.",
      // Sem valor de parcela: a Hotmart calcula. E o parcelado tem
      // acréscimo (o checkout da fhrttdh8 mostrou 12x de R$ 16,40 em
      // 12/10/2026): "com acréscimo" impede ler, ao lado da manchete
      // "R$ 12,49/mês", 12x de R$ 12,49.
      pagamento: "À vista, ou em até 12x no cartão com acréscimo",
      pagamentoLancamento: "Pagamento à vista",
      botao: "Começar meu ano",
      renovacao: "Renova a cada ano. Cancele quando quiser.",
      renovacaoMesmoValor: "Renova a cada ano pelo mesmo valor. Cancele quando quiser.",
      prazo: "Preço de lançamento até",
      estudante: "Sou estudante",
      nota: "por um ano · Garantia de 7 dias",
    },
    confianca: [
      "Garantia incondicional de 7 dias",
      // O checkout da oferta oficial mostra cartão, Apple Pay, Pix e Pix
      // Automático (12/10/2026). Boleto não aparece lá, e saiu daqui.
      "Pagamento seguro via Hotmart · Pix ou cartão",
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
    anual: 29.99,
    lancamento: null,
    checkout: CHECKOUT_USD,
    imposto: "fora",
    parcela: false,
    renovaMesmoValor: true,
    // Fechado até o dono confirmar a abertura (e os 365 textos em
    // espanhol estarem revisados, handoff, seção 9).
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
    checkout: CHECKOUT_EUR_ES,
    imposto: "dentro",
    parcela: false,
    renovaMesmoValor: true,
    // Fechado até o dono confirmar a abertura.
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
    checkout: CHECKOUT_EUR_PT,
    imposto: "dentro",
    parcela: false,
    renovaMesmoValor: true,
    // Fechado até o dono confirmar a abertura.
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
    // Página em português: vírgula decimal (US$ 29,99).
    formato: { simbolo: "US$", simboloDepois: false, decimal: "," },
    anual: 29.99,
    lancamento: null,
    // Mesma oferta em dólar da América Latina (decisão do dono, 12/10).
    checkout: CHECKOUT_USD,
    imposto: "fora",
    parcela: false,
    renovaMesmoValor: true,
    // Fechado até o dono confirmar a abertura: o bloco vira a lista de
    // espera e o build lista rw entre os mercados fechados. Antes de
    // abrir, conferir o checkout em dólar, que abre em espanhol.
    vendaAberta: false,
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
   Tudo em centavos inteiros: 41,94 / 12 em ponto flutuante dá 3,4949...
   e arredondaria para 3,49; em centavos, 4194 / 12 = 349,5 vira 350.
   O estudante: 8990 / 12 = 749,17, R$ 7,49/mês. */

const centavos = (v: number) => Math.round(v * 100);

/** Marcador de campo ainda não preenchido (link, data). */
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
 * O preço de lançamento vale agora? Precisa estar ativo, ter o link da
 * oferta e a data preenchidos e a data não ter passado. `agora` vem do
 * servidor (prop `momento`) para o HTML e a hidratação concordarem.
 */
export function lancamentoVigente(m: Mercado, agora: number = Date.now()): boolean {
  const l = MERCADOS[m].lancamento;
  if (!l || !l.ativo || pendente(l.checkout)) return false;
  const fim = fimDoLancamento(m);
  return fim !== null && agora < fim;
}

/** Preço efetivamente cobrado agora: o da oferta de lançamento, quando vale. */
export function precoFinal(m: Mercado, agora: number = Date.now()): number {
  const o = MERCADOS[m];
  if (o.lancamento && lancamentoVigente(m, agora)) return o.lancamento.anual;
  return o.anual;
}

/** Equivalente mensal: anual dividido por 12, duas casas. Nunca é um plano. */
export function mensal(anual: number): number {
  return Math.round(centavos(anual) / 12) / 100;
}

export function porMes(m: Mercado, agora: number = Date.now()): number {
  return mensal(precoFinal(m, agora));
}

/** Formata no padrão do mercado: R$ 149,90 · US$ 29.99 (es-419) · US$ 29,99 · 29,99 €. */
export function formatar(m: Mercado, valor: number): string {
  const f = MERCADOS[m].formato;
  const [int, dec] = (Math.round(valor * 100) / 100).toFixed(2).split(".");
  const milhar = f.decimal === "," ? "." : ",";
  const inteiro = int.replace(/\B(?=(\d{3})+(?!\d))/g, milhar);
  const numero = `${inteiro}${f.decimal}${dec}`;
  // Espaço que não quebra: o símbolo nunca fica sozinho no fim da linha.
  return f.simboloDepois ? `${numero} ${f.simbolo}` : `${f.simbolo} ${numero}`;
}

/** Junta o cupom ao link do checkout com o parâmetro da Hotmart. Só o
    estudante usa (cupom pessoal, /estudante/ativar). */
export function linkComCupom(base: string, codigo: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${PARAMETRO_CUPOM}=${encodeURIComponent(codigo)}`;
}

/**
 * Link do botão. No Brasil, com o lançamento valendo, é a oferta de
 * lançamento; encerrado (data passada ou ativo: false), é a oferta
 * oficial do plano. Nenhum dos dois leva cupom.
 */
export function linkCheckout(m: Mercado, agora: number = Date.now()): string {
  const o = MERCADOS[m];
  if (o.lancamento && lancamentoVigente(m, agora)) return o.lancamento.checkout;
  return o.checkout;
}

/** Parcela agora? A oferta de lançamento é só à vista. */
export function parcelaAgora(m: Mercado, agora: number = Date.now()): boolean {
  const o = MERCADOS[m];
  if (o.lancamento && lancamentoVigente(m, agora)) return o.lancamento.parcela;
  return o.parcela;
}

/** Linha de pagamento do bloco: "Pagamento à vista" no lançamento,
    "À vista, ou em até 12x no cartão com acréscimo" no preço cheio.
    Nunca valor de parcela. */
export function pagamentoAgora(m: Mercado, agora: number = Date.now()): string {
  const t = MERCADOS[m].textos;
  return lancamentoVigente(m, agora) && t.pagamentoLancamento ? t.pagamentoLancamento : t.pagamento;
}

/** O mercado vende agora: chave ligada e link de verdade. */
export function vendeAgora(m: Mercado): boolean {
  return MERCADOS[m].vendaAberta && !pendente(MERCADOS[m].checkout);
}

/** Preço cheio riscado: só existe enquanto o preço de lançamento vale. */
export function precoCheio(m: Mercado, agora: number = Date.now()): string | null {
  return lancamentoVigente(m, agora) ? formatar(m, MERCADOS[m].anual) : null;
}

/** Desconto do lançamento sobre o preço cheio, em % inteiro, arredondado
    PARA BAIXO (R$ 99,98 sobre R$ 149,90 é 33,3%: o selo diz 33%, nunca
    mais do que é). null fora do lançamento. */
export function percentualDoLancamento(m: Mercado, agora: number = Date.now()): number | null {
  const o = MERCADOS[m];
  if (!o.lancamento || !lancamentoVigente(m, agora)) return null;
  const cheio = centavos(o.anual);
  if (cheio <= 0) return null;
  const pct = Math.floor(((cheio - centavos(o.lancamento.anual)) * 100) / cheio);
  return pct > 0 ? pct : null;
}

/** "nos 3 primeiros anos. Depois, R$ 149,90 por ano.", com o lançamento
    valendo. null fora dele. */
export function regraDoLancamento(m: Mercado, agora: number = Date.now()): string | null {
  const o = MERCADOS[m];
  const regra = o.textos.lancamentoRegra;
  if (!o.lancamento || !regra || !lancamentoVigente(m, agora)) return null;
  return regra.replace("{anos}", String(o.lancamento.anos)).replace("{cheio}", formatar(m, o.anual));
}

const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "16 de novembro", para a linha "Preço de lançamento até ...". */
export function dataDoLancamento(m: Mercado): string | null {
  const l = MERCADOS[m].lancamento;
  if (!l || !dataReal(l.terminaEm)) return null;
  const r = l.terminaEm.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!r) return null;
  const mes = MESES_PT[Number(r[2]) - 1];
  return mes ? `${Number(r[3])} de ${mes}` : null;
}

/* ---------------------------- estudante ----------------------------
   Cupom PESSOAL de uso único sobre a oferta oficial do Brasil
   (CHECKOUT_BRL, R$ 149,90), criado pela API da Hotmart quando o
   estudante é aprovado e apagado pelo webhook do site quando o
   pagamento é aprovado. Existe só no Brasil: a validação usa CPF e o
   cobro é em real. Piso interno de R$ 47, nunca público. Nenhuma oferta
   própria de estudante entra no site: o cupom pessoal é a única via (a
   oferta de estudante da Hotmart hoje mostra R$ 149,90, igual à oficial).
   Se o cupom vale também nas renovações não se sabe: o texto diz só que
   a cobrança é anual (ESTUDANTE, em config.ts), sem prometer duração. */

/** Casas decimais do desconto do cupom. A API da Hotmart recebe o
    `discount` como fração (0 < discount < 0,99) e não documenta quantas
    casas guarda nem como arredonda o preço; com 5, o preço que sai cai
    no centavo certo para qualquer preço final (o desconto é arredondado
    PARA CIMA, então o preço exato fica no anunciado ou até 0,15 centavo
    abaixo, nunca acima). Com 2 casas (0,40) seriam R$ 89,94. */
const CASAS_DO_DESCONTO = 5;

/** Preço que um desconto (fração, o formato da API e do
    STUDENT_DISCOUNT) deixa sobre um preço anual, arredondado ao
    centavo. Em centavos inteiros: 149,90 x (1 - 0,40027) = 89,8995...,
    que o checkout mostra como R$ 89,90. */
export function precoComDesconto(anual: number, desconto: number): number {
  return Math.round(centavos(anual) * (1 - desconto)) / 100;
}

/** Desconto do cupom pessoal, em FRAÇÃO, derivado do preço final:
    1 - 89,90/149,90 = 0,400266..., arredondado PARA CIMA com 5 casas =
    0.40027. Para cima porque o preço exato que ele deixa (R$ 89,8995)
    fica no anunciado ou abaixo: seja qual for o arredondamento da
    Hotmart, o checkout mostra R$ 89,90 ou R$ 89,89, nunca R$ 89,91. É o
    valor do STUDENT_DISCOUNT na Vercel (a trava do build aceita só os
    valores com essa mesma garantia, de 0.40027 a 0.40030, e diz este
    quando faltar). Conta em centavos inteiros, sem o erro de ponto
    flutuante de 1 - 0,59973... */
export const ESTUDANTE_DESCONTO =
  Math.ceil(
    ((centavos(MERCADOS.br.anual) - centavos(ESTUDANTE_PRECO_FINAL)) * 10 ** CASAS_DO_DESCONTO) /
      centavos(MERCADOS.br.anual),
  ) / 10 ** CASAS_DO_DESCONTO;

/** O que o estudante paga por ano: o preço oficial com o desconto do
    cupom, em centavos. Dá o ESTUDANTE_PRECO_FINAL (R$ 89,90); a trava
    do build e os testes conferem. */
export function precoEstudante(): number {
  return precoComDesconto(MERCADOS.br.anual, ESTUDANTE_DESCONTO);
}

export function porMesEstudante(): number {
  return mensal(precoEstudante());
}
