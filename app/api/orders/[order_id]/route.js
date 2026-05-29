import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', params.order_id)
      .single();

    if (error || !data) {
      return Response.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
