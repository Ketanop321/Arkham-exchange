// Netlify Serverless Function: India market quotes via Alpha Vantage GLOBAL_QUOTE
// Accepts comma-separated symbols (e.g., RELIANCE.NSE,TCS.NSE,SBIN.NSE)

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

function normalizeSymbol(sym) {
  if (/\.NS$/i.test(sym)) return sym.replace(/\.NS$/i, '.NSE');
  if (/\.BO$/i.test(sym)) return sym.replace(/\.BO$/i, '.BSE');
  return sym;
}

async function fetchAV(symbol) {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) {
    // Return mock data if no API key
    return {
      symbol,
      price: 1500 + Math.random() * 500,
      change: (Math.random() - 0.5) * 50,
      changePercent: (Math.random() - 0.5) * 3,
      volume: Math.floor(Math.random() * 5000000),
      high: null,
      low: null,
      lastUpdated: new Date().toISOString(),
      provider: 'mock',
    };
  }
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`AlphaVantage error ${r.status}`);
  const j = await r.json();
  const q = j['Global Quote'] || {};
  const price = Number(q['05. price']) || Number(q['08. previous close']) || null;
  const prev = Number(q['08. previous close']) || price;
  const change = Number(q['09. change']) || (price && prev ? price - prev : 0);
  const changePctStr = q['10. change percent'] || '0%';
  const changePercent = Number(changePctStr.replace('%', '')) || (prev ? ((price - prev) / prev) * 100 : 0);
  return {
    symbol,
    price,
    change,
    changePercent,
    volume: Number(q['06. volume']) || 0,
    high: Number(q['03. high']) || null,
    low: Number(q['04. low']) || null,
    lastUpdated: new Date().toISOString(),
    provider: 'alphavantage',
  };
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const params = event.queryStringParameters || {};
    const symbolsParam = (params.symbols || 'RELIANCE.NSE,TCS.NSE,SBIN.NSE,HDFCBANK.NSE').toString();
    const symbols = symbolsParam.split(',').map((s) => normalizeSymbol(s.trim())).filter(Boolean);

    const out = [];
    for (const s of symbols) {
      const q = await fetchAV(s);
      out.push(q);
    }

    return jsonResponse(200, { quotes: out });
  } catch (err) {
    console.error('markets/in error', err);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
