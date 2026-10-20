import { EMPRESA } from "@/config";

// =====================================================================
// ATENDIMENTO DO PÓS-PAGAMENTO · fonte única
// ---------------------------------------------------------------------
// O endereço que as três páginas de obrigado (/obrigado-aprovado,
// /obrigado-aguardando-pagamento e /obrigado-aguardando-analise) mostram
// para quem tem dificuldade de acesso ou dúvida sobre o pagamento.
//
// PENDENTE DO DONO (plano 2.6 do app, docs/PLANO-DE-ACAO.md): escolher
// um endereço único de atendimento, contato@ ou suporte@scienceplay.com.
// Até a decisão vale contato@, que é o que o app já mostra quando o envio
// do acesso falha (RESPOSTA_ENVIO_INDISPONIVEL, command-center/acesso.js,
// e as mensagens err.ENVIO_INDISPONIVEL e err.ACESSO_ENCERRADO do app).
// Assim a pessoa vê o mesmo endereço aqui e no app. O suporte@ ainda não
// tem a caixa de entrada confirmada (plano 6.2).
//
// Decidido o endereço, troque SÓ esta linha (por EMPRESA.suporteEmail,
// por exemplo) e, no app, a RESPOSTA_ENVIO_INDISPONIVEL e o i18n.
// =====================================================================
export const ATENDIMENTO = {
  email: EMPRESA.contatoEmail,
};
