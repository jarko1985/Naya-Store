const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

export const paypal = {
  // PayPal only supports a fixed set of currency codes (see
  // PAYPAL_SUPPORTED_CURRENCIES in lib/constants) — all 2-decimal, so
  // .toFixed(2) is always correct for whatever currency is passed in here.
  createOrder: async function createOrder(price: number, currency: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: price.toFixed(2),
            },
          },
        ],
      }),
    });

    return handleResponse(response);
  },
  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleResponse(response);
  },
  // Refunds all or part of a previously captured payment. captureId is the
  // capture id stored as Order.paymentResult.id for a PayPal order. Only
  // USD/EUR/GBP ever reach here (PAYPAL_SUPPORTED_CURRENCIES), all 2-decimal,
  // so .toFixed(2) is always correct, same reasoning as createOrder above.
  refundCapture: async function refundCapture(
    captureId: string,
    amount: number,
    currency: string
  ) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/payments/captures/${captureId}/refund`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      }),
    });
    return handleResponse(response);
  },
};

// Generate paypal access token
async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    'base64'
  );

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  } else {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

export { generateAccessToken };