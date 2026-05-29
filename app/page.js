'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatRupiah, getCategoryLabel, DEFAULT_PRODUCT_IMAGE, DEFAULT_BANNER_IMAGE } from '@/lib/utils';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [filter, setFilter] = useState('all');

  // Form state
  const [phone, setPhone] = useState('');
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, banRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/banners'),
      ]);
      const prodData = await prodRes.json();
      const banData = await banRes.json();
      setProducts(prodData.data || []);
      setBanners(banData.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-slide banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openCheckout = (product) => {
    setSelectedProduct(product);
    setPhone('');
    setCustName('');
    setCustEmail('');
    setShowModal(true);
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast('Nomor WhatsApp tidak valid!', 'error');
      return;
    }
    setOrderLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          customer_phone: phone,
          customer_name: custName || undefined,
          customer_email: custEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat order');

      setShowModal(false);
      if (data.data?.payment_link) {
        window.open(data.data.payment_link, '_blank');
      }
      if (data.data?.payment_qr) {
        showToast(`QRIS generated! Order: ${data.data.order_id}`, 'success');
      }
      showToast(`Order ${data.data.order_id} dibuat! Silakan bayar.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-2xl toast-enter text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50 text-red-200' :
          toast.type === 'success' ? 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-200' :
          'bg-cyan-900/90 border border-cyan-500/50 text-cyan-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-400/50">
        {/* Marquee */}
        <div className="bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 border-b border-dark-400/30 py-1.5">
          <div className="marquee-container">
            <div className="marquee-content text-xs text-gray-400 font-medium">
              {[...Array(2)].map((_, i) => (
                <span key={i} className="mx-8">
                  🔥 SELAMAT DATANG DI BABEH DIGITAL STORE &nbsp;|&nbsp;
                  ⚡ Pterodactyl Panel - INSTAN &nbsp;|&nbsp;
                  🚀 VPS DigitalOcean - AUTO DEPLOY &nbsp;|&nbsp;
                  📦 Script Digital - LANGSUNG KIRIM &nbsp;|&nbsp;
                  💳 Pembayaran QRIS Mudah & Cepat &nbsp;|&nbsp;
                  🎉 Promo Spesial Setiap Hari &nbsp;|&nbsp;
                  📞 CS: 0851-3757-4436 &nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">BD</div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">BABEH DIGITAL STORE</h1>
                <p className="text-[10px] text-gray-500 leading-tight">Auto Order Digital Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/track" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors px-3 py-2 rounded-lg hover:bg-dark-500/50">
                Lacak Order
              </a>
              <a href="/admin/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2 py-1">
                Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Banner Carousel */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {banners.length > 0 ? (
            <div className="relative rounded-2xl overflow-hidden bg-dark-700 h-[220px] sm:h-[300px] md:h-[380px]">
              {banners.map((banner, idx) => (
                <a
                  key={banner.id}
                  href={banner.link || '#'}
                  target={banner.link ? '_blank' : undefined}
                  rel={banner.link ? 'noopener noreferrer' : undefined}
                  className={`banner-slide absolute inset-0 ${idx === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img
                    src={banner.image_url || DEFAULT_BANNER_IMAGE}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = DEFAULT_BANNER_IMAGE; }}
                  />
                  {banner.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{banner.title}</h2>
                    </div>
                  )}
                </a>
              ))}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBanner(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeBanner ? 'bg-cyan-400 w-6' : 'bg-white/40 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-dark-700 via-dark-600 to-dark-700 h-[220px] sm:h-[300px] md:h-[380px] flex items-center justify-center border border-dark-400/30">
              <div className="text-center px-6">
                <div className="text-5xl mb-4">⚡</div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">
                  BABEH <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">DIGITAL STORE</span>
                </h2>
                <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                  Toko digital terpercaya. Pterodactyl Panel, Script Digital, VPS DigitalOcean. Auto-order instan!
                </p>
              </div>
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
              </div>
            </div>
          )}
        </section>

        {/* Filter Tabs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Semua Produk' },
              { key: 'panel', label: 'Pterodactyl Panel' },
              { key: 'script', label: 'Script Digital' },
              { key: 'vps', label: 'VPS DigitalOcean' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-dark-500/50 text-gray-400 border border-dark-400/30 hover:bg-dark-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-600">{filtered.length} produk</span>
          </div>
        </section>

        {/* Product Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl bg-dark-500/50 border border-dark-400/30 overflow-hidden">
                  <div className="img-skeleton h-44" />
                  <div className="p-4 space-y-3">
                    <div className="img-skeleton h-4 rounded w-3/4" />
                    <div className="img-skeleton h-3 rounded w-1/2" />
                    <div className="img-skeleton h-10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-30">📦</div>
              <p className="text-gray-500 text-lg">Belum ada produk tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => (
                <div
                  key={product.id}
                  className="product-card rounded-xl bg-dark-500/40 border border-dark-400/30 overflow-hidden group cursor-pointer"
                  onClick={() => openCheckout(product)}
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden bg-dark-700">
                    <img
                      src={product.image_url || DEFAULT_PRODUCT_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                    {/* Badge */}
                    {product.badge && (
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        product.badge === 'HOT' ? 'bg-red-500/90 text-white' :
                        product.badge === 'SALE' ? 'bg-amber-500/90 text-white' :
                        product.badge === 'LIMITED' ? 'bg-purple-500/90 text-white' :
                        'bg-cyan-500/90 text-white'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                    {/* Category label */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-gray-300 backdrop-blur-sm">
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-gray-600 mb-0.5">Mulai dari</p>
                        <p className="text-lg font-bold text-cyan-400">{formatRupiah(product.price)}</p>
                      </div>
                      <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95">
                        Beli Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-2xl bg-gradient-to-br from-dark-600 via-dark-500 to-dark-600 border border-dark-400/30 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Butuh Bantuan?</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                Hubungi kami via WhatsApp untuk pertanyaan seputar produk atau bantuan teknis.
              </p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_PHONE || '6285137574436'}?text=Halo%20BABEH%20DIGITAL%20STORE`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.585-1.467A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.331 0-4.512-.638-6.384-1.748l-.447-.27-2.723.872.736-2.647-.3-.476A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                Chat WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-400/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} BABEH DIGITAL STORE. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="/track" className="hover:text-gray-400 transition-colors">Lacak Order</a>
            <a href="/admin/login" className="hover:text-gray-400 transition-colors">Admin</a>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-[90] modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-dark-700 border border-dark-400/50 rounded-2xl w-full max-w-md shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-400/30">
              <h3 className="font-bold text-white text-lg">Checkout</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-dark-500 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleOrder} className="p-5 space-y-4">
              {/* Product summary */}
              <div className="flex gap-3 p-3 rounded-xl bg-dark-600/50 border border-dark-400/20">
                <img
                  src={selectedProduct.image_url || DEFAULT_PRODUCT_IMAGE}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500">{getCategoryLabel(selectedProduct.category)}</p>
                  <p className="text-base font-bold text-cyan-400 mt-1">{formatRupiah(selectedProduct.price)}</p>
                </div>
              </div>

              {/* Form fields */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Nomor WhatsApp <span className="text-red-400">*</span></label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg bg-dark-500 border border-r-0 border-dark-400/50 text-xs text-gray-500">+62</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="85137574436"
                    required
                    className="flex-1 bg-dark-500 border border-dark-400/50 rounded-r-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Nama <span className="text-gray-600">(opsional)</span></label>
                <input
                  type="text"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full bg-dark-500 border border-dark-400/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email <span className="text-gray-600">(opsional)</span></label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-dark-500 border border-dark-400/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                <p className="text-[11px] text-amber-300/80">Pembayaran via QRIS. Produk otomatis dikirim setelah pembayaran dikonfirmasi.</p>
              </div>

              <button
                type="submit"
                disabled={orderLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {orderLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Memproses...
                  </>
                ) : (
                  <>Bayar Sekarang - {formatRupiah(selectedProduct.price)}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
