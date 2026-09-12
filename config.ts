// =====================================================================
// DIARIAMENTE — CONFIGURAÇÃO CENTRAL DA PÁGINA DE VENDA
// ---------------------------------------------------------------------
// Tudo que muda fica AQUI. Não edite valores espalhados pelo código.
// Valores confirmados por Brunno em jun/2026. Itens [TROCAR] aguardam
// definição (links de checkout, pixels). Nada inventado.
// =====================================================================

export const SITE = {
  nome: "Diariamente",
  // Domínio oficial (Brandbook 5.0, seção 29 · papelaria: diariamente.app).
  // Alimenta metadataBase, canonical, openGraph.url, schemas, sitemap,
  // robots e o rodapé visível.
  // PRÉ-CONDIÇÃO: diariamente.club precisa fazer 301 permanente para cá,
  // e os dois domínios precisam estar no Search Console. Sem isso, o sinal
  // fica dividido entre os dois.
  dominio: "https://diariamente.app",
  appUrl: "https://app.diariamente.club",

  // Rede social DA MARCA. O Diariamente fala por si: as redes da Science
  // Play são da realizadora, não do produto, e misturar as duas dilui a
  // entidade que os buscadores precisam reconhecer.
  instagram: "diariamente.app",
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
// OFERTA (arquitetura confirmada por Brunno em ago/2026)
// Dois carrinhos:
//   APP    — Diariamente App:   nominal R$197 → lançamento R$137,90 (30% OFF)
// Estudante: NÃO divulgado no site (sem mecanismo de validação ainda).
// Desconto founders válido durante o mês de lançamento — ao encerrar,
// definir LANCAMENTO.ativa = false e os cards voltam ao preço nominal.
// ---------------------------------------------------------------------
export const LANCAMENTO = {
  ativa: true,
  selo: "30% OFF de lançamento",
  // [TROCAR] data de fim da janela founders (usada só no texto, ex: "até 30/09")
  prazoTexto: "válido apenas no mês de lançamento",
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
  nota?: string;          // caption abaixo do CTA
  checkoutUrl: string;
  rodape?: string;
};

// ---------------------------------------------------------------------
// CHECKOUT — HOTMART
// Cada preço é uma OFERTA na Hotmart (parâmetro ?off=CODIGO).
// [TROCAR] Criar no Hotmart:
//   2) Oferta APP lançamento:   R$137,90
// Enquanto o link começar com "[", o botão avisa "em configuração".
// ---------------------------------------------------------------------
export const HOTMART = {
  // Oferta única do APP. ATENCAO: se houver order bump de produto fisico
  // configurado no painel da Hotmart, ele precisa ser REMOVIDO la — o site
  // nao controla o conteudo do checkout.
  app: "https://pay.hotmart.com/L107085210M?checkoutMode=10",
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
  id: "club",
  nome: "Diariamente App",
  destaque: true,
  precoNumero: 137.9,
  preco: "137,90",
  precoDe: "197",
  precoVista: "R$ 137,90 à vista",
  // Parcelamento confirmado por Brunno (ago/2026).
  // 12 x 14,26 = 171,12 contra 137,90 à vista: acréscimo de R$ 33,22 (24,1%).
  // O total precisa aparecer na página junto da parcela (CDC art. 52 e
  // Decreto 5.903). Oferta.tsx exibe automaticamente quando estes campos existem.
  parcela: "14,26",
  parcelas: 12,
  parcelaTotal: "171,12",
  perDia: "menos de R$ 0,38 por dia",
  inclui: [
    "Uma provocação por dia, os 365 dias do ano",
    "Calendário de constância (acompanhe sua jornada)",
    "Menu Ações: transforme a provocação em tarefa concreta",
    "Contador de voltas: cada dia que você volta conta, e nunca zera",
    "Lembrete diário no WhatsApp",
    "Acesso imediato por e-mail",
  ],
  ctaLabel: "Quero meu acesso",
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
  // Dois canais, papéis distintos: contato para institucional e imprensa,
  // suporte para quem já é assinante e precisa de ajuda.
  contatoEmail: "contato@scienceplay.com",
  suporteEmail: "suporte@scienceplay.com",
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
  // Ligado: a /estudante passa a exibir preço, desconto e comparativo.
  // Vire para false se a condição ainda não existir na Hotmart: a página
  // volta à versão sem número sem quebrar nada.
  mostrarPreco: true,

  precoNumero: 77,
  preco: "77,00",
  parcela: "", // [CONFIRMAR na Hotmart] ex: "12x de R$ 7,58"

  precoDeNumero: PLANO_APP.precoNumero,
  precoDe: PLANO_APP.preco,

  perDia: "menos de R$ 0,22 por dia",
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
