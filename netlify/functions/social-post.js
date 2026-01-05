// Netlify Serverless: Create a social post stored in PlayFab user data under key "socialPosts"
import { corsHeaders, jsonResponse, optionsResponse, getBody, getPfidFromCookie, serverGetUserData, serverUpdateUserData, assertPlayFabEnv } from './_utils/playfab.js';

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('POST, OPTIONS');
    if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

    assertPlayFabEnv();

    const pfid = getPfidFromCookie(event);
    if (!pfid) return jsonResponse(401, { error: 'no_player_session' });

    const body = getBody(event);
    const post = {
      id: `post-${Date.now()}`,
      authorId: pfid,
      content: String(body?.content || ''),
      type: ['text','portfolio-share','trade-alert','achievement'].includes(body?.type) ? body.type : 'text',
      timestamp: new Date().toISOString(),
      portfolio: body?.portfolio ? {
        id: String(body.portfolio.id || `portfolio-${Date.now()}`),
        name: String(body.portfolio.name || 'Portfolio'),
        performance: Number(body.portfolio.performance || 0),
        value: Number(body.portfolio.value || 0),
      } : undefined,
      trade: body?.trade ? {
        symbol: String(body.trade.symbol || ''),
        action: body.trade.action === 'sell' ? 'sell' : 'buy',
        price: Number(body.trade.price || 0),
        quantity: Number(body.trade.quantity || 0),
      } : undefined,
      achievement: body?.achievement ? {
        name: String(body.achievement.name || ''),
        rarity: String(body.achievement.rarity || 'Common'),
      } : undefined,
    };

    // load current posts
    const r = await serverGetUserData(pfid, ['socialPosts']);
    if (!r.ok) return jsonResponse(r.status, { error: 'playfab_error', detail: r.json });
    const raw = r.json?.data?.Data?.socialPosts?.Value;
    let posts = [];
    try { posts = raw ? JSON.parse(raw) : []; } catch { posts = []; }

    posts.unshift(post);
    const u = await serverUpdateUserData(pfid, { socialPosts: posts });
    if (!u.ok) return jsonResponse(u.status, { error: 'update_failed', detail: u.json });

    return jsonResponse(200, { ok: true, post });
  } catch (e) {
    console.error('social/post error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
