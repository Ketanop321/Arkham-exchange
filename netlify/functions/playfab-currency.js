// Netlify Serverless: PlayFab currency balances
// GET: Returns virtual currency balances (PT, GC)
import { corsHeaders, jsonResponse, optionsResponse, getPfidFromCookie, serverGetInventory, assertPlayFabEnv } from './_utils/playfab.js';

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('GET, OPTIONS');
    if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'method_not_allowed' });

    assertPlayFabEnv();

    const pfid = getPfidFromCookie(event);
    if (!pfid) {
      return jsonResponse(401, { error: 'no_player_session' });
    }

    const result = await serverGetInventory(pfid);
    
    if (!result.ok) {
      console.error('PlayFab inventory error:', result.json);
      return jsonResponse(result.status, { error: 'inventory_error', detail: result.json });
    }

    const balances = result.json?.data?.VirtualCurrency || {};
    
    return jsonResponse(200, { 
      ok: true, 
      balances: {
        PT: Number(balances.PT || 0),
        GC: Number(balances.GC || 0),
      }
    });
  } catch (e) {
    console.error('playfab/currency error', e);
    return jsonResponse(500, { error: 'internal_error', message: e.message });
  }
}
