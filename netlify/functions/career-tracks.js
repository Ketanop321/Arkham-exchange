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

async function callOpenRouter(messages, model, temperature = 0.2) {
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
  });
  if (!r.ok) throw new Error(`OpenRouter error ${r.status}`);
  const json = await r.json();
  const content = json.choices?.[0]?.message?.content || '';
  return content;
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
      return jsonResponse(200, { userStats: { level: 1, xp: 0, nextLevelXp: 1000, totalFundsManaged: 0, totalAUM: 0, careerRank: 'Associate', specializations: [] }, careerTracks: [], dailyGoals: [], marketSimulations: [], raw: content });
    }
    return jsonResponse(200, parsed);
  } catch (e) {
    console.error('career/tracks error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
