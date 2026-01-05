// Netlify Serverless: PlayFab leaderboard operations
// GET: Fetch leaderboard entries
// POST: Update player statistic
import { corsHeaders, jsonResponse, optionsResponse, getBody, getPfidFromCookie, serverGetLeaderboard, serverUpdateStatistic, assertPlayFabEnv } from './_utils/playfab.js';

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('GET, POST, OPTIONS');

    assertPlayFabEnv();

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const stat = (params.stat || 'PortfolioValue').toString();
      const limit = Math.min(parseInt(params.limit || '25', 10), 100);
      const start = parseInt(params.start || '0', 10);

      const result = await serverGetLeaderboard(stat, limit, start);
      
      if (!result.ok) {
        console.error('PlayFab leaderboard error:', result.json);
        return jsonResponse(result.status, { error: 'leaderboard_error', detail: result.json });
      }

      const entries = (result.json?.data?.Leaderboard || []).map((e) => ({
        playFabId: e.PlayFabId,
        position: e.Position + 1, // 0-indexed to 1-indexed
        statValue: e.StatValue,
        displayName: e.DisplayName || e.PlayFabId?.substring(0, 8) || 'Anonymous',
      }));

      return jsonResponse(200, { ok: true, entries });
    }

    if (event.httpMethod === 'POST') {
      const pfid = getPfidFromCookie(event);
      if (!pfid) {
        return jsonResponse(401, { error: 'no_player_session' });
      }

      const body = getBody(event);
      const stat = String(body?.stat || 'PortfolioValue');
      const value = Number(body?.value || 0);

      const result = await serverUpdateStatistic(pfid, stat, value);
      
      if (!result.ok) {
        console.error('PlayFab update stat error:', result.json);
        return jsonResponse(result.status, { error: 'update_stat_error', detail: result.json });
      }

      return jsonResponse(200, { ok: true, stat, value });
    }

    return jsonResponse(405, { error: 'method_not_allowed' });
  } catch (e) {
    console.error('playfab/leaderboard error', e);
    return jsonResponse(500, { error: 'internal_error', message: e.message });
  }
}
