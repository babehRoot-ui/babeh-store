import { supabaseAdmin } from '@/lib/supabase';
import { listDroplets, createDroplet } from '@/lib/digitalocean';

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
    const action = body.action || 'list';

    // Ambil DO API Key
    const { data: apiKeys } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('type', 'do')
      .eq('is_active', true)
      .limit(1);

    if (!apiKeys || apiKeys.length === 0) {
      return Response.json({ error: 'DigitalOcean API Key belum dikonfigurasi' }, { status: 400 });
    }

    const doKey = apiKeys[0].api_key;

    if (action === 'list') {
      const result = await listDroplets(doKey);
      return Response.json({ data: result.droplets || [] });
    } else if (action === 'create') {
      const result = await createDroplet(doKey, body.config || {});
      return Response.json({ data: result.droplet });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
