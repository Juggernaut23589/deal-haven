'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import {
  LayoutDashboard, ListChecks, ShoppingBag, Tag,
  BarChart3, DollarSign, Store, Star, Zap, Settings, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const LINKS: { href: Route; label: string; icon: React.ElementType }[] = [
  { href: '/seller',            label: 'Overview',     icon: LayoutDashboard },
  { href: '/seller/listings',   label: 'My Listings',  icon: ListChecks },
  { href: '/seller/orders',     label: 'Orders',       icon: ShoppingBag },
  { href: '/seller/offers',     label: 'Offers',       icon: Tag },
  { href: '/seller/analytics',  label: 'Analytics',    icon: BarChart3 },
  { href: '/seller/earnings',   label: 'Earnings',     icon: DollarSign },
  { href: '/seller/storefront', label: 'Storefront',   icon: Store },
  { href: '/seller/reviews',    label: 'Reviews',      icon: Star },
  { href: '/seller/promotions', label: 'Promotions',   icon: Zap },
  { href: '/dashboard/settings', label: 'Settings',    icon: Settings },
];

export function SellerMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 overflow-x-auto scrollbar-hide" aria-label="Seller navigation">
      <ul className="flex gap-1.5 min-w-max pb-2" role="list">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/seller' ? pathname === '/seller' : pathname.startsWith(href as string);
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap',
                  'border border-slate-200 dark:border-slate-700',
                  'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-colors duration-100',
                  isActive && 'bg-primary/10 border-primary/30 text-primary dark:text-primary-light font-semibold'
                )}
                aria-current={isActive ? 'page' : undefined}
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

export function SellerSidebar({ activePage }: { activePage?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0" aria-label="Seller dashboard navigation">
      <nav>
        <ul className="space-y-0.5" role="list">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = activePage
              ? label === activePage
              : href === '/seller'
              ? pathname === '/seller'
              : pathname.startsWith(href as string);
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
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
