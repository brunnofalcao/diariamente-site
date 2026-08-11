/**
 * Rota de setup — cria o template WhatsApp do fluxo estudante na Meta.
 * Uso ÚNICO: chame uma vez, depois pode remover.
 *
 *   GET /api/setup/criar-template?key=SEU_HOTMART_HOTTOK
 *
 * Usa o WHATSAPP_TOKEN do proprio sistema (env). Descobre a WABA a partir
 * do WHATSAPP_PHONE_NUMBER_ID e cria o template UTILITY com 2 variaveis
 * ({{1}} primeiro nome, {{2}} codigo) + botao de URL FIXO (checkout).
 */

export const runtime = 'nodejs';

const VERSAO = 'v22.0';

export async function GET(req) {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');

  // Protecao: exige a chave secreta que o sistema ja tem (o hottok da Hotmart).
  if (!process.env.HOTMART_HOTTOK || key !== process.env.HOTMART_HOTTOK) {
    return Response.json({ ok: false, erro: 'nao autorizado' }, { status: 401 });
  }

  const TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const CHECKOUT =
    process.env.HOTMART_CHECKOUT_URL ||
    'https://pay.hotmart.com/L107085210M?checkoutMode=10';

  if (!TOKEN || !PHONE_ID) {
    return Response.json(
      { ok: false, erro: 'WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID ausentes no ambiente' },
      { status: 500 }
    );
  }

  try {
    // 1) Descobrir a WhatsApp Business Account (WABA) a partir do phone id.
    const waRes = await fetch(
      `https://graph.facebook.com/${VERSAO}/${PHONE_ID}?fields=whatsapp_business_account`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const waJson = await waRes.json();
    const wabaId = waJson?.whatsapp_business_account?.id;
    if (!wabaId) {
      return Response.json(
        { ok: false, etapa: 'descobrir_waba', resposta: waJson },
        { status: 500 }
      );
    }

    // 2) Criar o template UTILITY (2 variaveis no corpo + botao de URL fixo).
    const template = {
      name: 'diariamente_estudante_aprovado',
      language: 'pt_BR',
      category: 'UTILITY',
      components: [
        {
          type: 'BODY',
          text:
            'Olá, {{1}}. Segue o código que você solicitou para ativar sua condição de estudante.\n\n' +
            'Código: {{2}}\n' +
            'Válido por 48 horas, de uso único e vinculado ao seu CPF.\n\n' +
            'Toque no botão abaixo e informe o código no campo "Cupom de desconto".',
          example: { body_text: [['Marina', 'DIARIAESTP72Y5V85']] },
        },
        {
          type: 'BUTTONS',
          buttons: [{ type: 'URL', text: 'Ativar meu acesso', url: CHECKOUT }],
        },
      ],
    };

    const tplRes = await fetch(
      `https://graph.facebook.com/${VERSAO}/${wabaId}/message_templates`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      }
    );
    const tplJson = await tplRes.json();

    return Response.json(
      { ok: tplRes.ok, waba: wabaId, resposta: tplJson },
      { status: tplRes.ok ? 200 : 400 }
    );
  } catch (e) {
    return Response.json({ ok: false, erro: String(e?.message || e) }, { status: 500 });
  }
}
