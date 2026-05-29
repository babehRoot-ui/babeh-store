export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderId() {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BD-${ts}-${rand}`;
}

export function getStatusColor(status) {
  const map = {
    pending: 'status-pending',
    paid: 'status-paid',
    delivered: 'status-delivered',
    failed: 'status-failed',
    expired: 'status-expired',
  };
  return map[status] || 'status-pending';
}

export function getStatusLabel(status) {
  const map = {
    pending: 'Menunggu Pembayaran',
    paid: 'Sudah Dibayar',
    delivered: 'Terkirim',
    failed: 'Gagal',
    expired: 'Kadaluarsa',
  };
  return map[status] || status;
}

export function getCategoryLabel(cat) {
  const map = {
    panel: 'Pterodactyl Panel',
    script: 'Script / File Digital',
    vps: 'VPS DigitalOcean',
  };
  return map[cat] || cat;
}

export function getCategoryIcon(cat) {
  const map = {
    panel: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>`,
    script: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
    vps: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>`,
  };
  return map[cat] || '';
}

export function timeAgo(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`;
  return date.toLocaleDateString('id-ID');
}

export const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/600x400/111827/06b6d4?text=No+Image';
export const DEFAULT_BANNER_IMAGE = 'https://placehold.co/1200x400/111827/06b6d4?text=BABEH+DIGITAL+STORE';

import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'babeh_secret_2024');

export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
