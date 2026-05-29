import { supabaseAdmin } from '@/lib/supabase';
import { createDroplet } from '@/lib/digitalocean';

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

    // Ambil DO API Key
    const { data: apiKeys } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('type', 'do')
      .eq('is_active', true)
      .limit(1);

    const doApiKey = apiKeys && apiKeys.length > 0 ? apiKeys[0].api_key : null;
    if (!doApiKey) throw new Error('DigitalOcean API Key not found');

    // Parse config
    let vpsConfig = {};
    try { vpsConfig = product.type ? JSON.parse(product.type) : {}; } catch {}

    const dropletName = `vps-${order_id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15)}`;
    const dropletRes = await createDroplet(doApiKey, {
      name: dropletName,
      region: vpsConfig.region || 'sgp1',
      size: vpsConfig.size || 's-1vcpu-1gb',
      image: vpsConfig.image || 'ubuntu-22-04-x64',
      sshKeys: vpsConfig.ssh_keys || [],
    });

    const droplet = dropletRes.droplet;
    const ipv4 = droplet?.networks?.v4?.find(n => n.type === 'public')?.ip_address;

    const deliveryData = {
      droplet_id: droplet?.id,
      droplet_name: dropletName,
      ip_address: ipv4,
      region: vpsConfig.region || 'sgp1',
      size: vpsConfig.size || 's-1vcpu-1gb',
      os: vpsConfig.image || 'ubuntu-22-04-x64',
      status: droplet?.status,
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
    console.error('VPS delivery error:', error);
    try {
      const body = await request.json();
      await supabaseAdmin.from('orders').update({ status: 'failed' }).eq('order_id', body.order_id);
    } catch {}
    return Response.json({ error: error.message }, { status: 500 });
  }
}
