// Cadastro de convidado pelo site (www.diariamente.app/convidado, 07/11/2026).
//
// O dono quer o cadastro gratuito do evento no site normal, com o CUPOM obrigatório: o campo
// só aceita um cupom que existe no app (tabela convites). Quem cadastra recebe no WhatsApp a
// confirmação com os botões para baixar o app (modelo diariamente_convite_conta_criada, aprovado
// na Meta) e entra no app com o e-mail e a senha daqui.
//
// O formulário fala direto com o app pelo navegador (CORS só para /api/convite no app): cada
// pessoa conta no limite de tentativas pelo próprio IP, e não pelo IP do servidor da Vercel.
// Aqui só ficam as regras puras (testadas em testes/convidado.test.mjs).

export const API_DO_APP = "https://app.diariamente.club";

// Lista curta: o evento é no Brasil. O DDI vai junto e decide o país da conta no app.
export const PAISES_DO_WHATSAPP = [
  { ddi: "55", nome: "Brasil", exemplo: "(62) 99999-9999" },
  { ddi: "351", nome: "Portugal", exemplo: "912 345 678" },
  { ddi: "34", nome: "Espanha", exemplo: "612 345 678" },
  { ddi: "1", nome: "EUA / Canadá", exemplo: "202 555 1234" },
  { ddi: "54", nome: "Argentina", exemplo: "11 2345 6789" },
  { ddi: "56", nome: "Chile", exemplo: "9 1234 5678" },
  { ddi: "57", nome: "Colômbia", exemplo: "310 123 4567" },
  { ddi: "52", nome: "México", exemplo: "55 1234 5678" },
  { ddi: "51", nome: "Peru", exemplo: "912 345 678" },
  { ddi: "598", nome: "Uruguai", exemplo: "94 123 456" },
  { ddi: "595", nome: "Paraguai", exemplo: "961 456 789" },
];

// O cupom como o app guarda: sem acento, maiúsculo, só letras e números, de 3 a 32.
export function normalizarCupom(v) {
  const s = String(v == null ? "" : v)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return /^[A-Z0-9]{3,32}$/.test(s) ? s : "";
}

// WhatsApp digitado → DDI + número, só dígitos, ou "" quando não dá para ler.
// Brasil: sai o 00, o 0 de longa distância ou de operadora (062..., 0xx62..., 015 62...) e o 55
// quando sobra DDD + número (o DDD 55, do RS, fica); vale DDD + 8 ou 9 dígitos. Fora: sai o 00 e
// o DDI só quando foi digitado (+, 00 ou dígitos demais); vale de 8 a 12 dígitos. Argentina: o
// 15 do celular, se vier, sai depois do código de área de 2 dígitos.
export function montarWhatsapp(ddi, bruto) {
  const texto = String(bruto == null ? "" : bruto);
  let d = texto.replace(/\D/g, "");
  if (!d) return "";
  if (ddi === "55") {
    d = d.replace(/^00/, "");
    d = d.replace(/^0(?:\d{2})?(?=\d{10,11}$)/, "");
    if (d.startsWith("55") && d.length > 11) d = d.slice(2);
    return d.length >= 10 && d.length <= 11 ? "55" + d : "";
  }
  const comDdi = /^\s*(\+|00)/.test(texto) || d.length > 12;
  d = d.replace(/^00/, "");
  if (comDdi && d.startsWith(ddi) && d.length - ddi.length >= 8) d = d.slice(ddi.length);
  d = d.replace(/^0/, "");
  if (ddi === "54") d = d.replace(/^(\d{2})15(\d{8})$/, "$1$2");
  return d.length >= 8 && d.length <= 12 ? ddi + d : "";
}

export const EMAIL_RE = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/;

// Os erros do app (command-center/convite.js) em português.
const ERROS = {
  CONVITE_INVALIDO: "Este cupom não existe. Confira e tente de novo.",
  CONVITE_PAUSADO: "Este cupom está pausado no momento.",
  CONVITE_ENCERRADO: "O prazo deste cupom terminou.",
  CONVITE_ESGOTADO: "As vagas deste cupom acabaram.",
  CONVITE_EMAIL_JA_CADASTRADO: "Este e-mail já tem uma conta. Baixe o app e entre com ele.",
  CONVITE_EMAIL_INVALIDO: "Confira o e-mail.",
  CONVITE_NOME_OBRIGATORIO: "Digite o seu nome.",
  CONVITE_TELEFONE_INVALIDO: "Confira o número do WhatsApp.",
  CONVITE_SENHA_LONGA: "A senha é longa demais.",
  CONVITE_ACEITE_OBRIGATORIO: "Para criar a conta, aceite os Termos de uso e a Política de privacidade.",
  SENHA_CURTA: "A senha precisa ter pelo menos 6 caracteres.",
  MUITAS_TENTATIVAS: "Muitas tentativas. Aguarde 15 minutos e tente de novo.",
  ERRO_INTERNO: "Algo deu errado do nosso lado. Tente de novo em instantes.",
};
export function mensagemDoErro(codigo) {
  return ERROS[codigo] || ERROS.ERRO_INTERNO;
}
// Erro que é do cupom (aparece embaixo do campo do cupom) ou do resto do formulário.
export function erroDoCupom(codigo) {
  return ["CONVITE_INVALIDO", "CONVITE_PAUSADO", "CONVITE_ENCERRADO", "CONVITE_ESGOTADO"].includes(codigo);
}

// Meses de acesso para o texto do cupom válido (365 dias → 12 meses).
export function mesesDeAcesso(dias) {
  return Math.max(1, Math.round((Number(dias) || 365) / 30.44));
}
