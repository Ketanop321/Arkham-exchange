// Shared PlayFab utilities for Netlify serverless functions
// Reads env, builds helpers for Client and Server APIs and common HTTP helpers

const TITLE_ID = process.env.PLAYFAB_TITLE_ID;
const SECRET = process.env.PLAYFAB_SECRET_KEY;

function baseUrl() {
  const title = TITLE_ID || '';
  return `https://${title}.playfabapi.com`;
}

async function httpPost(path, body, extraHeaders = {}) {
  const url = `${baseUrl()}/${path}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body || {}),
  });
  const text = await r.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { error: 'invalid_json', raw: text }; }
  return { ok: r.ok, status: r.status, json };
}

// ---------- HTTP helpers for Netlify ----------
export function corsHeaders(methods = 'GET, POST, OPTIONS') {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': methods,
  };
}

export function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function optionsResponse(methods = 'GET, POST, OPTIONS') {
  return {
    statusCode: 200,
    headers: corsHeaders(methods),
    body: '',
  };
}

export function getBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

export function getPfidFromCookie(event) {
  const cookie = event.headers?.cookie || '';
  const m = cookie.match(/(?:^|; )pfid=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

export function setPfidCookie(pfid) {
  if (!pfid) return {};
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  const secure = process.env.NODE_ENV !== 'development';
  return {
    'Set-Cookie': `pfid=${encodeURIComponent(pfid)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`,
  };
}

// ---------- Client API (no secret) ----------
export async function clientLoginWithCustomId(customId, create = true) {
  return httpPost('Client/LoginWithCustomID', {
    CreateAccount: !!create,
    CustomId: String(customId || ''),
    TitleId: TITLE_ID,
    InfoRequestParameters: { GetUserAccountInfo: true }
  });
}

// ---------- Server API (uses SecretKey) ----------
function serverHeaders() {
  return {
    'X-SecretKey': SECRET || '',
  };
}

export async function serverLoginWithServerCustomId(customId, create = true) {
  return httpPost('Server/LoginWithServerCustomId', {
    CreateAccount: !!create,
    ServerCustomId: String(customId || ''),
    InfoRequestParameters: { GetUserAccountInfo: true },
  }, serverHeaders());
}

export async function serverGetLeaderboard(statName, maxResults = 25, start = 0) {
  return httpPost('Server/GetLeaderboard', {
    StatisticName: String(statName || 'PortfolioValue'),
    StartPosition: Number(start || 0),
    MaxResultsCount: Number(maxResults || 25),
  }, serverHeaders());
}

export async function serverUpdateStatistic(pfid, statName, value) {
  return httpPost('Server/UpdatePlayerStatistics', {
    PlayFabId: String(pfid),
    Statistics: [{ StatisticName: String(statName || 'PortfolioValue'), Value: Math.round(Number(value || 0)) }],
  }, serverHeaders());
}

export async function serverGetInventory(pfid) {
  return httpPost('Server/GetUserInventory', { PlayFabId: String(pfid) }, serverHeaders());
}

export async function serverGetPlayerStatistics(pfid, names) {
  return httpPost('Server/GetPlayerStatistics', {
    PlayFabId: String(pfid),
    StatisticNames: Array.isArray(names) ? names : undefined,
  }, serverHeaders());
}

export async function serverAddCurrency(pfid, code, amount) {
  return httpPost('Server/AddUserVirtualCurrency', {
    PlayFabId: String(pfid),
    VirtualCurrency: String(code || 'GC'),
    Amount: Number(amount || 0),
  }, serverHeaders());
}

export async function serverSubtractCurrency(pfid, code, amount) {
  return httpPost('Server/SubtractUserVirtualCurrency', {
    PlayFabId: String(pfid),
    VirtualCurrency: String(code || 'PT'),
    Amount: Number(amount || 0),
  }, serverHeaders());
}

export async function serverGetUserData(pfid, keys) {
  return httpPost('Server/GetUserData', { PlayFabId: String(pfid), Keys: Array.isArray(keys) ? keys : undefined }, serverHeaders());
}

export async function serverUpdateUserData(pfid, dataObj) {
  const Data = {};
  for (const [k, v] of Object.entries(dataObj || {})) Data[k] = typeof v === 'string' ? v : JSON.stringify(v);
  return httpPost('Server/UpdateUserData', { PlayFabId: String(pfid), Data }, serverHeaders());
}

export function assertPlayFabEnv() {
  if (!TITLE_ID) throw new Error('missing_PLAYFAB_TITLE_ID');
  if (!SECRET) throw new Error('missing_PLAYFAB_SECRET_KEY');
}
