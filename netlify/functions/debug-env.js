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
      value: process.env.PLAYFAB_TITLE_ID || null,
    },
    PLAYFAB_SECRET_KEY: {
      set: !!process.env.PLAYFAB_SECRET_KEY,
      length: process.env.PLAYFAB_SECRET_KEY?.length || 0,
      preview: process.env.PLAYFAB_SECRET_KEY ? `${process.env.PLAYFAB_SECRET_KEY.substring(0, 4)}...${process.env.PLAYFAB_SECRET_KEY.slice(-4)}` : null,
    },
    OPENROUTER_API_KEY: {
      set: !!process.env.OPENROUTER_API_KEY,
      length: process.env.OPENROUTER_API_KEY?.length || 0,
    },
    OPENROUTER_MODEL: {
      set: !!process.env.OPENROUTER_MODEL,
      value: process.env.OPENROUTER_MODEL || null,
    },
    ALPACA_API_KEY: {
      set: !!process.env.ALPACA_API_KEY,
      length: process.env.ALPACA_API_KEY?.length || 0,
    },
    ALPHAVANTAGE_API_KEY: {
      set: !!process.env.ALPHAVANTAGE_API_KEY,
      length: process.env.ALPHAVANTAGE_API_KEY?.length || 0,
    },
    GNEWS_API_KEY: {
      set: !!process.env.GNEWS_API_KEY,
      length: process.env.GNEWS_API_KEY?.length || 0,
    },
    MARKETAUX_API_TOKEN: {
      set: !!process.env.MARKETAUX_API_TOKEN,
      length: process.env.MARKETAUX_API_TOKEN?.length || 0,
    },
    TMDB_API_KEY: {
      set: !!process.env.TMDB_API_KEY,
      length: process.env.TMDB_API_KEY?.length || 0,
    },
  };

  const allSet = Object.values(envVars).every(v => v.set);

  return jsonResponse(200, {
    ok: allSet,
    timestamp: new Date().toISOString(),
    envVars,
    nodeVersion: process.version,
  });
}
