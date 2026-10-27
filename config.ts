// =====================================================================
// DIARIAMENTE — CONFIGURAÇÃO CENTRAL DA PÁGINA DE VENDA
// ---------------------------------------------------------------------
// Tudo que muda fica AQUI. Não edite valores espalhados pelo código.
// Valores confirmados por Brunno em jun/2026. Itens [TROCAR] aguardam
// definição (links de checkout, pixels). Nada inventado.
// =====================================================================

// PREÇO, CUPOM, MOEDA E LINK DE CHECKOUT NÃO MORAM AQUI: moram em
// config/pricing.ts, por mercado (br, la, es, pt, rw). Os campos de plano
// abaixo só repassam de lá, para os componentes antigos continuarem
// funcionando sem um segundo número escrito à mão.
import { MERCADOS, ESTUDANTE_DESCONTO, formatar, precoEstudante, porMesEstudante, percentualDoLancamento } from "@/config/pricing";

export const SITE = {
  nome: "Diariamente",
  // Endereço técnico oficial (decisão do dono, 20/10/2026): com www, que é onde o site
  // responde (diariamente.app sem www faz 308 para cá na Vercel). Alimenta metadataBase,
  // canonical, openGraph.url, schemas, sitemap, robots e os links (href).
  // PRÉ-CONDIÇÃO: diariamente.club precisa fazer 301 permanente para cá, e os domínios
  // precisam estar no Search Console. Sem isso, o sinal fica dividido.
  dominio: "https://www.diariamente.app",
  // O que a pessoa LÊ (rodapé, papelaria, textos e links de compartilhar): sem www, como
  // no Brandbook 5.0, seção 29. Nunca usar dominio.replace("https://", "") para texto.
  dominioVisivel: "diariamente.app",
  // Parte protegida (app, login, API e banco). O domínio .club é só
  // endereço técnico: a marca é "Diariamente" / "Diariamente App", nunca
  // "Diariamente Club". O site comercial não tem login: só aponta para cá.
  appUrl: "https://app.diariamente.club",

  // Rede social DA MARCA. O Diariamente fala por si: as redes da Science
  // Play são da realizadora, não do produto, e misturar as duas dilui a
  // entidade que os buscadores precisam reconhecer.
  // Perfil oficial: @diariamente (confirmado por Brunno, set/2026).
  // NÃO é @diariamente.app. Este valor alimenta o rodapé visível E o
  // sameAs do schema Organization, que é o principal sinal de entidade
  // para buscadores: handle errado aqui ensina o Google a associar a
  // marca a um perfil que não é o seu.
  instagram: "diariamente",
  descricao:
    "Uma prática diária de hábitos e bem-estar. Um texto por dia que provoca uma reflexão e termina numa ação possível ainda hoje. Três minutos. Quando você falta, ele não cobra: te espera. Porque interromper não significa abandonar.",
  // OG image gerada a partir do kit oficial da marca, servida pelo próprio
  // domínio via convenção de arquivo do Next (app/opengraph-image.png).
  // Sem dependência de Cloudinary: o card de compartilhamento não quebra
  // se o asset for movido ou renomeado lá.
  ogImage: "/opengraph-image.png",
};

// Logos · Brandbook 5.0
// Os PNG antigos do Cloudinary (Asset_7, Asset_10, Logo_Diariamente_1) eram
// a MARCA ANTERIOR e saíram de circulação. O símbolo agora é SVG inline em
// components/Brand.tsx, e os arquivos de ícone são servidos pelo próprio
// domínio através das convenções do Next:
//   app/icon.png            512px, símbolo a 66% sobre S0 (o favicon)
//   app/apple-icon.png      180px, idem
//   app/opengraph-image.png 1200x630, lockup horizontal + a sequência
// O símbolo vetorial fica em public/icon.svg: responde em /icon.svg, mas
// não é anunciado no <head>. Em app/ o Next 16 passaria a anunciá-lo, e
// Chrome, Edge e Firefox trocariam o ícone da aba pelo SVG (maior e, no
// tema claro, de outro verde). O Next 14 anunciava só o icon.png.
export const LOGOS = {
  // usado no schema Organization, que exige URL absoluta
  schemaLogo: "/icon.png",
};

// ---------------------------------------------------------------------
// TELAS DO APP: as artes das lojas, em public/telas/pt e public/telas/es
// (lib/i18n.ts, telasDo; components/TelaDaLoja.tsx). Os mockups antigos
// do Cloudinary (Tela_HOJE, Tela_DIAS, Tela_ACOES e Tela_RITMO) saíram do
// site de vendas e da /estudante em 27/10/2026.
// ---------------------------------------------------------------------

// Foto lifestyle (ambiente) — seção "virada". Foto cheia, não transparente.
export const LIFESTYLE = "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782699619/Lifestyle_Diariamente_yur3mm.png";

// ---------------------------------------------------------------------
// PROVA REAL (confirmada — não inventar)
// ---------------------------------------------------------------------
export const PROVA = {
  // O numero vem de quem ja passou pela pratica. Nao afirmamos que sao
  // usuarios ativos diarios hoje: isso seria claim quantitativo nao
  // verificavel. "Ja comecaram" e verdade, honra quem participou e monta
  // exatamente a tensao que a marca vende: comecar e comum, voltar nao.
  leitores: "+5.000 pessoas",
  leitoresNumero: 5000,
  frase: "já começaram",

  // Todo mundo le o MESMO texto no mesmo dia (conteudo chaveado por
  // dia_ano na API). E o territorio "Quem comeca junto" da secao 11.
  simultaneidade: "Hoje, todas elas leram o mesmo texto que você.",
};

// ---------------------------------------------------------------------
// CONSELHO EDITORIAL
// ---------------------------------------------------------------------
// A frase "conteudo autoral, escrito e revisado por profissionais de
// saude" e a formulacao oficial da secao 10 — e ela EXIGE conselho
// editorial nomeado, com credencial publica e processo de revisao
// documentado. Sem isso, a frase nao pode ir ao ar.
//
// Preencha com os nomes e credenciais quando o conselho existir
// publicamente. Enquanto o array estiver vazio, a pagina NAO exibe a
// frase de procedencia — ela simplesmente nao renderiza.
export const CONSELHO: { nome: string; credencial: string; registro?: string }[] = [
  // { nome: "[NOME]", credencial: "[Psicologa | Nutricionista | Medica...]", registro: "[CRP/CRN/CRM 00000]" },
];

// ---------------------------------------------------------------------
// OFERTA · desde out/2026 (handoff de precificação v2)
// Uma oferta anual por mercado na Hotmart (produto 7448309). No Brasil,
// a oferta oficial (R$ 149,90) e, até o fim do lançamento, uma oferta
// própria de lançamento (R$ 99,98 por ano nos 3 primeiros anos), sem
// cupom. Tudo isso, com a data de término, está em config/pricing.ts.
// A oferta antiga do produto 8280315 (R$ 137,90) saiu daqui.
// ---------------------------------------------------------------------
const LANC_BR = MERCADOS.br.lancamento;
const PCT_LANC_BR = percentualDoLancamento("br");
export const LANCAMENTO = {
  ativa: Boolean(LANC_BR?.ativo),
  selo: PCT_LANC_BR ? `${PCT_LANC_BR}% OFF de lançamento` : "Preço de lançamento",
  prazoTexto: "preço de lançamento por tempo determinado, com a data na página",
};

/** "149,90": o número sem o símbolo, no formato do Brasil. */
const semSimbolo = (v: number) => formatar("br", v).replace(/^R\$\s/, "");

/** "À vista, ou..." vira "à vista, ou...", para entrar depois de um preço. */
const inicialMinuscula = (s: string) => s.charAt(0).toLocaleLowerCase("pt-BR") + s.slice(1);

export type Plano = {
  id: string;
  nome: string;
  selo?: string;
  destaque: boolean;
  precoNumero: number;     // preço COBRADO agora (founders enquanto LANCAMENTO.ativa)
  preco: string;
  precoDe?: string;        // preço nominal riscado (âncora)
  parcela?: string;        // valor da parcela, confirmado na Hotmart
  parcelas?: number;       // quantidade de parcelas
  parcelaTotal?: string;   // total pago no parcelado (obrigatório por CDC quando há acréscimo)
  precoVista?: string;
  perDia?: string;
  inclui: string[];
  ctaLabel: string;
  nota?: string;          // caption abaixo do CTA
  checkoutUrl: string;
  rodape?: string;
};

// ---------------------------------------------------------------------
// CHECKOUT — HOTMART
// O link da oferta oficial do Brasil vem de config/pricing.ts
// (CHECKOUT_BRL, off=fhrttdh8). O botão do site usa linkCheckout("br"),
// que abre a oferta de lançamento enquanto ela vale e a oficial depois.
// ATENCAO: se houver order bump de produto fisico configurado no painel
// da Hotmart, ele precisa ser REMOVIDO la: o site nao controla o checkout.
// ---------------------------------------------------------------------
export const HOTMART = {
  app: MERCADOS.br.checkout,
};


// ---------------------------------------------------------------------
// LOJAS DE APP — o app é ENTREGA, não aquisição.
// ---------------------------------------------------------------------
export const LOJAS = {
  appStore: "https://apps.apple.com/br/app/diariamente/id6762151251",
  googlePlay: "https://play.google.com/store/apps/details?id=club.diariamente.app",
};

export const LOJAS_BADGES = {
  googlePlay: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1783609634/GetItOnGooglePlay_Badge_Web_color_Portuguese-Brazil_rl6hba.svg",
  appStoreClaro: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1783609634/Apple_Store_Preta_usar_no_fundo_claro_u1etbw.svg",
  appStoreEscuro: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1783609634/Apple_Store_Branca_usar_no_fundo_escuro_tp7rgw.svg",
};

// ---------------------------------------------------------------------
// PLANOS
// ---------------------------------------------------------------------
export const PLANO_APP: Plano = {
  id: "anual-br",
  nome: "Diariamente App",
  destaque: true,
  // Preço CHEIO do plano BRL. O valor de lançamento (oferta própria) é
  // escolhido na hora por precoFinal("br") em config/pricing.ts. Sem valor
  // de parcela: a Hotmart calcula, e o site nunca escreve um número fixo.
  precoNumero: MERCADOS.br.anual,
  preco: semSimbolo(MERCADOS.br.anual),
  inclui: [
    "Uma provocação por dia, os 365 dias do ano",
    "Calendário de constância (acompanhe sua jornada)",
    "Menu Ações: transforme a provocação em tarefa concreta",
    "Contador de voltas: cada dia que você volta conta, e nunca zera",
    "Lembrete diário no WhatsApp",
    "Acesso imediato por e-mail",
  ],
  ctaLabel: MERCADOS.br.textos.botao,
  checkoutUrl: HOTMART.app,
  nota: "Acesso liberado por e-mail assim que o pagamento for confirmado.",
  rodape: "Comece hoje. Volte amanhã.",
};

// Compatibilidade: componentes existentes importam PLANO (singular).
export const PLANO: Plano = PLANO_APP;

// JSON-LD e tracking leem PLANOS
export const PLANOS: Plano[] = [PLANO_APP];

// ---------------------------------------------------------------------
// GARANTIA (confirmada: 7 dias)
// ---------------------------------------------------------------------
export const GARANTIA = {
  dias: 7,
  texto:
    "Você tem 7 dias para experimentar. Se sentir que o Diariamente não é pra você, devolvemos o seu investimento. Sem letra miúda.",
};

// ---------------------------------------------------------------------
// ESCASSEZ / LANÇAMENTO (confirmada: combo com poucas unidades)
// ---------------------------------------------------------------------
export const ESCASSEZ = {
  ativa: false, // combo saiu; urgencia honesta vem do LANCAMENTO (30% founders)
  selo: "Condição de lançamento",
  texto:
    "Esta é a condição de lançamento. Quando a janela fechar, o valor passa a ser o oficial.",
};

// ---------------------------------------------------------------------
// AUTORIDADE
// ---------------------------------------------------------------------
export const AUTORES = {
  brunno: {
    nome: "Brunno Falcão",
    bio: "Empresário e palestrante, é fundador e CEO da Science Play e do Nutrição Brasil, com clientes em mais de 95 países. Autor best-seller de Zona Desconforto e O Fim do Consultório, criador do Palestre•se e colunista da Forbes Portugal, Revista Medicina S/A e O Fit Feed.",
    instagram: "brunnofalcao",
    foto: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782699377/Foto_Brunno_Falca%CC%83o_-_Diariamente_Club_z7fitl.png",
  },
  selo: "Science Play®",
};

// ---------------------------------------------------------------------
// TRACKING / PIXELS — slots prontos, IDs a preencher na fase técnica
// ---------------------------------------------------------------------
export const TRACKING = {
  // Pixel do portfólio "Diariamente App" (confirmado por Brunno, out/2026).
  // Substitui 460696430970324, que era do portfólio da Science Play.
  metaPixelId: "1427972145950859",
  // GA4 · propriedade oficial do Diariamente (confirmada por Brunno,
  // out/2026). A antiga G-NJNEY6KY7L era da Science Play e saiu daqui:
  // o histórico dela continua no painel, só para de receber dados novos.
  //
  // A lista aceita mais de um ID se um dia for preciso medir em paralelo.
  // O gtag.js é carregado uma vez e cada ID recebe o seu config.
  ga4Ids: ["G-2BVYXFENP8"],
  gtmId: "", // opcional — se um dia usar GTM, cole aqui
  ativo: true,
};

// ---------------------------------------------------------------------
// EMPRESA / SUPORTE / LEGAL
// O Diariamente é um produto da marca Science Play®, operado por um
// GRUPO de empresas (decisão de Brunno, 26/10/2026). Os textos não ficam
// presos a um CNPJ: Termos e Política falam em "Science Play" e UMA
// linha de identificação lista as empresas do grupo. As frases são as das
// funções abaixo; as páginas as exibem por components/CnpjsDoGrupo.tsx,
// que mantém cada CNPJ inteiro na mesma linha. Nenhuma página escreve
// razão social ou CNPJ à mão (testes/empresas-do-grupo.test.mjs confere).
// Razões sociais e CNPJs copiados dos cartões CNPJ. Não inventar número
// de documento: tem peso jurídico.
//
// Esta decisão substitui a de 12/10/2026 (só a Science Play Cursos nos
// legais e só a assinatura no rodapé): os rodapés mostram o grupo
// (RodapeDoGrupo) e a seção 1 dos Termos e da Política
// (components/Titularidade.tsx) abre com a linha de identificação.
// ---------------------------------------------------------------------
// Endereço de contato do grupo: sede da Science Play Cursos e da
// Falcão14, que processa o pagamento. Fonte única: só aqui. Se um dia
// voltar a ter "[TROCAR" em qualquer parte, o `next build` FALHA de
// propósito (scripts/checar-endereco.js, chamado pelo next.config.js).
// Base legal: Decreto 7.962/2013, art. 2º (nome empresarial, CNPJ,
// endereço físico e eletrônico). Ver o LEIA-ME.
const ENDERECO_DA_EMPRESA = "SRTVN Quadra 702, Conjunto P, Edifício Radio Center, Asa Norte, Brasília/DF, CEP 70.719-900, Brasil";

export const EMPRESA = {
  marca: "Science Play",
  // Assinatura curta da página "Em breve" (components/EmBreve.tsx).
  assinatura: "Diariamente App by Science Play",
  // A ordem é a da linha de identificação aprovada.
  grupo: [
    // Titular da conta de desenvolvedor da Apple (App Store).
    { razaoSocial: "Science Play Audiobook LTDA", cnpj: "33.619.144/0001-80" },
    // A que os textos legais citavam sozinha até out/2026.
    { razaoSocial: "Science Play Cursos LTDA", cnpj: "33.612.911/0001-29" },
    // Processa o pagamento e emite a nota fiscal.
    { razaoSocial: "Falcão14 Organização de Feiras LTDA", cnpj: "33.616.206/0001-08" },
  ],
  // Dois canais, papéis distintos: contato para institucional e imprensa,
  // suporte para quem já é assinante e precisa de ajuda.
  contatoEmail: "contato@scienceplay.com",
  suporteEmail: "suporte@scienceplay.com",
  site: "https://www.scienceplay.com",
  instagram: "scienceplay",
  linkedin: "scienceplay",
  // DM_ENDERECO_TESTE só existe em build de teste (a trava recusa em
  // produção na Vercel). Em build normal vem vazia e vale o endereço real.
  endereco: process.env.DM_ENDERECO_TESTE || ENDERECO_DA_EMPRESA,
  // "Última atualização" dos Termos e da Política (pt e es). Mudou o texto
  // de um deles, muda aqui: a cláusula final dos Termos e a seção final da
  // Política prometem a data. Outubro de 2026: aviso de cookies (Política,
  // seção 8), garantia (Termos) e a identificação passou a ser o grupo
  // Science Play (decisão de 26/10/2026, Termos e Política, seção 1).
  vigenciaLegal: "Outubro de 2026",
  // A mesma data nas páginas em espanhol.
  vigenciaLegalEs: "Octubre de 2026",
};

type IdiomaLegal = "pt" | "es";

/** "a, b e c" em português, "a, b y c" em espanhol. */
function emLista(itens: string[], lang: IdiomaLegal): string {
  if (itens.length < 2) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} ${lang === "es" ? "y" : "e"} ${itens[itens.length - 1]}`;
}

/** A linha de identificação aprovada: aparece UMA vez nos Termos e na Política
 *  (exibida por IdentificacaoDoGrupo, em components/CnpjsDoGrupo.tsx). */
export function identificacaoDoGrupo(lang: IdiomaLegal = "pt"): string {
  const empresas = emLista(
    EMPRESA.grupo.map((e) => `${e.razaoSocial} (CNPJ ${e.cnpj})`),
    lang,
  );
  return lang === "es"
    ? `Diariamente es un producto ${EMPRESA.marca}®, operado por las empresas del grupo ${EMPRESA.marca}: ${empresas}.`
    : `O Diariamente é um produto ${EMPRESA.marca}®, operado pelas empresas do grupo ${EMPRESA.marca}: ${empresas}.`;
}

/** Rodapé curto: "Science Play® · grupo Science Play · CNPJs a, b e c"
 *  (exibido por RodapeDoGrupo, em components/CnpjsDoGrupo.tsx). */
export function rodapeDoGrupo(lang: IdiomaLegal = "pt"): string {
  const cnpjs = emLista(EMPRESA.grupo.map((e) => e.cnpj), lang);
  return `${EMPRESA.marca}® · grupo ${EMPRESA.marca} · CNPJs ${cnpjs}`;
}

/** Campo "Responsável" dos resumos factuais (sobre, acerca-de, estudante). */
export function responsavelDoGrupo(lang: IdiomaLegal = "pt"): string {
  const nomes = emLista(EMPRESA.grupo.map((e) => e.razaoSocial), lang);
  return `${EMPRESA.marca}® (grupo ${EMPRESA.marca}: ${nomes})`;
}

// ---------------------------------------------------------------------
// ESTUDANTE — condição exclusiva (/estudante)
// ---------------------------------------------------------------------
// Fluxo (o original, retomado em 12/10/2026): aprovado o estudante, o
// site cria o cupom PESSOAL dele pela API da Hotmart (lib/hotmart.js),
// o WhatsApp leva o botão para /estudante/ativar?cupom=CODIGO, que abre
// a oferta oficial do Brasil (CHECKOUT_BRL, R$ 149,90) com o cupom
// aplicado, e o webhook do site apaga o cupom quando o pagamento é
// aprovado (uso único).
//
// aberto       -> o fluxo do cupom pessoal está configurado na Vercel.
//                 NÃO se edita aqui: o next.config.js calcula a cada build
//                 (estadoDoEstudante, em scripts/checar-precos.js) e grava
//                 DM_ESTUDANTE_ABERTO. Abre com as três: modelo v2 do
//                 WhatsApp em WA_TEMPLATE_ESTUDANTE, HOTMART_PRODUCT_ID=7448309
//                 e um STUDENT_DISCOUNT que dê o preço final anunciado
//                 (R$ 89,90: STUDENT_DISCOUNT=0.40027). Fechado:
//                 a home não leva à /estudante, a /estudante mostra a lista
//                 de espera no lugar do formulário e a API responde 503 sem
//                 gravar nada. O log de todo build diz o que falta.
// mostrarPreco = false  -> a /estudante e a home falam de "condição de
//                          estudante" sem número.
// mostrarPreco = true   -> as duas exibem o preço abaixo.
// O preço do estudante é FINAL (ESTUDANTE_PRECO_FINAL, config/pricing.ts):
// R$ 89,90 por ano, e o desconto do cupom sobre o preço cheio do plano
// (R$ 149,90, a base do cupom na Hotmart) sai dele. A comparação com o
// preço público do dia (com ou sem lançamento) é feita na hora em
// components/BlocoPreco.tsx.
// ---------------------------------------------------------------------
export const ESTUDANTE = {
  aberto: process.env.DM_ESTUDANTE_ABERTO === "1",

  // Ligado: a /estudante e a home passam a exibir preço, desconto e
  // comparativo. Vire para false se a condição ainda não existir na
  // Hotmart: as duas voltam à versão sem número sem quebrar nada.
  mostrarPreco: true,

  // Desconto do cupom pessoal, em fração (o STUDENT_DISCOUNT da Vercel),
  // derivado do preço final em config/pricing.ts: 0.40027.
  // Sem valor de parcela: a Hotmart calcula.
  desconto: ESTUDANTE_DESCONTO,

  // Se o cupom vale também nas renovações NÃO se sabe (decisão do dono,
  // 12/10/2026, terceira rodada): o texto diz SÓ que a cobrança é anual.
  // Nada de "no primeiro ano", "3 anos" ou "renova pelo mesmo valor".
  cobranca: "cobrança anual",
  periodo: "por ano · cobrança anual",
  renovacao: "Cobrança anual. Cancele quando quiser.",
  // Como o estudante paga: o cupom vai na oferta OFICIAL (fhrttdh8), que
  // parcela em até 12x com acréscimo, nunca na de lançamento (só à vista).
  // É a mesma linha da oferta oficial (MERCADOS.br.textos.pagamento), com
  // inicial minúscula para seguir o preço: "R$ 89,90 à vista, ou em até 12x
  // no cartão com acréscimo". Sem valor de parcela: a Hotmart calcula, e o
  // parcelado custa mais que os R$ 89,90 e que o equivalente mensal.
  pagamento: inicialMinuscula(MERCADOS.br.textos.pagamento),
  precoNumero: precoEstudante(),
  preco: semSimbolo(precoEstudante()),
  porMes: semSimbolo(porMesEstudante()),

  // Preço cheio do plano, sobre o qual o cupom incide.
  precoDeNumero: MERCADOS.br.anual,
  precoDe: semSimbolo(MERCADOS.br.anual),

  selo: "Condição de estudante",

  // validade do código enviado por WhatsApp (espelha VALIDADE_HORAS da API)
  validadeHoras: 48,

  // Tempo de espera comunicado ao estudante ("em até N minutos"). O envio
  // é AGENDADO: app/api/estudante/solicitar/route.js grava enviar_em =
  // agora + ESPERA_MINUTOS (5, a janela de conferência), e quem manda o
  // WhatsApp é o cron /api/cron/manutencao, de minuto em minuto, com até
  // MAX_TENTATIVAS (5) tentativas, uma por rodada, se a Meta recusar.
  // 5 + 5 = 10. test/estudante.test.js confere esta conta contra os dois
  // arquivos: mexeu na API ou no cron, ajuste aqui.
  esperaMinutos: 10,

  // um código por CPF (regra aplicada na API)
  regra: "Um código por pessoa. Enviado só no WhatsApp informado.",
};

/** Período do preço de estudante no texto: "por ano · cobrança anual",
    sem prometer duração do desconto (ESTUDANTE.periodo). */
export function periodoEstudante(): string {
  return ESTUDANTE.periodo;
}

// ---------------------------------------------------------------------
// ESTUDANTE EM STANDBY · a /estudante da produção (main, 0a25ffa)
// ---------------------------------------------------------------------
// Com a chave de lançamento desligada (config/lancamento.ts), a
// /estudante continua a da produção: formulário aberto, R$ 77,00 sobre
// R$ 137,90 e o mockup Tela_HOJE do Cloudinary no hero
// (components/estudante-atual/). Estes são os números da main, copiados
// como estavam; só valem em standby. Ligada a chave, valem ESTUDANTE e
// config/pricing.ts. No lançamento, este bloco e a pasta
// components/estudante-atual podem sair.
// ---------------------------------------------------------------------
export const ESTUDANTE_ATUAL = {
  precoNumero: 77,
  preco: "77,00",
  // A âncora da main: o preço público de então (PLANO_APP da main).
  precoDeNumero: 137.9,
  precoDe: "137,90",
  perDia: "menos de R$ 0,22 por dia",
  // PLANO_APP.perDia da main, na coluna "Quem entra hoje pelo site".
  planoPerDia: "menos de R$ 0,38 por dia",
  // O mockup do hero da main (SCREENSHOTS.hoje).
  telaHoje: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782664582/Tela_HOJE_Diariamente_shzi7c.png",
  telaHojeAlt: "Tela Hoje do aplicativo Diariamente, com a provocação do dia e o progresso da sequência",
  // Subtítulo do formulário na main (components/EstudanteForm.tsx).
  subtituloDoFormulario:
    "Leva cerca de um minuto. O código chega no seu WhatsApp e é aplicado no campo de cupom da tela de pagamento.",
};
