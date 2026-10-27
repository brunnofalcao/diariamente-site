import { EMPRESA } from "@/config";

// =====================================================================
// ATENDIMENTO DO PÓS-PAGAMENTO · fonte única
// ---------------------------------------------------------------------
// O endereço que as três páginas de obrigado (/obrigado-aprovado,
// /obrigado-aguardando-pagamento e /obrigado-aguardando-analise) mostram
// para quem tem dificuldade de acesso ou dúvida sobre o pagamento.
//
// DECIDIDO PELO DONO em 20/10/2026 (plano 2.6 do app): contato@scienceplay.com,
// o mesmo que o app já mostra (RESPOSTA_ENVIO_INDISPONIVEL e i18n), com o
// assunto já preenchido no link:
//   - "Suporte Diariamente App": dificuldade de acesso (/obrigado-aprovado);
//   - "Atendimento Diariamente App": dúvidas (/obrigado-aguardando-pagamento
//     e /obrigado-aguardando-analise).
// O endereço também aparece escrito, para quem prefere copiar.
// =====================================================================
export const ATENDIMENTO = {
  email: EMPRESA.contatoEmail,
  assuntoSuporte: "Suporte Diariamente App",
  assuntoAtendimento: "Atendimento Diariamente App",
};

/** mailto: com o assunto preenchido (o assunto vai codificado; o endereço, não). */
export function linkDoAtendimento(assunto: string): string {
  return `mailto:${ATENDIMENTO.email}?subject=${encodeURIComponent(assunto)}`;
}
