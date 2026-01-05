// Netlify Serverless: Movie search via TMDB (FREE with API key)
// GET: ?q=movie_name OR ?trending=true OR ?id=movie_id

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

export async function handler(event, context) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const apiKey = process.env.TMDB_API_KEY;
    const bearerToken = process.env.TMDB_BEARER_TOKEN;
    
    if (!apiKey && !bearerToken) {
      return jsonResponse(500, { error: 'missing_tmdb_credentials', message: 'TMDB_API_KEY or TMDB_BEARER_TOKEN required' });
    }

    const params = event.queryStringParameters || {};
    const query = (params.q || '').toString().trim();
    const trending = params.trending === 'true';
    const movieId = (params.id || '').toString().trim();

    const headers = {
      'Accept': 'application/json',
      ...(bearerToken ? { 'Authorization': `Bearer ${bearerToken}` } : {})
    };

    let url;
    if (movieId) {
      url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,revenue`;
    } else if (trending) {
      url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
    } else if (query) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    } else {
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error('TMDB error:', response.status);
      return jsonResponse(response.status, { error: 'api_error', status: response.status });
    }

    const data = await response.json();
    
    if (movieId) {
      const m = data;
      return jsonResponse(200, {
        movie: {
          id: m.id,
          title: m.title || m.original_title,
          overview: m.overview || '',
          releaseDate: m.release_date || null,
          budget: m.budget || 0,
          revenue: m.revenue || 0,
          runtime: m.runtime || 0,
          voteAverage: m.vote_average || 0,
          voteCount: m.vote_count || 0,
          popularity: m.popularity || 0,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          genres: (m.genres || []).map(g => g.name),
          productionCompanies: (m.production_companies || []).map(c => c.name),
          source: 'tmdb'
        }
      });
    }

    const movies = (data?.results || []).slice(0, 20).map((m) => ({
      id: m.id,
      title: m.title || m.original_title,
      overview: m.overview || '',
      releaseDate: m.release_date || null,
      voteAverage: m.vote_average || 0,
      voteCount: m.vote_count || 0,
      popularity: m.popularity || 0,
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      source: 'tmdb'
    }));

    return jsonResponse(200, { movies, total: movies.length });
  } catch (e) {
    console.error('movies/search error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
