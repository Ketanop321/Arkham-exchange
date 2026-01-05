// Netlify Serverless: Daily quests (claim rewards via PlayFab)
import { corsHeaders, jsonResponse, optionsResponse, getBody, getPfidFromCookie, serverAddCurrency, serverGetPlayerStatistics, serverUpdateStatistic, serverGetUserData, serverUpdateUserData, assertPlayFabEnv } from './_utils/playfab.js';

function originFromEvent(event) {
  const headers = event.headers || {};
  const proto = headers['x-forwarded-proto'] || 'https';
  const host = headers['x-forwarded-host'] || headers.host || 'localhost:8888';
  return `${proto}://${host}`;
}

async function readJson(res) {
  const t = await res.text();
  try { return JSON.parse(t); } catch { return null; }
}

async function safeFetchJson(url) {
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    return await readJson(r);
  } catch (_) {
    return null;
  }
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') return optionsResponse('GET, POST, OPTIONS');

    assertPlayFabEnv();

    if (event.httpMethod === 'GET') {
      const pfid = getPfidFromCookie(event);
      if (!pfid) return jsonResponse(401, { error: 'no_player_session' });

      // If already generated within the last 12h, return existing
      try {
        const r0 = await serverGetUserData(pfid, ['dailyQuests']);
        if (r0.ok) {
          const store = r0.json?.data?.Data || {};
          if (store.dailyQuests?.Value) {
            let data;
            try { data = JSON.parse(store.dailyQuests.Value); } catch { data = null; }
            if (data && Array.isArray(data.goals) && data.goals.length) {
              const ts = Number(data.generatedAt || 0);
              if (Date.now() - ts < 12 * 3600 * 1000) {
                return jsonResponse(200, data);
              }
            }
          }
        }
      } catch {}

      const origin = originFromEvent(event);
      const [news, crypto, us] = await Promise.all([
        safeFetchJson(`${origin}/.netlify/functions/news?q=${encodeURIComponent('finance OR markets OR technology OR crypto OR real estate')}&limit=8`),
        safeFetchJson(`${origin}/.netlify/functions/crypto-quotes?ids=bitcoin,ethereum,solana&vs_currency=usd`),
        safeFetchJson(`${origin}/.netlify/functions/markets-us?symbols=AAPL,MSFT,GOOGL,AMZN,NVDA,META,TSLA,JPM,V,JNJ,WMT,DIS,NFLX,AMD,BA,GS`),
      ]);

      const signals = {
        headlines: (news?.articles || []).slice(0, 6).map((a) => a.title),
        crypto: (crypto?.coins || []).slice(0, 3).map((c) => ({ id: c.id, price: c.price, change24hPct: c.change24hPct })),
        equities: (us?.quotes || []).slice(0, 4),
      };

      const prompt = [
        { role: 'system', content: 'You generate DAILY QUESTS for a finance training app. Output STRICT JSON only.' },
        { role: 'user', content: `Using these live signals ${JSON.stringify(signals)}, propose 3-5 daily quests. JSON:
{
  "goals": [ {"id": string, "title": string, "description": string, "type": "learning"|"trading"|"research"|"networking", "progress": 0, "target": number, "reward": {"xp": number, "badge"?: string}, "dueDate": string } ]
}
Rules: actionable, realistic, reflect headlines/price moves, no markdown.` }
      ];

      const aiRes = await fetch(`${origin}/.netlify/functions/ai-deepseek`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: prompt, temperature: 0.2 }) });
      if (!aiRes.ok) return jsonResponse(aiRes.status, { error: 'ai_error' });
      const ai = await aiRes.json();
      const content = ai?.choices?.[0]?.message?.content || '';
      let parsed = null;
      try { parsed = JSON.parse(content); } catch {
        const first = content.indexOf('{'); const last = content.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) { try { parsed = JSON.parse(content.slice(first, last + 1)); } catch {} }
      }

      const data = Array.isArray(parsed?.goals) && parsed.goals.length ? parsed : {
        goals: [
          { id: `dg-news-${Date.now()}`, title: 'Read 3 market headlines', description: 'Open the Market Intelligence tab and read the top headlines.', type: 'research', progress: 0, target: 3, reward: { xp: 60 }, dueDate: new Date(Date.now()+12*3600*1000).toISOString() },
          { id: `dg-trade-${Date.now()}`, title: 'Add 1 asset to portfolio', description: 'Use Trading Sandbox → Live Market Data → Add to Portfolio.', type: 'trading', progress: 0, target: 1, reward: { xp: 90 }, dueDate: new Date(Date.now()+12*3600*1000).toISOString() },
        ],
      };

      // Persist
      try {
        await serverUpdateUserData(pfid, { dailyQuests: { goals: data.goals, generatedAt: Date.now() } });
      } catch {}

      return jsonResponse(200, { goals: data.goals, generatedAt: Date.now() });
    }

    if (event.httpMethod === 'POST') {
      const pfid = getPfidFromCookie(event);
      if (!pfid) return jsonResponse(401, { error: 'no_player_session' });

      const body = getBody(event);
      const xp = Number(body?.xp || 0);
      const currencyCode = String(body?.currencyCode || 'GC');
      const currencyAmount = Number(body?.currencyAmount || 0);

      // Read current XP
      let currentXp = 0;
      try {
        const stats = await serverGetPlayerStatistics(pfid, ['XP']);
        if (stats.ok) {
          const arr = stats.json?.data?.Statistics || [];
          const xpItem = arr.find((s) => s.StatisticName === 'XP');
          if (xpItem) currentXp = Number(xpItem.Value || 0);
        }
      } catch (e) {
        console.warn('Failed to get player stats', e.message);
      }

      const newXp = currentXp + xp;
      // Update XP
      if (xp > 0) {
        try {
          await serverUpdateStatistic(pfid, 'XP', newXp);
        } catch (e) {
          console.warn('Failed to update XP', e.message);
        }
      }
      // Grant currency
      if (currencyAmount > 0) {
        try {
          await serverAddCurrency(pfid, currencyCode, currencyAmount);
        } catch (e) {
          console.warn('Failed to add currency', e.message);
        }
      }

      return jsonResponse(200, { ok: true, newXp });
    }

    return jsonResponse(405, { error: 'method_not_allowed' });
  } catch (e) {
    console.error('quests/daily error', e);
    return jsonResponse(500, { error: 'internal_error', message: e.message });
  }
}
