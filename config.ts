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
import { MERCADOS, ESTUDANTE_DESCONTO, formatar, precoEstudante, porMesEstudante } from "@/config/pricing";

export const SITE = {
  nome: "Diariamente",
  // Domínio oficial (Brandbook 5.0, seção 29 · papelaria: diariamente.app).
  // Alimenta metadataBase, canonical, openGraph.url, schemas, sitemap,
  // robots e o rodapé visível.
  // PRÉ-CONDIÇÃO: diariamente.club precisa fazer 301 permanente para cá,
  // e os dois domínios precisam estar no Search Console. Sem isso, o sinal
  // fica dividido entre os dois.
  dominio: "https://diariamente.app",
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
//   app/icon.svg            favicon vetorial
//   app/icon.png            512px, símbolo a 66% sobre S0
//   app/apple-icon.png      180px, idem
//   app/opengraph-image.png 1200x630, lockup horizontal + a sequência
export const LOGOS = {
  // usado no schema Organization, que exige URL absoluta
  schemaLogo: "/icon.png",
};

// ---------------------------------------------------------------------
// SCREENSHOTS / MOCKUPS 3D do app (Cloudinary)
// Cole aqui as URLs dos mockups 3D gerados a partir dos prints reais.
// Enquanto vazio (""), o site mostra o slot de marcação no lugar.
// Telas reais do app: Hoje · Dias · Ações · Ritmo · Conta
// ---------------------------------------------------------------------
export const SCREENSHOTS = {
  hoje: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782664582/Tela_HOJE_Diariamente_shzi7c.png",
  dias: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782664583/Tela_DIAS_Diariamente_i4dpih.png",
  acoes: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782664582/Tela_ACOES_Diariamente_nr8gwf.png",
  ritmo: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782664581/Tela_RITMO_Diariamente_mz9efm.png",
};

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
// Um plano anual por moeda na Hotmart (produto 7448309). No Brasil o
// plano fica no preço cheio e o lançamento entra por cupom embutido no
// botão. Tudo isso, com a data de término, está em config/pricing.ts.
// A oferta antiga (R$ 137,90, link L107085210M) saiu daqui.
// ---------------------------------------------------------------------
const LANC_BR = MERCADOS.br.lancamento;
export const LANCAMENTO = {
  ativa: Boolean(LANC_BR?.ativo),
  selo: LANC_BR ? `${LANC_BR.percentual}% OFF de lançamento` : "",
  prazoTexto: "preço de lançamento por tempo determinado, com a data na página",
};

/** "149,90": o número sem o símbolo, no formato do Brasil. */
const semSimbolo = (v: number) => formatar("br", v).replace(/^R\$\s/, "");

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
// O link do plano BRL vem de config/pricing.ts (CHECKOUT_BRL). O botão do
// site usa linkCheckout("br"), que embute o cupom de lançamento.
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
  // Preço CHEIO do plano BRL. O valor de lançamento (com cupom) é calculado
  // na hora por precoFinal("br") em config/pricing.ts. Sem valor de parcela:
  // a Hotmart calcula, e o site nunca escreve um número fixo.
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
// ENDEREÇO DA EMPRESA · FONTE ÚNICA · PREENCHER ANTES DE PUBLICAR
// ---------------------------------------------------------------------
// Troque o texto abaixo pelo endereço completo do cartão CNPJ da
// Science Play Cursos LTDA (rua, número, complemento, bairro, cidade/UF,
// CEP). Ele aparece na Política de Privacidade (pt e es), no rodapé da
// home e no rodapé das páginas legais. Obrigatório em loja on-line
// (Decreto 7.962/2013, art. 2º).
//
// Enquanto tiver "[TROCAR" em qualquer parte, o `next build` FALHA de propósito,
// com mensagem explicando o que fazer (scripts/checar-endereco.js,
// chamado pelo next.config.js). Não remova a trava: preencha o endereço.
const ENDERECO_DA_EMPRESA = "[TROCAR: endereço completo da Science Play Cursos LTDA, igual ao cartão CNPJ]";

// ---------------------------------------------------------------------
// EMPRESA / SUPORTE / LEGAL
// CNPJ e razão social: [TROCAR] pelo documento oficial da Science Play.
// Não inventar número de documento — tem peso jurídico.
// ---------------------------------------------------------------------
export const EMPRESA = {
  marca: "Science Play",
  razaoSocial: "Science Play Cursos LTDA",
  cnpj: "33.612.911/0001-29",
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
  // Data exibida como "Última atualização" nos Termos e na Política. Mudou
  // em out/2026: aviso de cookies (Política, seção 8) e garantia (Termos).
  vigenciaLegal: "Outubro de 2026",
};

// ---------------------------------------------------------------------
// ESTUDANTE — condição exclusiva (/estudante)
// ---------------------------------------------------------------------
// mostrarPreco = false  -> a página fala de "condição exclusiva" sem número.
// mostrarPreco = true   -> a página exibe o preço abaixo. Vire a chave só
//                          depois de a oferta de estudante existir na Hotmart.
// O desconto exibido é calculado sobre o preço cheio do plano (R$ 149,90),
// que é a base do cupom na Hotmart; a comparação com o preço público do
// dia (com ou sem lançamento) é feita na hora em components/BlocoPreco.tsx.
// ---------------------------------------------------------------------
export const ESTUDANTE = {
  // Ligado: a /estudante passa a exibir preço, desconto e comparativo.
  // Vire para false se a condição ainda não existir na Hotmart: a página
  // volta à versão sem número sem quebrar nada.
  mostrarPreco: true,

  // Cupom de ESTUDANTE_DESCONTO% sobre o plano BRL (config/pricing.ts).
  // Sem valor de parcela: a Hotmart calcula.
  desconto: ESTUDANTE_DESCONTO,
  precoNumero: precoEstudante(),
  preco: semSimbolo(precoEstudante()),
  porMes: semSimbolo(porMesEstudante()),

  // Preço cheio do plano, sobre o qual o cupom incide.
  precoDeNumero: MERCADOS.br.anual,
  precoDe: semSimbolo(MERCADOS.br.anual),

  selo: "Condição de estudante",

  // validade do código enviado por WhatsApp (espelha VALIDADE_HORAS da API)
  validadeHoras: 48,

  // Tempo de espera comunicado ao estudante. O envio é SÍNCRONO: em
  // app/api/estudante/solicitar/route.js o `await whatsapp.aprovado(...)` roda
  // dentro da mesma requisição, antes de a resposta voltar. Estes 2 minutos são
  // folga para atraso de entrega da Meta Cloud API, não processamento nosso.
  esperaMinutos: 2,

  // um código por CPF (regra aplicada na API)
  regra: "Um código por pessoa. Enviado só no WhatsApp informado.",
};
