// Netlify Serverless: Company search via OpenCorporates (FREE)
// GET: ?q=company_name&jurisdiction=us (optional)

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
    const query = (params.q || '').toString().trim();
    const jurisdiction = (params.jurisdiction || '').toString().trim();

    if (!query) {
      return jsonResponse(400, { error: 'missing_query', message: 'Please provide a search query via ?q=' });
    }

    const baseUrl = process.env.OPENCORPORATES_BASE || 'https://api.opencorporates.com/v0.4';
    const apiToken = process.env.OPENCORPORATES_API_KEY || '';
    
    let url = `${baseUrl}/companies/search?q=${encodeURIComponent(query)}&format=json`;
    if (jurisdiction) url += `&jurisdiction_code=${encodeURIComponent(jurisdiction)}`;
    if (apiToken) url += `&api_token=${apiToken}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.error('OpenCorporates error:', response.status);
      return jsonResponse(response.status, { error: 'api_error', status: response.status });
    }

    const data = await response.json();
    const companies = (data?.results?.companies || []).map((item) => {
      const c = item.company || {};
      return {
        id: c.company_number || c.opencorporates_url,
        name: c.name || 'Unknown',
        jurisdiction: c.jurisdiction_code || '',
        companyNumber: c.company_number || '',
        status: c.current_status || c.company_type || 'Unknown',
        incorporationDate: c.incorporation_date || null,
        companyType: c.company_type || '',
        registeredAddress: c.registered_address_in_full || '',
        opencorporatesUrl: c.opencorporates_url || '',
        source: 'opencorporates'
      };
    });

    return jsonResponse(200, { companies, total: companies.length });
  } catch (e) {
    console.error('companies/search error', e);
    return jsonResponse(500, { error: 'internal_error' });
  }
}
