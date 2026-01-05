// Netlify Serverless: PlayFab user data operations
// GET: Fetch user data by keys
// POST: Update user data
import { corsHeaders, jsonResponse, optionsResponse, getBody, getPfidFromCookie, serverGetUserData, serverUpdateUserData, assertPlayFabEnv } from './_utils/playfab.js';

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('GET, POST, OPTIONS');

    assertPlayFabEnv();

    const pfid = getPfidFromCookie(event);
    if (!pfid) {
      return jsonResponse(401, { error: 'no_player_session' });
    }

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const keysParam = (params.keys || '').toString();
      const keys = keysParam ? keysParam.split(',').map((k) => k.trim()).filter(Boolean) : undefined;

      const result = await serverGetUserData(pfid, keys);
      
      if (!result.ok) {
        console.error('PlayFab get user data error:', result.json);
        return jsonResponse(result.status, { error: 'userdata_error', detail: result.json });
      }

      // Parse stored JSON values
      const rawData = result.json?.data?.Data || {};
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
        return jsonResponse(result.status, { error: 'update_userdata_error', detail: result.json });
      }

      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'method_not_allowed' });
  } catch (e) {
    console.error('playfab/userdata error', e);
    return jsonResponse(500, { error: 'internal_error', message: e.message });
  }
}
