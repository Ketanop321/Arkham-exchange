// Netlify Serverless: Social feed via AI (OpenRouter)
// GET: Returns { users, posts, leaderboard }

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');
  
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
    throw new Error(`OpenRouter error ${r.status}: ${text}`);
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

function ensureArray(a) {
  return Array.isArray(a) ? a : [];
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const system = {
      role: 'system',
      content: 'You are a data generator for a social trading network. Output strictly valid JSON only. No markdown.'
    };
    const user = {
      role: 'user',
      content: `Generate social trading data with this schema:
{
  "users": [
    {
      "id": string,
      "username": string,
      "displayName": string,
      "avatar": string (use placeholder like https://api.dicebear.com/7.x/avataaars/svg?seed=USER_ID),
      "bio": string,
      "verified": boolean,
      "reputation": { "score": number, "rank": string, "badges": string[], "level": number },
      "stats": { "followers": number, "following": number, "totalReturn": number, "winRate": number, "portfolios": number, "copiers": number }
    }
  ],
  "posts": [
    {
      "id": string,
      "authorId": string (must match a user id),
      "content": string,
      "type": "text"|"portfolio-share"|"trade-alert"|"achievement",
      "timestamp": string (ISO-8601),
      "engagement": { "likes": number, "comments": number, "shares": number, "hasLiked": boolean },
      "trade"?: { "symbol": string, "action": "buy"|"sell", "price": number, "quantity": number }
    }
  ],
  "leaderboard": [ { "rank": number, "userId": string, "metric": number, "change": number } ]
}
Generate 3-4 users, 3-4 posts, 3 leaderboard entries. Realistic finance content. JSON only.`
    };

    console.log('[social-feed] Calling OpenRouter...');
    const content = await callOpenRouter([system, user]);
    console.log('[social-feed] Got response, parsing...');
    
    const parsed = tryParseJSON(content);
    if (!parsed) {
      console.error('[social-feed] Failed to parse:', content.substring(0, 500));
      return jsonResponse(500, { error: 'ai_parse_error' });
    }

    // Map authors to posts
    const users = ensureArray(parsed.users);
    const byId = new Map(users.map(u => [u.id, u]));
    
    const posts = ensureArray(parsed.posts).map(p => ({
      ...p,
      author: byId.get(p.authorId) || users[0] || null
    })).filter(p => p.author);

    const leaderboard = ensureArray(parsed.leaderboard).map(e => ({
      ...e,
      user: byId.get(e.userId) || users[0] || null
    })).filter(e => e.user);

    return jsonResponse(200, { users, posts, leaderboard });
  } catch (e) {
    console.error('[social-feed] Error:', e.message);
    return jsonResponse(500, { error: 'ai_error', message: e.message });
  }
}
