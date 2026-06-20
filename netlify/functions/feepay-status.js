const fetch = globalThis.fetch;

/**
 * FeePay Status Check Function
 * Queries the status of a FeePay transaction by reference
 */
exports.handler = async function (event) {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const apiKey = process.env.FEEPAY_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'FeePay API key not configured',
        }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { reference } = body;

    if (!reference) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required field: reference',
        }),
      };
    }

    // Query FeePay API for transaction status
    // This endpoint depends on FeePay's documentation
    const statusUrl = `https://api-v2.feexpay.me/api/transactions/public/get/${reference}`;

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status || 500,
        body: JSON.stringify({
          error: 'Failed to check transaction status',
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Status check error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server error checking transaction status',
        details: String(err),
      }),
    };
  }
};
