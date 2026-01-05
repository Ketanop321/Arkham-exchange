// Netlify Serverless Function: US market quotes
// Uses Alpaca snapshots if both key and secret provided; falls back to Alpha Vantage GLOBAL_QUOTE

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

const hasAlpaca = () => !!(process.env.ALPACA_API_KEY && process.env.ALPACA_API_SECRET);

async function fetchAlpaca(symbols) {
  const url = `${process.env.ALPACA_DATA_URL || 'https://data.alpaca.markets/v2'}/stocks/snapshots?symbols=${encodeURIComponent(
    symbols.join(',')
  )}`;
  const r = await fetch(url, {
    headers: {
      'Apca-Api-Key-Id': process.env.ALPACA_API_KEY,
      'Apca-Api-Secret-Key': process.env.ALPACA_API_SECRET,
      Accept: 'application/json',
    },
  });
  if (!r.ok) throw new Error(`Alpaca error ${r.status}`);
  const json = await r.json();
  const out = [];
  for (const s of symbols) {
    const snap = json.snapshots?.[s];
    if (!snap) continue;
    const last = snap.latestTrade?.p ?? snap.minuteBar?.c ?? snap.dailyBar?.c;
    const prevClose = snap.prevDailyBar?.c ?? snap.dailyBar?.o ?? last;
    const change = last - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    out.push({
      symbol: s,
      price: last,
      change: change,
      changePercent: changePct,
      volume: snap.minuteBar?.v ?? snap.dailyBar?.v ?? 0,
      high: snap.dailyBar?.h ?? null,
      low: snap.dailyBar?.l ?? null,
      lastUpdated: new Date().toISOString(),
      provider: 'alpaca',
    });
  }
  return out;
}

async function fetchAlphaVantage(symbol) {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) {
    // Return mock data if no API key
    return {
      symbol,
      price: 150 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      high: null,
      low: null,
      lastUpdated: new Date().toISOString(),
      provider: 'mock',
    };
  }
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
    symbol
  )}&apikey=${key}`;
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
    const symbolsParam = (params.symbols || 'AAPL,MSFT,NVDA,TSLA').toString();
    const symbols = symbolsParam.split(',').map((s) => s.trim()).filter(Boolean);

    let data = [];
    if (hasAlpaca()) {
      try {
        data = await fetchAlpaca(symbols);
      } catch (e) {
        console.warn('Alpaca failed, falling back to Alpha Vantage', e);
      }
    }

    if (data.length === 0) {
      const results = [];
      for (const s of symbols) {
        const q = await fetchAlphaVantage(s);
        results.push(q);
      }
      data = results;
    }

    return jsonResponse(200, { quotes: data });
  } catch (err) {
    console.error('markets/us error', err);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
