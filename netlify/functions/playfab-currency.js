// Netlify Serverless: PlayFab currency balances
// GET: Returns virtual currency balances (PT, GC)
import { corsHeaders, jsonResponse, optionsResponse, getPfidFromCookie, serverGetInventory, assertPlayFabEnv } from './_utils/playfab.js';

export async function handler(event, context) {
  console.log('[playfab-currency] Handler invoked', { method: event.httpMethod });
  
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('GET, OPTIONS');
    if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'method_not_allowed' });

    assertPlayFabEnv();

    const pfid = getPfidFromCookie(event);
    console.log('[playfab-currency] pfid from cookie:', pfid || 'none');
    
    if (!pfid) {
      return jsonResponse(401, { error: 'no_player_session' });
    }

    const result = await serverGetInventory(pfid);
    console.log('[playfab-currency] Inventory result:', result);
    
    if (!result.ok) {
      console.error('[playfab-currency] PlayFab inventory error:', result.json);
      return jsonResponse(result.status, { error: 'inventory_error', detail: result.json });
    }

    // Handle both Data and data (PlayFab uses Data with capital D)
    const balances = result.json?.data?.VirtualCurrency || result.json?.Data?.VirtualCurrency || {};
    console.log('[playfab-currency] Balances:', balances);
    
    return jsonResponse(200, { 
      ok: true, 
      balances: {
        PT: Number(balances.PT || 0),
        GC: Number(balances.GC || 0),
      }
    });
  } catch (e) {
    console.error('[playfab-currency] Exception:', e.message, e.stack);
    return jsonResponse(500, { error: 'internal_error', message: e.message });
  }
}
