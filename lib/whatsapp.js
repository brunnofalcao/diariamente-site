/**
 * Diariamente | WhatsApp Cloud API v22.0
 *
 * Template UTILITY do fluxo estudante:
 *   diariamente_estudante_aprovado
 *   Corpo:  {{1}} = primeiro nome  (SEM codigo no texto)
 *   Botao:  URL DINAMICA cujo sufixo {{1}} = codigo do cupom
 *           base de HOJE no painel da Meta (link antigo, R$ 137,90):
 *           https://pay.hotmart.com/L107085210M?checkoutMode=10&offDiscount={{1}}
 *           -> a Hotmart aplica o cupom sozinho (nada de digitar codigo).
 *
 *           PENDENCIA DO DONO (plano novo, produto 7448309): trocar a base
 *           do botao no template para
 *             https://diariamente.app/estudante/ativar?cupom={{1}}
 *           Essa rota (app/estudante/ativar/route.ts) monta o link a partir
 *           de config/pricing.ts (CHECKOUT_BRL) com o MESMO parametro
 *           offDiscount. Daí em diante, trocar de plano e editar o config,
 *           nunca o template. Este arquivo continua mandando so o codigo.
 *           Junto, na Vercel: HOTMART_PRODUCT_ID=7448309 e o id numerico da
 *           oferta do plano BRL em HOTMART_OFFER_IDS (lib/hotmart.js cria o
 *           cupom nesse produto e nessa oferta). Item 6 do quadro de go-live
 *           do LEIA-ME; a trava de precos avisa em todo build ate
 *           DM_TEMPLATE_ESTUDANTE_OK=1 (scripts/checar-precos.js).
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
