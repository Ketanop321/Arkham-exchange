// Netlify Serverless: Generate simulation scenarios using live news + market data + AI
// GET: ?track=hedge-fund|venture-capital|real-estate|investment-bank|private-equity|mutual-fund|movie-music&mode=solo|multiplayer

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) return null;
    return await readJson(r);
  } catch (_) {
    clearTimeout(timeout);
    return null;
  }
}

// Fallback simulation data
function getFallbackSimulation(track, mode, signals) {
  const headlines = signals?.headlines || [];
  return {
    scenario: {
      title: `${track.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} Market Challenge`,
      summary: 'Navigate current market conditions and build a winning strategy',
      macro: ['Market volatility elevated', 'Interest rate uncertainty', 'Tech sector momentum'],
      duration: '3 days',
      difficulty: 'Intermediate'
    },
    tasks: [
      { id: 'task-1', title: 'Market Analysis', description: 'Analyze current market conditions and identify opportunities', successCriteria: ['Complete sector analysis', 'Identify 3 potential trades'], weight: 25 },
      { id: 'task-2', title: 'Portfolio Construction', description: 'Build an initial portfolio with proper diversification', successCriteria: ['Deploy 80% of capital', 'No position > 20%'], weight: 35 },
      { id: 'task-3', title: 'Risk Management', description: 'Set stop losses and define risk parameters', successCriteria: ['Set max drawdown limits', 'Define position sizing'], weight: 25 },
      { id: 'task-4', title: 'Performance Review', description: 'Track and document portfolio performance', successCriteria: ['Daily P&L tracking', 'Weekly report'], weight: 15 }
    ],
    metrics: { aumTarget: 1000000, maxDrawdown: -0.12, sharpeMin: 1.2 },
    constraints: ['Maximum 20% in single position', 'Maintain 10% cash reserve', 'No leverage above 1.5x'],
    subquests: mode === 'multiplayer' ? [
      { role: 'Lead Analyst', taskId: 'task-1', hint: 'Focus on macro trends and sector rotation' },
      { role: 'Portfolio Manager', taskId: 'task-2', hint: 'Balance growth and value exposure' },
      { role: 'Risk Officer', taskId: 'task-3', hint: 'Model tail risk scenarios' },
      { role: 'Trader', taskId: 'task-4', hint: 'Optimize execution timing' }
    ] : [],
    sources: { news: headlines.map(h => h.title).slice(0, 5), notes: 'Live market data with fallback scenario.' }
  };
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

    // Pull live signals from your own APIs
    const [news, crypto, us] = await Promise.all([
      safeFetchJson(`${origin}/.netlify/functions/news?q=${encodeURIComponent('markets OR technology OR crypto OR real estate OR venture capital OR movies OR music')}&limit=12`),
      safeFetchJson(`${origin}/.netlify/functions/crypto-quotes?ids=bitcoin,ethereum,solana&vs_currency=usd`),
      safeFetchJson(`${origin}/.netlify/functions/markets-us?symbols=AAPL,MSFT,NVDA,TSLA`),
    ]);

    const signals = {
      headlines: (news?.articles || []).slice(0, 8).map((a) => ({ title: a.title, source: a.source, publishedAt: a.publishedAt })),
      crypto: (crypto?.coins || []).slice(0, 3).map((c) => ({ id: c.id, price: c.price, change24hPct: c.change24hPct })),
      equities: (us?.quotes || []).slice(0, 4),
    };

    // Build track-specific context
    let trackContext = '';
    switch (track) {
      case 'hedge-fund':
        trackContext = 'Focus on hedge fund strategies: long/short equity, market-neutral, momentum, quantitative analysis, risk management, and portfolio optimization.';
        break;
      case 'venture-capital':
        trackContext = 'Focus on venture capital: sourcing deals, analyzing pitch decks, due diligence, term sheets, startup valuation, crisis management, and board governance.';
        break;
      case 'real-estate':
        trackContext = 'Focus on real estate investment: property valuation, REITs, commercial vs residential, cap rates, leverage, and market cycles.';
        break;
      case 'investment-bank':
        trackContext = 'Focus on investment banking: M&A advisory, IPO underwriting, DCF valuation, deal structuring, and client presentations.';
        break;
      case 'private-equity':
        trackContext = 'Focus on private equity: LBO modeling, operational improvements, exit strategies, fund structure, and portfolio company management.';
        break;
      case 'mutual-fund':
        trackContext = 'Focus on mutual fund management: asset allocation, benchmark tracking, expense ratios, investor reporting, and regulatory compliance.';
        break;
      case 'movie-music':
        trackContext = 'Focus on entertainment investments: box office prediction, streaming revenue models, artist momentum, catalog valuation, and production financing.';
        break;
      default:
        trackContext = 'General finance simulation covering multiple asset classes and investment strategies.';
    }

    // Ask the local AI router to synthesize a scenario JSON
    const prompt = [
      { role: 'system', content: 'You are a simulation designer for a finance training platform. Output STRICT JSON only. No markdown, no code fences.' },
      { role: 'user', content: `Build a ${mode} simulation for track "${track}".
${trackContext}

Use these real-time signals to make the scenario feel connected to current events:
${JSON.stringify(signals)}

Return JSON with keys:
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

For multiplayer mode, create 3-5 subquests where each team member has a specific role (e.g., Analyst, Risk Manager, Portfolio Manager, Trader, Compliance Officer).
Ensure strings are plain JSON (no markdown).` }
    ];

    const r = await fetch(`${origin}/.netlify/functions/ai-deepseek`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: prompt, temperature: 0.3 }),
    });
    if (!r.ok) return jsonResponse(r.status, { error: 'ai_error' });
    const ai = await r.json();
    const content = ai?.choices?.[0]?.message?.content || '';

    // Try to parse JSON from the AI content
    let parsed = null;
    try { parsed = JSON.parse(content); } catch (_) {
      const first = content.indexOf('{');
      const last = content.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        try { parsed = JSON.parse(content.slice(first, last + 1)); } catch {}
      }
    }

    if (!parsed) {
      return jsonResponse(200, {
        scenario: { title: `${track} Market Scenario`, summary: 'Fallback scenario based on current market conditions', macro: ['Market volatility', 'Interest rate uncertainty'], duration: '3 days', difficulty: 'Intermediate' },
        tasks: [
          { id: 'task-1', title: 'Analyze Market Conditions', description: 'Review current headlines and market data', successCriteria: ['Complete analysis'], weight: 30 },
          { id: 'task-2', title: 'Build Position', description: 'Construct an initial portfolio position', successCriteria: ['Deploy at least 50% of capital'], weight: 40 },
          { id: 'task-3', title: 'Risk Assessment', description: 'Evaluate downside scenarios', successCriteria: ['Document max drawdown scenarios'], weight: 30 }
        ],
        metrics: { aumTarget: 1000000, maxDrawdown: -0.15, sharpeMin: 1.0 },
        constraints: ['Maximum 20% in single position', 'Must maintain 10% cash reserve'],
        subquests: mode === 'multiplayer' ? [
          { role: 'Analyst', taskId: 'task-1', hint: 'Focus on fundamental research' },
          { role: 'Portfolio Manager', taskId: 'task-2', hint: 'Balance risk and return' },
          { role: 'Risk Manager', taskId: 'task-3', hint: 'Model worst-case scenarios' }
        ] : [],
        sources: { news: signals.headlines.map((h) => h.title), notes: 'AI fallback with live market data.' }
      });
    }

    parsed.sources = parsed.sources || {};
    parsed.sources.news = parsed.sources.news || signals.headlines.map((h) => h.title);
    return jsonResponse(200, parsed);
  } catch (e) {
    console.error('[simulations-generate] Error:', e.message);
    // Return fallback on any error
    const params = event.queryStringParameters || {};
    const track = (params.track || 'hedge-fund').toString();
    const mode = (params.mode || 'solo').toString();
    return jsonResponse(200, getFallbackSimulation(track, mode, { headlines: [] }));
  }
}
