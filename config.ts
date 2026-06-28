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
    "O livro de Brunno Falcão e Roberta Carbonari que virou um ritual diário no seu bolso: uma provocação por dia, por 363 dias — com um app feito pra você não largar no meio.",
  // OG image — usar o asset oficial do brandbook (Cloudinary)
  ogImage:
    "https://res.cloudinary.com/diariamente/image/upload/Asset_7_z9hcmw.png",
};

// Logos oficiais (Cloudinary — brandbook v1.0)
export const LOGOS = {
  principalEscuro:
    "https://res.cloudinary.com/diariamente/image/upload/Asset_10_cirv6z.png",
  horizontal:
    "https://res.cloudinary.com/diariamente/image/upload/Logo_Diariamente_1_smbwdg.png",
  favicon:
    "https://res.cloudinary.com/diariamente/image/upload/Asset_7_z9hcmw.png",
};

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
  parcela?: string;
  inclui: string[];
  ctaLabel: string;
  // Link do checkout — [TROCAR] quando a plataforma estiver definida
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
    precoNumero: 147,
    preco: "147",
    parcela: "ou 12x de R$ 14,70",
    inclui: [
      "App completo (telas HOJE e DIAS)",
      "363 provocações — uma para cada dia",
      "Sistema de ofensiva pra manter a constância",
      "Conquistas e ranking",
      "Lembrete diário no WhatsApp",
      "Acesso imediato por e-mail",
    ],
    ctaLabel: "Quero meu acesso",
    checkoutUrl: HOTMART.digital,
  },
  {
    id: "combo",
    nome: "Combo Livro + App",
    selo: "Mais completo · poucas unidades",
    destaque: true,
    precoNumero: 247,
    preco: "247",
    parcela: "ou 12x de R$ 24,70",
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
    bio: "Empresário, palestrante e autor best-seller. CEO e fundador da Science Play, plataforma de educação em saúde. Colunista da Forbes Portugal, Medicina S/A e O Fit Feed. Há 25 anos no setor de eventos e educação, construiu autoridade ao lado dos maiores nomes da saúde do país.",
  },
  roberta: {
    nome: "Roberta Carbonari",
    // [TROCAR] — bio/papel da Roberta no conteúdo (Brunno confirma)
    bio: "[TROCAR: 1-2 linhas de bio da Roberta + papel dela no conteúdo do Diariamente]",
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
  razaoSocial: "[TROCAR: razão social oficial da Science Play]",
  cnpj: "[TROCAR: CNPJ oficial]",
  suporteEmail: "contato@scienceplay.com",
  endereco: "[TROCAR: endereço da empresa, se for incluir]",
  vigenciaLegal: "Junho de 2026",
};
