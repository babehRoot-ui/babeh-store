import { supabaseAdmin } from '@/lib/supabase';
import { fetchPterodactylServers } from '@/lib/pterodactyl';

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

    // Ambil config dari API Keys
    const { data: apiKeys } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('type', 'pterodactyl')
      .eq('is_active', true)
      .limit(1);

    if (!apiKeys || apiKeys.length === 0) {
      return Response.json({ error: 'Pterodactyl API Key belum dikonfigurasi' }, { status: 400 });
    }

    const config = { baseUrl: apiKeys[0].domain, apiKey: apiKeys[0].api_key };
    const servers = await fetchPterodactylServers(config);

    return Response.json({ data: servers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
