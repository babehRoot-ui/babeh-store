'use client';

import { useState, useEffect } from 'react';
import { formatRupiah, timeAgo } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchAll = async () => {
      try {
        const [prodRes, orderRes, serverRes] = await Promise.all([
          fetch('/api/products', headers),
          fetch('/api/admin/orders', { headers }),
          fetch('/api/integration/pterodactyl', { method: 'POST', headers }).catch(() => null),
        ]);

        const prodData = await prodRes.json();
        const orderData = await orderRes.json();
        const orders = orderData.data || [];

        let serverData = [];
        if (serverRes) {
          try {
            const sData = await serverRes.json();
            serverData = sData.data || [];
          } catch {}
        }

        setStats({
          products: (prodData.data || []).length,
          orders: orders.length,
          revenue: orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s, o) => s + (o.product_price || 0), 0),
          pending: orders.filter(o => o.status === 'pending').length,
        });

        setRecentOrders(orders.slice(0, 10));
        setServers(serverData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: 'Produk', value: stats.products, color: 'from-blue-500 to-cyan-500', icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>` },
    { label: 'Total Order', value: stats.orders, color: 'from-emerald-500 to-green-500', icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>` },
    { label: 'Pendapatan', value: formatRupiah(stats.revenue), color: 'from-amber-500 to-orange-500', icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
    { label: 'Pending', value: stats.pending, color: 'from-red-500 to-pink-500', icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-panel-card border border-panel-border img-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-panel-card border border-panel-border rounded-xl p-5 hover:border-panel-accent/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-panel-muted uppercase tracking-wider">{card.label}</span>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                <span dangerouslySetInnerHTML={{ __html: card.icon }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Status */}
        <div className="bg-panel-card border border-panel-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-panel-border">
            <h3 className="text-sm font-semibold text-white">Server Status</h3>
          </div>
          {servers.length > 0 ? (
            <div className="divide-y divide-panel-border">
              {servers.slice(0, 5).map((server, idx) => {
                const attrs = server.attributes || server;
                return (
                  <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-panel-card/50">
                    <div className="flex items-center gap-3">
                      <div className="pulse-dot online" />
                      <div>
                        <p className="text-sm text-white font-medium">{attrs.name || 'Unknown'}</p>
                        <p className="text-[10px] text-panel-muted">{attrs.identifier || '-'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-panel-green bg-panel-green/10 px-2 py-0.5 rounded">
                      {attrs.status === 0 ? 'Stopped' : 'Running'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-panel-muted">Belum ada server terhubung. Konfigurasi API Key Pterodactyl terlebih dahulu.</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-panel-card border border-panel-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-panel-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Order Terbaru</h3>
            <a href="/admin/dashboard/orders" className="text-[10px] text-cyan-400 hover:text-cyan-300">Lihat Semua →</a>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-panel-border">
              {recentOrders.map(order => (
                <div key={order.id} className="px-5 py-3 hover:bg-panel-card/50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-mono text-white">{order.order_id}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-panel-muted truncate max-w-[60%]">{order.product_name}</p>
                    <p className="text-xs font-semibold text-cyan-400">{formatRupiah(order.product_price)}</p>
                  </div>
                  <p className="text-[10px] text-panel-muted mt-1">{timeAgo(order.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-panel-muted">Belum ada order</p>
            </div>
          )}
        </div>
      </div>

      {/* Resource Usage Placeholder */}
      <div className="bg-panel-card border border-panel-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-panel-border">
          <h3 className="text-sm font-semibold text-white">Resource Usage</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'CPU', value: 0, max: 100, unit: '%' },
            { label: 'RAM', value: 0, max: 100, unit: '%' },
            { label: 'Disk', value: 0, max: 100, unit: '%' },
          ].map((res, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-panel-muted">{res.label}</span>
                <span className="text-xs font-mono text-white">{res.value}{res.unit}</span>
              </div>
              <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${res.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
