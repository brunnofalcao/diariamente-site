/* =====================================================================
   NOME DO ESTUDANTE · o que o formulário aceita e o "Olá, Fulana."
   ---------------------------------------------------------------------
   O pedido de estudante não confirma o e-mail nem o WhatsApp antes de
   mandar a mensagem de aprovação, e a primeira palavra do nome vai na
   saudação ("Olá, {{1}}.") do e-mail (Resend, de acesso@diariamente.app)
   e do WhatsApp. Sem regra, um nome como "www.golpe.com.br Silva" virava
   "Olá, www.golpe.com.br." com a marca e o domínio do Diariamente, e o
   Gmail, o Outlook e o WhatsApp transformam isso em link.

   Duas travas:
     - o formulário e a API só aceitam letras (com acento), espaço, hífen
       e apóstrofo, até 80 caracteres e 30 na primeira palavra
       (problemaDoNome);
     - na hora de mandar, a saudação usa a primeira palavra só se ela for
       um nome (primeiroNome); senão, "Olá." (pedidos antigos, gravados
       antes desta regra).

   Sem \p{L} de propósito: o formulário roda em navegadores antigos da
   lista do package.json (Firefox 67 não entende \p{} e quebraria o
   script inteiro). As faixas abaixo cobrem o latim com acento: á, ã, ç,
   ê, ü, ñ, ł, ő e afins. Sem import nenhum: o formulário ("use client")
   usa este arquivo, e nada do config pode ir junto ao navegador.
   ===================================================================== */

const LETRAS = "A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u024F\\u1E00-\\u1EFF";

/** Nome inteiro: letras, espaço, hífen e apóstrofo (reto ou curvo). */
const NOME_PERMITIDO = new RegExp(`^[${LETRAS}'\\u2019 -]+$`);

/** Uma palavra que é nome (a da saudação). */
const PALAVRA_DE_NOME = new RegExp(`^[${LETRAS}'\\u2019-]{1,30}$`);

export const NOME_MAX = 80;
export const PRIMEIRA_PALAVRA_MAX = 30;

/** O nome como é gravado: forma NFC, sem espaço sobrando. */
export function nomeLimpo(nome: unknown): string {
  return String(nome ?? "").normalize("NFC").trim().replace(/\s+/g, " ");
}

export type ProblemaDoNome = "curto" | "caracteres" | "longo";

/** null se o nome serve; senão, o problema. */
export function problemaDoNome(nome: unknown): ProblemaDoNome | null {
  const n = nomeLimpo(nome);
  const palavras = n.split(" ").filter(Boolean);
  if (palavras.length < 2) return "curto";
  if (!NOME_PERMITIDO.test(n)) return "caracteres";
  if (n.length > NOME_MAX || palavras[0].length > PRIMEIRA_PALAVRA_MAX) return "longo";
  return null;
}

/** A primeira palavra, para a saudação, só se ela for um nome. Senão "". */
export function primeiroNome(nome: unknown): string {
  const primeira = nomeLimpo(nome).split(" ")[0] || "";
  return PALAVRA_DE_NOME.test(primeira) ? primeira : "";
}
