import { supabase, supabaseAdmin } from '@/lib/supabase';
import { generateOrderId } from '@/lib/utils';
import { createPakasirTransaction } from '@/lib/pakasir';

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, customer_phone, customer_name, customer_email } = body;

    if (!product_id || !customer_phone) {
      return Response.json({ error: 'Product ID dan nomor WhatsApp wajib diisi' }, { status: 400 });
    }

    // Ambil data produk
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (prodErr || !product) {
      return Response.json({ error: 'Produk tidak ditemukan atau tidak aktif' }, { status: 404 });
    }

    const orderId = generateOrderId();
    const phone = customer_phone.startsWith('62') ? customer_phone : `62${customer_phone.replace(/^0/, '')}`;

    // Buat order di database
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        customer_phone: phone,
        customer_name: customer_name || null,
        customer_email: customer_email || null,
        status: 'pending',
        payment_method: 'qris',
        payment_expired: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Generate QRIS via Pakasir
    let paymentData = {};
    try {
      const pakasirRes = await createPakasirTransaction({
        orderId,
        amount: product.price,
        customerName: customer_name || 'Customer',
        customerPhone: phone,
        customerEmail: customer_email || '',
      });

      const pakasirData = pakasirRes.data || pakasirRes;
      paymentData = {
        payment_qr: pakasirData.qr_url || pakasirData.qr_string || null,
        payment_link: pakasirData.payment_url || pakasirData.checkout_url || null,
      };

      // Update order dengan data pembayaran
      await supabase
        .from('orders')
        .update(paymentData)
        .eq('id', order.id);

      // Simpan log transaksi
      await supabase
        .from('transactions')
        .insert({
          order_id: orderId,
          pakasir_id: pakasirData.id || pakasirData.transaction_id || null,
          amount: product.price,
          status: 'pending',
          raw_response: pakasirRes,
        });
    } catch (pakasirErr) {
      console.error('Pakasir error (order tetap dibuat):', pakasirErr);
      // Order tetap dibuat, tapi tanpa QRIS
      paymentData = { payment_qr: null, payment_link: null };
    }

    return Response.json({
      data: {
        order_id: orderId,
        ...paymentData,
      },
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
