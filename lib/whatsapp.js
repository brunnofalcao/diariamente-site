/**
 * Diariamente | WhatsApp Cloud API v22.0
 *
 * Template UTILITY do fluxo estudante (aprovacao):
 *   Nome: WA_TEMPLATE_ESTUDANTE (Vercel). Padrao: diariamente_estudante_aprovado.
 *   Corpo:  {{1}} = primeiro nome  (SEM codigo no texto)
 *   Botao:  URL DINAMICA cujo sufixo {{1}} = codigo do cupom pessoal
 *           -> o checkout abre com o cupom aplicado (nada de digitar codigo).
 *
 * Fluxo (o original, retomado em 12/10/2026): aprovado o estudante, o
 * site cria o cupom PESSOAL pela API da Hotmart (lib/hotmart.js) e este
 * arquivo manda so o codigo. O botao leva a
 *   https://www.diariamente.app/estudante/ativar?cupom={{1}}
 * (com www, o SITE.dominio do config.ts: sem www a Vercel responde 308,
 * e o clique passa por um salto a mais)
 * e essa rota (app/estudante/ativar/route.ts) abre a oferta oficial do
 * Brasil (CHECKOUT_BRL de config/pricing.ts, off=fhrttdh8) com
 * offDiscount=<cupom>. O webhook do site (app/api/webhooks/hotmart)
 * apaga o cupom quando o pagamento e aprovado: uso unico.
 *
 * O modelo aprovado hoje (diariamente_estudante_aprovado, preservado)
 * tem o botao com a base do checkout antigo, do produto 8280315, onde o
 * cupom criado no 7448309 nao vale. O v2, com o botao acima, e criado e
 * aprovado pelo app; quando estiver aprovado, ponha o nome dele em
 * WA_TEMPLATE_ESTUDANTE na Vercel. Daí em diante, trocar de oferta e
 * editar o config, nunca o modelo. A trava de precos avisa em todo build
 * enquanto o nome for o antigo (scripts/checar-precos.js).
 * Junto, na Vercel: HOTMART_PRODUCT_ID=7448309 e o id NUMERICO da oferta
 * fhrttdh8 em HOTMART_OFFER_IDS. Sem ele, o cupom vale em qualquer oferta
 * do produto, inclusive a de lancamento.
 *
 * Como o codigo NAO aparece no corpo, a mensagem e uma confirmacao de
 * matricula (transacional) — evita a classificacao de Autenticacao.
 */

const VERSAO = 'v22.0';

/** Modelo aprovado hoje. Fica como padrao ate o v2 existir. */
export const MODELO_ESTUDANTE_PADRAO = 'diariamente_estudante_aprovado';

/**
 * Nome do modelo de aprovacao do estudante: WA_TEMPLATE_ESTUDANTE ou o
 * padrao. Nome de modelo da Meta e so minuscula, numero e _; qualquer
 * outra coisa volta ao padrao (com aviso no log), para um erro de
 * digitacao na Vercel nao derrubar o envio.
 *
 * STANDBY (DM_SITE_LANCADO vazio, config/lancamento.ts): sempre o
 * padrao, como na main. A /estudante e o fluxo da producao, e o botao do
 * v2 leva a /estudante/ativar, que so abre o checkout com a chave ligada.
 */
export function modeloEstudante() {
  if (process.env.DM_SITE_LANCADO !== '1') return MODELO_ESTUDANTE_PADRAO;
  const nome = (process.env.WA_TEMPLATE_ESTUDANTE || '').trim();
  if (!nome) return MODELO_ESTUDANTE_PADRAO;
  if (!/^[a-z0-9_]{1,512}$/.test(nome)) {
    console.warn('[whatsapp] WA_TEMPLATE_ESTUDANTE invalido; usando o modelo padrao.');
    return MODELO_ESTUDANTE_PADRAO;
  }
  return nome;
}

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
        name: modeloEstudante(),
        language: { code: 'pt_BR' },
        components: [
          // {{1}} do CORPO = primeiro nome
          { type: 'body', parameters: [{ type: 'text', text: String(nome) }] },
          // {{1}} do BOTAO (url dinamica) = codigo do cupom (no v2, vai depois de
          // /estudante/ativar?cupom=)
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
