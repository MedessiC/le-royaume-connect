const fetch = globalThis.fetch;

const FEEPAY_ENDPOINTS = {
  mtn: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/mtn',
  moov: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/moov',
  celtiis: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/celtiis_bj',
};

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
    const shopId = process.env.FEEPAY_SHOP_ID;

    if (!apiKey || !shopId) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'FeePay configuration missing. Set FEEPAY_API_KEY and FEEPAY_SHOP_ID environment variables.',
        }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const {
      network = 'mtn',
      phoneNumber,
      amount,
      firstName,
      lastName,
      description = 'Donation MILLENIUM',
      callbackInfo,
    } = body;

    // Validate required fields
    if (!phoneNumber || !amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: phoneNumber and amount',
        }),
      };
    }

    // Validate network
    if (!FEEPAY_ENDPOINTS[network]) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid network. Must be one of: ${Object.keys(FEEPAY_ENDPOINTS).join(', ')}`,
        }),
      };
    }

    // Validate phone number format (should be numeric, 12 digits for Benin)
    const phoneStr = String(phoneNumber).replace(/\D/g, '');
    if (phoneStr.length !== 12) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid phone number. Must be 12 digits (229 + 9 digits for Benin)',
        }),
      };
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid amount. Must be a positive number',
        }),
      };
    }

    // Prepare FeePay request payload
    const feepayPayload = {
      shop: shopId,
      amount: Math.round(amount),
      phoneNumber: phoneStr,
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(description && { description }),
      ...(callbackInfo && { callback_info: callbackInfo }),
    };

    // Make request to FeePay API
    const endpoint = FEEPAY_ENDPOINTS[network];
    const feepayResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feepayPayload),
    });

    const feepayData = await feepayResponse.json();

    // Return response
    if (!feepayResponse.ok) {
      return {
        statusCode: feepayResponse.status || 500,
        body: JSON.stringify({
          error: 'FeePay API error',
          details: feepayData,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(feepayData),
    };
  } catch (err) {
    console.error('FeePay function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server error processing FeePay request',
        details: String(err),
      }),
    };
  }
};
