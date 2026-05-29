import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Pakasir webhook received:', JSON.stringify(body));

    // Pakasir biasanya mengirim: { order_id, status, transaction_id, ... }
    const orderId = body.order_id || body.external_id;
    const status = body.status || body.payment_status;
    const pakasirId = body.transaction_id || body.id;

    if (!orderId) {
      return Response.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Cek apakah sudah diproses
    const { data: existingTx } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingTx && existingTx.status === 'paid') {
      return Response.json({ message: 'Already processed' });
    }

    // Update transaksi log
    if (pakasirId) {
      await supabaseAdmin
        .from('transactions')
        .update({ status, raw_response: body })
        .eq('pakasir_id', pakasirId);
    }

    // Jika status paid/success
    if (status === 'paid' || status === 'success' || status === 'settlement') {
      // Update order status
      const { data: order } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .select('*, products(*)')
        .single();

      if (order) {
        // Trigger delivery (fire and forget)
        const category = order.products?.category;
        const productId = order.product_id;

        if (category === 'panel') {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/delivery/panel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, product_id: productId }),
          }).catch(e => console.error('Delivery panel error:', e));
        } else if (category === 'vps') {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/delivery/vps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, product_id: productId }),
          }).catch(e => console.error('Delivery VPS error:', e));
        } else if (category === 'script') {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/delivery/script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, product_id: productId }),
          }).catch(e => console.error('Delivery script error:', e));
        }

        // Kirim notifikasi WhatsApp
        try {
          const msg = encodeURIComponent(
            `*ORDER BERHASIL DIBAYAR*\n\n` +
            `Order ID: ${orderId}\n` +
            `Produk: ${order.product_name}\n` +
            `Harga: Rp${order.product_price.toLocaleString('id-ID')}\n` +
            `Status: Sedang diproses\n\n` +
            `Produk akan segera dikirim otomatis.`
          );
          await fetch(`https://api.whatsapp.com/send?phone=${order.customer_phone}&text=${msg}`);
        } catch {}
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
