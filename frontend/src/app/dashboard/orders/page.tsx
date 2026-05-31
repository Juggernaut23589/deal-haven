'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Package, Truck, CheckCircle2, Clock, ChevronRight,
  XCircle, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Order, OrderStatus } from '@/types/order';

const TABS: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('');
  const [confirming, setConfirming] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ordersApi.getMyOrders('buying');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirming(orderId);
    try {
      await ordersApi.confirmDelivery(orderId);
      toast.success('Delivery confirmed — transaction complete');
      fetchOrders();
    } catch {
      toast.error('Failed to confirm delivery');
    } finally {
      setConfirming(null);
    }
  };

  if (authLoading) return null;

  const filtered = activeTab
    ? orders.filter((o) => o.status.toLowerCase() === activeTab)
    : orders;

  const getItemImage = (order: Order) =>
    order.items?.[0]?.listingImageUrl ?? `https://picsum.photos/seed/${order.id}/80/80`;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">My Orders</span>
        </nav>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            My Orders
            {!isLoading && orders.length > 0 && (
              <span className="ml-2 text-lg font-normal text-slate-400">({orders.length})</span>
            )}
          </h1>
          <Button variant="outline" size="sm" onClick={fetchOrders} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-14 w-14 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {activeTab ? `No ${activeTab} orders` : 'No orders yet'}
            </p>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              When you request to buy a listing, it will appear here.
            </p>
            <Button asChild><Link href="/search">Browse Listings</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const { label, colorClass } = formatOrderStatus(order.status);
              const item = order.items?.[0];
              const canConfirm = ['SHIPPED','IN_TRANSIT','PROCESSING','shipped','in_transit','processing'].includes(order.status);
              return (
                <div
                  key={order.id}
                  className={cn(
                    'rounded-xl bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800 shadow-card',
                    'p-4 flex gap-4 items-start'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getItemImage(order)}
                    alt=""
                    className="h-16 w-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item?.listingTitle ?? 'Order Item'}
                      </p>
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0', colorClass)}>
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {order.orderNumber} &middot; Seller: @{item?.sellerUsername ?? '—'}
                    </p>
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <p className="font-bold font-mono text-primary text-sm">{formatPrice(order.total)}</p>
                      <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Link
                        href={`/dashboard/orders/${order.id}` as Route}
                        className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        View Details →
                      </Link>
                      {canConfirm && (
                        <button
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={confirming === order.id}
                          className="text-xs font-medium text-success hover:text-emerald-700 transition-colors"
                        >
                          {confirming === order.id ? 'Confirming…' : 'Confirm Receipt'}
                        </button>
                      )}
                      {['PENDING','pending'].includes(order.status) && (
                        <Link
                          href={`/dashboard/messages?listing=${order.items[0]?.listingId}` as Route}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          Contact Seller
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
