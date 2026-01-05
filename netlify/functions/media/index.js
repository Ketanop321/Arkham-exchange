// Netlify Serverless: Combined media data for Movie & Music investment track
// GET: Returns trending movies, artists, and combined entertainment investment opportunities

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

function originFromEvent(event) {
  const headers = event.headers || {};
  const proto = headers['x-forwarded-proto'] || 'https';
  const host = headers['x-forwarded-host'] || headers.host || 'localhost:8888';
  return `${proto}://${host}`;
}

async function safeFetchJson(url) {
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function calculateMovieInvestmentScore(movie) {
  const popularityScore = Math.min(movie.popularity || 0, 100);
  const ratingScore = (movie.voteAverage || 0) * 10;
  return Math.round((popularityScore * 0.6) + (ratingScore * 0.4));
}

function calculateArtistInvestmentScore(artist) {
  const baseScore = artist.score || 50;
  const tagBonus = (artist.tags?.length || 0) * 2;
  return Math.min(100, baseScore + tagBonus);
}

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const origin = originFromEvent(event);

    // Fetch movies and music data in parallel
    const [moviesData, musicData] = await Promise.all([
      safeFetchJson(`${origin}/.netlify/functions/movies/search?trending=true`),
      safeFetchJson(`${origin}/.netlify/functions/music/search?artist=Taylor%20Swift`),
    ]);

    const movies = (moviesData?.movies || []).slice(0, 10).map((m) => ({
      id: `movie-${m.id}`,
      type: 'movie',
      title: m.title,
      releaseDate: m.releaseDate,
      popularity: m.popularity || 0,
      voteAverage: m.voteAverage || 0,
      posterUrl: m.posterUrl,
      investmentPotential: calculateMovieInvestmentScore(m),
    }));

    const artists = (musicData?.artists || []).slice(0, 10).map((a) => ({
      id: `artist-${a.id}`,
      type: 'music',
      name: a.name,
      country: a.country || 'Unknown',
      tags: a.tags || [],
      score: a.score || 0,
      investmentPotential: calculateArtistInvestmentScore(a),
    }));

    // Create combined investment opportunities
    const opportunities = [
      ...movies.map(m => ({
        id: m.id,
        category: 'Box Office',
        name: m.title,
        type: 'movie',
        potential: m.investmentPotential,
        risk: m.investmentPotential > 70 ? 'Medium' : 'High',
        description: `Film investment opportunity based on ${m.title}`,
      })),
      ...artists.map(a => ({
        id: a.id,
        category: 'Music Catalog',
        name: a.name,
        type: 'music',
        potential: a.investmentPotential,
        risk: a.investmentPotential > 70 ? 'Low' : 'Medium',
        description: `Artist catalog and streaming rights for ${a.name}`,
      })),
    ].sort((a, b) => b.potential - a.potential);

    return jsonResponse(200, {
      movies,
      artists,
      opportunities,
      summary: {
        totalMovies: movies.length,
        totalArtists: artists.length,
        averageMoviePotential: movies.length ? Math.round(movies.reduce((s, m) => s + m.investmentPotential, 0) / movies.length) : 0,
        averageArtistPotential: artists.length ? Math.round(artists.reduce((s, a) => s + a.investmentPotential, 0) / artists.length) : 0,
      }
    });
  } catch (e) {
    console.error('media/index error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
