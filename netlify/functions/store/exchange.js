// Netlify Serverless: Exchange premium tokens (PT) for in-app currency packs (GC)
// POST { packId: 'starter'|'pro'|'elite' }
// Requires PlayFab currency codes: PT (premium token) and GC configured in Title
import { corsHeaders, jsonResponse, optionsResponse, getBody, getPfidFromCookie, serverAddCurrency, serverSubtractCurrency, serverGetInventory, assertPlayFabEnv } from '../_utils/playfab.js';

const PACKS = {
  starter: { ptCost: 1, gcGrant: 100 },
  pro: { ptCost: 3, gcGrant: 400 },
  elite: { ptCost: 5, gcGrant: 1000 },
};

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('POST, OPTIONS');
    if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

    assertPlayFabEnv();

    const pfid = getPfidFromCookie(event);
    if (!pfid) return jsonResponse(401, { error: 'no_player_session' });

    const body = getBody(event);
    let packId = String(body?.packId || 'starter');
    // Map catalog-style IDs to internal keys
    const map = {
      gc_pack_starter: 'starter', gc_pack_starter_100: 'starter',
      gc_pack_pro: 'pro', gc_pack_pro_300: 'pro',
      gc_pack_elite: 'elite', gc_pack_elite_1000: 'elite',
    };
    packId = map[packId] || packId;
    const pack = PACKS[packId];
    if (!pack) return jsonResponse(400, { error: 'invalid_pack' });

    // Check balances
    const inv = await serverGetInventory(pfid);
    if (!inv.ok) return jsonResponse(inv.status, { error: 'inventory_error', detail: inv.json });
    const bal = inv.json?.data?.VirtualCurrency || {};
    const pt = Number(bal.PT || 0);
    if (pt < pack.ptCost) return jsonResponse(400, { error: 'insufficient_PT' });

    // Subtract PT, add GC
    const sub = await serverSubtractCurrency(pfid, 'PT', pack.ptCost);
    if (!sub.ok) return jsonResponse(sub.status, { error: 'pt_subtract_failed', detail: sub.json });
    const add = await serverAddCurrency(pfid, 'GC', pack.gcGrant);
    if (!add.ok) return jsonResponse(add.status, { error: 'gc_add_failed', detail: add.json });

    return jsonResponse(200, { ok: true, packId, newPT: pt - pack.ptCost, grantGC: pack.gcGrant });
  } catch (e) {
    console.error('store/exchange error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
