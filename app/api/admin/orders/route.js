import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { verifyAdminToken } = await import('@/lib/utils');
    if (!verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { verifyAdminToken } = await import('@/lib/utils');
    if (!verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, status, delivery_data } = body;

    if (!order_id) return Response.json({ error: 'Order ID required' }, { status: 400 });

    const updates = {};
    if (status) updates.status = status;
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    if (delivery_data) updates.delivery_data = delivery_data;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('order_id', order_id)
      .select()
      .single();

    if (error) throw error;
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
