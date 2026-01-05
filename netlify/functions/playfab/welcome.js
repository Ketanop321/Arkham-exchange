// Netlify Serverless: Grant initial currency to new players
// POST: Grants starter PT and GC if player hasn't received welcome bonus
import { corsHeaders, jsonResponse, optionsResponse, getPfidFromCookie, serverGetUserData, serverUpdateUserData, serverAddCurrency, assertPlayFabEnv } from '../_utils/playfab.js';

const WELCOME_BONUS = {
  PT: 10, // Premium Tokens to start
  GC: 500, // Game Coins to start
};

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('POST, OPTIONS');
    if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

    assertPlayFabEnv();

    const pfid = getPfidFromCookie(event);
    if (!pfid) return jsonResponse(401, { error: 'no_player_session' });

    // Check if player already received welcome bonus
    const userData = await serverGetUserData(pfid, ['welcomeBonusClaimed']);
    if (userData.ok) {
      const claimed = userData.json?.data?.Data?.welcomeBonusClaimed?.Value;
      if (claimed === 'true') {
        return jsonResponse(200, { ok: true, alreadyClaimed: true, message: 'Welcome bonus already claimed' });
      }
    }

    // Grant welcome bonus
    const ptResult = await serverAddCurrency(pfid, 'PT', WELCOME_BONUS.PT);
    const gcResult = await serverAddCurrency(pfid, 'GC', WELCOME_BONUS.GC);

    if (!ptResult.ok || !gcResult.ok) {
      console.error('Failed to grant welcome bonus:', { ptResult, gcResult });
      return jsonResponse(500, { error: 'grant_failed' });
    }

    // Mark as claimed
    await serverUpdateUserData(pfid, { welcomeBonusClaimed: 'true' });

    return jsonResponse(200, {
      ok: true,
      granted: WELCOME_BONUS,
      message: `Welcome! You received ${WELCOME_BONUS.PT} PT and ${WELCOME_BONUS.GC} GC to get started.`
    });
  } catch (e) {
    console.error('playfab/welcome error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
