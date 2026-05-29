import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { order_id, product_id } = await request.json();

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();
    if (!order) throw new Error('Order not found');

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();
    if (!product) throw new Error('Product not found');

    const deliveryData = {
      file_url: product.file_url,
      product_name: product.name,
      description: product.description,
      download_note: 'Klik link di bawah untuk mengunduh file script',
    };

    await supabaseAdmin
      .from('orders')
      .update({
        status: 'delivered',
        delivery_data: deliveryData,
      })
      .eq('order_id', order_id);

    return Response.json({ success: true, delivery_data: deliveryData });
  } catch (error) {
    console.error('Script delivery error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
