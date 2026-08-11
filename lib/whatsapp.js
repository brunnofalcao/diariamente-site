/**
 * Diariamente | WhatsApp Cloud API v22.0
 *
 * Template UTILITY do fluxo estudante:
 *   diariamente_estudante_aprovado
 *   Corpo:  {{1}} = primeiro nome  (SEM codigo no texto)
 *   Botao:  URL DINAMICA cujo sufixo {{1}} = codigo do cupom
 *           https://pay.hotmart.com/L107085210M?checkoutMode=10&offDiscount={{1}}
 *           -> a Hotmart aplica o cupom sozinho (nada de digitar codigo).
 *
 * Como o codigo NAO aparece no corpo, a mensagem e uma confirmacao de
 * matricula (transacional) — evita a classificacao de Autenticacao.
 */

const VERSAO = 'v22.0';

function env(nome) {
  const v = process.env[nome];
  if (!v) throw new Error(`Variavel de ambiente ausente: ${nome}`);
  return v;
}

async function enviar(body) {
  const url = `https://graph.facebook.com/${VERSAO}/${env('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('WHATSAPP_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`WhatsApp [${r.status}]: ${await r.text()}`);
  return r.json();
}

export const whatsapp = {
  // Aceita um 4o argumento (link) por compatibilidade — e ignorado.
  aprovado: (tel, nome, codigo) =>
    enviar({
      messaging_product: 'whatsapp',
      to: tel,
      type: 'template',
      template: {
        name: 'diariamente_estudante_aprovado',
        language: { code: 'pt_BR' },
        components: [
          // {{1}} do CORPO = primeiro nome
          { type: 'body', parameters: [{ type: 'text', text: String(nome) }] },
          // {{1}} do BOTAO (url dinamica) = codigo do cupom (vai depois de offDiscount=)
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: String(codigo) }],
          },
        ],
      },
    }),
};
