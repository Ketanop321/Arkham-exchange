// Netlify Serverless: Social feed via DeepSeek (OpenRouter)
// Returns: { users: User[], posts: Post[], leaderboard: LeaderboardEntry[] }

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}

async function callOpenRouter(messages, model, temperature = 0.2) {
  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  };
  if (process.env.SITE_URL) headers['HTTP-Referer'] = process.env.SITE_URL;
  if (process.env.SITE_NAME) headers['X-Title'] = process.env.SITE_NAME;

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: model || process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free', messages, temperature }),
  });
  if (!r.ok) throw new Error(`OpenRouter error ${r.status}`);
  const json = await r.json();
  const content = json.choices?.[0]?.message?.content || '';
  return content;
}

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const sub = text.slice(first, last + 1);
      try { return JSON.parse(sub); } catch (_) {}
    }
    return null;
  }
}

function ensureArray(a) {
  return Array.isArray(a) ? a : [];
}

function defaultAvatar(i) {
  const avatars = [
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    'https://images.pexels.com/photos/428333/pexels-photo-428333.jpeg',
  ];
  return avatars[i % avatars.length];
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const system = {
      role: 'system',
      content: 'You are a data generator for a social trading network. Output strictly valid JSON only.'
    };
    const user = {
      role: 'user',
      content: `Generate social trading data with this exact schema:
{
  "users": [
    {
      "id": string,
      "username": string,
      "displayName": string,
      "avatar": string,
      "bio": string,
      "verified": boolean,
      "reputation": { "score": number, "rank": string, "badges": string[], "level": number },
      "stats": { "followers": number, "following": number, "totalReturn": number, "winRate": number, "portfolios": number, "copiers": number },
      "blockchain": { "walletAddress": string, "nftProfile"?: string, "tokenGating": { "requiredTokens": number, "tokenType": string, "hasAccess": boolean } },
      "social": { "isFollowing": boolean, "mutualFollowers": number, "lastActive": string },
      "achievements": [ { "id": string, "name": string, "description": string, "rarity": "Common"|"Rare"|"Epic"|"Legendary", "unlockedAt": string, "nftTokenId"?: string } ]
    }
  ],
  "posts": [
    {
      "id": string,
      "authorId": string,
      "content": string,
      "type": "text"|"portfolio-share"|"trade-alert"|"achievement",
      "timestamp": string,
      "engagement": { "likes": number, "comments": number, "shares": number, "hasLiked": boolean },
      "portfolio"?: { "id": string, "name": string, "performance": number, "value": number },
      "trade"?: { "symbol": string, "action": "buy"|"sell", "price": number, "quantity": number },
      "achievement"?: { "name": string, "rarity": string, "nftTokenId"?: string },
      "tokenGated"?: { "required": boolean, "tokenType": string, "minTokens": number }
    }
  ],
  "leaderboard": [ { "rank": number, "userId": string, "metric": number, "change": number } ]
}
Constraints: 2-4 users, 2-4 posts, 2-3 leaderboard entries. ISO-8601 dates. Realistic numbers. JSON only. No Markdown.`
    };

    const content = await callOpenRouter([system, user]);
    const parsed = tryParseJSON(content) || { users: [], posts: [], leaderboard: [] };

    const users = ensureArray(parsed.users).map((u, i) => ({
      id: String(u.id || `user-${i+1}`),
      username: String(u.username || `user${i+1}`),
      displayName: String(u.displayName || `User ${i+1}`),
      avatar: String(u.avatar || defaultAvatar(i)),
      bio: String(u.bio || ''),
      verified: Boolean(u.verified),
      reputation: {
        score: Number(u.reputation?.score || 0),
        rank: String(u.reputation?.rank || 'Trader'),
        badges: ensureArray(u.reputation?.badges).map(String),
        level: Number(u.reputation?.level || 1),
      },
      stats: {
        followers: Number(u.stats?.followers || 0),
        following: Number(u.stats?.following || 0),
        totalReturn: Number(u.stats?.totalReturn || 0),
        winRate: Number(u.stats?.winRate || 0),
        portfolios: Number(u.stats?.portfolios || 0),
        copiers: Number(u.stats?.copiers || 0),
      },
      blockchain: {
        walletAddress: String(u.blockchain?.walletAddress || '0x0000...0000'),
        nftProfile: u.blockchain?.nftProfile ? String(u.blockchain.nftProfile) : undefined,
        tokenGating: {
          requiredTokens: Number(u.blockchain?.tokenGating?.requiredTokens || 0),
          tokenType: String(u.blockchain?.tokenGating?.tokenType || 'ARKHAM'),
          hasAccess: Boolean(u.blockchain?.tokenGating?.hasAccess || false),
        }
      },
      social: {
        isFollowing: Boolean(u.social?.isFollowing || false),
        mutualFollowers: Number(u.social?.mutualFollowers || 0),
        lastActive: String(u.social?.lastActive || new Date().toISOString()),
      },
      achievements: ensureArray(u.achievements).map((a, j) => ({
        id: String(a.id || `ach-${i+1}-${j+1}`),
        name: String(a.name || 'Achievement'),
        description: String(a.description || ''),
        rarity: String(a.rarity || 'Common'),
        unlockedAt: String(a.unlockedAt || new Date().toISOString()),
        nftTokenId: a.nftTokenId ? String(a.nftTokenId) : undefined,
      })),
    }));
    const byId = new Map(users.map((u) => [u.id, u]));

    const posts = ensureArray(parsed.posts).map((p, i) => ({
      id: String(p.id || `post-${i+1}`),
      author: byId.get(String(p.authorId)) || users[0] || null,
      content: String(p.content || ''),
      type: ['text','portfolio-share','trade-alert','achievement'].includes(p.type) ? p.type : 'text',
      timestamp: String(p.timestamp || new Date().toISOString()),
      engagement: {
        likes: Number(p.engagement?.likes || 0),
        comments: Number(p.engagement?.comments || 0),
        shares: Number(p.engagement?.shares || 0),
        hasLiked: Boolean(p.engagement?.hasLiked || false),
      },
      portfolio: p.portfolio ? {
        id: String(p.portfolio.id || 'portfolio-1'),
        name: String(p.portfolio.name || 'Portfolio'),
        performance: Number(p.portfolio.performance || 0),
        value: Number(p.portfolio.value || 0),
      } : undefined,
      trade: p.trade ? {
        symbol: String(p.trade.symbol || 'AAPL'),
        action: p.trade.action === 'sell' ? 'sell' : 'buy',
        price: Number(p.trade.price || 0),
        quantity: Number(p.trade.quantity || 0),
      } : undefined,
      achievement: p.achievement ? {
        name: String(p.achievement.name || 'Milestone'),
        rarity: String(p.achievement.rarity || 'Common'),
        nftTokenId: p.achievement.nftTokenId ? String(p.achievement.nftTokenId) : undefined,
      } : undefined,
      tokenGated: p.tokenGated ? {
        required: Boolean(p.tokenGated.required || false),
        tokenType: String(p.tokenGated.tokenType || 'ARKHAM'),
        minTokens: Number(p.tokenGated.minTokens || 0),
      } : undefined,
    })).filter((p) => p.author);

    const leaderboard = ensureArray(parsed.leaderboard).map((e, i) => ({
      rank: Number(e.rank || i + 1),
      user: byId.get(String(e.userId)) || users[i % Math.max(users.length,1)] || null,
      metric: Number(e.metric || 0),
      change: Number(e.change || 0),
    })).filter((e) => e.user);

    return jsonResponse(200, { users, posts, leaderboard });
  } catch (e) {
    console.error('social/feed error', e);
    return jsonResponse(200, { users: [], posts: [], leaderboard: [] });
  }
}
