'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Masukkan Order ID');
      return;
    }
    setError('');
    router.push(`/track/${orderId.trim()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Lacak Order</h1>
          <p className="text-sm text-gray-500">Masukkan Order ID untuk mengecek status pesanan Anda</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Contoh: BD-20241215-ABC123"
              className="w-full bg-dark-500 border border-dark-400/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-center font-mono"
            />
            {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Lacak Pesanan
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Kembali ke beranda</a>
        </div>
      </div>
    </div>
  );
                                        }
