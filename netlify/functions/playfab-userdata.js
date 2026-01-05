// Netlify Serverless: PlayFab user data operations
// GET: Fetch user data by keys
// POST: Update user data
import { corsHeaders, jsonResponse, optionsResponse, getBody, getPfidFromCookie, serverGetUserData, serverUpdateUserData, assertPlayFabEnv } from './_utils/playfab.js';

// In-memory storage for local sessions (for demo purposes)
const localStore = new Map();

export async function handler(event, context) {
  console.log('[playfab-userdata] Handler invoked', { method: event.httpMethod });
  
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('GET, POST, OPTIONS');

    const pfid = getPfidFromCookie(event);
    console.log('[playfab-userdata] pfid from cookie:', pfid || 'none');
    
    if (!pfid) {
      return jsonResponse(401, { error: 'no_player_session' });
    }

    // Handle local sessions with in-memory storage
    if (pfid.startsWith('local_')) {
      if (event.httpMethod === 'GET') {
        const data = localStore.get(pfid) || {};
        return jsonResponse(200, { ok: true, data, local: true });
      }
      if (event.httpMethod === 'POST') {
        const body = getBody(event);
        const dataObj = body?.data || body;
        const existing = localStore.get(pfid) || {};
        localStore.set(pfid, { ...existing, ...dataObj });
        return jsonResponse(200, { ok: true, local: true });
      }
    }

    // Try PlayFab for non-local sessions
    try {
      assertPlayFabEnv();

      if (event.httpMethod === 'GET') {
        const params = event.queryStringParameters || {};
        const keysParam = (params.keys || '').toString();
        const keys = keysParam ? keysParam.split(',').map((k) => k.trim()).filter(Boolean) : undefined;
        console.log('[playfab-userdata] GET keys:', keys);

        const result = await serverGetUserData(pfid, keys);
        console.log('[playfab-userdata] GET result:', result);
        
        if (!result.ok) {
          console.error('[playfab-userdata] PlayFab get user data error:', result.json);
          return jsonResponse(200, { ok: true, data: {}, fallback: true });
        }

        // Handle both Data and data (PlayFab uses Data with capital D)
        const rawData = result.json?.data?.Data || result.json?.Data?.Data || {};
        console.log('[playfab-userdata] rawData:', rawData);
        
        const data = {};
        for (const [key, val] of Object.entries(rawData)) {
          const value = val?.Value;
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        }

        return jsonResponse(200, { ok: true, data });
      }

      if (event.httpMethod === 'POST') {
        const body = getBody(event);
        const dataObj = body?.data || body;

        if (!dataObj || typeof dataObj !== 'object') {
          return jsonResponse(400, { error: 'invalid_data' });
        }

        const result = await serverUpdateUserData(pfid, dataObj);
        
        if (!result.ok) {
          console.error('PlayFab update user data error:', result.json);
          return jsonResponse(200, { ok: true, fallback: true });
        }

        return jsonResponse(200, { ok: true });
      }
    } catch (playfabError) {
      console.warn('[playfab-userdata] PlayFab error:', playfabError.message);
      return jsonResponse(200, { ok: true, data: {}, fallback: true });
    }

    return jsonResponse(405, { error: 'method_not_allowed' });
  } catch (e) {
    console.error('playfab/userdata error', e);
    return jsonResponse(200, { ok: true, data: {}, error: true });
  }
}
