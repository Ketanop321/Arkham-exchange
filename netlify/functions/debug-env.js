// Debug endpoint to check if environment variables are set
// GET: Returns status of all required env vars (without exposing secrets)

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

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  const envVars = {
    PLAYFAB_TITLE_ID: {
      set: !!process.env.PLAYFAB_TITLE_ID,
      value: process.env.PLAYFAB_TITLE_ID || 'NOT SET',
    },
    PLAYFAB_SECRET_KEY: {
      set: !!process.env.PLAYFAB_SECRET_KEY,
      length: process.env.PLAYFAB_SECRET_KEY?.length || 0,
      preview: process.env.PLAYFAB_SECRET_KEY 
        ? `${process.env.PLAYFAB_SECRET_KEY.substring(0, 6)}...${process.env.PLAYFAB_SECRET_KEY.slice(-4)}` 
        : 'NOT SET',
    },
    GROQ_API_KEY: {
      set: !!process.env.GROQ_API_KEY,
      length: process.env.GROQ_API_KEY?.length || 0,
      preview: process.env.GROQ_API_KEY
        ? `${process.env.GROQ_API_KEY.substring(0, 10)}...`
        : 'NOT SET',
    },
    GROQ_MODEL: {
      set: !!process.env.GROQ_MODEL,
      value: process.env.GROQ_MODEL || 'NOT SET (will use openai/gpt-oss-120b)',
    },
    OPENROUTER_API_KEY: {
      set: !!process.env.OPENROUTER_API_KEY,
      length: process.env.OPENROUTER_API_KEY?.length || 0,
      preview: process.env.OPENROUTER_API_KEY
        ? `${process.env.OPENROUTER_API_KEY.substring(0, 10)}...`
        : 'NOT SET (fallback only)',
    },
    OPENROUTER_MODEL: {
      set: !!process.env.OPENROUTER_MODEL,
      value: process.env.OPENROUTER_MODEL || 'NOT SET (xiaomi/mimo-v2-flash:free as fallback)',
    },
    ALPACA_API_KEY: {
      set: !!process.env.ALPACA_API_KEY,
    },
    ALPHAVANTAGE_API_KEY: {
      set: !!process.env.ALPHAVANTAGE_API_KEY,
    },
    GNEWS_API_KEY: {
      set: !!process.env.GNEWS_API_KEY,
    },
    MARKETAUX_API_TOKEN: {
      set: !!process.env.MARKETAUX_API_TOKEN,
    },
    TMDB_API_KEY: {
      set: !!process.env.TMDB_API_KEY,
    },
  };

  const criticalMissing = [];
  if (!process.env.PLAYFAB_TITLE_ID) criticalMissing.push('PLAYFAB_TITLE_ID');
  if (!process.env.PLAYFAB_SECRET_KEY) criticalMissing.push('PLAYFAB_SECRET_KEY');
  if (!process.env.GROQ_API_KEY && !process.env.OPENROUTER_API_KEY) criticalMissing.push('GROQ_API_KEY or OPENROUTER_API_KEY');

  return jsonResponse(200, {
    ok: criticalMissing.length === 0,
    criticalMissing,
    message: criticalMissing.length > 0 
      ? `CRITICAL: Add these env vars in Netlify Dashboard > Site Settings > Environment Variables: ${criticalMissing.join(', ')}`
      : 'All critical env vars are set! Using Groq API for ultra-fast AI inference.',
    timestamp: new Date().toISOString(),
    envVars,
  });
}
