import type { Lang } from "@/lib/i18n";

/* =====================================================================
   ARQUITETURA DE CONSENTIMENTO
   ---------------------------------------------------------------------
   Este arquivo é a fonte única do que a pessoa aceita, e é lido pelo
   formulário E pela política de privacidade. Se os dois divergirem, a
   política vira ficção e o consentimento perde validade.

   POR QUE SÃO TRÊS BLOCOS SEPARADOS, E NÃO UM

   RGPD art. 7º(4) e considerando 43: consentimento empacotado é NULO.
   Não se pode condicionar a prestação do serviço à aceitação de
   tratamentos que não são necessários para ele. LGPD art. 8º §4º diz o
   equivalente: o consentimento deve se referir a finalidades
   determinadas, e autorizações genéricas são nulas.

   Na prática isso significa:

   1. CONTRATO        necessário para entregar o produto. Não é
                      consentimento, é execução de contrato
                      (RGPD 6(1)(b) · LGPD 7º V). Não tem caixa.

   2. MARKETING       comunicação sobre o PRÓPRIO produto.
      PRÓPRIO         Caixa DESMARCADA por padrão, com descadastro em
                      todo envio.

   3. PARCEIROS E     compartilhamento com empresas do grupo,
      PATROCINADORES  parceiros e patrocinadores para comunicação
                      DELES. Caixa DESMARCADA, separada da anterior,
                      com as categorias de destinatários nomeadas.

   Marcar prévia é proibido: RGPD considerando 32 e decisão Planet49
   (TJUE C-673/17) são explícitos. Caixa pré-marcada não é consentimento.

   O QUE ISSO PROTEGE

   Com os três separados e registrados com data, origem e versão do
   texto, existe prova de consentimento (RGPD art. 7º(1) exige que o
   responsável DEMONSTRE). Com uma cláusula genérica enterrada na
   política, não existe prova de nada, e a multa do RGPD vai a 4% do
   faturamento global ou 20 milhões de euros, o que for maior.
   ===================================================================== */

export type ChaveConsentimento = "marketingProprio" | "parceiros";

export type Opcao = {
  chave: ChaveConsentimento;
  /** Rótulo da caixa. Precisa ser compreensível sozinho, sem a política. */
  rotulo: Record<Lang, string>;
  /** Detalhe obrigatório: quem recebe e para quê. */
  detalhe: Record<Lang, string>;
  /** Sempre false. Caixa pré-marcada é consentimento inválido. */
  padrao: false;
  /** Nenhum dos dois pode bloquear a solicitação. */
  obrigatorio: false;
};

export const OPCOES: Opcao[] = [
  {
    chave: "marketingProprio",
    rotulo: {
      pt: "Quero receber novidades e conteúdos do Diariamente.",
      es: "Quiero recibir novedades y contenidos de Diariamente.",
    },
    detalhe: {
      pt: "Comunicações por e-mail e WhatsApp sobre o próprio Diariamente. Você pode sair a qualquer momento, com um clique, em todo envio.",
      es: "Comunicaciones por correo y WhatsApp sobre Diariamente. Puedes darte de baja en cualquier momento, con un clic, en cada envío.",
    },
    padrao: false,
    obrigatorio: false,
  },
  {
    chave: "parceiros",
    rotulo: {
      pt: "Autorizo o compartilhamento dos meus dados com empresas do grupo Science Play, parceiros e patrocinadores.",
      es: "Autorizo compartir mis datos con empresas del grupo Science Play, socios y patrocinadores.",
    },
    detalhe: {
      pt: "Para que essas empresas possam me enviar comunicações próprias. As categorias de destinatários estão descritas na Política de Privacidade. Posso revogar a qualquer momento, sem perder o acesso ao produto.",
      es: "Para que esas empresas puedan enviarme sus propias comunicaciones. Las categorías de destinatarios están descritas en la Política de Privacidad. Puedo revocarlo en cualquier momento, sin perder el acceso al producto.",
    },
    padrao: false,
    obrigatorio: false,
  },
];

/**
 * Versão do texto de consentimento. INCREMENTE sempre que os rótulos ou
 * as finalidades mudarem, e grave junto com o aceite.
 *
 * Sem isso não há como provar a QUE a pessoa consentiu: um aceite de
 * 2026 vale para o texto de 2026, não para o que estiver no ar depois.
 * RGPD art. 7º(1) coloca o ônus da prova no responsável.
 */
export const VERSAO_CONSENTIMENTO = "2026-09-v1";

/** Registro a ser persistido junto do aceite. */
export type RegistroConsentimento = {
  versao: string;
  aceitoEm: string;            // ISO 8601, UTC
  origem: string;              // ex: "form-estudante-global"
  idioma: Lang;
  marketingProprio: boolean;
  parceiros: boolean;
};
