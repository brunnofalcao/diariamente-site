/**
 * Diariamente | WhatsApp Cloud API v22.0
 *
 * Template unico do fluxo estudante (UTILITY):
 *   diariamente_estudante_aprovado
 *   {{1}} primeiro nome | {{2}} codigo
 *   + botao de URL FIXO (link do checkout) — nao e variavel.
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
        // Botao de URL fixo NAO precisa de componente no envio.
        // So mandamos as 2 variaveis do corpo: {{1}} nome, {{2}} codigo.
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
  // Aceita um 4o argumento (link) por compatibilidade, mas ele e IGNORADO:
  // o link agora e um botao fixo no template, nao uma variavel.
  aprovado: (tel, nome, codigo) =>
    enviarTemplate(tel, 'diariamente_estudante_aprovado', [nome, codigo]),
};
