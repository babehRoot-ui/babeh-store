'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatRupiah, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.order_id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Order tidak ditemukan');
        const data = await res.json();
        setOrder(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Auto refresh setiap 5 detik jika status pending/paid
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.data);
          if (['delivered', 'failed', 'expired'].includes(data.data?.status)) {
            clearInterval(interval);
          }
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <p className="text-gray-500 text-sm">Mencari order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4 opacity-30">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Order Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <a href="/track" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-dark-500 border border-dark-400/50 text-sm text-gray-300 hover:text-white transition-colors">
            ← Coba Lagi
          </a>
        </div>
      </div>
    );
  }

  const statusSteps = ['pending', 'paid', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Status Order</h1>
          <p className="text-sm text-gray-500 font-mono">{order.order_id}</p>
        </div>

        <div className="bg-dark-500/40 border border-dark-400/30 rounded-2xl overflow-hidden">
          {/* Status Progress */}
          <div className="p-6 border-b border-dark-400/20">
            <div className="flex items-center justify-between mb-6">
              {['Menunggu Bayar', 'Dibayar', 'Terkirim'].map((label, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all ${
                    idx <= currentStep
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-dark-400/50 text-gray-600'
                  } ${idx === currentStep ? 'ring-4 ring-cyan-500/20' : ''}`}>
                    {idx < currentStep ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${idx <= currentStep ? 'text-cyan-400' : 'text-gray-600'}`}>{label}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Order Detail */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Produk</span>
              <span className="text-white font-medium text-right">{order.product_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Harga</span>
              <span className="text-cyan-400 font-semibold">{formatRupiah(order.product_price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">WhatsApp</span>
              <span className="text-white">{order.customer_phone}</span>
            </div>
            {order.customer_name && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nama</span>
                <span className="text-white">{order.customer_name}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tanggal</span>
              <span className="text-white">{new Date(order.created_at).toLocaleString('id-ID')}</span>
            </div>
            {order.paid_at && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dibayar</span>
                <span className="text-emerald-400">{new Date(order.paid_at).toLocaleString('id-ID')}</span>
              </div>
            )}

            {/* Payment Link */}
            {order.status === 'pending' && order.payment_link && (
              <div className="pt-3 border-t border-dark-400/20">
                <a
                  href={order.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all"
                >
                  Bayar Sekarang (QRIS)
                </a>
                {order.payment_qr && (
                  <div className="mt-4 flex justify-center">
                    <img src={order.payment_qr} alt="QRIS" className="w-48 h-48 rounded-xl border border-dark-400/30" />
                  </div>
                )}
              </div>
            )}

            {/* Delivery Data */}
            {order.status === 'delivered' && order.delivery_data && (
              <div className="pt-3 border-t border-dark-400/20">
                <h4 className="text-sm font-semibold text-white mb-3">Detail Pengiriman</h4>
                <div className="bg-dark-600/50 rounded-xl p-4 space-y-2">
                  {Object.entries(order.delivery_data).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-cyan-400 font-mono text-right max-w-[60%] break-all">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/track" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Lacak order lain</a>
        </div>
      </div>
    </div>
  );
    }
