export async function getPterodactylConfig() {
  // Ambil config aktif dari database via API internal
  const baseUrl = process.env.PTERODACTYL_URL || '';
  const apiKey = process.env.PTERODACTYL_API_KEY || '';
  return { baseUrl, apiKey };
}

export async function fetchPterodactylServers(config) {
  const { baseUrl, apiKey } = config;
  if (!baseUrl || !apiKey) return [];

  try {
    const res = await fetch(`${baseUrl}/api/application/servers?include=allocations,node`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Pterodactyl error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Fetch Pterodactyl servers error:', error);
    return [];
  }
}

export async function createPterodactylUser(config, { username, email, password }) {
  const { baseUrl, apiKey } = config;
  const res = await fetch(`${baseUrl}/api/application/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      first_name: username,
      last_name: '',
      password,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors ? JSON.stringify(err.errors) : `Failed to create user: ${res.status}`);
  }
  return await res.json();
}

export async function createPterodactylServer(config, { name, userId, eggId, nestId, allocationId, nodeId, memory, disk, cpu }) {
  const { baseUrl, apiKey } = config;
  const res = await fetch(`${baseUrl}/api/application/servers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      user_id: userId,
      egg_id: eggId,
      nest_id: nestId,
      allocation_id: allocationId,
      node_id: nodeId,
      limits: { memory, disk, cpu },
      feature_limits: { databases: 2, backups: 1, allocations: 1 },
      startup: '',
      environment: {},
      deploy: true,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors ? JSON.stringify(err.errors) : `Failed to create server: ${res.status}`);
  }
  return await res.json();
}
