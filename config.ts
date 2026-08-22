// =====================================================================
// DIARIAMENTE — CONFIGURAÇÃO CENTRAL DA PÁGINA DE VENDA
// ---------------------------------------------------------------------
// Tudo que muda fica AQUI. Não edite valores espalhados pelo código.
// Valores confirmados por Brunno em jun/2026. Itens [TROCAR] aguardam
// definição (links de checkout, pixels). Nada inventado.
// =====================================================================

export const SITE = {
  nome: "Diariamente",
  dominio: "https://diariamente.app",
  appUrl: "https://app.diariamente.club",
  descricao:
    "Diariamente não é um livro comum, nem um ebook. É um livro vivo: um app com uma provocação por dia, por 365 dias, para você se desenvolver profissionalmente, criado pra te ajudar a voltar amanhã, depois de amanhã e no dia seguinte. Um ritual diário na palma da sua mão, de Brunno Falcão e Roberta Carbonari.",
  // OG card estratégico 1200×630 (em /public/og-card.png): headline + app +
  // oferta. Quem cola o link no WhatsApp vê a OFERTA, não um logo.
  ogImage: "/og-card.png",
};

// Logos oficiais (Cloudinary — cloud name oficial: dlzrfhwin)
export const LOGOS = {
  // [CONFIRMAR] URL oficial do logo principal escuro (Asset_10)
  principalEscuro:
    "https://res.cloudinary.com/dlzrfhwin/image/upload/Asset_10_cirv6z.png",
  // ✓ URL OFICIAL confirmada por Brunno
  horizontal:
    "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1775167899/Logo_Diariamente_1_smbwdg.png",
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
  hoje: "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1782664582/Tela_HOJE_Diariamente_shzi7c.png",
  dias: "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1782664583/Tela_DIAS_Diariamente_i4dpih.png",
  acoes: "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1782664582/Tela_ACOES_Diariamente_nr8gwf.png",
  ritmo: "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1782664581/Tela_RITMO_Diariamente_mz9efm.png",
};

// Foto lifestyle (ambiente) — seção "virada". Foto cheia, não transparente.
export const LIFESTYLE = "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1782699619/Lifestyle_Diariamente_yur3mm.png";

// ---------------------------------------------------------------------
// PROVA REAL (confirmada — não inventar)
// ---------------------------------------------------------------------
export const PROVA = {
  leitores: "+5.000 pessoas",
  leitoresNumero: 5000,
};

// ---------------------------------------------------------------------
// OFERTA (arquitetura confirmada por Brunno em ago/2026)
// Dois carrinhos:
//   COMBO  — Livro físico + App: nominal R$297 → lançamento R$207,90 (30% OFF)
//   APP    — Diariamente Club:   nominal R$197 → lançamento R$137,90 (30% OFF)
// Estudante: NÃO divulgado no site (sem mecanismo de validação ainda).
// Desconto founders válido durante o mês de lançamento — ao encerrar,
// definir LANCAMENTO.ativa = false e os cards voltam ao preço nominal.
// ---------------------------------------------------------------------
export const LANCAMENTO = {
  ativa: true,
  selo: "30% OFF de lançamento",
  // [TROCAR] data de fim da janela founders (usada só no texto, ex: "até 30/09")
  prazoTexto: "válida apenas no mês de lançamento",
};

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
  nota?: string;          // caption abaixo do CTA (ex: order bump do livro)
  checkoutUrl: string;
  rodape?: string;
};

// ---------------------------------------------------------------------
// CHECKOUT — HOTMART
// Cada preço é uma OFERTA na Hotmart (parâmetro ?off=CODIGO).
// [TROCAR] Criar no Hotmart:
//   1) Oferta COMBO lançamento: R$207,90 (produto com livro físico + frete)
//   2) Oferta APP lançamento:   R$137,90
// Enquanto o link começar com "[", o botão avisa "em configuração".
// ---------------------------------------------------------------------
export const HOTMART = {
  // Oferta única do APP (R$137,90 no lançamento). O livro físico entra como
  // ORDER BUMP dentro do checkout Hotmart (configuração no painel, não no site).
  app: "https://pay.hotmart.com/L107085210M?checkoutMode=10",
};

// Livro impresso avulso (vendido à parte, via Eduzz). Link discreto na página e no FAQ.
export const LIVRO_AVULSO = "https://sun.eduzz.com/2038359";

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
  id: "club",
  nome: "Diariamente Club",
  destaque: true,
  precoNumero: 137.9,
  preco: "137,90",
  precoDe: "197",
  precoVista: "R$ 137,90 à vista",
  // Parcelamento confirmado por Brunno (ago/2026).
  // 12 x 14,26 = 171,12 contra 137,90 à vista: há acréscimo de R$ 33,22 (24,1%).
  // Por isso a página exibe as duas informações juntas. Ver nota no LEIA-ME.
  parcela: "14,26",
  parcelas: 12,
  parcelaTotal: "171,12",
  perDia: "menos de R$ 0,38 por dia",
  inclui: [
    "Uma provocação por dia, os 365 dias do ano",
    "Calendário de constância (acompanhe sua jornada)",
    "Menu Ações: transforme a provocação em tarefa concreta",
    "Ofensiva, conquistas e ranking",
    "Lembrete diário no WhatsApp",
    "Acesso imediato por e-mail",
  ],
  ctaLabel: "Quero meu acesso",
  checkoutUrl: HOTMART.app,
  nota: "No checkout, você pode adicionar o livro físico.",
  rodape: "O livro te provoca. O app te ajuda a voltar amanhã.",
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
    "O combo com livro físico tem poucas unidades nesta condição de lançamento. Quando o estoque desta leva acabar, sai do ar.",
};

// ---------------------------------------------------------------------
// AUTORIDADE
// ---------------------------------------------------------------------
export const AUTORES = {
  brunno: {
    nome: "Brunno Falcão",
    bio: "Empresário e palestrante, é fundador e CEO da Science Play e do Nutrição Brasil, com clientes em mais de 95 países. Autor best-seller de Zona Desconforto e O Fim do Consultório, criador do Palestre•se e colunista da Forbes Portugal, Revista Medicina S/A e O Fit Feed.",
    instagram: "brunnofalcao",
    foto: "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1782699377/Foto_Brunno_Falca%CC%83o_-_Diariamente_Club_z7fitl.png",
  },
  roberta: {
    nome: "Roberta Carbonari",
    bio: "Nutricionista, mestre em Nutrição, pós-graduada em Comportamento Alimentar e referência em Psiquiatria Nutricional. Coordenadora de pós-graduação, professora, palestrante e empresária, com formação também em Administração e Marketing.",
    instagram: "robertacarbonari",
    foto: "https://res.cloudinary.com/dlzrfhwin/image/upload/f_auto,q_auto/v1782699376/Foto_Roberta_Carbonari_-_Diariamente_Club_ugcgsi.png",
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

// ---------------------------------------------------------------------
// ESTUDANTE — condição exclusiva (/estudante)
// ---------------------------------------------------------------------
// mostrarPreco = false  -> a página fala de "condição exclusiva" sem número.
// mostrarPreco = true   -> a página exibe o preço abaixo. Vire a chave só
//                          depois de a oferta de estudante existir na Hotmart.
// A âncora riscada usa o preço PÚBLICO vigente (PLANO_APP), não o nominal,
// para o desconto exibido ser sempre verdadeiro em relação ao que está à venda.
// ---------------------------------------------------------------------
export const ESTUDANTE = {
  mostrarPreco: false,

  precoNumero: 77,
  preco: "77,00",
  parcela: "", // [CONFIRMAR na Hotmart] ex: "12x de R$ 7,58"

  precoDeNumero: PLANO_APP.precoNumero,
  precoDe: PLANO_APP.preco,

  perDia: "menos de R$ 0,22 por dia",
  selo: "Condição de estudante",

  // validade do código enviado por WhatsApp (espelha VALIDADE_HORAS da API)
  validadeHoras: 48,

  // um código por CPF (regra aplicada na API)
  regra: "Um código por pessoa. Enviado só no WhatsApp informado.",
};
