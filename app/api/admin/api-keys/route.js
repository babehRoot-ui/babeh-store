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

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
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
      .from('api_keys')
      .insert({
        type: body.type,
        name: body.name || null,
        api_key: body.api_key,
        domain: body.domain || null,
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
