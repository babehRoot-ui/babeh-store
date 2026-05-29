'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_BANNER_IMAGE } from '@/lib/utils';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    image_url: '', title: '', link: '', order_position: 0, is_active: true,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchBanners = async () => {
    try {
      // Fetch all banners (including inactive) via direct supabase or separate endpoint
      const res = await fetch('/api/banners', headers);
      const data = await res.json();
      setBanners(data.data || []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ image_url: '', title: '', link: '', order_position: 0, is_active: true });
    setEditing(null);
    setShowForm(false);
  };

  const openAdd = () => { resetForm(); setShowForm(true); };

  const openEdit = (banner) => {
    setForm({
      image_url: banner.image_url || '',
      title: banner.title || '',
      link: banner.link || '',
      order_position: banner.order_position || 0,
      is_active: banner.is_active !== false,
    });
    setEditing(banner.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image_url) { showToast('Image URL wajib diisi', 'error'); return; }
    setSubmitting(true);
    try {
      const url = editing ? `/api/banners/${editing}` : '/api/banners';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Gagal menyimpan'); }
      showToast(editing ? 'Banner diupdate' : 'Banner ditambahkan', 'success');
      resetForm();
      fetchBanners();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus banner ini?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Gagal menghapus');
      showToast('Banner dihapus', 'success');
      fetchBanners();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-panel-card border border-panel-border img-skeleton" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium toast-enter ${toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50 text-red-200' : 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-200'}`}>{toast.msg}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-panel-muted">{banners.length} banner</p>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Tambah Banner
        </button>
      </div>

      <div className="space-y-3">
        {banners.map((banner, idx) => (
          <div key={banner.id} className="bg-panel-card border border-panel-border rounded-xl overflow-hidden hover:border-panel-accent/30 transition-colors">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-64 h-36 sm:h-auto bg-dark-700 flex-shrink-0 relative">
                <img src={banner.image_url || DEFAULT_BANNER_IMAGE} alt={banner.title || 'Banner'} className="w-full h-full object-cover" onError={e => { e.target.src = DEFAULT_BANNER_IMAGE; }} />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">#{idx + 1}</span>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white">{banner.title || 'Tanpa Judul'}</h3>
                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${banner.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {banner.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  {banner.link && (
                    <p className="text-[10px] text-cyan-400 truncate mb-1">{banner.link}</p>
                  )}
                  <p className="text-[10px] text-panel-muted">Posisi: {banner.order_position}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(banner)} className="px-3 py-1.5 rounded-lg bg-panel-border/50 hover:bg-panel-border text-panel-text text-[11px] font-medium transition-colors">Edit</button>
                  <button onClick={() => handleDelete(banner.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-colors">Hapus</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-16 bg-panel-card border border-panel-border rounded-xl">
          <p className="text-panel-muted text-sm">Belum ada banner. Klik "Tambah Banner" untuk memulai.</p>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[90] modal-overlay flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-panel-card border border-panel-border rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-panel-border">
              <h3 className="font-bold text-white">{editing ? 'Edit Banner' : 'Tambah Banner'}</h3>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-panel-border flex items-center justify-center text-panel-muted hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">Image URL *</label>
                <input type="url" value={form.image_url} onChange={e => updateField('image_url', e.target.value)} required placeholder="https://example.com/banner.jpg"
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
                {form.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-panel-border h-28 bg-dark-700">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Judul banner (opsional)"
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">Link (URL tujuan saat diklik)</label>
                <input type="url" value={form.link} onChange={e => updateField('link', e.target.value)} placeholder="https://..."
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-panel-muted mb-1">Urutan Posisi</label>
                <input type="number" value={form.order_position} onChange={e => updateField('order_position', parseInt(e.target.value) || 0)} min="0"
                  className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => updateField('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-panel-border bg-dark-500 text-cyan-500 focus:ring-cyan-500/20" />
                <span className="text-xs text-panel-muted">Banner Aktif</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-lg bg-panel-border/50 hover:bg-panel-border text-panel-text text-sm font-medium transition-colors">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : (editing ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
        }
