// Netlify Serverless: Persist simulation run progress in PlayFab user data
import { corsHeaders, jsonResponse, optionsResponse, getBody, getPfidFromCookie, serverGetUserData, serverUpdateUserData, assertPlayFabEnv } from '../_utils/playfab.js';

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('GET, POST, OPTIONS');

    assertPlayFabEnv();

    const pfid = getPfidFromCookie(event);
    if (!pfid) return jsonResponse(401, { error: 'no_player_session' });

    if (event.httpMethod === 'GET') {
      const r = await serverGetUserData(pfid, ['simRuns', 'teamStats']);
      if (!r.ok) return jsonResponse(r.status, { error: 'playfab_error', detail: r.json });
      let simRuns = {};
      let teamStats = null;
      try { simRuns = JSON.parse(r.json?.data?.Data?.simRuns?.Value || '{}'); } catch { simRuns = {}; }
      try { teamStats = JSON.parse(r.json?.data?.Data?.teamStats?.Value || 'null'); } catch { teamStats = null; }
      return jsonResponse(200, { simRuns, teamStats });
    }

    if (event.httpMethod === 'POST') {
      const body = getBody(event);
      const simId = String(body?.simId || '').trim();
      const subquestId = String(body?.subquestId || '').trim();
      const done = Boolean(body?.done);
      const teamName = body?.teamName ? String(body.teamName) : undefined;
      const createTeam = Boolean(body?.createTeam);
      const joinTeam = Boolean(body?.joinTeam);

      // Handle team creation/joining
      if (createTeam || joinTeam) {
        if (!teamName) return jsonResponse(400, { error: 'missing_teamName' });
        const teamStats = {
          name: teamName,
          joinedAt: new Date().toISOString(),
          role: createTeam ? 'leader' : 'member'
        };
        const u = await serverUpdateUserData(pfid, { teamStats });
        if (!u.ok) return jsonResponse(u.status, { error: 'update_failed', detail: u.json });
        return jsonResponse(200, { ok: true, teamStats });
      }

      if (!simId) return jsonResponse(400, { error: 'missing_simId' });

      const r0 = await serverGetUserData(pfid, ['simRuns']);
      let simRuns = {};
      try { simRuns = JSON.parse(r0.json?.data?.Data?.simRuns?.Value || '{}'); } catch { simRuns = {}; }
      if (!simRuns[simId]) simRuns[simId] = { subquests: {}, teamName: teamName || '', lastUpdated: Date.now() };
      if (teamName) simRuns[simId].teamName = teamName;
      if (subquestId) simRuns[simId].subquests[subquestId] = { done, updatedAt: Date.now() };
      simRuns[simId].lastUpdated = Date.now();

      const u = await serverUpdateUserData(pfid, { simRuns });
      if (!u.ok) return jsonResponse(u.status, { error: 'update_failed', detail: u.json });
      return jsonResponse(200, { ok: true, simRuns });
    }

    return jsonResponse(405, { error: 'method_not_allowed' });
  } catch (e) {
    console.error('simulations/run error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
