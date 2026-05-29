import { supabaseAdmin } from '@/lib/supabase';
import { createPterodactylUser, createPterodactylServer, getPterodactylConfig } from '@/lib/pterodactyl';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { order_id, product_id } = await request.json();

    // Ambil order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();
    if (orderErr || !order) throw new Error('Order not found');

    // Ambil produk
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();
    if (!product) throw new Error('Product not found');

    // Ambil Pterodactyl config dari API Keys
    const { data: apiKeys } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('type', 'pterodactyl')
      .eq('is_active', true)
      .limit(1);

    const config = apiKeys && apiKeys.length > 0
      ? { baseUrl: apiKeys[0].domain, apiKey: apiKeys[0].api_key }
      : { baseUrl: product.panel_domain || '', apiKey: product.panel_plta || '' };

    if (!config.baseUrl || !config.apiKey) {
      throw new Error('Pterodactyl API config not found');
    }

    // Generate user credentials
    const username = `user_${order_id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)}`;
    const email = `${username}@babehstore.com`;
    const password = crypto.randomBytes(12).toString('base64url');

    // Buat user di Pterodactyl
    const userRes = await createPterodactylUser(config, { username, email, password });
    const userId = userRes.attributes?.id;

    if (!userId) throw new Error('Failed to create Pterodactyl user');

    // Parse konfigurasi server dari product type
    let serverConfig = {};
    try {
      serverConfig = product.type ? JSON.parse(product.type) : {};
    } catch {}

    // Buat server di Pterodactyl
    const serverRes = await createPterodactylServer(config, {
      name: `${product.name} - ${order_id.substring(0, 10)}`,
      userId,
      eggId: serverConfig.egg_id || 1,
      nestId: serverConfig.nest_id || 1,
      allocationId: serverConfig.allocation_id || 1,
      nodeId: serverConfig.node_id || 1,
      memory: serverConfig.memory || 1024,
      disk: serverConfig.disk || 5120,
      cpu: serverConfig.cpu || 100,
    });

    const serverId = serverRes.attributes?.id;
    const serverIdentifier = serverRes.attributes?.identifier;

    // Update order dengan delivery data
    const deliveryData = {
      panel_url: config.baseUrl,
      server_id: serverId,
      server_identifier: serverIdentifier,
      username,
      email,
      password,
      memory: serverConfig.memory || 1024,
      disk: serverConfig.disk || 5120,
      cpu: serverConfig.cpu || 100,
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
    console.error('Panel delivery error:', error);

    // Update order sebagai failed
    try {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'failed' })
        .eq('order_id', (await request.json()).order_id);
    } catch {}

    return Response.json({ error: error.message }, { status: 500 });
  }
}
