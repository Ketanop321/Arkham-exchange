// Netlify Serverless: AI via Groq (ultra-fast inference)
// POST body: { messages: [{role, content}], model?: string, temperature?: number }
// Returns OpenAI-style { id, choices: [{ message: { role, content } }], ... }

function getBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

    // Use Groq API (primary) or fall back to OpenRouter
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!groqKey && !openrouterKey) {
      return jsonResponse(500, { error: 'missing_api_key' });
    }

    const body = getBody(event);
    const messages = Array.isArray(body.messages) ? body.messages : [{ role: 'user', content: String(body.prompt || '') }];
    const temperature = typeof body.temperature === 'number' ? body.temperature : 0.5;

    // Try Groq first (faster), fall back to OpenRouter
    if (groqKey) {
      const groqModel = body.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: groqModel, messages, temperature }),
      });
      if (r.ok) {
        const data = await r.json();
        return jsonResponse(200, data);
      }
      console.warn('Groq API failed, trying OpenRouter fallback');
    }

    // Fallback to OpenRouter
    if (openrouterKey) {
      const model = body.model || process.env.OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free';
      const headers = {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
      };
      if (process.env.SITE_URL) headers['HTTP-Referer'] = process.env.SITE_URL;
      if (process.env.SITE_NAME) headers['X-Title'] = process.env.SITE_NAME;

      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ model, messages, temperature }),
      });
      if (!r.ok) {
        const errTxt = await r.text().catch(() => '');
        return jsonResponse(r.status, { error: 'ai_api_error', detail: errTxt });
      }
      const data = await r.json();
      return jsonResponse(200, data);
    }

    return jsonResponse(500, { error: 'no_ai_provider_available' });
  } catch (e) {
    console.error('ai/deepseek error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
