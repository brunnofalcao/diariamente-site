// =====================================================================
// DIARIAMENTE — CONFIGURAÇÃO CENTRAL DA PÁGINA DE VENDA
// ---------------------------------------------------------------------
// Tudo que muda fica AQUI. Não edite valores espalhados pelo código.
// Valores confirmados por Brunno em jun/2026. Itens [TROCAR] aguardam
// definição (links de checkout, pixels). Nada inventado.
// =====================================================================

export const SITE = {
  nome: "Diariamente",
  dominio: "https://diariamente.club",
  appUrl: "https://app.diariamente.club",
  descricao:
    "Diariamente não é um livro comum, nem um ebook. É um livro vivo: um app com uma provocação por dia, por 365 dias, para você se desenvolver profissionalmente, criado pra te ajudar a voltar amanhã, depois de amanhã e no dia seguinte. Um ritual diário na palma da sua mão, de Brunno Falcão e Roberta Carbonari.",
  // OG image — usar o asset oficial do brandbook (Cloudinary)
  // [CONFIRMAR] mesmo cloud (dlzrfhwin); colar URL oficial do Asset_7 (OG/favicon)
  ogImage:
    "https://res.cloudinary.com/dlzrfhwin/image/upload/Asset_7_z9hcmw.png",
};

// Logos oficiais (Cloudinary — cloud name oficial: dlzrfhwin)
export const LOGOS = {
  // [CONFIRMAR] URL oficial do logo principal escuro (Asset_10)
  principalEscuro:
    "https://res.cloudinary.com/dlzrfhwin/image/upload/Asset_10_cirv6z.png",
  // ✓ URL OFICIAL confirmada por Brunno
  horizontal:
    "https://res.cloudinary.com/dlzrfhwin/image/upload/v1775167899/Logo_Diariamente_1_smbwdg.png",
  // [CONFIRMAR] URL oficial do favicon/OG (Asset_7)
  favicon:
    "https://res.cloudinary.com/dlzrfhwin/image/upload/Asset_7_z9hcmw.png",
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
export const LIFESTYLE = "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782670073/Lifestyle_Diariamente_kjl7hu.png";

// ---------------------------------------------------------------------
// PROVA REAL (confirmada — não inventar)
// ---------------------------------------------------------------------
export const PROVA = {
  leitores: "+5.000 pessoas",
  leitoresNumero: 5000,
};

// ---------------------------------------------------------------------
// OFERTA (preços confirmados por Brunno)
// Livro avulso R$149 entra como ÂNCORA de valor (não é plano vendável aqui).
// ---------------------------------------------------------------------
export const PRECO_ANCORA_LIVRO = "149";

export type Plano = {
  id: string;
  nome: string;
  selo?: string;
  destaque: boolean;
  precoNumero: number;
  preco: string;
  precoDe?: string;       // preço original riscado (âncora de lançamento)
  parcela?: string;
  perDia?: string;        // ex: "menos de R$ 1 por dia"
  inclui: string[];
  ctaLabel: string;
  checkoutUrl: string;
  rodape?: string;
};

// ---------------------------------------------------------------------
// CHECKOUT — HOTMART
// Cole abaixo o link de checkout de cada produto. Formato Hotmart:
//   https://pay.hotmart.com/XXXXXXXXX?checkoutMode=10
// O parâmetro ?off= e UTMs são anexados automaticamente em runtime
// (ver helper buildCheckoutUrl em components/Oferta.tsx).
// Enquanto o link começar com "[", o botão avisa "em configuração"
// em vez de quebrar (sem botão morto).
// ---------------------------------------------------------------------
export const HOTMART = {
  // exemplos de formato — substitua pelos links reais dos seus produtos:
  // digital: "https://pay.hotmart.com/A00000000?checkoutMode=10",
  // combo:   "https://pay.hotmart.com/B00000000?checkoutMode=10",
  digital: "[TROCAR_HOTMART_DIGITAL]",
  combo: "[TROCAR_HOTMART_COMBO]",
};

export const PLANOS: Plano[] = [
  {
    id: "digital",
    nome: "Diariamente Digital",
    destaque: false,
    precoNumero: 247,
    preco: "247",
    precoDe: "297",
    parcela: "ou 12x de R$ 24,70",
    perDia: "menos de R$ 1 por dia",
    inclui: [
      "App completo: leitura do dia, calendário, Ações, ofensiva, conquistas e ranking",
      "365 provocações, uma para cada dia do ano",
      "Menu Ações: transforme a provocação em tarefa concreta",
      "Acompanhamento da sua jornada de constância",
      "Lembrete diário no WhatsApp",
      "Acesso imediato por e-mail",
    ],
    ctaLabel: "Quero meu acesso",
    checkoutUrl: HOTMART.digital,
    rodape: "Preço de lançamento, por tempo limitado",
  },
  {
    id: "combo",
    nome: "Combo Livro + App",
    selo: "Mais completo · poucas unidades",
    destaque: true,
    precoNumero: 297,
    preco: "297",
    precoDe: "397",
    parcela: "ou 12x de R$ 29,70",
    perDia: "menos de R$ 1 por dia, com o livro na sua casa",
    inclui: [
      "Tudo do plano Digital",
      "O livro físico Diariamente na sua casa",
      "A experiência completa: papel + ritual no bolso",
    ],
    ctaLabel: "Quero o livro + o app",
    checkoutUrl: HOTMART.combo,
    rodape: "+ frete · estoque limitado nesta condição de lançamento",
  },
];

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
  ativa: true,
  selo: "Condição de lançamento",
  texto:
    "O combo com livro físico tem poucas unidades nesta condição. Quando o estoque desta leva acabar, sai do ar.",
};

// ---------------------------------------------------------------------
// AUTORIDADE
// ---------------------------------------------------------------------
export const AUTORES = {
  brunno: {
    nome: "Brunno Falcão",
    bio: "Empresário e palestrante, é fundador e CEO da Science Play e do Nutrição Brasil, com clientes em mais de 95 países. Autor best-seller de Zona Desconforto e O Fim do Consultório, criador do Palestre•se e colunista da Forbes Portugal, Revista Medicina S/A e O Fit Feed.",
    instagram: "brunnofalcao",
    foto: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782666480/Brunno_Falca%CC%83o_-_Palco_-_Transparente_kyhow7.png",
  },
  roberta: {
    nome: "Roberta Carbonari",
    bio: "Nutricionista, mestre em Nutrição, pós-graduada em Comportamento Alimentar e referência em Psiquiatria Nutricional. Coordenadora de pós-graduação, professora, palestrante e empresária, com formação também em Administração e Marketing.",
    instagram: "robertacarbonari",
    foto: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782662986/roberta_ityi3g.png",
  },
  selo: "Science Play®",
};

// ---------------------------------------------------------------------
// TRACKING / PIXELS — slots prontos, IDs a preencher na fase técnica
// ---------------------------------------------------------------------
export const TRACKING = {
  metaPixelId: "[TROCAR_META_PIXEL_ID]",
  ga4Id: "[TROCAR_GA4_ID]",
  gtmId: "[TROCAR_GTM_ID]",
  ativo: false, // vira true quando os IDs estiverem preenchidos
};

// ---------------------------------------------------------------------
// EMPRESA / SUPORTE / LEGAL
// CNPJ e razão social: [TROCAR] pelo documento oficial da Science Play.
// Não inventar número de documento — tem peso jurídico.
// ---------------------------------------------------------------------
export const EMPRESA = {
  marca: "Science Play",
  razaoSocial: "Science Play Cursos LTDA",
  cnpj: "33.612.911/0001-29",
  suporteEmail: "contato@scienceplay.com",
  site: "https://www.scienceplay.com",
  instagram: "scienceplay",
  linkedin: "scienceplay",
  endereco: "[TROCAR: endereço completo da empresa, recomendado nos legais]",
  vigenciaLegal: "Junho de 2026",
};
