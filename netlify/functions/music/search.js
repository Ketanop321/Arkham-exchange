// Netlify Serverless: Music/Artist search via MusicBrainz (FREE, no key needed)
// GET: ?artist=name OR ?release=album_name OR ?artistId=id

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

    const params = event.queryStringParameters || {};
    const artistQuery = (params.artist || '').toString().trim();
    const releaseQuery = (params.release || '').toString().trim();
    const artistId = (params.artistId || '').toString().trim();

    const baseUrl = process.env.MUSICBRAINZ_BASE || 'https://musicbrainz.org/ws/2';
    const userAgent = 'ArkhamXchange/1.0 (contact@arkhamxchange.com)';

    const headers = {
      'Accept': 'application/json',
      'User-Agent': userAgent
    };

    if (artistId) {
      const url = `${baseUrl}/artist/${artistId}?inc=releases+release-groups&fmt=json`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return jsonResponse(response.status, { error: 'api_error', status: response.status });
      }

      const data = await response.json();
      return jsonResponse(200, {
        artist: {
          id: data.id,
          name: data.name || 'Unknown',
          type: data.type || 'Unknown',
          country: data.country || '',
          disambiguation: data.disambiguation || '',
          lifeSpan: data['life-span'] || {},
          releases: (data.releases || []).slice(0, 20).map(r => ({
            id: r.id,
            title: r.title,
            date: r.date,
            status: r.status,
            country: r.country
          })),
          source: 'musicbrainz'
        }
      });
    }

    if (artistQuery) {
      const url = `${baseUrl}/artist/?query=${encodeURIComponent(artistQuery)}&fmt=json&limit=20`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return jsonResponse(response.status, { error: 'api_error', status: response.status });
      }

      const data = await response.json();
      const artists = (data?.artists || []).map((a) => ({
        id: a.id,
        name: a.name || 'Unknown',
        type: a.type || 'Unknown',
        country: a.country || '',
        disambiguation: a.disambiguation || '',
        score: a.score || 0,
        tags: (a.tags || []).slice(0, 5).map(t => t.name),
        source: 'musicbrainz'
      }));

      return jsonResponse(200, { artists, total: artists.length });
    }

    if (releaseQuery) {
      const url = `${baseUrl}/release/?query=${encodeURIComponent(releaseQuery)}&fmt=json&limit=20`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return jsonResponse(response.status, { error: 'api_error', status: response.status });
      }

      const data = await response.json();
      const releases = (data?.releases || []).map((r) => ({
        id: r.id,
        title: r.title || 'Unknown',
        date: r.date || null,
        status: r.status || 'Unknown',
        country: r.country || '',
        artistCredit: (r['artist-credit'] || []).map(ac => ac.name || ac.artist?.name).join(', '),
        trackCount: r['track-count'] || 0,
        score: r.score || 0,
        source: 'musicbrainz'
      }));

      return jsonResponse(200, { releases, total: releases.length });
    }

    return jsonResponse(400, { error: 'missing_query', message: 'Provide ?artist=name or ?release=album or ?artistId=id' });
  } catch (e) {
    console.error('music/search error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
