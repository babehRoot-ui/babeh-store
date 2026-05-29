'use client';

import { useState, useEffect } from 'react';
import { formatRupiah, getCategoryLabel, DEFAULT_PRODUCT_IMAGE } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
