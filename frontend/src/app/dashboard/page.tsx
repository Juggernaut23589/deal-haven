'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  ShoppingBag, Tag, Heart, Bookmark, ChevronRight,
  Package, Clock, ExternalLink, LayoutDashboard,
  MessageSquare, Bell, Settings, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';
import { ordersApi, offersApi, wishlistApi, searchApi, notificationsApi } from '@/lib/api';
import type { Order, Offer } from '@/types/order';

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
    <aside className="hidden lg:flex flex-col w-56 shrink-0" aria-label="Dashboard navigation">
      <nav>
        <ul className="space-y-0.5" role="list">
          {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-slate-600 dark:text-slate-400',
                  'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                  'transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  href === '/dashboard' && 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
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
    <nav className="lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 overflow-x-auto scrollbar-hide" aria-label="Dashboard navigation">
      <ul className="flex gap-1.5 min-w-max pb-2" role="list">
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap',
                'border border-slate-200 dark:border-slate-700',
                'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                'transition-colors duration-100',
                href === '/dashboard' && 'bg-primary/10 border-primary/30 text-primary dark:text-primary-light font-semibold'
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

function StatCard({
  title, value, icon: Icon, href, badge, loading,
}: {
  title: string; value: string | number; icon: React.ElementType;
  href: Route; badge?: React.ReactNode; loading?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-4 rounded-xl p-5',
        'bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800',
        'shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {loading ? (
            <Skeleton className="h-7 w-10 rounded" />
          ) : (
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">{value}</span>
          )}
          {badge}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth();

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const [savedSearches, setSavedSearches] = React.useState<Array<{ id: string; name: string; query: string; newMatchCount: number }>>([]);
  const [unreadNotif, setUnreadNotif] = React.useState(0);
  const [dataLoading, setDataLoading] = React.useState(true);

  const { data: recommended, isLoading: recLoading } = useListings({ sort: 'newest', limit: 4 });

  React.useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      ordersApi.getMyOrders('buying', undefined, 1).then((r) => setOrders(r.data.slice(0, 3))),
      offersApi.getMyOffers('sent', undefined, 1).then((r) => setOffers(r.data.slice(0, 3))),
      wishlistApi.get(1).then((r) => setWishlistCount(r.meta.total)),
      searchApi.getSavedSearches().then((r) => setSavedSearches(r)),
      notificationsApi.getUnreadCount().then((r) => setUnreadNotif(r.count)),
    ]).finally(() => setDataLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['COMPLETED','CANCELLED','completed','cancelled'].includes(o.status)).length;
  const pendingOffers = offers.filter((o) => o.status === 'pending').length;
  const newSearchMatches = savedSearches.reduce((s, ss) => s + (ss.newMatchCount ?? 0), 0);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <DashboardSidebar />

          <main className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            <DashboardMobileNav />

            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                Welcome back{user ? `, ${user.profile.displayName.split(' ')[0]}` : ''}!
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Here&apos;s what&apos;s happening with your account.
              </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Active Orders" value={activeOrders} icon={ShoppingBag} href="/dashboard/orders" loading={dataLoading} />
              <StatCard
                title="Pending Offers" value={pendingOffers} icon={Tag} href="/dashboard/offers" loading={dataLoading}
                badge={pendingOffers > 0 ? <Badge variant="warning" size="sm">Respond</Badge> : undefined}
              />
              <StatCard title="Wishlist Items" value={wishlistCount} icon={Heart} href="/dashboard/wishlist" loading={dataLoading} />
              <StatCard
                title="Notifications" value={unreadNotif} icon={Bell} href="/dashboard/notifications" loading={dataLoading}
                badge={unreadNotif > 0 ? <Badge variant="solid-accent" size="sm">{unreadNotif} new</Badge> : undefined}
              />
            </div>

            {/* Recent Orders */}
            <section aria-labelledby="orders-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="orders-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Orders</h2>
                <Link href="/dashboard/orders" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {dataLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : orders.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 p-8 text-center">
                  <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No orders yet. Browse listings to get started.</p>
                  <Button asChild size="sm" className="mt-3"><Link href="/search">Browse Listings</Link></Button>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {['Order', 'Item', 'Status', 'Total', ''].map(h => (
                          <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide first:table-cell [&:nth-child(2)]:hidden sm:[&:nth-child(2)]:table-cell [&:nth-child(4)]:hidden md:[&:nth-child(4)]:table-cell">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {orders.map((order) => {
                        const { label, colorClass } = formatOrderStatus(order.status);
                        const item = order.items[0];
                        return (
                          <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">{order.orderNumber}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="text-sm text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[160px]">
                                {item?.listingTitle ?? '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', colorClass)}>{label}</span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{formatPrice(order.total)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/dashboard/orders/${order.id}` as Route} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                                Details <ExternalLink className="h-3 w-3" />
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

            {/* Active Offers */}
            <section aria-labelledby="offers-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="offers-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Active Offers</h2>
                <Link href="/dashboard/offers" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {dataLoading ? (
                <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
              ) : offers.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 p-8 text-center">
                  <Tag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No active offers. Make an offer on any listing.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer) => {
                    const img = offer.listing?.coverImage;
                    const imgUrl = typeof img === 'string' ? img : (img as {url?: string})?.url ?? `https://picsum.photos/seed/${offer.listingId}/60/60`;
                    return (
                      <div key={offer.id} className="flex items-center gap-4 rounded-xl p-4 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{offer.listing?.title ?? 'Listing'}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
                            <span>Listed: <span className="font-mono font-medium">{formatPrice(offer.listing?.price ?? 0)}</span></span>
                            <span>Offer: <span className="font-mono font-medium text-primary">{formatPrice(offer.amount)}</span></span>
                            {offer.counterAmount && <span>Counter: <span className="font-mono font-medium text-accent-dark">{formatPrice(offer.counterAmount)}</span></span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge variant={offer.status === 'pending' ? 'warning' : offer.status === 'accepted' ? 'success' : offer.status === 'countered' ? 'accent' : 'default'} size="sm">
                            {offer.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(offer.expiresAt) > new Date()
                              ? `Expires ${new Date(offer.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`
                              : 'Expired'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Saved Searches */}
            {(savedSearches.length > 0 || dataLoading) && (
              <section aria-labelledby="searches-heading">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="searches-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Saved Searches</h2>
                </div>
                {dataLoading ? (
                  <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
                ) : (
                  <div className="space-y-2">
                    {savedSearches.map((ss) => (
                      <div key={ss.id} className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
                        <Search className="h-4 w-4 text-slate-400 shrink-0" />
                        <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">&ldquo;{ss.query}&rdquo;</p>
                        {ss.newMatchCount > 0 && <Badge variant="solid-accent" size="sm">{ss.newMatchCount} new</Badge>}
                        <Link href={`/search?q=${encodeURIComponent(ss.query)}` as Route} className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                          Search
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Recommended listings */}
            <section aria-labelledby="recommended-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="recommended-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recommended for You</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recLoading
                  ? [1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-card" />)
                  : (recommended?.listings ?? []).map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
