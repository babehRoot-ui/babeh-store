import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (active !== null && active !== undefined) query = query.eq('is_active', active === 'true');

    const { data, error } = await query;
    if (error) throw error;
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validasi admin (sederhana - di produksi gunakan JWT middleware)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { verifyAdminToken } = await import('@/lib/utils');
    const admin = verifyAdminToken(authHeader.replace('Bearer ', ''));
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: body.name,
        description: body.description || null,
        price: body.price,
        category: body.category,
        type: body.type || null,
        stock: body.stock || 999,
        file_url: body.file_url || null,
        panel_domain: body.panel_domain || null,
        panel_plta: body.panel_plta || null,
        badge: body.badge || null,
        image_url: body.image_url || null,
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
