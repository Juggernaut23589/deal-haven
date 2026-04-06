'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/formatters';

// ─── Mock orders ─────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
  {
    id: 'ord_1',
    orderNumber: 'DH-20260001',
    itemTitle: 'Apple MacBook Pro 14" M3 Pro',
    itemImage: 'https://picsum.photos/seed/mbp/80',
    price: 1_799.99,
    status: 'shipped' as const,
    date: '2026-03-18',
    seller: 'TechHub Store',
  },
  {
    id: 'ord_2',
    orderNumber: 'DH-20260002',
    itemTitle: 'Sony WH-1000XM5 Headphones',
    itemImage: 'https://picsum.photos/seed/sony/80',
    price: 279.95,
    status: 'delivered' as const,
    date: '2026-03-10',
    seller: 'AudioPhile',
  },
  {
    id: 'ord_3',
    orderNumber: 'DH-20260003',
    itemTitle: 'Herman Miller Aeron Chair',
    itemImage: 'https://picsum.photos/seed/chair/80',
    price: 1_395.00,
    status: 'pending' as const,
    date: '2026-03-22',
    seller: 'HomeStyle Boutique',
  },
  {
    id: 'ord_4',
    orderNumber: 'DH-20260004',
    itemTitle: 'Nintendo Switch OLED',
    itemImage: 'https://picsum.photos/seed/switch/80',
    price: 349.99,
    status: 'completed' as const,
    date: '2026-02-15',
    seller: 'GameWorld',
  },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'warning' as const },
  shipped: { label: 'Shipped', icon: Truck, color: 'info' as const },
  delivered: { label: 'Delivered', icon: Package, color: 'success' as const },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'success' as const },
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <span className="font-medium text-slate-900 dark:text-slate-100">My Orders</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            My Orders
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : MOCK_ORDERS.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No orders yet
            </h3>
            <p className="text-slate-500 mb-6">Start shopping to see your orders here.</p>
            <Button asChild>
              <Link href="/search">Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_ORDERS.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status];
              const StatusIcon = statusCfg.icon;
              return (
                <div
                  key={order.id}
                  className={cn(
                    'flex items-center gap-3 p-3 sm:gap-4 sm:p-4 rounded-xl',
                    'bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800',
                    'shadow-card hover:shadow-card-hover transition-shadow'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.itemImage}
                    alt={order.itemTitle}
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {order.itemTitle}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {order.orderNumber} &middot; {order.seller}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold font-mono text-slate-900 dark:text-slate-100">
                      {formatPrice(order.price)}
                    </p>
                    <Badge variant={statusCfg.color} size="sm" className="mt-1">
                      <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                      {statusCfg.label}
                    </Badge>
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
