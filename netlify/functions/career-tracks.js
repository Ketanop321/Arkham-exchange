// Netlify Serverless: Career tracks via AI (Groq primary, OpenRouter fallback)
// GET params: level?, focus?
// Returns structured JSON for GameProgress

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

async function callAI(messages, model, temperature = 0.2) {
  // Try Groq first (faster)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: groqModel, messages, temperature }),
      });
      if (r.ok) {
        const json = await r.json();
        return json.choices?.[0]?.message?.content || '';
      }
      console.warn('[career-tracks] Groq failed, trying OpenRouter fallback');
    } catch (e) {
      console.warn('[career-tracks] Groq error:', e.message);
    }
  }

  // Fallback to OpenRouter
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No AI API key available (GROQ_API_KEY or OPENROUTER_API_KEY)');
  
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (process.env.SITE_URL) headers['HTTP-Referer'] = process.env.SITE_URL;
  if (process.env.SITE_NAME) headers['X-Title'] = process.env.SITE_NAME;

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      model: model || process.env.OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free', 
      messages, 
      temperature 
    }),
  });
  
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`AI API error ${r.status}: ${text}`);
  }
  
  const json = await r.json();
  return json.choices?.[0]?.message?.content || '';
}

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      try { return JSON.parse(text.slice(first, last + 1)); } catch (_) {}
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
      content: 'You are an expert career designer for finance professionals. Output strictly valid JSON only. No markdown, no code fences.'
    };
    const user = {
      role: 'user',
      content: `Design career data for a finance learning app. LEVEL=${level}. FOCUS=${focus}. Return JSON with exactly these keys:
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
Ensure numbers are realistic and strings ISO-8601 for dates. JSON only.`
    };

    console.log('[career-tracks] Calling Groq AI...');
    const content = await callAI([system, user]);
    console.log('[career-tracks] Got response, parsing...');
    
    const parsed = tryParseJSON(content);
    if (!parsed) {
      console.error('[career-tracks] Failed to parse AI response:', content.substring(0, 500));
      return jsonResponse(500, { error: 'ai_parse_error', raw: content.substring(0, 500) });
    }
    
    return jsonResponse(200, parsed);
  } catch (e) {
    console.error('[career-tracks] Error:', e.message);
    return jsonResponse(500, { error: 'ai_error', message: e.message });
  }
}
