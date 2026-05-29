import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('order_position', { ascending: true });
    if (error) throw error;
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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
    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert({
        image_url: body.image_url,
        title: body.title || null,
        link: body.link || null,
        order_position: body.order_position || 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
