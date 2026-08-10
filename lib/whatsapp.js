/**
 * Diariamente | WhatsApp Cloud API v22.0
 *
 * Template unico do fluxo estudante:
 *   diariamente_estudante_aprovado
 *   {{1}} primeiro nome | {{2}} codigo | {{3}} link do checkout
 *
 * Regra de marca: maximo 1 emoji por mensagem. Este nao usa nenhum.
 */

const VERSAO = 'v22.0';

function env(nome) {
  const v = process.env[nome];
  if (!v) throw new Error(`Variavel de ambiente ausente: ${nome}`);
  return v;
}

async function enviarTemplate(paraE164, template, parametros = []) {
  const url = `https://graph.facebook.com/${VERSAO}/${env('WHATSAPP_PHONE_NUMBER_ID')}/messages`;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('WHATSAPP_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: paraE164,
      type: 'template',
      template: {
        name: template,
        language: { code: 'pt_BR' },
        components: parametros.length
          ? [{ type: 'body', parameters: parametros.map(t => ({ type: 'text', text: String(t) })) }]
          : [],
      },
    }),
  });

  if (!r.ok) throw new Error(`WhatsApp [${r.status}]: ${await r.text()}`);
  return r.json();
}

export const whatsapp = {
  aprovado: (tel, nome, codigo, link) =>
    enviarTemplate(tel, 'diariamente_estudante_aprovado', [nome, codigo, link]),
};
