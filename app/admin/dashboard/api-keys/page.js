'use client';

import { useState, useEffect } from 'react';

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});

  const [form, setForm] = useState({ type: 'pterodactyl', name: '', api_key: '', domain: '', is_active: true });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/admin/api-keys', headers);
      const data = await res.json();
      setKeys(data.data || []);
    } catch { setKeys([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchKeys(); }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ type: 'pterodactyl', name: '', api_key: '', domain: '', is_active: true });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.api_key) { showToast('API Key wajib diisi', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/api-keys', { method: 'POST', headers, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Gagal menyimpan'); }
      showToast('API Key berhasil disimpan', 'success');
      resetForm();
      fetchKeys();
    } catch (err) { showToast(err.message, 'error'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus API Key ini?')) return;
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Gagal menghapus');
      showToast('API Key dihapus', 'success');
      fetchKeys();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const toggleSecret = (id) => setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  const maskKey = (key) => key ? key.substring(0, 8) + '••••••••' + key.substring(key.length - 4) : '-';

  const typeLabels = { pterodactyl: 'Pterodactyl Panel', do: 'DigitalOcean' };
  const typeColors = { pterodactyl: 'text-cyan-400 bg-cyan-500/10', do: 'text-blue-400 bg-blue-500/10' };

  if (loading) {
    return <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-panel-card border border-panel-border img-skeleton" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium toast-enter ${toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50 text-red-200' : 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-200'}`}>{toast.msg}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-panel-muted">{keys.length} API key tersimpan</p>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Tambah API Key
        </button>
      </div>

      <div className="space-y-3">
        {keys.map(key => (
          <div key={key.id} className="bg-panel-card border border-panel-border rounded-xl p-5 hover:border-panel-accent/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${typeColors[key.type] || 'text-gray-400 bg-gray-500/10'}`}>
                  {typeLabels[key.type] || key.type}
                </span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${key.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {key.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <button onClick={() => handleDelete(key.id)} className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] transition-colors">Hapus</button>
            </div>
            {key.name && <p className="text-sm font-medium text-white mb-2">{key.name}</p>}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-panel-muted">API Key</span>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] font-mono text-panel-text">{showSecrets[key.id] ? key.api_key : maskKey(key.api_key)}</code>
                  <button onClick={() => toggleSecret(key.id)} className="text-panel-muted hover:text-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={showSecrets[key.id] ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'}/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={!showSecrets[key.id] ? 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : ''}/></svg>
                  </button>
                </div>
              </div>
              {key.domain && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-panel-muted">Domain / URL</span>
                  <code className="text-[11px] font-mono text-cyan-400">{key.domain}</code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {keys.length === 0 && (
        <div className="text-center py-16 bg-panel-card border border-panel-border rounded-xl">
          <p className="text-panel-muted text-sm mb-1">Belum ada API Key</p>
          <p className="text-[10px] text-panel-muted">Tambahkan API Key untuk menghubungkan ke layanan eksternal.</p>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[90] modal-overlay flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-panel-card border border-panel-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-panel-border">
              <h3 className="font-bold text-white">Tambah API Key</h3>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-panel-border flex items-center justify-center text-panel-muted hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">Tipe</label>
                <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                  <option value="pterodactyl">Pterodactyl Panel</option>
                  <option value="do">DigitalOcean</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">Nama (opsional)</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Contoh: Panel Utama"
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">API Key *</label>
                <input type="text" value={form.api_key} onChange={e => setForm(prev => ({ ...prev, api_key: e.target.value }))} required
                  placeholder={form.type === 'pterodactyl' ? 'ptla_xxxxxxxxxxxx' : 'dop_v1_xxxxxxxxxxxx'}
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">Domain / Base URL {form.type === 'pterodactyl' ? '*' : '(opsional)'}</label>
                <input type="text" value={form.domain} onChange={e => setForm(prev => ({ ...prev, domain: e.target.value }))} required={form.type === 'pterodactyl'}
                  placeholder="https://panel.example.com"
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-panel-border bg-dark-500 text-cyan-500 focus:ring-cyan-500/20" />
                <span className="text-xs text-panel-muted">Aktif</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-lg bg-panel-border/50 hover:bg-panel-border text-panel-text text-sm font-medium transition-colors">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
        }
