// Netlify Serverless: DeepSeek via OpenRouter
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return jsonResponse(500, { error: 'missing_openrouter_key' });

    const body = getBody(event);
    const model = body.model || process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
    const messages = Array.isArray(body.messages) ? body.messages : [{ role: 'user', content: String(body.prompt || '') }];
    const temperature = typeof body.temperature === 'number' ? body.temperature : 0.5;

    const headers = {
      Authorization: `Bearer ${apiKey}`,
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
      return jsonResponse(r.status, { error: 'openrouter_error', detail: errTxt });
    }
    const data = await r.json();
    return jsonResponse(200, data);
  } catch (e) {
    console.error('ai/deepseek error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
