/**
 * Diariamente | RD Station Marketing
 *
 * Usa a API de conversao por evento. O identificador da conversao
 * (conversion_identifier) e o que agrupa o lead no RD.
 *
 * Requer RD_STATION_TOKEN (token publico da API de conversoes).
 *
 * Falha aqui NUNCA pode derrubar a emissao do cupom. O lead fica
 * marcado com enviado_rd = false e um job de retry reprocessa.
 */

const URL_CONVERSAO = 'https://api.rd.services/platform/conversions';

export async function enviarLeadRD(lead) {
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

  const r = await fetch(`${URL_CONVERSAO}?api_key=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!r.ok) throw new Error(`RD Station [${r.status}]: ${await r.text()}`);
  return true;
}

function slug(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
