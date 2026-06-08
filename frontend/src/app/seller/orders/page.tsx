'use client';

import { SellerMobileNav } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Package, ChevronRight, Search, Truck, CheckCircle2,
  Clock, AlertCircle, XCircle, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Order } from '@/types/order';

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING: Clock,    pending: Clock,
  PAID: CheckCircle2, paid: CheckCircle2,
  PROCESSING: Clock, processing: Clock,
  SHIPPED: Truck,    shipped: Truck,
  IN_TRANSIT: Truck, in_transit: Truck,
  DELIVERED: CheckCircle2, delivered: CheckCircle2,
  COMPLETED: CheckCircle2, completed: CheckCircle2,
  CANCELLED: XCircle, cancelled: XCircle,
  DISPUTED: AlertCircle, disputed: AlertCircle,
  REFUNDED: XCircle, refunded: XCircle,
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-slate-500',    pending: 'text-slate-500',
  PAID: 'text-primary',         paid: 'text-primary',
  PROCESSING: 'text-amber-500', processing: 'text-amber-500',
  SHIPPED: 'text-blue-500',     shipped: 'text-blue-500',
  IN_TRANSIT: 'text-blue-500',  in_transit: 'text-blue-500',
  DELIVERED: 'text-success',    delivered: 'text-success',
  COMPLETED: 'text-success',    completed: 'text-success',
  CANCELLED: 'text-error',      cancelled: 'text-error',
  DISPUTED: 'text-error',       disputed: 'text-error',
  REFUNDED: 'text-slate-400',   refunded: 'text-slate-400',
};

const TABS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'DISPUTED', label: 'Disputed' },
];

export default function SellerOrdersPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('');
  const [search, setSearch] = React.useState('');

  const load = React.useCallback(() => {
    setIsLoading(true);
    ordersApi.getMyOrders('selling', activeTab || undefined, 1)
      .then((res) => setOrders(res.data ?? []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setIsLoading(false));
  }, [activeTab, toast]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.items?.[0]?.listingTitle?.toLowerCase().includes(q) ||
      o.buyer?.username?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  if (authLoading) return null;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <SellerMobileNav />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/seller" className="text-slate-500 hover:text-primary transition-colors">Seller Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Orders</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Incoming Orders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.key ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order # or buyer…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Package className="h-10 w-10" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((order) => {
                const StatusIcon = STATUS_ICON[order.status] ?? Clock;
                const statusColor = STATUS_COLOR[order.status] ?? 'text-slate-500';
                const item = order.items?.[0];
                const buyerName = order.buyer?.profile?.displayName ?? order.buyer?.username ?? 'Buyer';

                return (
                  <div key={order.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <Avatar src={order.buyer?.profile?.avatarUrl} name={buyerName} size="sm" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-primary">{order.orderNumber}</span>
                        <span className={cn('flex items-center gap-1 text-xs font-medium', statusColor)}>
                          <StatusIcon className="h-3 w-3" />
                          {formatOrderStatus(order.status).label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {item?.listingTitle ?? 'Order item'}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500">Buyer: {buyerName}</span>
                        <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">{formatPrice(order.total)}</p>
                      <Link href={`/seller/orders/${order.id}` as Route}>
                        <Button size="sm" variant="outline" leftIcon={<Eye className="h-3.5 w-3.5" />} className="mt-1">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
