/**
 * Diariamente | WhatsApp Cloud API v22.0
 *
 * Template UTILITY do fluxo estudante (aprovacao):
 *   Nome: WA_TEMPLATE_ESTUDANTE (Vercel). Padrao: diariamente_estudante_aprovado.
 *   Corpo:  {{1}} = primeiro nome  (SEM codigo no texto)
 *   Botao:  URL DINAMICA cujo sufixo {{1}} = o codigo da linha de
 *           cupons_estudante (no fluxo novo, o TOKEN do link pessoal)
 *
 * Fluxo novo (decisao do dono, 28/10/2026), com a chave de lancamento
 * ligada: o modelo e o diariamente_estudante_aprovado_v2 (Utilidade,
 * aprovado; o texto e o botao NAO mudam):
 *   "Ola, {{1}}. Sua inscricao como estudante no Diariamente App foi
 *   aprovada. Toque no botao abaixo para concluir sua matricula. Sua
 *   condicao de estudante ja esta aplicada."
 *   botao "Concluir inscricao" ->
 *   https://www.diariamente.app/estudante/ativar?cupom={{1}}
 * O {{1}} do botao e o token aleatorio do link pessoal
 * (lib/estudante.js), e o /estudante/ativar abre a OFERTA de estudante da
 * fase vigente (config/pricing.ts). Nenhum cupom na Hotmart: a API de
 * cupons nao aceita produto de assinatura. Trocar de oferta e editar o
 * config, nunca o modelo.
 *
 * O modelo antigo (diariamente_estudante_aprovado, preservado) tem o
 * botao com a base do checkout antigo, do produto 8280315: e o de
 * standby. A trava de precos avisa em todo build enquanto o nome na
 * Vercel for o antigo (scripts/checar-precos.js), e o fluxo novo fica
 * fechado.
 *
 * Como o codigo NAO aparece no corpo, a mensagem e uma confirmacao de
 * matricula (transacional): evita a classificacao de Autenticacao.
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
          // {{1}} do BOTAO (url dinamica) = token do link pessoal (no v2, vai
          // depois de /estudante/ativar?cupom=)
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
