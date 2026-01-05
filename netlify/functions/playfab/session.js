// Netlify Serverless: PlayFab session initialization
// POST: Creates or retrieves session, sets pfid cookie
import { corsHeaders, jsonResponse, optionsResponse, getPfidFromCookie, setPfidCookie, serverLoginWithServerCustomId, assertPlayFabEnv } from '../_utils/playfab.js';

function generateCustomId() {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('POST, OPTIONS');
    if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

    assertPlayFabEnv();

    // Check for existing pfid in cookie
    let pfid = getPfidFromCookie(event);
    
    if (pfid) {
      // Already have session
      return jsonResponse(200, { ok: true, pfid, existing: true });
    }

    // Create new session with custom ID
    const customId = generateCustomId();
    const result = await serverLoginWithServerCustomId(customId, true);
    
    if (!result.ok) {
      console.error('PlayFab login failed:', result.json);
      return jsonResponse(result.status, { error: 'playfab_login_failed', detail: result.json });
    }

    pfid = result.json?.data?.PlayFabId;
    if (!pfid) {
      return jsonResponse(500, { error: 'no_playfab_id_returned' });
    }

    // Set cookie for future requests
    const cookieHeader = setPfidCookie(pfid);

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
    console.error('playfab/session error', e);
    return jsonResponse(500, { error: 'internal_error', message: e.message });
  }
}
