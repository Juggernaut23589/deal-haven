'use client';

import { SellerSidebar } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  DollarSign, Package, ShoppingBag, Star, TrendingUp,
  Plus, Store, BarChart3, ExternalLink, ChevronRight,
  Zap, LayoutDashboard, ListChecks, Tag, Settings,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';
import { ordersApi, listingsApi, offersApi, reviewsApi } from '@/lib/api';
import type { Order } from '@/types/order';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function StatsCard({ title, value, icon: Icon, sub, loading }: {
  title: string; value: string | number; icon: React.ElementType; sub?: string; loading?: boolean;
}) {
  return (
    <div className="rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20 rounded" />
      ) : (
        <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
      )}
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [stats, setStats] = React.useState({
    totalListings: 0,
    activeListings: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    avgRating: 0,
    reviewCount: 0,
    pendingOffers: 0,
  });
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    Promise.allSettled([
      ordersApi.getMyOrders('selling', undefined, 1).then((res) => {
        setOrders(res.data.slice(0, 5));
        const pending = res.data.filter((o) => ['PENDING', 'pending'].includes(o.status)).length;
        const revenue = res.data
          .filter((o) => ['COMPLETED', 'DELIVERED', 'completed', 'delivered'].includes(o.status))
          .reduce((s, o) => s + o.total, 0);
        setStats((p) => ({ ...p, pendingOrders: pending, totalRevenue: revenue }));
      }),
      listingsApi.getMyListings(undefined, 1, 1).then((res) => {
        setStats((p) => ({ ...p, totalListings: res.meta?.total ?? res.data.length }));
      }),
      listingsApi.getMyListings('ACTIVE', 1, 1).then((res) => {
        setStats((p) => ({ ...p, activeListings: res.meta?.total ?? res.data.length }));
      }),
      offersApi.getMyOffers('received', 'pending', 1).then((res) => {
        setStats((p) => ({ ...p, pendingOffers: res.meta?.total ?? res.data.length }));
      }),
      reviewsApi.getForSeller(user.id, 1).then((res) => {
        const reviews = res.data;
        const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
        setStats((p) => ({ ...p, avgRating: avg, reviewCount: res.meta?.total ?? reviews.length }));
      }),
    ]).finally(() => setDataLoading(false));
  }, [user]);

  if (authLoading) return null;

  return (
    <>
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />

          <main className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                  Seller Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {user?.profile.displayName ? `Welcome, ${user.profile.displayName.split(' ')[0]}` : 'Your store at a glance'}
                </p>
              </div>
              <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
                <Link href="/listing/create">Post a Listing</Link>
              </Button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Active Listings" value={stats.activeListings} icon={ListChecks} sub={`${stats.totalListings} total`} loading={dataLoading} />
              <StatsCard title="Pending Orders" value={stats.pendingOrders} icon={ShoppingBag} sub="awaiting action" loading={dataLoading} />
              <StatsCard title="Pending Offers" value={stats.pendingOffers} icon={Tag} sub="needs response" loading={dataLoading} />
              <StatsCard
                title="Avg. Rating"
                value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
                icon={Star}
                sub={stats.reviewCount > 0 ? `${stats.reviewCount} reviews` : 'No reviews yet'}
                loading={dataLoading}
              />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: '/seller/listings' as Route, icon: ListChecks, label: 'Manage Listings' },
                { href: '/seller/orders' as Route, icon: ShoppingBag, label: 'View Orders' },
                { href: '/seller/offers' as Route, icon: Tag, label: 'Review Offers' },
                { href: '/seller/storefront' as Route, icon: Store, label: 'Edit Storefront' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 rounded-xl p-4 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card hover:border-primary/30 hover:shadow-card-hover transition-all text-center group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{label}</span>
                </Link>
              ))}
            </div>

            {/* Recent orders */}
            <section aria-labelledby="orders-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="orders-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Recent Orders
                </h2>
                <Link href="/seller/orders" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {dataLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : orders.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 p-8 text-center">
                  <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No orders yet. List items to start selling.</p>
                  <Button asChild size="sm" className="mt-3"><Link href="/listing/create">Post a Listing</Link></Button>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {['Order', 'Item', 'Buyer', 'Status', 'Total', ''].map(h => (
                          <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {orders.map((order) => {
                        const { label, colorClass } = formatOrderStatus(order.status);
                        const item = order.items?.[0];
                        return (
                          <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{order.orderNumber}</td>
                            <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 max-w-[140px]">
                              <span className="line-clamp-1">{item?.listingTitle ?? '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                              @{item?.sellerUsername ?? order.buyer?.username ?? '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', colorClass)}>{label}</span>
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                              {formatPrice(order.total)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/seller/orders/${order.id}` as Route} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                                Manage <ExternalLink className="h-3 w-3" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Tips when empty */}
            {!dataLoading && stats.activeListings === 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Get started as a seller</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2"><TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />Post your first listing — it only takes a few minutes.</li>
                  <li className="flex items-start gap-2"><MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />Respond quickly to messages and offers to build your reputation.</li>
                  <li className="flex items-start gap-2"><Store className="h-4 w-4 text-primary mt-0.5 shrink-0" />Set up your storefront with a bio and photo for more trust.</li>
                </ul>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
