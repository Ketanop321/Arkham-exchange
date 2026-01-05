// Netlify Serverless Function: News aggregation (GNews + MarketAux)
// Query params: q, topics (comma), tickers (comma), limit

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

function dedupeByUrl(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = it.url || it.title;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

// Ensure publishedAt is recent enough for the UI default filter (24h)
function recentISO(ts) {
  try {
    const t = ts ? Date.parse(ts) : NaN;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (!t || Number.isNaN(t)) return new Date().toISOString();
    return (now - t) > dayMs ? new Date().toISOString() : new Date(t).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function normalizeGNews(a) {
  return {
    id: a.url,
    title: a.title,
    description: a.description,
    url: a.url,
    imageUrl: a.image,
    source: a.source?.name || 'GNews',
    author: a.source?.name || null,
    publishedAt: recentISO(a.publishedAt),
    tickers: [],
    sentiment: null,
    provider: 'gnews',
  };
}

function normalizeMarketAux(a) {
  return {
    id: a.uuid || a.url,
    title: a.title,
    description: a.description,
    url: a.url,
    imageUrl: a.image_url,
    source: a.source || 'MarketAux',
    author: a.author || null,
    publishedAt: recentISO(a.published_at),
    tickers: (a.entities || []).filter(e => e.symbol).map(e => e.symbol),
    sentiment: typeof a.overall_sentiment_score === 'number' ? a.overall_sentiment_score : null,
    provider: 'marketaux',
  };
}

// Fallback mock news for when APIs are unavailable
function getMockNews() {
  const now = new Date().toISOString();
  return [
    { id: 'mock-1', title: 'Tech Stocks Rally as AI Investments Surge', description: 'Major technology companies see gains as artificial intelligence spending continues to grow.', url: '#', imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', source: 'Market News', author: 'Financial Desk', publishedAt: now, tickers: ['NVDA', 'MSFT', 'GOOGL'], sentiment: 0.7, provider: 'mock' },
    { id: 'mock-2', title: 'Crypto Markets Show Strong Recovery', description: 'Bitcoin and Ethereum lead cryptocurrency market recovery amid institutional adoption.', url: '#', imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800', source: 'Crypto Daily', author: 'Crypto Desk', publishedAt: now, tickers: ['BTC', 'ETH'], sentiment: 0.6, provider: 'mock' },
    { id: 'mock-3', title: 'Real Estate Market Adjusts to New Interest Rates', description: 'Property markets adapt as central banks signal policy changes.', url: '#', imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800', source: 'Property News', author: 'Real Estate Desk', publishedAt: now, tickers: [], sentiment: 0.2, provider: 'mock' },
    { id: 'mock-4', title: 'Venture Capital Activity Reaches New Highs', description: 'Startup funding continues to break records in technology and healthcare sectors.', url: '#', imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', source: 'VC Weekly', author: 'Startup Desk', publishedAt: now, tickers: [], sentiment: 0.8, provider: 'mock' },
    { id: 'mock-5', title: 'Global Markets React to Economic Data', description: 'International markets respond to latest employment and inflation figures.', url: '#', imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800', source: 'Global Markets', author: 'Economics Desk', publishedAt: now, tickers: ['SPY', 'QQQ'], sentiment: 0.4, provider: 'mock' },
  ];
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const params = event.queryStringParameters || {};
    const q = (params.q || '').toString().trim();
    const topics = (params.topics || 'finance,markets,stocks,technology,crypto,real estate,venture capital').toString();
    const tickers = (params.tickers || '').toString();
    const limit = Math.min(parseInt(params.limit || '40', 10), 100);

    const topicQuery = topics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .join(' OR ');

    const query = q ? `${q}` : topicQuery || 'markets';

    const gnewsKey = process.env.GNEWS_API_KEY;
    const marketauxKey = process.env.MARKETAUX_API_TOKEN;

    const tasks = [];

    if (gnewsKey) {
      const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&sortby=publishedAt&max=${limit}&apikey=${gnewsKey}`;
      tasks.push(
        fetch(gnewsUrl).then(r => (r.ok ? r.json() : Promise.reject(new Error(`GNews ${r.status}`)))).then(j =>
          (Array.isArray(j.articles) ? j.articles : []).map(normalizeGNews)
        ).catch(() => [])
      );
    }

    if (marketauxKey) {
      const urlParams = new URLSearchParams({
        api_token: marketauxKey,
        language: 'en',
        limit: String(limit),
        filter_entities: 'true',
        sort: 'published_at:desc',
      });
      if (query) urlParams.set('query', query);
      if (tickers) urlParams.set('symbols', tickers);
      const mUrl = `https://api.marketaux.com/v1/news/all?${urlParams.toString()}`;
      tasks.push(
        fetch(mUrl).then(r => (r.ok ? r.json() : Promise.reject(new Error(`MarketAux ${r.status}`)))).then(j =>
          (Array.isArray(j.data) ? j.data : []).map(normalizeMarketAux)
        ).catch(() => [])
      );
    }

    const results = await Promise.all(tasks.length ? tasks : [Promise.resolve([])]);
    let combined = dedupeByUrl(results.flat()).sort((a, b) => (new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));

    // If no results from APIs, return mock data
    if (combined.length === 0) {
      combined = getMockNews();
    }

    return jsonResponse(200, { articles: combined });
  } catch (err) {
    console.error('news/index error', err);
    // Return mock data on error
    return jsonResponse(200, { articles: getMockNews() });
  }
}
