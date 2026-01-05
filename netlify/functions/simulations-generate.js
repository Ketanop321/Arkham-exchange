// Netlify Serverless: Generate simulation scenarios using AI + live market data
// GET: ?track=hedge-fund|venture-capital|...&mode=solo|multiplayer

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

async function readJson(res) {
  const t = await res.text();
  try { return JSON.parse(t); } catch { return null; }
}

function originFromEvent(event) {
  const headers = event.headers || {};
  const proto = headers['x-forwarded-proto'] || 'https';
  const host = headers['x-forwarded-host'] || headers.host || 'localhost:8888';
  return `${proto}://${host}`;
}

async function safeFetchJson(url) {
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    return await readJson(r);
  } catch (_) {
    return null;
  }
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const params = event.queryStringParameters || {};
    const track = (params.track || 'hedge-fund').toString();
    const mode = (params.mode || 'solo').toString();
    const origin = originFromEvent(event);

    // Pull live signals from internal APIs
    const [news, crypto, us] = await Promise.all([
      safeFetchJson(`${origin}/.netlify/functions/news?q=${encodeURIComponent('markets finance crypto')}&limit=8`),
      safeFetchJson(`${origin}/.netlify/functions/crypto-quotes?ids=bitcoin,ethereum,solana&vs_currency=usd`),
      safeFetchJson(`${origin}/.netlify/functions/markets-us?symbols=AAPL,MSFT,NVDA,TSLA`),
    ]);

    const signals = {
      headlines: (news?.articles || []).slice(0, 6).map(a => ({ title: a.title, source: a.source })),
      crypto: (crypto?.coins || []).slice(0, 3).map(c => ({ id: c.id, price: c.price, change24hPct: c.change24hPct })),
      equities: (us?.quotes || []).slice(0, 4),
    };

    // Track-specific context
    const trackContexts = {
      'hedge-fund': 'Focus on hedge fund strategies: long/short equity, market-neutral, quantitative analysis, risk management.',
      'venture-capital': 'Focus on VC: sourcing deals, due diligence, term sheets, startup valuation.',
      'real-estate': 'Focus on real estate: property valuation, REITs, cap rates, leverage.',
      'investment-bank': 'Focus on IB: M&A advisory, IPO underwriting, DCF valuation.',
      'private-equity': 'Focus on PE: LBO modeling, operational improvements, exit strategies.',
      'mutual-fund': 'Focus on mutual funds: asset allocation, benchmark tracking, compliance.',
      'movie-music': 'Focus on entertainment: box office prediction, streaming revenue, artist momentum.',
    };
    const trackContext = trackContexts[track] || 'General finance simulation.';

    // Call AI via internal endpoint
    const prompt = [
      { role: 'system', content: 'You are a simulation designer for a finance training platform. Output STRICT JSON only. No markdown.' },
      { role: 'user', content: `Build a ${mode} simulation for track "${track}".
${trackContext}

Live market signals:
${JSON.stringify(signals)}

Return JSON:
{
  "scenario": {
    "title": string,
    "summary": string,
    "macro": string[],
    "duration": string,
    "difficulty": "Beginner"|"Intermediate"|"Advanced"|"Expert"
  },
  "tasks": [
    {"id": string, "title": string, "description": string, "successCriteria": string[], "weight": number}
  ],
  "metrics": {"aumTarget": number, "maxDrawdown": number, "sharpeMin": number},
  "constraints": string[],
  "subquests": ${mode === 'multiplayer' ? '[{"role": string, "taskId": string, "hint": string}]' : '[]'},
  "sources": {"news": string[], "notes": string}
}

For multiplayer, create 3-5 subquests with roles like Analyst, Risk Manager, Portfolio Manager.
JSON only.` }
    ];

    const aiRes = await fetch(`${origin}/.netlify/functions/ai-deepseek`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: prompt, temperature: 0.3 }),
    });
    
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('[simulations-generate] AI error:', errText);
      return jsonResponse(aiRes.status, { error: 'ai_error', detail: errText });
    }
    
    const ai = await aiRes.json();
    const content = ai?.choices?.[0]?.message?.content || '';

    // Parse JSON
    let parsed = null;
    try { parsed = JSON.parse(content); } catch (_) {
      const first = content.indexOf('{');
      const last = content.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        try { parsed = JSON.parse(content.slice(first, last + 1)); } catch {}
      }
    }

    if (!parsed) {
      console.error('[simulations-generate] Parse failed:', content.substring(0, 500));
      return jsonResponse(500, { error: 'ai_parse_error' });
    }

    parsed.sources = parsed.sources || {};
    parsed.sources.news = parsed.sources.news || signals.headlines.map(h => h.title);
    return jsonResponse(200, parsed);
  } catch (e) {
    console.error('[simulations-generate] Error:', e.message);
    return jsonResponse(500, { error: 'internal_error', message: e.message });
  }
}
