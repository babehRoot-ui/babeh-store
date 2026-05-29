const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;
const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT;
const PAKASIR_BASE_URL = 'https://pakasir.com/api/v1';

export async function createPakasirTransaction({ orderId, amount, customerName, customerPhone, customerEmail }) {
  try {
    const res = await fetch(`${PAKASIR_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAKASIR_API_KEY}`,
      },
      body: JSON.stringify({
        project: PAKASIR_PROJECT,
        order_id: orderId,
        amount: amount,
        customer_name: customerName || 'Customer',
        customer_phone: customerPhone,
        customer_email: customerEmail || '',
        payment_method: 'qris',
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/pakasir`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Pakasir error: ${res.status} - ${err}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Pakasir create transaction error:', error);
    throw error;
  }
}

export async function checkPakasirTransaction(pakasirId) {
  try {
    const res = await fetch(`${PAKASIR_BASE_URL}/transactions/${pakasirId}`, {
      headers: {
        'Authorization': `Bearer ${PAKASIR_API_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`Pakasir check error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Pakasir check transaction error:', error);
    throw error;
  }
}
