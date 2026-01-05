// Netlify Serverless Function: Crypto quotes via CoinGecko

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const params = event.queryStringParameters || {};
    const ids = params.ids || 'bitcoin,ethereum,solana';
    const vs_currency = params.vs_currency || 'usd';
    const base = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

    const url = `${base}/coins/markets?vs_currency=${encodeURIComponent(vs_currency)}&ids=${encodeURIComponent(
      ids
    )}&order=market_cap_desc&sparkline=false&price_change_percentage=1h,24h,7d`;

    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) {
      return jsonResponse(r.status, { error: 'CoinGecko error', status: r.status });
    }
    const data = await r.json();

    const mapped = (Array.isArray(data) ? data : []).map((c) => ({
      id: c.id,
      symbol: c.symbol?.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change1hPct: c.price_change_percentage_1h_in_currency,
      change24hPct: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h,
      change7dPct: c.price_change_percentage_7d_in_currency,
      marketCap: c.market_cap,
      volume24h: c.total_volume,
      image: c.image,
      high24h: c.high_24h,
      low24h: c.low_24h,
      lastUpdated: c.last_updated,
    }));

    return jsonResponse(200, { coins: mapped });
  } catch (err) {
    console.error('crypto/quotes error', err);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
