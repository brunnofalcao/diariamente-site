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
export const LIFESTYLE = "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782699619/Lifestyle_Diariamente_yur3mm.png";

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
  precoVista?: string;    // ex: "ou R$ 297 à vista"
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
  club: "https://pay.hotmart.com/K105072021O?off=mm50gc4m&checkoutMode=6&bid=1782701141456",
};

// Carrinho único — Diariamente Club (só app, R$297 à vista / 12x R$30,72)
export const PLANO: Plano = {
  id: "club",
  nome: "Diariamente Club",
  destaque: true,
  precoNumero: 297,
  preco: "297",
  parcela: "12x de R$ 30,72",
  precoVista: "ou R$ 297 à vista",
  perDia: "menos de R$ 1 por dia",
  inclui: [
    "Uma provocação por dia, os 365 dias do ano",
    "Calendário de constância (acompanhe sua jornada)",
    "Menu Ações: transforme a provocação em tarefa concreta",
    "Ofensiva, conquistas e ranking",
    "Lembrete diário no WhatsApp",
    "Acesso imediato por e-mail",
  ],
  ctaLabel: "Quero meu acesso",
  checkoutUrl: HOTMART.club,
  rodape: "O livro te provoca. O app te ajuda a voltar amanhã.",
};

// Mantido como array p/ compatibilidade (JSON-LD lê PLANOS)
export const PLANOS: Plano[] = [PLANO];

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
    foto: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782699377/Foto_Brunno_Falca%CC%83o_-_Diariamente_Club_z7fitl.png",
  },
  roberta: {
    nome: "Roberta Carbonari",
    bio: "Nutricionista, mestre em Nutrição, pós-graduada em Comportamento Alimentar e referência em Psiquiatria Nutricional. Coordenadora de pós-graduação, professora, palestrante e empresária, com formação também em Administração e Marketing.",
    instagram: "robertacarbonari",
    foto: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782699376/Foto_Roberta_Carbonari_-_Diariamente_Club_ugcgsi.png",
  },
  selo: "Science Play®",
};

// ---------------------------------------------------------------------
// TRACKING / PIXELS — slots prontos, IDs a preencher na fase técnica
// ---------------------------------------------------------------------
export const TRACKING = {
  metaPixelId: "460696430970324",
  ga4Id: "G-NJNEY6KY7L",
  gtmId: "", // opcional — se um dia usar GTM, cole aqui
  ativo: true,
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
