/**
 * Diariamente | Cliente da API Hotmart
 *
 * A API NAO tem limite de uso por cupom. Campos aceitos na criacao:
 *   code (max 25), discount (>0 e <0.99), start_date, end_date (ms),
 *   affiliate, offer_ids
 *
 * O uso unico e garantido pelo nosso webhook, que apaga o cupom
 * assim que a compra e aprovada.
 */

const AUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const API_URL = 'https://developers.hotmart.com';

let tokenCache = { value: null, expiraEm: 0 };

function env(nome) {
  const v = process.env[nome];
  if (!v) throw new Error(`Variavel de ambiente ausente: ${nome}`);
  return v;
}

export async function getToken() {
  if (tokenCache.value && Date.now() < tokenCache.expiraEm) return tokenCache.value;

  const url = `${AUTH_URL}?grant_type=client_credentials`
    + `&client_id=${encodeURIComponent(env('HOTMART_CLIENT_ID'))}`
    + `&client_secret=${encodeURIComponent(env('HOTMART_CLIENT_SECRET'))}`;

  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${env('HOTMART_BASIC')}` },
  });
  if (!r.ok) throw new Error(`Hotmart auth [${r.status}]: ${await r.text()}`);

  const data = await r.json();
  tokenCache = {
    value: data.access_token,
    expiraEm: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000,
  };
  return tokenCache.value;
}

async function chamar(metodo, caminho, body) {
  const token = await getToken();
  const r = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Hotmart ${metodo} ${caminho} [${r.status}]: ${texto}`);
  return texto ? JSON.parse(texto) : {};
}

/**
 * Le HOTMART_OFFER_IDS do ambiente e devolve SO os IDs numericos validos.
 *
 * A API da Hotmart exige `offer_ids` como array de inteiros. O codigo que
 * aparece na URL do checkout (?off=gqu7p0mm) NAO serve: parseInt vira NaN,
 * o JSON manda null e a criacao do cupom quebra.
 *
 * Regra: entrada que nao for so digito e DESCARTADA com aviso no log.
 * Se sobrar nada, devolve undefined e o cupom nasce sem restricao de oferta
 * (comportamento antigo, seguro). Nunca derruba a emissao por config errada.
 */
export function offerIdsDoAmbiente() {
  const bruto = (process.env.HOTMART_OFFER_IDS || '').trim();
  if (!bruto) return undefined;

  const partes = bruto.split(',').map(s => s.trim()).filter(Boolean);
  const validos = [];
  const descartados = [];

  for (const p of partes) {
    if (/^\d+$/.test(p)) validos.push(Number(p));
    else descartados.push(p);
  }

  if (descartados.length) {
    console.warn(
      `[hotmart] HOTMART_OFFER_IDS ignorou ${JSON.stringify(descartados)}: ` +
      'a API exige o ID NUMERICO da oferta, nao o codigo do checkout. ' +
      'O cupom sera criado sem restricao de oferta.'
    );
  }

  return validos.length ? validos : undefined;
}

/** Codigo unico, sem caracteres ambiguos, dentro dos 25 chars. */
export function gerarCodigo(prefixo = 'DIARIAEST') {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem I O 0 1
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += alfabeto[b % alfabeto.length];
  return `${prefixo}${s}`.slice(0, 25);
}

/**
 * Cria o cupom e recupera o coupon_id.
 * O POST responde objeto generico sem id garantido, por isso o GET logo
 * depois. Sem coupon_id nao existe DELETE, e sem DELETE o cupom e infinito.
 */
export async function criarCupom({ codigo, desconto, validadeHoras = 48, offerIds }) {
  if (!(desconto > 0 && desconto < 0.99)) {
    throw new Error(`Desconto invalido: ${desconto}. A Hotmart exige >0 e <0.99.`);
  }
  if (codigo.length > 25) throw new Error('Codigo excede 25 caracteres.');

  const productId = env('HOTMART_PRODUCT_ID');
  const agora = Date.now();

  // A Hotmart interpreta o start_date no FUSO do produto (ex: America/Sao_Paulo,
  // -03:00), entao um timestamp UTC "agora" vira ~3h no futuro e o cupom fica
  // "Em breve" (invalido no checkout) por esse periodo. Recuamos o inicio em 12h
  // pra garantir que ele ja nasce ATIVO em qualquer fuso do Brasil. O fim
  // (validade real que o estudante ve) continua sendo agora + validadeHoras.
  const START_BACKDATE_MS = 12 * 3600 * 1000;

  const payload = {
    code: codigo,
    discount: desconto,
    start_date: agora - START_BACKDATE_MS,
    end_date: agora + validadeHoras * 3600 * 1000,
  };
  const ofertas = (offerIds || []).filter(n => Number.isInteger(n) && n > 0);
  if (ofertas.length) payload.offer_ids = ofertas;

  await chamar('POST', `/products/api/v1/product/${productId}/coupon`, payload);

  const achado = await buscarCupom(codigo);
  if (!achado?.id) {
    throw new Error(`Cupom ${codigo} criado mas o id nao foi recuperado. Revogar manualmente.`);
  }
  return { codigo, hotmartCouponId: achado.id, expiraEm: new Date(payload.end_date) };
}

export async function buscarCupom(codigo) {
  const productId = env('HOTMART_PRODUCT_ID');
  const r = await chamar(
    'GET',
    `/products/api/v1/coupon/product/${productId}?code=${encodeURIComponent(codigo)}`
  );
  return (r.items || []).find(c => c.coupon_code === codigo) || null;
}

export async function apagarCupom(couponId) {
  await chamar('DELETE', `/products/api/v1/coupon/${couponId}`);
  return true;
}
