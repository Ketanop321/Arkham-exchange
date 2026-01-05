// Debug endpoint to test PlayFab API directly and return the exact error
// GET: Tests PlayFab Server/LoginWithServerCustomId and returns raw response

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
    body: JSON.stringify(body, null, 2),
  };
}

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  const TITLE_ID = process.env.PLAYFAB_TITLE_ID;
  const SECRET = process.env.PLAYFAB_SECRET_KEY;

  const diagnostic = {
    timestamp: new Date().toISOString(),
    step: 'init',
    titleIdSet: !!TITLE_ID,
    titleIdValue: TITLE_ID || 'NOT SET',
    secretKeySet: !!SECRET,
    secretKeyLength: SECRET?.length || 0,
    secretKeyPreview: SECRET ? `${SECRET.substring(0, 6)}...${SECRET.slice(-4)}` : 'NOT SET',
  };

  if (!TITLE_ID || !SECRET) {
    return jsonResponse(200, {
      ok: false,
      error: 'missing_env_vars',
      diagnostic,
      message: 'PLAYFAB_TITLE_ID or PLAYFAB_SECRET_KEY not set in Netlify environment'
    });
  }

  // Build the URL
  const url = `https://${TITLE_ID}.playfabapi.com/Server/LoginWithServerCustomId`;
  diagnostic.step = 'url_built';
  diagnostic.url = url;

  // Build the request body
  const body = {
    TitleId: TITLE_ID,
    CreateAccount: true,
    ServerCustomId: 'debug_test_user_' + Date.now(),
    InfoRequestParameters: { GetUserAccountInfo: true }
  };
  diagnostic.step = 'body_built';
  diagnostic.requestBody = body;

  // Use AbortController with 8 second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SecretKey': SECRET,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    diagnostic.step = 'fetch_complete';
    diagnostic.httpStatus = response.status;
    diagnostic.httpStatusText = response.statusText;

    const text = await response.text();
    diagnostic.step = 'text_read';
    diagnostic.rawResponseLength = text.length;

    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (parseError) {
      return jsonResponse(200, {
        ok: false,
        error: 'json_parse_error',
        diagnostic,
        rawResponse: text.substring(0, 1000),
        parseError: parseError.message
      });
    }

    diagnostic.step = 'json_parsed';

    if (response.ok) {
      return jsonResponse(200, {
        ok: true,
        message: 'PlayFab API call successful!',
        diagnostic,
        playfabResponse: {
          code: json.code,
          status: json.status,
          hasData: !!json.data || !!json.Data,
          playFabId: json.data?.PlayFabId || json.Data?.PlayFabId,
          newlyCreated: json.data?.NewlyCreated || json.Data?.NewlyCreated
        }
      });
    } else {
      return jsonResponse(200, {
        ok: false,
        error: 'playfab_api_error',
        diagnostic,
        playfabError: {
          code: json.code,
          status: json.status,
          error: json.error,
          errorCode: json.errorCode,
          errorMessage: json.errorMessage,
          errorDetails: json.errorDetails
        },
        possibleCauses: [
          'Secret Key may be invalid or expired',
          'Server API may not be enabled in PlayFab Game Manager',
          'Title ID may be incorrect',
          'The secret key may be for a different environment (live vs sandbox)'
        ],
        howToFix: [
          '1. Go to PlayFab Game Manager: https://developer.playfab.com',
          '2. Select your title (F7790)',
          '3. Go to Settings → API Features',
          '4. Enable "Allow server API access for this title"',
          '5. Go to Settings → Secret Keys and generate a new key if needed',
          '6. Update PLAYFAB_SECRET_KEY in Netlify environment variables'
        ]
      });
    }
  } catch (fetchError) {
    clearTimeout(timeoutId);
    diagnostic.step = 'fetch_error';
    
    // Check if it's a timeout/abort error
    if (fetchError.name === 'AbortError') {
      return jsonResponse(200, {
        ok: false,
        error: 'timeout_error',
        diagnostic,
        message: 'Request timed out after 8 seconds',
        possibleCauses: [
          'PlayFab API is slow or unresponsive',
          'Network latency between Netlify and PlayFab',
          'Netlify function cold start issues'
        ]
      });
    }
    
    return jsonResponse(200, {
      ok: false,
      error: 'network_error',
      diagnostic,
      errorName: fetchError.name,
      fetchError: fetchError.message,
      stack: fetchError.stack
    });
  }
}
