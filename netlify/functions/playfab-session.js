// Netlify Serverless: PlayFab session initialization
// POST: Creates or retrieves session, sets pfid cookie
import { corsHeaders, jsonResponse, optionsResponse, getPfidFromCookie, setPfidCookie, clientLoginWithCustomId, assertPlayFabEnv } from './_utils/playfab.js';

function generateCustomId() {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Generate a local fallback session ID when PlayFab is unavailable
function generateLocalSession() {
  return 'local_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
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

    // Check for existing pfid in cookie
    let pfid = getPfidFromCookie(event);
    console.log('[playfab-session] Existing pfid from cookie:', pfid || 'none');
    
    if (pfid) {
      console.log('[playfab-session] Returning existing session');
      return jsonResponse(200, { ok: true, pfid, existing: true });
    }

    // Try PlayFab, but fall back to local session if it fails
    try {
      console.log('[playfab-session] Asserting PlayFab env...');
      assertPlayFabEnv();
      console.log('[playfab-session] PlayFab env OK');

      // Create new session with custom ID using Client API (faster, no secret needed)
      const customId = generateCustomId();
      console.log('[playfab-session] Creating new session with customId:', customId);
      
      const result = await clientLoginWithCustomId(customId, true);
      console.log('[playfab-session] Login result:', { ok: result.ok, status: result.status });
      
      if (result.ok) {
        pfid = result.json?.data?.PlayFabId || result.json?.Data?.PlayFabId;
        console.log('[playfab-session] Got PlayFabId:', pfid);
      }
    } catch (playfabError) {
      console.warn('[playfab-session] PlayFab failed, using local session:', playfabError.message);
    }
    
    // Fallback to local session if PlayFab didn't work
    if (!pfid) {
      pfid = generateLocalSession();
      console.log('[playfab-session] Using local fallback session:', pfid);
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
      body: JSON.stringify({ ok: true, pfid, existing: false, local: pfid.startsWith('local_') }),
    };
  } catch (e) {
    console.error('[playfab-session] Exception:', e.message, e.stack);
    // Even on error, return a local session so the app works
    const localPfid = generateLocalSession();
    const cookieHeader = setPfidCookie(localPfid);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
        ...cookieHeader,
      },
      body: JSON.stringify({ ok: true, pfid: localPfid, existing: false, local: true, fallback: true }),
    };
  }
}
