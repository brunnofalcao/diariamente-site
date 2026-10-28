import { MERCADOS } from "@/config/pricing";
import { ListaEsperaForm } from "@/components/ListaEsperaForm";

/* =====================================================================
   ESTUDANTE · LISTA DE ESPERA
   ---------------------------------------------------------------------
   Entra no lugar do EstudanteForm quando o fluxo do estudante está
   FECHADO agora (estudanteAberto(agora), config.ts). Fechado quer dizer
   que falta, na Vercel, o modelo v2 do WhatsApp, ou, em
   config/pricing.ts, o código da oferta de estudante da fase vigente
   (ESTUDANTE_OFERTA_LANCAMENTO até 16/11, ESTUDANTE_OFERTA depois; o log
   do build diz qual). Nesse estado, pedir a inscrição queimaria o CPF
   ("1 CPF = 1 lead") sem o estudante conseguir pagar. Por isso a página só anota o
   contato, pela mesma lista de espera do site, com origem "estudante"
   (a API separa esses leads do aviso de abertura do produto).

   Mesmo cartão do formulário (.ed-card-form) para a página não mudar de
   cara; o formulário vai embutido, sem o cartão próprio.
   ===================================================================== */

export function EstudanteEspera() {
  return (
    <div className="ed-card-form">
      <span className="ed-overline" style={{ marginBottom: 0 }}>
        Em breve
      </span>
      <h2 className="ed-form-h">A inscrição de estudante abre em breve</h2>
      <p className="ed-form-sub">
        Estamos terminando de preparar a condição de estudante. Deixe seu contato: avisamos
        no dia em que abrir, e aí leva cerca de um minuto para fazer a sua inscrição.
      </p>
      <ListaEsperaForm
        mercado="br"
        origem="estudante"
        embutido
        botao={MERCADOS.br.espera.botao}
        textos={{
          legal1:
            "Usamos seus dados só para avisar quando a solicitação da condição de estudante abrir. Você pode sair da lista a qualquer momento. Veja a",
          okD:
            "Quando a solicitação da condição de estudante abrir, você fica sabendo primeiro, pelo WhatsApp e pelo e-mail que deixou aqui.",
        }}
      />
    </div>
  );
}
