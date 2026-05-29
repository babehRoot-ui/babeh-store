'use client';

import { useState, useEffect } from 'react';
import { formatRupiah, getCategoryLabel, DEFAULT_PRODUCT_IMAGE } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form fields
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'panel',
    image_url: '', badge: '', file_url: '', panel_domain: '',
    panel_plta: '', type: '', is_active: true, stock: 999,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', headers);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      showToast('Gagal memuat produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'panel', image_url: '', badge: '', file_url: '', panel_domain: '', panel_plta: '', type: '', is_active: true, stock: 999 });
    setEditing(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || 'panel',
      image_url: product.image_url || '',
      badge: product.badge || '',
      file_url: product.file_url || '',
      panel_domain: product.panel_domain || '',
      panel_plta: product.panel_plta || '',
      type: product.type || '',
      is_active: product.is_active !== false,
      stock: product.stock || 999,
    });
    setEditing(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      showToast('Nama dan harga wajib diisi', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const body = { ...form, price: parseInt(form.price), stock: parseInt(form.stock) || 999 };
      // Bersihkan field kosong jadi null
      Object.keys(body).forEach(k => { if (body[k] === '') body[k] = null; });

      const url = editing ? `/api/products/${editing}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      showToast(editing ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan', 'success');
      resetForm();
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Gagal menghapus');
      showToast('Produk berhasil dihapus', 'success');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-xl bg-panel-card border border-panel-border img-skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium toast-enter ${
          toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50 text-red-200' :
          'bg-emerald-900/90 border border-emerald-500/50 text-emerald-200'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-panel-muted">{products.length} produk</p>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Tambah Produk
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-panel-card border border-panel-border rounded-xl overflow-hidden hover:border-panel-accent/30 transition-colors">
            <div className="aspect-video bg-dark-700 relative">
              <img
                src={product.image_url || DEFAULT_PRODUCT_IMAGE}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
              />
              {product.badge && (
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  product.badge === 'HOT' ? 'bg-red-500/90 text-white' :
                  product.badge === 'SALE' ? 'bg-amber-500/90 text-white' :
                  'bg-purple-500/90 text-white'
                }`}>{product.badge}</span>
              )}
              <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-medium ${product.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {product.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white truncate mb-1">{product.name}</h3>
              <p className="text-[10px] text-panel-muted mb-1">{getCategoryLabel(product.category)}</p>
              <p className="text-base font-bold text-cyan-400 mb-3">{formatRupiah(product.price)}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(product)} className="flex-1 py-1.5 rounded-lg bg-panel-border/50 hover:bg-panel-border text-panel-text text-[11px] font-medium transition-colors">Edit</button>
                <button onClick={() => handleDelete(product.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-panel-muted text-sm">Belum ada produk. Klik "Tambah Produk" untuk memulai.</p>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[90] modal-overlay flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={resetForm}>
          <div className="bg-panel-card border border-panel-border rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-in mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-panel-border">
              <h3 className="font-bold text-white">{editing ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-panel-border flex items-center justify-center text-panel-muted hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-panel-muted mb-1">Nama Produk *</label>
                  <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} required
                    className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-panel-muted mb-1">Deskripsi</label>
                  <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows="2"
                    className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-panel-muted mb-1">Harga (Rp) *</label>
                  <input type="number" value={form.price} onChange={e => updateField('price', e.target.value)} required min="0"
                    className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-panel-muted mb-1">Kategori</label>
                  <select value={form.category} onChange={e => updateField('category', e.target.value)}
                    className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                    <option value="panel">Pterodactyl Panel</option>
                    <option value="script">Script / File Digital</option>
                    <option value="vps">VPS DigitalOcean</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-panel-muted mb-1">Image URL (Gambar Produk) *</label>
                  <input type="url" value={form.image_url} onChange={e => updateField('image_url', e.target.value)} placeholder="https://example.com/image.jpg"
                    className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
                  {form.image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-panel-border h-32 bg-dark-700">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-panel-muted mb-1">Badge</label>
                  <select value={form.badge} onChange={e => updateField('badge', e.target.value)}
                    className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                    <option value="">Tanpa Badge</option>
                    <option value="HOT">HOT</option>
                    <option value="SALE">SALE</option>
                    <option value="LIMITED">LIMITED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-panel-muted mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={e => updateField('stock', e.target.value)} min="0"
                    className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                </div>

                {/* Conditional fields berdasarkan kategori */}
                {form.category === 'script' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-panel-muted mb-1">File URL (Link Script)</label>
                    <input type="url" value={form.file_url} onChange={e => updateField('file_url', e.target.value)} placeholder="https://drive.google.com/..."
                      className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
                  </div>
                )}

                {form.category === 'panel' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-panel-muted mb-1">Panel Domain</label>
                      <input type="text" value={form.panel_domain} onChange={e => updateField('panel_domain', e.target.value)} placeholder="https://panel.example.com"
                        className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-panel-muted mb-1">PLTA (Application API Key)</label>
                      <input type="text" value={form.panel_plta} onChange={e => updateField('panel_plta', e.target.value)} placeholder="ptla_xxxxxxxxxxxx"
                        className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-panel-muted mb-1">Server Config (JSON) - egg_id, nest_id, allocation_id, node_id, memory, disk, cpu</label>
                      <textarea value={form.type} onChange={e => updateField('type', e.target.value)} rows="3" placeholder='{"egg_id":1,"nest_id":1,"allocation_id":1,"node_id":1,"memory":1024,"disk":5120,"cpu":100}'
                        className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none" />
                    </div>
                  </>
                )}

                {form.category === 'vps' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-panel-muted mb-1">VPS Config (JSON) - region, size, image</label>
                    <textarea value={form.type} onChange={e => updateField('type', e.target.value)} rows="3" placeholder='{"region":"sgp1","size":"s-1vcpu-1gb","image":"ubuntu-22-04-x64"}'
                      className="w-full bg-dark-500 border border-panel-border rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none" />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => updateField('is_active', e.target.checked)}
                      className="w-4 h-4 rounded border-panel-border bg-dark-500 text-cyan-500 focus:ring-cyan-500/20" />
                    <span className="text-xs text-panel-muted">Produk Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-lg bg-panel-border/50 hover:bg-panel-border text-panel-text text-sm font-medium transition-colors">Batal</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Menyimpan...</>
                  ) : (editing ? 'Update Produk' : 'Simpan Produk')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
