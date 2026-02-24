// CJ Dropshipping Proxy — Vercel Serverless Function
// Handles CORS so your dashboard can talk to CJ's API directly

export default async function handler(req, res) {
  // Allow requests from any origin (your dashboard)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, CJ-Access-Token');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
  const url = `${CJ_BASE}/${endpoint}`;

  try {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Forward CJ-Access-Token header if present
    if (req.headers['cj-access-token']) {
      options.headers['CJ-Access-Token'] = req.headers['cj-access-token'];
    }

    // Forward body for POST requests
    if (req.method === 'POST' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    // Forward query params (except 'endpoint')
    const params = { ...req.query };
    delete params.endpoint;
    const queryString = new URLSearchParams(params).toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(finalUrl, options);
    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
}
