'use client';

import { useState } from 'react';

export default function AdminServersPage() {
  const [servers, setServers] = useState([]);
  const [droplets, setDroplets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pterodactyl');

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchPterodactyl = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/integration/pterodactyl', { method: 'POST', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data server');
      setServers(data.data || []);
    } catch (err) {
      setError(err.message);
      setServers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDigitalOcean = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/integration/digitalocean', { method: 'POST', headers, body: JSON.stringify({ action: 'list' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data droplet');
      setDroplets(data.data || []);
    } catch (err) {
      setError(err.message);
      setDroplets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button onClick={() => setActiveTab('pterodactyl')} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'pterodactyl' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-panel-card border border-panel-border text-panel-muted'}`}>
          Pterodactyl Servers
        </button>
        <button onClick={() => setActiveTab('digitalocean')} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'digitalocean' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-panel-card border border-panel-border text-panel-muted'}`}>
          DigitalOcean Droplets
        </button>
      </div>

      {activeTab === 'pterodactyl' && (
        <>
          <button onClick={fetchPterodactyl} disabled={loading}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5">
            {loading ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Memuat...</>
            ) : 'Sync Server dari Pterodactyl'}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>
          )}

          {/* Stats mirip Pterodactyl dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Servers', value: servers.length, color: 'text-cyan-400' },
              { label: 'Online', value: servers.filter(s => (s.attributes?.status || 0) !== 0).length, color: 'text-emerald-400' },
              { label: 'Stopped', value: servers.filter(s => (s.attributes?.status || 0) === 0).length, color: 'text-red-400' },
              { label: 'Total Users', value: new Set(servers.map(s => s.attributes?.user)).size, color: 'text-amber-400' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-panel-card border border-panel-border rounded-xl p-4">
                <p className="text-[10px] text-panel-muted uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Server List */}
          {servers.length > 0 ? (
            <div className="bg-panel-card border border-panel-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-panel-border">
                <h3 className="text-xs font-semibold text-white">Server Status</h3>
              </div>
              <div className="divide-y divide-panel-border">
                {servers.map((server, idx) => {
                  const attrs = server.attributes || server;
                  const isRunning = attrs.status !== 0;
                  const resources = attrs.resources || {};
                  return (
                    <div key={idx} className="px-5 py-4 hover:bg-panel-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`pulse-dot ${isRunning ? 'online' : 'offline'}`} />
                          <div>
                            <p className="text-sm font-medium text-white">{attrs.name || 'Unknown Server'}</p>
                            <p className="text-[10px] text-panel-muted font-mono">{attrs.identifier || '-'}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${isRunning ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {isRunning ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      {/* Resource bars */}
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[9px] text-panel-muted">CPU</span>
                            <span className="text-[9px] font-mono text-white">{resources.cpu_absolute || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-dark-400 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.min(resources.cpu_absolute || 0, 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[9px] text-panel-muted">RAM</span>
                            <span className="text-[9px] font-mono text-white">{resources.memory_bytes ? Math.round(resources.memory_bytes / 1024 / 1024) : 0} MB</span>
                          </div>
                          <div className="h-1.5 bg-dark-400 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(((resources.memory_bytes || 0) / (attrs.limits?.memory * 1024 * 1024 || 1)) * 100, 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[9px] text-panel-muted">Disk</span>
                            <span className="text-[9px] font-mono text-white">{resources.disk_bytes ? Math.round(resources.disk_bytes / 1024 / 1024) : 0} MB</span>
                          </div>
                          <div className="h-1.5 bg-dark-400 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(((resources.disk_bytes || 0) / (attrs.limits?.disk * 1024 * 1024 || 1)) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !loading && !error ? (
            <div className="text-center py-12 bg-panel-card border border-panel-border rounded-xl">
              <p className="text-panel-muted text-sm">Klik "Sync Server" untuk mengambil data dari Pterodactyl</p>
            </div>
          ) : null}
        </>
      )}

      {activeTab === 'digitalocean' && (
        <>
          <button onClick={fetchDigitalOcean} disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5">
            {loading ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Memuat...</>
            ) : 'Sync Droplet dari DigitalOcean'}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-panel-card border border-panel-border rounded-xl p-4">
              <p className="text-[10px] text-panel-muted uppercase tracking-wider mb-1">Total Droplets</p>
              <p className="text-2xl font-bold text-blue-400">{droplets.length}</p>
            </div>
            <div className="bg-panel-card border border-panel-border rounded-xl p-4">
              <p className="text-[10px] text-panel-muted uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{droplets.filter(d => d.status === 'active').length}</p>
            </div>
            <div className="bg-panel-card border border-panel-border rounded-xl p-4">
              <p className="text-[10px] text-panel-muted uppercase tracking-wider mb-1">Off</p>
              <p className="text-2xl font-bold text-red-400">{droplets.filter(d => d.status === 'off').length}</p>
            </div>
            <div className="bg-panel-card border border-panel-border rounded-xl p-4">
              <p className="text-[10px] text-panel-muted uppercase tracking-wider mb-1">Regions</p>
              <p className="text-2xl font-bold text-amber-400">{new Set(droplets.map(d => d.region?.slug)).size}</p>
            </div>
          </div>

          {droplets.length > 0 ? (
            <div className="bg-panel-card border border-panel-border rounded-xl overflow-hidden">
              <div className="divide-y divide-panel-border">
                {droplets.map(droplet => {
                  const ipv4 = droplet.networks?.v4?.find(n => n.type === 'public')?.ip_address;
                  return (
                    <div key={droplet.id} className="px-5 py-4 hover:bg-panel-card/50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <div className={`pulse-dot ${droplet.status === 'active' ? 'online' : 'offline'}`} />
                          <div>
                            <p className="text-sm font-medium text-white">{droplet.name}</p>
                            <p className="text-[10px] text-panel-muted font-mono">{ipv4 || '-'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${droplet.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                            {droplet.status}
                          </span>
                          <p className="text-[9px] text-panel-muted mt-1">{droplet.region?.slug?.toUpperCase()} • {droplet.size?.slug}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !loading && !error ? (
            <div className="text-center py-12 bg-panel-card border border-panel-border rounded-xl">
              <p className="text-panel-muted text-sm">Klik "Sync Droplet" untuk mengambil data dari DigitalOcean</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
            }
