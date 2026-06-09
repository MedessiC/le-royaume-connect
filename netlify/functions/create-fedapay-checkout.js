const fetch = global.fetch || require('node-fetch');

exports.handler = async function (event) {
  try {
    const secret = process.env.FEDAPAY_SECRET;
    if (!secret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'FEDAPAY_SECRET not configured on server.' }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { amount, currency = 'EUR', description = 'Donation' } = body;

    if (!amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing amount' }) };
    }

    // Generic Fedapay create checkout request. Adjust endpoint/fields if your Fedapay account expects different payload.
    const resp = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amount),
        currency,
        description,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { statusCode: resp.status || 500, body: JSON.stringify(data) };
    }

    // Try to find a redirect/checkout URL in common properties
    const url = data.checkout_url || data.redirect_url || data.payment_url || data.url || data.data?.checkout_url;

    if (!url) {
      return { statusCode: 200, body: JSON.stringify({ data }) };
    }

    return { statusCode: 200, body: JSON.stringify({ url }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
