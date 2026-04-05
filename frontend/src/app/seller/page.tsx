'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Plus,
  Store,
  BarChart3,
  CreditCard,
  ExternalLink,
  Clock,
  ChevronRight,
  Zap,
  LayoutDashboard,
  ListChecks,
  Tag,
  Settings,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';

// ─── Mock revenue chart data ──────────────────────────────────────────────────

const REVENUE_DATA_7D = [
  { date: 'Mar 16', revenue: 320 },
  { date: 'Mar 17', revenue: 480 },
  { date: 'Mar 18', revenue: 260 },
  { date: 'Mar 19', revenue: 590 },
  { date: 'Mar 20', revenue: 820 },
  { date: 'Mar 21', revenue: 430 },
  { date: 'Mar 22', revenue: 710 },
];

const REVENUE_DATA_30D = Array.from({ length: 30 }, (_, i) => ({
  date: `Mar ${i + 1}`,
  revenue: Math.floor(Math.random() * 1200 + 200),
}));

const REVENUE_DATA_90D = Array.from({ length: 12 }, (_, i) => ({
  date: `Week ${i + 1}`,
  revenue: Math.floor(Math.random() * 5000 + 1000),
}));

const REVENUE_DATA_1Y = [
  { date: 'Apr 25', revenue: 12400 },
  { date: 'May 25', revenue: 18900 },
  { date: 'Jun 25', revenue: 22100 },
  { date: 'Jul 25', revenue: 19800 },
  { date: 'Aug 25', revenue: 24500 },
  { date: 'Sep 25', revenue: 21300 },
  { date: 'Oct 25', revenue: 27800 },
  { date: 'Nov 25', revenue: 31200 },
  { date: 'Dec 25', revenue: 38400 },
  { date: 'Jan 26', revenue: 24100 },
  { date: 'Feb 26', revenue: 29800 },
  { date: 'Mar 26', revenue: 14600 },
];

const CHART_DATA_MAP = {
  '7d': REVENUE_DATA_7D,
  '30d': REVENUE_DATA_30D,
  '90d': REVENUE_DATA_90D,
  '1y': REVENUE_DATA_1Y,
};

type TimeRange = '7d' | '30d' | '90d' | '1y';

// ─── Mock orders ──────────────────────────────────────────────────────────────

const MOCK_SELLER_ORDERS = [
  {
    id: 'so_1',
    orderNumber: 'DH-20260010',
    buyerName: 'Michael Chen',
    itemTitle: 'iPhone 14 Pro 256GB Purple',
    amount: 649,
    status: 'processing',
    date: '2026-03-22',
    canShip: true,
  },
  {
    id: 'so_2',
    orderNumber: 'DH-20260011',
    buyerName: 'Sarah Williams',
    itemTitle: 'AirPods Pro 2nd Gen',
    amount: 189,
    status: 'shipped',
    date: '2026-03-20',
    canShip: false,
  },
  {
    id: 'so_3',
    orderNumber: 'DH-20260012',
    buyerName: 'James Thompson',
    itemTitle: 'MacBook Air M2 Space Gray',
    amount: 1_049,
    status: 'delivered',
    date: '2026-03-15',
    canShip: false,
  },
  {
    id: 'so_4',
    orderNumber: 'DH-20260013',
    buyerName: 'Aisha Patel',
    itemTitle: 'iPad Pro 11" Wi-Fi 256GB',
    amount: 799,
    status: 'payment_confirmed',
    date: '2026-03-22',
    canShip: true,
  },
];

// ─── Listings needing attention ───────────────────────────────────────────────

const ATTENTION_LISTINGS = [
  {
    id: 'al_1',
    title: 'DJI Mini 3 Pro Drone',
    reason: 'expiring_soon',
    detail: 'Expires in 2 days',
    price: 499,
  },
  {
    id: 'al_2',
    title: 'Canon EOS R6 Mark II',
    reason: 'low_views',
    detail: 'Only 12 views in 7 days — consider a price drop',
    price: 2_399,
  },
  {
    id: 'al_3',
    title: 'Sony A7 IV Kit',
    reason: 'out_of_stock',
    detail: 'Variant "Silver" is out of stock',
    price: 2_599,
  },
];

const ATTENTION_ICONS: Record<string, React.ElementType> = {
  expiring_soon: Clock,
  low_views: TrendingUp,
  out_of_stock: AlertTriangle,
};

const ATTENTION_COLORS: Record<string, string> = {
  expiring_soon: 'text-warning',
  low_views: 'text-slate-500',
  out_of_stock: 'text-error',
};

// ─── Sidebar navigation ───────────────────────────────────────────────────────

const SELLER_SIDEBAR_LINKS: { href: Route; label: string; icon: React.ElementType }[] = [
  { href: '/seller', label: 'Overview', icon: LayoutDashboard },
  { href: '/seller/listings' as Route, label: 'My Listings', icon: ListChecks },
  { href: '/seller/orders' as Route, label: 'Orders', icon: ShoppingBag },
  { href: '/seller/offers' as Route, label: 'Offers', icon: Tag },
  { href: '/seller/analytics' as Route, label: 'Analytics', icon: BarChart3 },
  { href: '/seller/earnings' as Route, label: 'Earnings', icon: DollarSign },
  { href: '/seller/storefront' as Route, label: 'Storefront', icon: Store },
  { href: '/seller/reviews' as Route, label: 'Reviews', icon: Star },
  { href: '/seller/promotions' as Route, label: 'Promotions', icon: Zap },
  { href: '/seller', label: 'Settings', icon: Settings },
];

function SellerSidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0"
      aria-label="Seller dashboard navigation"
    >
      <nav>
        <ul className="space-y-0.5" role="list">
          {SELLER_SIDEBAR_LINKS.map(({ href, label, icon: Icon }, i) => (
            <li key={`${href}-${i}`}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-slate-600 dark:text-slate-400',
                  'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                  'transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  href === '/seller' && label === 'Overview' &&
                    'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                )}
                aria-current={href === '/seller' && label === 'Overview' ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick actions */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <Button asChild size="sm" className="w-full" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          <Link href="/listing/create">New Listing</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={'/shop/me' as Route}>View Storefront</Link>
        </Button>
      </div>
    </aside>
  );
}

// ─── Stats card ────────────────────────────────────────────────────────────────

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  colorClass = 'bg-primary/10 text-primary',
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  colorClass?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-5',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card'
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colorClass)}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend >= 0 ? 'text-success' : 'text-error'
            )}
            aria-label={`${trend >= 0 ? 'Up' : 'Down'} ${Math.abs(trend)}% ${trendLabel ?? ''}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{title}</p>
    </div>
  );
}

// ─── Revenue chart ─────────────────────────────────────────────────────────────

function RevenueChart() {
  const [range, setRange] = React.useState<TimeRange>('7d');
  const data = CHART_DATA_MAP[range];

  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div
      className={cn(
        'rounded-xl p-6',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Revenue
          </h3>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {formatPrice(total)}
          </p>
        </div>

        {/* Time range selector */}
        <div
          className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          role="group"
          aria-label="Select time range"
        >
          {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                range === r
                  ? 'bg-primary text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56" aria-label="Revenue chart" role="img">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value: number) => [formatPrice(value), 'Revenue']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0D7377"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#0D7377' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl mb-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />

          <main className="flex-1 min-w-0 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                  Seller Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage your listings, orders, and earnings.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  asChild
                  size="sm"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  <Link href="/listing/create">Create Listing</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/shop/${user?.sellerProfile?.storefrontSlug ?? 'me'}` as Route} target="_blank">
                    <Store className="h-3.5 w-3.5" />
                    View Storefront
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4" role="list" aria-label="Seller statistics">
              {[
                {
                  title: 'Total Revenue',
                  value: '$14,820',
                  icon: DollarSign,
                  trend: 12,
                  trendLabel: 'vs last month',
                  colorClass: 'bg-success/10 text-success',
                },
                {
                  title: 'This Month',
                  value: '$3,190',
                  icon: TrendingUp,
                  trend: 8,
                  colorClass: 'bg-primary/10 text-primary',
                },
                {
                  title: 'Active Listings',
                  value: '24',
                  icon: ListChecks,
                  trend: 4,
                  colorClass: 'bg-accent/10 text-accent-dark',
                },
                {
                  title: 'Pending Orders',
                  value: '6',
                  icon: ShoppingBag,
                  colorClass: 'bg-warning/10 text-warning',
                },
                {
                  title: 'Avg. Rating',
                  value: '4.8',
                  icon: Star,
                  colorClass: 'bg-accent/10 text-accent-dark',
                },
                {
                  title: 'Response Rate',
                  value: '96%',
                  icon: MessageSquare,
                  trend: -2,
                  colorClass: 'bg-primary/10 text-primary',
                },
              ].map((stat) => (
                <div key={stat.title} role="listitem">
                  <StatsCard {...stat} />
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <RevenueChart />

            {/* Listings Needing Attention */}
            <section aria-labelledby="attention-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="attention-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
                >
                  <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                  Listings Needing Attention
                </h2>
                <Link
                  href={"/seller/listings" as Route}
                  className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  All listings
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="space-y-3">
                {ATTENTION_LISTINGS.map((item) => {
                  const Icon = ATTENTION_ICONS[item.reason] ?? AlertTriangle;
                  const colorClass = ATTENTION_COLORS[item.reason] ?? 'text-slate-500';

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between gap-4 rounded-xl px-4 py-3',
                        'bg-white dark:bg-surface-dark',
                        'border border-slate-100 dark:border-slate-800',
                        'shadow-card'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn('h-5 w-5 shrink-0', colorClass)} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                          {formatPrice(item.price)}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/seller/listings?highlight=${item.id}` as Route}>Fix</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recent Orders */}
            <section aria-labelledby="seller-orders-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="seller-orders-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  Recent Orders
                </h2>
                <Link
                  href={"/seller/orders" as Route}
                  className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div
                className={cn(
                  'rounded-xl overflow-hidden',
                  'bg-white dark:bg-surface-dark',
                  'border border-slate-100 dark:border-slate-800',
                  'shadow-card'
                )}
              >
                <table className="w-full text-sm" role="table" aria-label="Recent seller orders">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Order #', 'Buyer', 'Item', 'Amount', 'Status', 'Action'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className={cn(
                            'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide',
                            h === 'Amount' || h === 'Action' ? 'text-right' : 'text-left',
                            (h === 'Buyer' || h === 'Item') && 'hidden sm:table-cell'
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {MOCK_SELLER_ORDERS.map((order) => {
                      const { label, colorClass } = formatOrderStatus(order.status);
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.date)}</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-sm text-slate-800 dark:text-slate-200">{order.buyerName}</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[140px]">
                              {order.itemTitle}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                              {formatPrice(order.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                colorClass
                              )}
                            >
                              {label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {order.canShip ? (
                              <Button size="sm" className="text-xs h-7 px-3">
                                Mark Shipped
                              </Button>
                            ) : (
                              <Link
                                href={`/seller/orders/${order.id}` as Route}
                                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
                                aria-label={`View order ${order.orderNumber}`}
                              >
                                View
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Quick Actions */}
            <section aria-labelledby="quick-actions-heading">
              <h2
                id="quick-actions-heading"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4"
              >
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="list">
                {[
                  {
                    label: 'Create Listing',
                    icon: Plus,
                    href: '/listing/create' as Route,
                    colorClass: 'bg-primary text-white hover:bg-primary-dark',
                  },
                  {
                    label: 'View Storefront',
                    icon: Store,
                    href: '/shop/me' as Route,
                    colorClass: 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/30',
                  },
                  {
                    label: 'Manage Payouts',
                    icon: CreditCard,
                    href: '/seller/earnings' as Route,
                    colorClass: 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/30',
                  },
                  {
                    label: 'View Analytics',
                    icon: BarChart3,
                    href: '/seller/analytics' as Route,
                    colorClass: 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/30',
                  },
                ].map(({ label, icon: Icon, href, colorClass }) => (
                  <div key={href} role="listitem">
                    <Link
                      href={href}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl px-4 py-5 text-center',
                        'transition-all duration-150 shadow-card hover:shadow-card-hover',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        colorClass
                      )}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
