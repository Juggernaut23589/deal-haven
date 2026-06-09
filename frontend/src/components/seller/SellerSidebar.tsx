'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import {
  LayoutDashboard, ListChecks, ShoppingBag, Tag,
  BarChart3, DollarSign, Store, Star, Zap, Settings, Plus,
  ChevronDown, Edit, Pause, Trash2, Play, RefreshCw, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

// Sub-items for Manage Listings
const MANAGE_LISTING_ITEMS: { href: Route; label: string; icon: React.ElementType; title?: string }[] = [
  { href: '/seller/listings' as Route,                     label: 'All Listings',    icon: ListChecks },
  { href: '/seller/listings?status=ACTIVE' as Route,       label: 'Edit / Active',   icon: Edit,     title: 'Edit or view your active listings' },
  { href: '/seller/listings?status=ACTIVE' as Route,       label: 'Pause Listings',  icon: Pause,    title: 'Pause your active listings' },
  { href: '/seller/listings?status=PAUSED' as Route,       label: 'Unpause / Resume',icon: Play,     title: 'Resume paused listings' },
  { href: '/seller/listings?status=DRAFT' as Route,        label: 'Draft Listings',  icon: FileText, title: 'View your drafts' },
  { href: '/seller/listings?status=EXPIRED' as Route,      label: 'Renew Expired',   icon: RefreshCw,title: 'Renew expired listings' },
  { href: '/seller/listings' as Route,                     label: 'Delete Listings', icon: Trash2,   title: 'Delete unwanted listings' },
];

const TOP_LINKS: { href: Route; label: string; icon: React.ElementType }[] = [
  { href: '/seller',              label: 'Overview',        icon: LayoutDashboard },
  { href: '/seller/orders',       label: 'Orders',          icon: ShoppingBag },
  { href: '/seller/offers',       label: 'Offers',          icon: Tag },
  { href: '/seller/analytics',    label: 'Analytics',       icon: BarChart3 },
  { href: '/seller/earnings',     label: 'Earnings',        icon: DollarSign },
  { href: '/seller/storefront',   label: 'Storefront',      icon: Store },
  { href: '/seller/reviews',      label: 'Reviews',         icon: Star },
  { href: '/seller/promotions',   label: 'Promotions',      icon: Zap },
  { href: '/dashboard/settings',  label: 'Settings',        icon: Settings },
];

function useManageOpen(pathname: string) {
  const isManagePath = pathname.startsWith('/seller/listings') || pathname.includes('/listing/');
  const [open, setOpen] = React.useState(isManagePath);
  return [open, setOpen] as const;
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export function SellerSidebar({ activePage }: { activePage?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [manageOpen, setManageOpen] = useManageOpen(pathname);

  const isActive = (href: string) => {
    if (href === '/seller') return pathname === '/seller';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0" aria-label="Seller dashboard navigation">
      <nav>
        <ul className="space-y-0.5" role="list">
          {/* Overview */}
          {TOP_LINKS.slice(0, 1).map(({ href, label, icon: Icon }) => {
            const active = activePage ? label === activePage : isActive(href as string);
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    active
                      ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}

          {/* Manage Listings — collapsible */}
          <li>
            <button
              type="button"
              onClick={() => setManageOpen((v) => !v)}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                pathname.startsWith('/seller/listings')
                  ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              )}
              aria-expanded={manageOpen}
            >
              <ListChecks className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">Manage Listings</span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform duration-200', manageOpen && 'rotate-180')}
                aria-hidden="true"
              />
            </button>

            {/* Sub-menu */}
            {manageOpen && (
              <ul className="mt-0.5 ml-4 pl-3 border-l border-slate-200 dark:border-slate-700 space-y-0.5">
                {MANAGE_LISTING_ITEMS.map(({ href, label, icon: Icon, title }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      title={title}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                        'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                        label === 'Delete Listings' && 'hover:text-error hover:bg-error/5',
                        label === 'Pause Listings' && 'hover:text-warning hover:bg-warning/5',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/listing/create"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    New Listing
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Remaining top-level links */}
          {TOP_LINKS.slice(1).map(({ href, label, icon: Icon }) => {
            const active = activePage ? label === activePage : isActive(href as string);
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    active
                      ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <Button asChild size="sm" className="w-full" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          <Link href="/listing/create">New Listing</Link>
        </Button>
        {user?.username && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/shop/${user.username}` as Route}>View Storefront</Link>
          </Button>
        )}
      </div>
    </aside>
  );
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────

const MOBILE_LINKS: { href: Route; label: string; icon: React.ElementType }[] = [
  { href: '/seller',                                   label: 'Overview',        icon: LayoutDashboard },
  { href: '/seller/listings' as Route,                 label: 'Manage Listings', icon: ListChecks },
  { href: '/seller/listings?status=ACTIVE' as Route,   label: 'Edit Listings',   icon: Edit },
  { href: '/seller/listings?status=ACTIVE' as Route,   label: 'Pause',           icon: Pause },
  { href: '/seller/listings?status=PAUSED' as Route,   label: 'Resume',          icon: Play },
  { href: '/seller/listings' as Route,                 label: 'Delete',          icon: Trash2 },
  { href: '/seller/orders' as Route,                   label: 'Orders',          icon: ShoppingBag },
  { href: '/seller/offers' as Route,                   label: 'Offers',          icon: Tag },
  { href: '/seller/analytics' as Route,                label: 'Analytics',       icon: BarChart3 },
  { href: '/seller/earnings' as Route,                 label: 'Earnings',        icon: DollarSign },
  { href: '/seller/storefront' as Route,               label: 'Storefront',      icon: Store },
  { href: '/seller/reviews' as Route,                  label: 'Reviews',         icon: Star },
  { href: '/seller/promotions' as Route,               label: 'Promotions',      icon: Zap },
  { href: '/dashboard/settings' as Route,              label: 'Settings',        icon: Settings },
];

export function SellerMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 overflow-x-auto scrollbar-hide" aria-label="Seller navigation">
      <ul className="flex gap-1.5 min-w-max pb-2" role="list">
        {MOBILE_LINKS.map(({ href, label, icon: Icon }) => {
          const hrefStr = href as string;
          const isActive = hrefStr === '/seller' ? pathname === '/seller' : pathname.startsWith(hrefStr.split('?')[0]);
          const isDelete = label === 'Delete';
          const isPause = label === 'Pause';
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap',
                  'border transition-colors duration-100',
                  isDelete
                    ? 'border-error/20 text-error hover:bg-error/5'
                    : isPause
                    ? 'border-warning/20 text-warning hover:bg-warning/5'
                    : cn(
                        'border-slate-200 dark:border-slate-700',
                        'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                        isActive && 'bg-primary/10 border-primary/30 text-primary dark:text-primary-light font-semibold'
                      )
                )}
                aria-current={isActive && !isDelete && !isPause ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
