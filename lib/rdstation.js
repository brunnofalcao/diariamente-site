/**
 * Diariamente | RD Station Marketing
 *
 * Usa a API de conversao por evento. O identificador da conversao
 * (conversion_identifier) e o que agrupa o lead no RD.
 *
 * Requer RD_STATION_TOKEN (token publico da API de conversoes).
 *
 * Falha aqui NUNCA pode derrubar o pedido do estudante. O lead fica
 * marcado com enviado_rd = false e o cron reprocessa.
 *
 * LINK PESSOAL (fluxo de 28/10/2026): com a chave de lancamento ligada, a
 * conversao leva o link pessoal do estudante em CAMPO_LINK_ESTUDANTE
 * (cf_link_estudante), para o e-mail de aprovacao da automacao do RD
 * poder usa-lo no botao. O campo precisa existir no RD (Configuracoes,
 * Campos personalizados, texto de uma linha, identificador
 * cf_link_estudante; docs/ESTUDANTE.md). Se o RD recusar a conversao com
 * ele (4xx), o envio e repetido sem os campos extras, como era antes, e o
 * log avisa: o lead nunca deixa de chegar por causa do campo novo.
 */

export const CAMPO_LINK_ESTUDANTE = 'cf_link_estudante';

const URL_CONVERSAO = 'https://api.rd.services/platform/conversions';

/**
 * Manda a conversao do estudante. `extras`: campos a mais (hoje so
 * { link }, que vai em cf_link_estudante). Devolve { ok, semExtras }.
 */
export async function enviarLeadRD(lead, extras = {}) {
  const token = process.env.RD_STATION_TOKEN;
  if (!token) throw new Error('RD_STATION_TOKEN nao configurado');

  const identificador = process.env.RD_CONVERSION_IDENTIFIER || 'diariamente-estudante';

  const payload = {
    event_type: 'CONVERSION',
    event_family: 'CDP',
    payload: {
      conversion_identifier: identificador,
      name: lead.nome,
      email: lead.email,
      mobile_phone: `+${lead.whatsapp}`,
      cf_instituicao: lead.instituicao,
      cf_estado_e_uf: lead.estado || null,
      cf_curso: lead.curso,
      cf_semestre: lead.semestre ? String(lead.semestre) : null,
      cf_previsao_conclusao: lead.previsao_conclusao || null,
      cf_email_institucional: lead.email_institucional ? 'sim' : 'nao',
      tags: ['estudante', `curso-${slug(lead.curso)}`],
      traffic_source: lead.utm?.utm_source || null,
      traffic_medium: lead.utm?.utm_medium || null,
      traffic_campaign: lead.utm?.utm_campaign || null,
    },
  };

  // Remove chaves nulas: o RD rejeita campos vazios em alguns casos
  for (const [k, v] of Object.entries(payload.payload)) {
    if (v === null || v === undefined || v === '') delete payload.payload[k];
  }

  const camposExtras = {};
  if (extras && extras.link) camposExtras[CAMPO_LINK_ESTUDANTE] = String(extras.link);

  const postar = (corpo) => fetch(`${URL_CONVERSAO}?api_key=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });

  if (!Object.keys(camposExtras).length) {
    const r = await postar(payload);
    if (!r.ok) throw new Error(`RD Station [${r.status}]: ${await r.text()}`);
    return { ok: true, semExtras: false };
  }

  const r = await postar({ ...payload, payload: { ...payload.payload, ...camposExtras } });
  if (r.ok) return { ok: true, semExtras: false };
  const erro = await r.text();
  // 4xx com o campo novo: provavelmente o campo ainda nao existe no RD.
  // Repete sem ele (o lead chega como antes) e avisa no log. 401, 403 e
  // 429 nao sao do campo: sobem como erro, e o cron tenta de novo.
  if (r.status >= 400 && r.status < 500 && ![401, 403, 429].includes(r.status)) {
    const r2 = await postar(payload);
    if (!r2.ok) throw new Error(`RD Station [${r2.status}]: ${await r2.text()}`);
    console.warn(
      `[rd] conversao recusada com ${Object.keys(camposExtras).join(', ')} [${r.status}]: ${String(erro).slice(0, 200)}. ` +
      'Enviada sem o campo; crie o campo no RD (docs/ESTUDANTE.md).'
    );
    return { ok: true, semExtras: true };
  }
  throw new Error(`RD Station [${r.status}]: ${erro}`);
}

function slug(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
