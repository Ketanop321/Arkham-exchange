// Netlify Serverless: Career tracks via DeepSeek (OpenRouter)
// GET params: level?, focus?
// Returns structured JSON for GameProgress: { userStats, careerTracks, dailyGoals, marketSimulations }

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

// Fallback data when AI times out
function getFallbackData(level) {
  return {
    userStats: {
      level: level === 'Advanced' ? 10 : level === 'Intermediate' ? 5 : 1,
      xp: 2500,
      nextLevelXp: 5000,
      totalFundsManaged: 1500000,
      totalAUM: 5000000,
      careerRank: level === 'Advanced' ? 'Senior Analyst' : level === 'Intermediate' ? 'Junior Analyst' : 'Trainee',
      specializations: ['Equity Analysis', 'Risk Management']
    },
    careerTracks: [
      {
        id: 'hedge-fund',
        title: 'Hedge Fund Manager',
        description: 'Master quantitative strategies and alternative investments',
        progress: 35,
        modules: [
          { id: 'quant-basics', title: 'Quantitative Basics', completed: true },
          { id: 'alpha-generation', title: 'Alpha Generation', completed: false },
          { id: 'risk-parity', title: 'Risk Parity Strategies', completed: false }
        ]
      },
      {
        id: 'investment-bank',
        title: 'Investment Banking',
        description: 'Learn M&A, capital markets, and deal structuring',
        progress: 20,
        modules: [
          { id: 'valuation', title: 'Company Valuation', completed: true },
          { id: 'dcf-modeling', title: 'DCF Modeling', completed: false },
          { id: 'deal-execution', title: 'Deal Execution', completed: false }
        ]
      },
      {
        id: 'venture-capital',
        title: 'Venture Capital',
        description: 'Evaluate startups and early-stage investments',
        progress: 15,
        modules: [
          { id: 'startup-eval', title: 'Startup Evaluation', completed: false },
          { id: 'term-sheets', title: 'Term Sheets', completed: false },
          { id: 'portfolio-mgmt', title: 'Portfolio Management', completed: false }
        ]
      },
      {
        id: 'movie-music',
        title: 'Movie & Music Investments',
        description: 'Analyze entertainment industry investments',
        progress: 0,
        modules: [
          { id: 'box-office', title: 'Box Office Analysis', completed: false },
          { id: 'music-royalties', title: 'Music Royalties', completed: false },
          { id: 'content-valuation', title: 'Content Valuation', completed: false }
        ]
      }
    ],
    dailyGoals: [
      { id: 'g1', title: 'Analyze a stock', description: 'Review fundamentals of any equity', xp: 50, completed: false },
      { id: 'g2', title: 'Check crypto prices', description: 'Monitor BTC, ETH, SOL', xp: 25, completed: false },
      { id: 'g3', title: 'Read market news', description: 'Stay updated on financial news', xp: 30, completed: false }
    ],
    marketSimulations: [
      { id: 'sim1', title: 'Market Crash Scenario', difficulty: 'Hard', participants: 150, reward: 500 },
      { id: 'sim2', title: 'Bull Run Strategy', difficulty: 'Medium', participants: 230, reward: 300 }
    ]
  };
}

async function callOpenRouter(messages, model, temperature = 0.2) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    };
    if (process.env.SITE_URL) headers['HTTP-Referer'] = process.env.SITE_URL;
    if (process.env.SITE_NAME) headers['X-Title'] = process.env.SITE_NAME;

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: model || process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free', messages, temperature }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!r.ok) throw new Error(`OpenRouter error ${r.status}`);
    const json = await r.json();
    const content = json.choices?.[0]?.message?.content || '';
    return content;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    // Try to extract JSON block
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const sub = text.slice(first, last + 1);
      try { return JSON.parse(sub); } catch (_) {}
    }
    return null;
  }
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const params = event.queryStringParameters || {};
    const level = (params.level || 'Intermediate').toString();
    const focus = (params.focus || 'hedge-fund,investment-bank,real-estate,venture-capital,private-equity,mutual-fund,movie-music').toString();

    const system = {
      role: 'system',
      content: 'You are an expert career designer for finance professionals. Output strictly valid JSON only.'
    };
    const user = {
      role: 'user',
      content: `Design career data for a finance learning app. LEVEL=${level}. FOCUS=${focus}. You may use external context like OpenCorporates (companies), TMDB (movies), and MusicBrainz (artists) when relevant to modules. Return JSON with exactly these keys:
{
  "userStats": {
    "level": number,
    "xp": number,
    "nextLevelXp": number,
    "totalFundsManaged": number,
    "totalAUM": number,
    "careerRank": string,
    "specializations": string[]
  },
  "careerTracks": [
    {
      "id": string,
      "name": string,
      "description": string,
      "fundType": "hedge-fund"|"investment-bank"|"real-estate"|"venture-capital"|"private-equity"|"mutual-fund"|"movie-music",
      "difficulty": "Beginner"|"Intermediate"|"Advanced"|"Expert",
      "duration": string,
      "startingCapital": number,
      "targetCapital": number,
      "currentProgress": number,
      "modules": [ {"id": string, "name": string, "description": string, "completed": boolean, "locked": boolean, "estimatedTime": string } ],
      "achievements": string[],
      "skills": string[]
    }
  ],
  "dailyGoals": [ {"id": string, "title": string, "description": string, "type": "learning"|"trading"|"research"|"networking", "progress": number, "target": number, "reward": {"xp": number, "badge"?: string}, "dueDate": string } ],
  "marketSimulations": [ {"id": string, "name": string, "description": string, "scenario": string, "difficulty": string, "duration": string, "participants": number, "status": "upcoming"|"active"|"completed", "startDate": string, "endDate": string, "rewards": {"winner": string, "participation": string} } ]
}
Ensure numbers are realistic and strings ISO-8601 for dates. Do NOT include Markdown or code fences. JSON only.`
    };

    const content = await callOpenRouter([system, user]);
    const parsed = tryParseJSON(content);
    if (!parsed) {
      console.log('[career-tracks] AI returned unparseable content, using fallback');
      return jsonResponse(200, getFallbackData(level));
    }
    return jsonResponse(200, parsed);
  } catch (e) {
    console.error('[career-tracks] Error:', e.message);
    // Return fallback data on any error (including timeout)
    const params = event.queryStringParameters || {};
    const level = (params.level || 'Intermediate').toString();
    return jsonResponse(200, getFallbackData(level));
  }
}
