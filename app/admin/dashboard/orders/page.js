'use client';

import { useState, useEffect } from 'react';
import { formatRupiah, getStatusColor, getStatusLabel, timeAgo } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchOrders = async () => {
    try {
      const url = filter === 'all' ? '/api/admin/orders' : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url, headers);
      const data = await res.json();
      setOrders(data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Gagal update status');
      showToast(`Status diubah ke ${newStatus}`, 'success');
      fetchOrders();
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const statusFilters = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium toast-enter ${toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50 text-red-200' : 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-200'}`}>{toast.msg}</div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-panel-card border border-panel-border text-panel-muted hover:text-panel-text'}`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-panel-muted">{orders.length} order</span>
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-panel-card border border-panel-border img-skeleton" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-panel-card border border-panel-border rounded-xl">
          <p className="text-panel-muted text-sm">Tidak ada order</p>
        </div>
      ) : (
        <div className="bg-panel-card border border-panel-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-panel-border">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-panel-muted uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-panel-muted uppercase tracking-wider">Produk</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-panel-muted uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-panel-muted uppercase tracking-wider">Harga</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-panel-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-panel-muted uppercase tracking-wider">Waktu</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-panel-muted uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-border">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-panel-card/50">
                    <td className="px-4 py-3 text-xs font-mono text-white">{order.order_id}</td>
                    <td className="px-4 py-3 text-xs text-panel-text truncate max-w-[150px]">{order.product_name}</td>
                    <td className="px-4 py-3 text-xs text-panel-muted">{order.customer_phone}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-cyan-400">{formatRupiah(order.product_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-panel-muted">{timeAgo(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="px-2 py-1 rounded text-[10px] bg-panel-border/50 hover:bg-panel-border text-panel-text transition-colors">Detail</button>
                        {order.status === 'pending' && (
                          <button onClick={() => updateStatus(order.order_id, 'paid')} className="px-2 py-1 rounded text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors">Konfirmasi</button>
                        )}
                        {order.status === 'paid' && (
                          <button onClick={() => updateStatus(order.order_id, 'delivered')} className="px-2 py-1 rounded text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">Kirim</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[90] modal-overlay flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-panel-card border border-panel-border rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-panel-border sticky top-0 bg-panel-card z-10">
              <h3 className="font-bold text-white text-sm">Detail Order</h3>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg hover:bg-panel-border flex items-center justify-center text-panel-muted hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-panel-muted">Order ID</span>
                <span className="text-white font-mono text-xs">{selectedOrder.order_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-panel-muted">Produk</span>
                <span className="text-white text-right">{selectedOrder.product_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-panel-muted">Harga</span>
                <span className="text-cyan-400 font-semibold">{formatRupiah(selectedOrder.product_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-panel-muted">WhatsApp</span>
                <a href={`https://wa.me/${selectedOrder.customer_phone}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{selectedOrder.customer_phone}</a>
              </div>
              {selectedOrder.customer_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-panel-muted">Nama</span>
                  <span className="text-white">{selectedOrder.customer_name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-panel-muted">Status</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(selectedOrder.status)}`}>{getStatusLabel(selectedOrder.status)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-panel-muted">Dibuat</span>
                <span className="text-white text-xs">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</span>
              </div>
              {selectedOrder.paid_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-panel-muted">Dibayar</span>
                  <span className="text-emerald-400 text-xs">{new Date(selectedOrder.paid_at).toLocaleString('id-ID')}</span>
                </div>
              )}
              {selectedOrder.payment_link && (
                <div className="flex justify-between text-sm">
                  <span className="text-panel-muted">Payment Link</span>
                  <a href={selectedOrder.payment_link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-xs truncate max-w-[200px]">Buka</a>
                </div>
              )}

              {/* Delivery Data */}
              {selectedOrder.delivery_data && (
                <div className="pt-3 border-t border-panel-border">
                  <h4 className="text-xs font-semibold text-white mb-2">Delivery Data</h4>
                  <div className="bg-dark-500/50 rounded-lg p-3 space-y-1.5">
                    {Object.entries(selectedOrder.delivery_data).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px]">
                        <span className="text-panel-muted capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-cyan-400 font-mono text-right max-w-[60%] break-all">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-3 border-t border-panel-border flex gap-2">
                {selectedOrder.status === 'pending' && (
                  <button onClick={() => updateStatus(selectedOrder.order_id, 'paid')} className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors">Konfirmasi Bayar</button>
                )}
                {selectedOrder.status === 'paid' && (
                  <button onClick={() => updateStatus(selectedOrder.order_id, 'delivered')} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">Tandai Terkirim</button>
                )}
                {selectedOrder.status !== 'failed' && selectedOrder.status !== 'expired' && (
                  <button onClick={() => updateStatus(selectedOrder.order_id, 'failed')} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors">Gagal</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
          }
