'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  ShoppingBag,
  Tag,
  Heart,
  Bookmark,
  ChevronRight,
  Package,
  TrendingDown,
  TrendingUp,
  Clock,
  ExternalLink,
  LayoutDashboard,
  MessageSquare,
  Bell,
  Settings,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';

// ─── Mock data (replaced by real API hooks in production) ──────────────────────

const MOCK_ORDERS = [
  {
    id: 'ord_1',
    orderNumber: 'DH-20260001',
    itemTitle: 'Apple MacBook Pro 14" M3 Pro',
    itemImage: 'https://picsum.photos/seed/mbp/60',
    price: 2_700_000,
    status: 'shipped' as const,
    date: '2026-03-18',
    trackingNumber: '1Z999AA10123456784',
  },
  {
    id: 'ord_2',
    orderNumber: 'DH-20260002',
    itemTitle: 'Sony WH-1000XM5 Headphones',
    itemImage: 'https://picsum.photos/seed/sony/60',
    price: 420_000,
    status: 'processing' as const,
    date: '2026-03-20',
    trackingNumber: null,
  },
  {
    id: 'ord_3',
    orderNumber: 'DH-20260003',
    itemTitle: 'LEGO Technic Set 42140',
    itemImage: 'https://picsum.photos/seed/lego/60',
    price: 135_000,
    status: 'delivered' as const,
    date: '2026-03-10',
    trackingNumber: null,
  },
];

const MOCK_OFFERS = [
  {
    id: 'off_1',
    listingTitle: 'iPhone 15 Pro Max 256GB Natural Titanium',
    listingImage: 'https://picsum.photos/seed/iphone/60',
    listingPrice: 1_650_000,
    offerAmount: 1_425_000,
    status: 'pending' as const,
    expiresIn: '22h',
  },
  {
    id: 'off_2',
    listingTitle: 'Herman Miller Aeron Chair Size C',
    listingImage: 'https://picsum.photos/seed/aeron/60',
    listingPrice: 2_100_000,
    offerAmount: 1_650_000,
    status: 'countered' as const,
    counterAmount: 1_800_000,
    expiresIn: '14h',
  },
];

const MOCK_SAVED_SEARCHES = [
  { id: 'ss_1', query: 'MacBook Pro M3', newMatches: 3, lastRun: '2026-03-22' },
  { id: 'ss_2', query: 'Herman Miller Chair', newMatches: 0, lastRun: '2026-03-21' },
  { id: 'ss_3', query: 'Vintage Rolex Watch', newMatches: 1, lastRun: '2026-03-22' },
];

// ─── Sidebar navigation ───────────────────────────────────────────────────────

const SIDEBAR_LINKS: { href: Route; label: string; icon: React.ElementType }[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders' as Route, label: 'My Orders', icon: ShoppingBag },
  { href: '/dashboard/offers' as Route, label: 'My Offers', icon: Tag },
  { href: '/dashboard/wishlist' as Route, label: 'Wishlist', icon: Heart },
  { href: '/dashboard/messages' as Route, label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/notifications' as Route, label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings' as Route, label: 'Settings', icon: Settings },
];

function DashboardSidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0"
      aria-label="Dashboard navigation"
    >
      <nav>
        <ul className="space-y-0.5" role="list">
          {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-slate-600 dark:text-slate-400',
                  'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                  'transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  href === '/dashboard' &&
                    'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                )}
                aria-current={href === '/dashboard' ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function DashboardMobileNav() {
  return (
    <nav
      className="lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 overflow-x-auto scrollbar-hide"
      aria-label="Dashboard navigation"
    >
      <ul className="flex gap-1.5 min-w-max pb-2" role="list">
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap',
                'border border-slate-200 dark:border-slate-700',
                'text-slate-600 dark:text-slate-400',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                'transition-colors duration-100',
                href === '/dashboard' &&
                  'bg-primary/10 border-primary/30 text-primary dark:text-primary-light font-semibold'
              )}
              aria-current={href === '/dashboard' ? 'page' : undefined}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── Overview stat card ───────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  badge,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  href: Route;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-4 rounded-xl p-5',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card hover:shadow-card-hover',
        'hover:border-primary/20',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        aria-hidden="true"
      >
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {value}
          </span>
          {badge}
        </div>
      </div>
      <ChevronRight
        className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0"
        aria-hidden="true"
      />
    </Link>
  );
}

// ─── Order status badge ───────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: string }) {
  const { label, colorClass } = formatOrderStatus(status);
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', colorClass)}>
      {label}
    </span>
  );
}

// ─── Offer status badge ────────────────────────────────────────────────────────

function OfferStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'destructive' | 'accent' }> = {
    pending: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Accepted', variant: 'success' },
    declined: { label: 'Declined', variant: 'destructive' },
    countered: { label: 'Counter Offer', variant: 'accent' },
    expired: { label: 'Expired', variant: 'default' },
    withdrawn: { label: 'Withdrawn', variant: 'default' },
  };
  const { label, variant } = statusMap[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={variant}>{label}</Badge>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth();

  // Recommended listings
  const { data: recommended, isLoading: recLoading } = useListings(
    { sort: 'deal_score', limit: 4 },
    { staleTime: 5 * 60_000 }
  );

  // Wishlist (placeholder — would use wishlistApi)
  const { data: wishlistItems, isLoading: wishlistLoading } = useListings(
    { sort: 'newest', limit: 4 },
    { staleTime: 5 * 60_000 }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <DashboardSidebar />

          <main className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            {/* Mobile nav */}
            <DashboardMobileNav />

            {/* Page header */}
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                Welcome back{user ? `, ${user.profile.displayName.split(' ')[0]}` : ''}! 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Account overview">
              <div role="listitem">
                <StatCard
                  title="Active Orders"
                  value={MOCK_ORDERS.filter((o) => !['delivered', 'completed'].includes(o.status)).length}
                  icon={ShoppingBag}
                  href={"/dashboard/orders" as Route}
                />
              </div>
              <div role="listitem">
                <StatCard
                  title="Pending Offers"
                  value={MOCK_OFFERS.filter((o) => o.status === 'pending').length}
                  icon={Tag}
                  href={"/dashboard/offers" as Route}
                  badge={<Badge variant="warning" size="sm">Respond</Badge>}
                />
              </div>
              <div role="listitem">
                <StatCard
                  title="Wishlist Items"
                  value={12}
                  icon={Heart}
                  href={"/dashboard/wishlist" as Route}
                />
              </div>
              <div role="listitem">
                <StatCard
                  title="Saved Searches"
                  value={MOCK_SAVED_SEARCHES.length}
                  icon={Bookmark}
                  href={"/dashboard/searches" as Route}
                  badge={
                    <Badge variant="solid-accent" size="sm">
                      {MOCK_SAVED_SEARCHES.reduce((acc, s) => acc + s.newMatches, 0)} new
                    </Badge>
                  }
                />
              </div>
            </div>

            {/* Recent Orders */}
            <section aria-labelledby="orders-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="orders-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  Recent Orders
                </h2>
                <Link
                  href={"/dashboard/orders" as Route}
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
                <table className="w-full text-sm" role="table" aria-label="Recent orders">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Order
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                        Item
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                        Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {MOCK_ORDERS.map((order) => (
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
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={order.itemImage}
                              alt=""
                              className="h-9 w-9 rounded-md object-cover shrink-0"
                            />
                            <span className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[160px]">
                              {order.itemTitle}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatPrice(order.price)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/orders/${order.id}` as Route}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
                            aria-label={`View order ${order.orderNumber}`}
                          >
                            Details
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Active Offers */}
            <section aria-labelledby="offers-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="offers-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  Active Offers
                </h2>
                <Link
                  href={"/dashboard/offers" as Route}
                  className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="space-y-3">
                {MOCK_OFFERS.map((offer) => (
                  <div
                    key={offer.id}
                    className={cn(
                      'flex items-center gap-4 rounded-xl p-4',
                      'bg-white dark:bg-surface-dark',
                      'border border-slate-100 dark:border-slate-800',
                      'shadow-card'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={offer.listingImage}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {offer.listingTitle}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">
                          Listed: <span className="font-mono font-medium">{formatPrice(offer.listingPrice)}</span>
                        </span>
                        <span className="text-xs text-slate-500">
                          Your offer:{' '}
                          <span className="font-mono font-medium text-primary">
                            {formatPrice(offer.offerAmount)}
                          </span>
                        </span>
                        {'counterAmount' in offer && offer.counterAmount && (
                          <span className="text-xs text-slate-500">
                            Counter:{' '}
                            <span className="font-mono font-medium text-accent-dark">
                              {formatPrice(offer.counterAmount)}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <OfferStatusBadge status={offer.status} />
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Expires in {offer.expiresIn}
                      </div>
                    </div>
                    {'counterAmount' in offer && offer.status === 'countered' && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" className="text-xs">Accept</Button>
                        <Button size="sm" variant="outline" className="text-xs">Decline</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Wishlist preview */}
            <section aria-labelledby="wishlist-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="wishlist-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  Wishlist
                </h2>
                <Link
                  href={"/dashboard/wishlist" as Route}
                  className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {wishlistLoading
                  ? [1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-shrink-0 w-52">
                        <Skeleton className="h-64 rounded-card" />
                      </div>
                    ))
                  : (wishlistItems?.listings ?? []).map((listing) => (
                      <div key={listing.id} className="flex-shrink-0 w-52">
                        <div className="relative">
                          {/* Price change indicator (mock) */}
                          {Math.random() > 0.6 && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-xs font-semibold text-white">
                              <TrendingDown className="h-3 w-3" aria-hidden="true" />
                              -8%
                            </div>
                          )}
                          <ListingCard listing={listing} />
                        </div>
                      </div>
                    ))}
              </div>
            </section>

            {/* Saved Searches */}
            <section aria-labelledby="searches-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="searches-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  Saved Searches
                </h2>
                <Link
                  href={"/dashboard/searches" as Route}
                  className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Manage
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="space-y-2">
                {MOCK_SAVED_SEARCHES.map((search) => (
                  <div
                    key={search.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3',
                      'bg-white dark:bg-surface-dark',
                      'border border-slate-100 dark:border-slate-800',
                      'shadow-card'
                    )}
                  >
                    <Search className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      &ldquo;{search.query}&rdquo;
                    </p>
                    {search.newMatches > 0 && (
                      <Badge variant="solid-accent" size="sm">
                        {search.newMatches} new
                      </Badge>
                    )}
                    <Link
                      href={`/search?q=${encodeURIComponent(search.query)}` as Route}
                      className="text-xs font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline shrink-0"
                    >
                      Search
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended */}
            <section aria-labelledby="recommended-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="recommended-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  Recommended for You
                </h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list">
                {recLoading
                  ? [1, 2, 3, 4].map((i) => (
                      <div key={i} role="listitem">
                        <Skeleton className="h-72 rounded-card" />
                      </div>
                    ))
                  : (recommended?.listings ?? []).map((listing) => (
                      <div key={listing.id} role="listitem">
                        <ListingCard listing={listing} />
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
