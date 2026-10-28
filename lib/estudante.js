/**
 * Diariamente | Link pessoal do estudante e e-mail de aprovacao
 *
 * FLUXO (decisao do dono, 28/10/2026). A API de cupons da Hotmart nao
 * aceita produto de assinatura, e o 7448309 e assinatura: o estudante
 * paga numa OFERTA da Hotmart (uma por fase, config/pricing.ts), e o que
 * o site entrega e um LINK PESSOAL:
 *
 *   /api/estudante/solicitar  valida, grava o lead (1 CPF = 1 lead) e um
 *                             token aleatorio em cupons_estudante.codigo
 *                             (sem hotmart_coupon_id)
 *   cron /api/cron/manutencao manda o WhatsApp (modelo
 *                             diariamente_estudante_aprovado_v2, botao
 *                             "Concluir inscricao" ->
 *                             https://www.diariamente.app/estudante/ativar?cupom={{1}},
 *                             {{1}} = o token)
 *   /estudante/ativar         token conhecido -> oferta de estudante da
 *                             fase vigente, com o token no sck
 *   webhook do site           venda aprovada da oferta de estudante ->
 *                             link marcado como usado
 *
 * O token nao e dado da pessoa: e aleatorio, so liga o clique ao pedido.
 * Mesmo formato do codigo de cupom de antes (DIARIAEST + letras e numeros,
 * ate 25 caracteres), para caber no botao do modelo da Meta e no filtro
 * de formato do /estudante/ativar.
 *
 * E-MAIL DE APROVACAO (decisao do dono, 28/10/2026: todo e-mail automatico
 * vai para o Resend). Com RESEND_API_KEY na Vercel, o site manda o e-mail
 * com o botao para o link pessoal; sem ela, nada sai daqui (o RD Station
 * recebe o link no campo cf_link_estudante, lib/rdstation.js, e a
 * automacao de la pode usa-lo). Falha no e-mail nunca derruba o pedido.
 * O click tracking do Resend e por dominio, nao por e-mail: deixe-o
 * DESLIGADO no dominio diariamente.app, para o botao levar direto ao
 * link pessoal (docs/ESTUDANTE.md).
 */

import { MERCADOS, formatar, precoEstudante, regraDoEstudante, faseDoEstudante } from '@/config/pricing';
import { primeiroNome } from '@/lib/nome';

/** Endereco do botao: o mesmo do modelo v2 da Meta, com www (sem www a
    Vercel responde 308 e o clique da um salto a mais). */
export const ENDERECO_DE_ATIVACAO = 'https://www.diariamente.app/estudante/ativar';

export const PREFIXO_DO_TOKEN = 'DIARIAEST';

/** O que o /estudante/ativar aceita (o botao da Meta manda o token como
    sufixo da URL). */
export const FORMATO_DO_TOKEN = /^[A-Z0-9_-]{1,25}$/;

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem I O 0 1

/** Token unico e aleatorio: DIARIAEST + 14 caracteres (70 bits), 23 no
    total. A coluna codigo e unica no banco (cupons_estudante_codigo_key). */
export function gerarToken() {
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += ALFABETO[b % ALFABETO.length];
  return `${PREFIXO_DO_TOKEN}${s}`.slice(0, 25);
}

/** O link pessoal: o mesmo que o botao do WhatsApp abre. */
export function linkPessoal(token) {
  return `${ENDERECO_DE_ATIVACAO}?cupom=${encodeURIComponent(token)}`;
}

/* ------------------------------ e-mail ------------------------------ */

export const REMETENTE = 'Diariamente App <acesso@diariamente.app>';
export const RESPONDER_PARA = 'suporte@scienceplay.com';
const URL_RESEND = 'https://api.resend.com/emails';
const PRAZO_RESEND_MS = 8000;

export function emailConfigurado() {
  return Boolean(String(process.env.RESEND_API_KEY || '').trim());
}

const escapar = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** "à vista, ..." para seguir o preço, como ESTUDANTE.pagamento (config.ts). */
const inicialMinuscula = (s) => String(s).charAt(0).toLowerCase() + String(s).slice(1);

/**
 * Texto do e-mail de aprovacao, com o preco da fase NO MOMENTO do envio
 * (regraDoEstudante): no lancamento, "R$ 59,90 por ano nos 3 primeiros
 * anos, para quem assinar ate 16 de novembro. Depois, R$ 149,90 por
 * ano."; depois, "R$ 79,90 ...". O corpo repete o modelo aprovado na Meta.
 * Como paga, igual a pagina (o preco antes do parcelamento, para nao
 * parecer que o "a vista ou 12x" vale para os R$ 149,90): "R$ 59,90 a
 * vista, ou em ate 12x no cartao com acrescimo."
 * Sem "compra", sem travessao, sem emoji, nada que o sistema nao cumpra.
 * A saudacao usa o primeiro nome so se ele for um nome (lib/nome.ts):
 * nome em forma de endereco vira "Olá.".
 */
export function textoDoEmail({ nome, token, agora = Date.now() }) {
  const primeiro = primeiroNome(nome);
  const link = linkPessoal(token);
  const regra = regraDoEstudante(agora);
  // "R$ 59,90 à vista, ou em até 12x no cartão com acréscimo"
  const pagamento = `${formatar('br', precoEstudante(agora))} ${inicialMinuscula(MERCADOS.br.textos.pagamento)}`;
  const assunto = 'Sua inscrição de estudante no Diariamente foi aprovada';
  const saudacao = primeiro ? `Olá, ${primeiro}.` : 'Olá.';
  const paragrafos = [
    'Sua inscrição como estudante no Diariamente App foi aprovada. Toque no botão abaixo para concluir sua matrícula. Sua condição de estudante já está aplicada.',
    `Sua condição: ${regra} ${pagamento}.`,
    'O link é pessoal. Garantia de 7 dias: se o Diariamente não for para você, devolvemos o valor.',
  ];
  const texto = [
    saudacao,
    paragrafos[0],
    `Concluir inscrição: ${link}`,
    paragrafos[1],
    paragrafos[2],
    'Dúvidas? É só responder este e-mail.',
    'Diariamente App by Science Play',
  ].join('\n\n');
  const p = (t) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#1F2626">${escapar(t)}</p>`;
  const html = [
    '<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#F4F6F6">',
    '<div style="max-width:520px;margin:0 auto;padding:32px 24px;font-family:Inter,Helvetica,Arial,sans-serif;background:#FFFFFF">',
    p(saudacao),
    p(paragrafos[0]),
    `<p style="margin:24px 0"><a href="${escapar(link)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#27BDBE;color:#131918;font-size:16px;font-weight:600;text-decoration:none">Concluir inscrição</a></p>`,
    p(paragrafos[1]),
    p(paragrafos[2]),
    `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#5B6666">Se o botão não abrir, copie este endereço no navegador: ${escapar(link)}</p>`,
    p('Dúvidas? É só responder este e-mail.'),
    '<p style="margin:24px 0 0;font-size:13px;color:#5B6666">Diariamente App by Science Play</p>',
    '</div></body></html>',
  ].join('');
  return { assunto, texto, html, link, fase: faseDoEstudante(agora), preco: precoEstudante(agora) };
}

/**
 * Manda o e-mail de aprovacao pelo Resend. Lanca erro se a Resend
 * recusar ou nao responder no prazo; quem chama decide (o pedido segue).
 * Idempotency-Key pelo token: um reenvio do mesmo pedido nao duplica.
 */
export async function enviarEmailDeAprovacao({ email, nome, token, agora = Date.now() }) {
  const chave = String(process.env.RESEND_API_KEY || '').trim();
  if (!chave) throw new Error('RESEND_API_KEY nao configurada');
  const m = textoDoEmail({ nome, token, agora });
  const controle = new AbortController();
  const prazo = setTimeout(() => controle.abort(), PRAZO_RESEND_MS);
  try {
    const r = await fetch(URL_RESEND, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chave}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `estudante-aprovado-${token}`,
      },
      body: JSON.stringify({
        from: REMETENTE,
        to: [email],
        reply_to: RESPONDER_PARA,
        subject: m.assunto,
        html: m.html,
        text: m.texto,
        tags: [{ name: 'fluxo', value: 'estudante_aprovado' }],
      }),
      signal: controle.signal,
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      throw new Error(`Resend HTTP ${r.status}${d && d.message ? `: ${d.message}` : ''}`);
    }
    const d = await r.json().catch(() => ({}));
    return { id: d && d.id ? String(d.id) : null, fase: m.fase };
  } finally {
    clearTimeout(prazo);
  }
}
