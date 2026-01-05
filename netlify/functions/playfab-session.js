// Netlify Serverless: PlayFab session initialization
// POST: Creates or retrieves session, sets pfid cookie
import { corsHeaders, jsonResponse, optionsResponse, getPfidFromCookie, setPfidCookie, serverLoginWithServerCustomId, assertPlayFabEnv } from './_utils/playfab.js';

function generateCustomId() {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export async function handler(event, context) {
  console.log('[playfab-session] Handler invoked', { 
    method: event.httpMethod,
    headers: event.headers,
    hasCookie: !!event.headers?.cookie
  });
  
  try {
    if (event.httpMethod === 'OPTIONS') {
      console.log('[playfab-session] Returning OPTIONS response');
      return optionsResponse('POST, OPTIONS');
    }
    if (event.httpMethod !== 'POST') {
      console.log('[playfab-session] Method not allowed:', event.httpMethod);
      return jsonResponse(405, { error: 'method_not_allowed' });
    }

    console.log('[playfab-session] Asserting PlayFab env...');
    assertPlayFabEnv();
    console.log('[playfab-session] PlayFab env OK');

    // Check for existing pfid in cookie
    let pfid = getPfidFromCookie(event);
    console.log('[playfab-session] Existing pfid from cookie:', pfid || 'none');
    
    if (pfid) {
      console.log('[playfab-session] Returning existing session');
      return jsonResponse(200, { ok: true, pfid, existing: true });
    }

    // Create new session with custom ID
    const customId = generateCustomId();
    console.log('[playfab-session] Creating new session with customId:', customId);
    
    const result = await serverLoginWithServerCustomId(customId, true);
    console.log('[playfab-session] Login result:', { ok: result.ok, status: result.status, json: result.json });
    
    if (!result.ok) {
      console.error('[playfab-session] PlayFab login failed:', result.json);
      return jsonResponse(result.status, { error: 'playfab_login_failed', detail: result.json });
    }

    pfid = result.json?.data?.PlayFabId || result.json?.Data?.PlayFabId;
    console.log('[playfab-session] Got PlayFabId:', pfid);
    
    if (!pfid) {
      console.error('[playfab-session] No PlayFabId in response');
      return jsonResponse(500, { error: 'no_playfab_id_returned', fullResponse: result.json });
    }

    // Set cookie for future requests
    const cookieHeader = setPfidCookie(pfid);
    console.log('[playfab-session] Setting cookie:', cookieHeader);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
        ...cookieHeader,
      },
      body: JSON.stringify({ ok: true, pfid, existing: false }),
    };
  } catch (e) {
    console.error('[playfab-session] Exception:', e.message, e.stack);
    return jsonResponse(500, { error: 'internal_error', message: e.message, stack: e.stack });
  }
}
