'use client';

import * as React from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatPrice } from '@/lib/formatters';
import { adminApi } from '@/lib/adminApi';
import { useToast } from '@/store/uiStore';

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  buyer: { id: string; username: string; email: string };
  items: Array<{ listingTitle: string; sellerUsername: string; sellerId: string }>;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  PROCESSING: 'bg-primary/10 text-primary border-primary/20',
  PAID: 'bg-primary/10 text-primary border-primary/20',
  SHIPPED: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  IN_TRANSIT: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  DELIVERED: 'bg-success/10 text-success border-success/20',
  COMPLETED: 'bg-success/10 text-success border-success/20',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  DISPUTED: 'bg-error/10 text-error border-error/20',
  REFUNDED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');

  const load = React.useCallback(() => {
    setIsLoading(true);
    adminApi.getOrders({ page, limit: 30, search: search || undefined, status: status || undefined })
      .then((res) => { setOrders(res.data as AdminOrder[]); setTotal(res.meta.total); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setIsLoading(false));
  }, [page, search, status, toast]);

  React.useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Orders</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} total orders</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search order # or buyer…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="DISPUTED">Disputed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Order #', 'Buyer', 'Item', 'Seller', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary whitespace-nowrap">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">@{o.buyer.username}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">{o.items[0]?.listingTitle ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">@{o.items[0]?.sellerUsername ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-medium', STATUS_COLOR[o.status] ?? STATUS_COLOR.PENDING)}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 30 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-slate-500">Page {page} of {Math.ceil(total / 30)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 30)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
