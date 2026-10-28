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
                        que o checkout diz). R$ 99,98 é o preço À VISTA: o
                        checkout salvo em 28/10/2026 também parcela em até
                        12x no cartão (e no Apple Pay e no Google Pay), com
                        acréscimo (12x somam R$ 131,28), e mostra Pix e
                        boleto. Nunca escrever "só à vista" nem "não
                        parcela" (CDC, art. 37).
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

   Na VITRINE (site de vendas em standby: /vendas, /es/vendas,
   /es-es/vendas, /pt-pt/vendas, /mundo/vendas), todo mercado aparece com
   a venda aberta e o botão abre o link dele daqui, já, mesmo com
   vendaAberta: false (decisão do dono, 27/10/2026: "Já pode colocar o
   link do checkout. Quero testar a jornada inteira."). vendaAberta e
   semVenda continuam decidindo o lançamento público.
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
    /** O checkout da oferta de lançamento parcela? (a lf63bgdd parcela: true) */
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
  /*
   * TEXTOS. Os {marcadores} são trocados pela conta, nunca por número
   * escrito à mão: {anos} (anos do lançamento), {pct}
   * (percentualDoLancamento), {cheio} (preço oficial formatado), {mes}
   * (porMes) e {dia} (porDia). O trecho entre asteriscos (*33% a menos*)
   * é o destaque do card (branco, peso 600); o asterisco nunca chega à
   * tela (emPartes, textoCorrido).
   *
   * CARD NOVO (só o Brasil, pedido do dono de 27/10/2026, copy julgada e
   * sintetizada): o mercado que tem `linhaValor` usa o card de venda
   * novo de components/BlocoOferta.tsx (manchete anual, âncora, quadro
   * de 3 anos no lançamento). Sem `linhaValor`, o card de sempre
   * (manchete mensal, frase de proposta, pílula de pagamento).
   */
  textos: {
    titulo: string;
    /** Cabeçalho do card com o lançamento valendo (sem o "por um ano",
        que contradizia o desconto de 3 anos e não cabia com o selo). */
    tituloLancamento?: string;
    proposta: string;
    mes: string;
    /** Rótulo do preço cheio riscado, acima da manchete, enquanto o
        preço de lançamento vale ("Preço oficial: R$ 149,90 por ano"). */
    ancora?: string;
    /** Junto da manchete quando o preço de lançamento vale (card de sempre). */
    mesLancamento?: string;
    totalSufixo: string;
    /** Regra do lançamento no card, com o lançamento valendo:
        "*{pct}% a menos*, travado nos {anos} primeiros anos. Depois,
        {cheio} por ano." */
    lancamentoRegra?: string;
    /** A mesma regra quando o desconto não chega a 1% (sem "0% a menos"). */
    lancamentoRegraSemPercentual?: string;
    /** A regra na /estudante (components/BlocoPreco.tsx), depois de "Por
        ano": "nos {anos} primeiros anos. Depois, {cheio} por ano.". Sem
        percentual: ali as diferenças mostradas são as do estudante. */
    lancamentoRegraEstudante?: string;
    /** Fracionamento do preço cobrado agora, no card novo:
        "Equivale a *{mes}* por mês. Por dia, cerca de *{dia}* e três
        minutos." Vale no lançamento e depois dele. */
    linhaValor?: string;
    /** Quadro dos {anos} anos do lançamento (card novo): rótulos das três
        linhas e a legenda, que só aparece com quaseUmAnoInteiro. */
    quadroOficial?: string;
    quadroLancamento?: string;
    quadroEconomia?: string;
    quadroLegenda?: string;
    pagamento: string;
    /** No lugar de `pagamento` com o lançamento valendo (card de sempre). */
    pagamentoLancamento?: string;
    botao: string;
    renovacao: string;
    renovacaoMesmoValor?: string;
    impostoNota?: string;
    /** Antes da data do fim do lançamento ("... até 16 de novembro."). */
    prazo?: string;
    estudante?: string;
    /** Linha curta da barra fixa e do CTA final, depois do preço. */
    nota: string;
    /** No lugar de `nota` no CTA final, com o lançamento valendo:
        "por ano à vista nos {anos} primeiros anos, para quem assinar até
        {data} · Garantia de 7 dias". */
    notaLancamento?: string;
    /** Segunda linha da barra fixa com o lançamento valendo, no lugar do
        stickyNote de lib/i18n.ts: "por ano durante {anos} anos". */
    notaBarraLancamento?: string;
  };
  /** Linhas de confiança sob o botão. Meio de pagamento muda por
      mercado: Pix não existe fora do Brasil. */
  confianca: string[];
  /** Lista de espera, enquanto vendaAberta for false. */
  espera: {
    selo: string;
    texto: string;
    botao: string;
    /** Rótulo do botão da barra fixa do celular: o botao inteiro quebrava
        em duas linhas dentro dos 48 px (revisão de 28/10/2026). */
    botaoCurto: string;
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
      // O checkout da oferta de lançamento parcela em até 12x com
      // acréscimo (conferido em 28/10/2026: 1x de R$ 99,98 a 12x de
      // R$ 10,94). Até 27/10 este campo dizia que não parcelava.
      parcela: true,
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
    // Card de venda novo (pedido do dono, 27/10/2026: "o card de venda,
    // de oferta, ele pode ser melhor trabalhado, essa copy"). A copy foi
    // escrita, julgada (conversão, verdade e lei, design) e sintetizada;
    // o que ficou de fora e por quê está em docs/LANCAMENTO.md ("Card de
    // oferta do Brasil"). Nada de "cashback", "de graça", "pague 2 leve
    // 3": ninguém recebe dinheiro de volta (CDC, art. 37). Todo número
    // sai da conta.
    textos: {
      titulo: "Seu Diariamente por um ano",
      tituloLancamento: "Seu Diariamente",
      proposta: "Uma provocação, uma reflexão, uma ação possível. Todos os dias.",
      mes: "/mês",
      // Pedido do dono (27/10/2026): deixar claro que o preço oficial é
      // R$ 149,90 e que, só agora, sai por 33% a menos. O número do
      // desconto vem da conta ({pct}), nunca escrito à mão.
      ancora: "Preço oficial",
      mesLancamento: "no lançamento",
      totalSufixo: "por ano",
      // "travado": o desconto vale nos 3 primeiros anos (é o que o
      // checkout da oferta de lançamento garante), e a renovação ao preço
      // oficial fica dita às claras (CDC, arts. 6º, III, e 31).
      lancamentoRegra: "*{pct}% a menos*, travado nos {anos} primeiros anos. Depois, {cheio} por ano.",
      lancamentoRegraSemPercentual: "Travado nos {anos} primeiros anos. Depois, {cheio} por ano.",
      lancamentoRegraEstudante: "nos {anos} primeiros anos. Depois, {cheio} por ano.",
      // "Equivale a": a oferta é anual, nunca mensalidade.
      // "cerca de": R$ 99,98 / 365 = 0,2739, e o ritual pede cerca de três
      // minutos.
      linhaValor: "Equivale a *{mes}* por mês. Por dia, cerca de *{dia}* e três minutos.",
      // O total de 3 anos no preço oficial NÃO é riscado: não existe plano
      // de 3 anos, e riscar esse total seria um preço de referência
      // fictício (CDC, art. 37, § 1º).
      quadroOficial: "{anos} anos no preço oficial",
      quadroLancamento: "{anos} anos no lançamento",
      // "Em 3 anos": o número do quadro é a economia dos 3 anos, não de um
      // (revisão do card, 28/10/2026). O {anos} sai da conta, como nas
      // outras linhas do quadro.
      quadroEconomia: "Em {anos} anos, você deixa de pagar",
      quadroLegenda: "Quase o preço oficial de um ano inteiro.",
      // Sem valor de parcela: a Hotmart calcula. E o parcelado tem
      // acréscimo (o checkout da fhrttdh8 mostrou 12x de R$ 16,40 em
      // 12/10/2026): "com acréscimo" impede ler, ao lado do equivalente
      // "R$ 12,49 por mês", 12x de R$ 12,49.
      // Vale também no lançamento: a oferta lf63bgdd parcela como a
      // oficial. Sem pagamentoLancamento ("Pagamento à vista" dava a
      // entender que só havia à vista).
      pagamento: "À vista, ou em até 12x no cartão com acréscimo",
      botao: "Começar meu ano",
      renovacao: "Renova a cada ano. Cancele quando quiser.",
      renovacaoMesmoValor: "Renova a cada ano pelo mesmo valor. Cancele quando quiser.",
      // "para quem assinar até": a data é para entrar na oferta e não
      // encurta os 3 anos. "à vista" qualifica o preço: R$ 99,98 é o
      // valor à vista (parcelado no cartão sai mais caro). Fica aqui,
      // antes do botão.
      prazo: "Preço de lançamento, à vista, para quem assinar até",
      estudante: "Sou estudante",
      nota: "por um ano · Garantia de 7 dias",
      // Nunca "só até" colado a "nos 3 primeiros anos": daria para ler
      // que o preço acaba em 16/11. "à vista" (revisão do card,
      // 28/10/2026): R$ 99,98 é o valor à vista (a oferta parcela em até
      // 12x com acréscimo), e o CTA final é lido sem o card ao lado. O 7
      // é o GARANTIA.dias do config.ts
      // (este arquivo não importa nada; um teste confere que é igual).
      notaLancamento: "por ano à vista nos {anos} primeiros anos, para quem assinar até {data} · Garantia de 7 dias",
      // Cabe ao lado do botão da barra a 375 px (~133 px em Inter 500 de
      // 12 px); com a garantia, o botão quebraria em duas linhas. Sem
      // "à vista" pelo mesmo motivo: a barra leva ao card (#preco), onde
      // o "à vista" está na linha do prazo, logo acima do botão.
      notaBarraLancamento: "por ano durante {anos} anos",
    },
    confianca: [
      // "Decida com o app na mão." só existe colado à garantia.
      "Garantia incondicional de 7 dias. Decida com o app na mão.",
      // O checkout da oferta oficial mostra cartão, Apple Pay, Pix e Pix
      // Automático (12/10/2026). Boleto não aparece lá, e saiu daqui.
      "Pagamento seguro via Hotmart · Pix ou cartão",
      "iPhone e Android, o mesmo acesso nos dois",
    ],
    espera: {
      selo: "Em breve",
      texto: "A assinatura abre em breve. Deixe seu contato e avisamos no dia em que abrir.",
      botao: "Me avise quando abrir",
      botaoCurto: "Me avise",
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
      botaoCurto: "Avísame",
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
      botaoCurto: "Avísame",
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
      botaoCurto: "Avisem-me",
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
      botaoCurto: "Me avise",
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

/** Equivalente por dia do preço cobrado agora, em centavos inteiros:
    9998 / 365 = 27,39, R$ 0,27 (na tela, sempre com "cerca de"). */
export function porDia(m: Mercado, agora: number = Date.now()): number {
  return Math.round(centavos(precoFinal(m, agora)) / 365) / 100;
}

/** Um preço anual somado por `anos` anos, em centavos inteiros:
    149,90 x 3 = 449,70; 99,98 x 3 = 299,94. */
export function totalEmAnos(valor: number, anos: number): number {
  return (centavos(valor) * anos) / 100;
}

/** O que a pessoa deixa de pagar nos anos do lançamento, contra o preço
    oficial: (149,90 - 99,98) x 3 = 149,76. null fora do lançamento (aí o
    quadro some) ou sem desconto. */
export function economiaDoLancamento(m: Mercado, agora: number = Date.now()): number | null {
  const o = MERCADOS[m];
  if (!o.lancamento || !lancamentoVigente(m, agora)) return null;
  const e = (centavos(o.anual) - centavos(o.lancamento.anual)) * o.lancamento.anos;
  return e > 0 ? e / 100 : null;
}

/** A economia do lançamento é "quase o preço oficial de um ano inteiro"?
    Só de 95% a menos de 100% do preço oficial, em centavos inteiros
    (hoje 14976 contra 14990, 99,9%). Fora dessa faixa a legenda não
    aparece: com 100% ou mais, "quase" seria falso. */
export function quaseUmAnoInteiro(m: Mercado, agora: number = Date.now()): boolean {
  const economia = economiaDoLancamento(m, agora);
  if (economia === null) return false;
  const e = centavos(economia);
  const c = centavos(MERCADOS[m].anual);
  return e * 100 >= c * 95 && e < c;
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

/** Parcela agora? As duas ofertas do Brasil parcelam (até 12x com acréscimo). */
export function parcelaAgora(m: Mercado, agora: number = Date.now()): boolean {
  const o = MERCADOS[m];
  if (o.lancamento && lancamentoVigente(m, agora)) return o.lancamento.parcela;
  return o.parcela;
}

/** Linha de pagamento do bloco: "À vista, ou em até 12x no cartão com
    acréscimo" (pagamentoLancamento, se um mercado tiver, no
    lançamento). Nunca valor de parcela. No card novo do Brasil, o "à
    vista" do lançamento está no prazo; esta linha só aparece depois dele. */
export function pagamentoAgora(m: Mercado, agora: number = Date.now()): string {
  const t = MERCADOS[m].textos;
  return lancamentoVigente(m, agora) && t.pagamentoLancamento ? t.pagamentoLancamento : t.pagamento;
}

/** O mercado vende agora: chave ligada e link de verdade. */
export function vendeAgora(m: Mercado): boolean {
  return MERCADOS[m].vendaAberta && !pendente(MERCADOS[m].checkout);
}

/** Preço cheio riscado ("Preço oficial", textos.ancora): só existe
    enquanto o preço de lançamento vale. */
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

/* ------------------------- textos com conta -------------------------
   Os textos do mercado levam {marcadores} (trocados pela conta) e
   *destaques* (o trecho que o card mostra em branco, peso 600). As
   funções abaixo devolvem o texto em PARTES, para o componente
   destacar sem escrever texto nenhum, e textoCorrido junta as partes
   em texto simples (testes, /estudante). */

/** Um trecho de texto; `destaque` é o que estava entre asteriscos. */
export type Parte = { texto: string; destaque: boolean };

/** Troca cada {chave} pelo valor. Chave sem valor fica como está (um
    teste confere que nenhuma chega à tela). */
function preencher(modelo: string, valores: Record<string, string>): string {
  return modelo.replace(/\{(\w+)\}/g, (todo, chave: string) => (chave in valores ? valores[chave] : todo));
}

/** "Equivale a *R$ 8,33* por mês." vira três partes, a do meio em
    destaque. O asterisco nunca chega à tela. */
export function emPartes(texto: string): Parte[] {
  return texto
    .split("*")
    .map((t, i) => ({ texto: t, destaque: i % 2 === 1 }))
    .filter((p) => p.texto !== "");
}

/** As partes juntas, sem os destaques: o texto que a pessoa lê. */
export function textoCorrido(partes: Parte[] | null): string | null {
  return partes ? partes.map((p) => p.texto).join("") : null;
}

/** Valores de conta dos textos do lançamento: {anos}, {cheio}, {data}.
    A data leva espaços que não quebram, como o preço: "16 de novembro"
    nunca se parte no fim da linha. */
function valoresDoLancamento(m: Mercado): Record<string, string> {
  const o = MERCADOS[m];
  return {
    anos: String(o.lancamento ? o.lancamento.anos : ""),
    cheio: formatar(m, o.anual),
    data: (dataDoLancamento(m) ?? "").replace(/ /g, "\u00a0"),
  };
}

/** A regra do lançamento no card, em partes, com o lançamento valendo:
    "*33% a menos*, travado nos 3 primeiros anos. Depois, R$ 149,90 por
    ano." null fora dele.

    O {pct} é o percentualDoLancamento (arredondado para baixo, o mesmo
    número do selo "33% OFF"). Sem desconto de 1% ou mais, o texto sem
    percentual ("Travado nos 3 primeiros anos. ..."), nunca "0% a menos".
    `semPercentual`: a forma da /estudante (components/BlocoPreco.tsx),
    que vem depois de "Por ano" ("nos 3 primeiros anos. Depois, R$ 149,90
    por ano."): ali as diferenças mostradas são as do estudante, e outro
    percentual, sobre outra base, confundiria. São três textos separados
    em config (lancamentoRegra, lancamentoRegraSemPercentual,
    lancamentoRegraEstudante): o texto do card começa pelo {pct} e não dá
    para tirar o percentual dele cortando um trecho. */
export function regraDoLancamentoEmPartes(
  m: Mercado,
  agora: number = Date.now(),
  opcoes: { semPercentual?: boolean } = {},
): Parte[] | null {
  const o = MERCADOS[m];
  const t = o.textos;
  if (!o.lancamento || !lancamentoVigente(m, agora)) return null;
  const pct = opcoes.semPercentual ? null : percentualDoLancamento(m, agora);
  const modelo = opcoes.semPercentual
    ? t.lancamentoRegraEstudante
    : pct !== null
      ? t.lancamentoRegra
      : t.lancamentoRegraSemPercentual;
  if (!modelo) return null;
  return emPartes(preencher(modelo, { ...valoresDoLancamento(m), pct: String(pct) }));
}

/** A regra do lançamento em texto simples (ver regraDoLancamentoEmPartes). */
export function regraDoLancamento(
  m: Mercado,
  agora: number = Date.now(),
  opcoes: { semPercentual?: boolean } = {},
): string | null {
  return textoCorrido(regraDoLancamentoEmPartes(m, agora, opcoes));
}

/** "Equivale a *R$ 8,33* por mês. Por dia, cerca de *R$ 0,27* e três
    minutos.", com o preço cobrado agora (R$ 12,49 e R$ 0,41 depois do
    lançamento). null no mercado sem `linhaValor`. */
export function linhaDeValor(m: Mercado, agora: number = Date.now()): Parte[] | null {
  const modelo = MERCADOS[m].textos.linhaValor;
  if (!modelo) return null;
  return emPartes(preencher(modelo, { mes: formatar(m, porMes(m, agora)), dia: formatar(m, porDia(m, agora)) }));
}

/** O quadro dos anos do lançamento, com o lançamento valendo e a
    economia positiva; null fora dele (o quadro some).
      oficial    "3 anos no preço oficial", R$ 449,70 (sem riscado)
      lancamento "3 anos no lançamento", R$ 299,94
      economia   "Em 3 anos, você deixa de pagar", R$ 149,76
      legenda    "Quase o preço oficial de um ano inteiro.", só com
                 quaseUmAnoInteiro (senão null) */
export function quadroDoLancamento(m: Mercado, agora: number = Date.now()): null | {
  oficial: { rotulo: string; valor: string };
  lancamento: { rotulo: string; valor: string };
  economia: { rotulo: string; valor: string };
  legenda: string | null;
} {
  const o = MERCADOS[m];
  const t = o.textos;
  const economia = economiaDoLancamento(m, agora);
  if (!o.lancamento || economia === null || !t.quadroOficial || !t.quadroLancamento || !t.quadroEconomia) return null;
  const v = valoresDoLancamento(m);
  const anos = o.lancamento.anos;
  return {
    oficial: { rotulo: preencher(t.quadroOficial, v), valor: formatar(m, totalEmAnos(o.anual, anos)) },
    lancamento: { rotulo: preencher(t.quadroLancamento, v), valor: formatar(m, totalEmAnos(o.lancamento.anual, anos)) },
    economia: { rotulo: preencher(t.quadroEconomia, v), valor: formatar(m, economia) },
    legenda: t.quadroLegenda && quaseUmAnoInteiro(m, agora) ? t.quadroLegenda : null,
  };
}

/** CTA final com o lançamento valendo, depois do preço: "por ano à vista
    nos 3 primeiros anos, para quem assinar até 16 de novembro · Garantia
    de 7 dias". null fora dele (o CTA usa textos.nota). */
export function notaDoLancamento(m: Mercado, agora: number = Date.now()): string | null {
  const modelo = MERCADOS[m].textos.notaLancamento;
  if (!modelo || !lancamentoVigente(m, agora) || !dataDoLancamento(m)) return null;
  return preencher(modelo, valoresDoLancamento(m));
}

/** Segunda linha da barra fixa com o lançamento valendo: "por ano
    durante 3 anos". null fora dele (a barra usa o stickyNote). */
export function notaDaBarra(m: Mercado, agora: number = Date.now()): string | null {
  const modelo = MERCADOS[m].textos.notaBarraLancamento;
  if (!modelo || !lancamentoVigente(m, agora)) return null;
  return preencher(modelo, valoresDoLancamento(m));
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
