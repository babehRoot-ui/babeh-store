export async function createDroplet(apiKey, { name, region, size, image, sshKeys }) {
  try {
    const res = await fetch('https://api.digitalocean.com/v2/droplets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name,
        region: region || 'sgp1',
        size: size || 's-1vcpu-1gb',
        image: image || 'ubuntu-22-04-x64',
        ssh_keys: sshKeys || [],
        backups: false,
        ipv6: true,
        monitoring: true,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `DO error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Create DO droplet error:', error);
    throw error;
  }
}

export async function listDroplets(apiKey) {
  try {
    const res = await fetch('https://api.digitalocean.com/v2/droplets', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (!res.ok) throw new Error(`DO list error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('List DO droplets error:', error);
    throw error;
  }
}

export async function getDroplet(apiKey, dropletId) {
  try {
    const res = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (!res.ok) throw new Error(`DO get error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Get DO droplet error:', error);
    throw error;
  }
}
