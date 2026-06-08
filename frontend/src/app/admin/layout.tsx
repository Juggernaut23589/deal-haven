'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, AlertTriangle, Flag,
  ShoppingBag, Layers, Percent, Settings, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/listings', label: 'Listings', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/fees', label: 'Fees', icon: Percent },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useRequireAuth();
  const pathname = usePathname();

  if (isLoading) return null;

  const isAdmin = user?.isAdmin ?? user?.roles?.some((r) => ['admin','ADMIN'].includes(r as string));
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Access Denied</h1>
          <p className="text-slate-500 mt-2">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm mb-6 text-slate-500">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-primary font-semibold">Admin Panel</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-slate-100 font-medium capitalize">
            {pathname.replace('/admin', '').replace('/', '') || 'Dashboard'}
          </span>
        </div>

        {/* Mobile nav — horizontal scrollable tabs */}
        <nav className="lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 overflow-x-auto scrollbar-hide" aria-label="Admin navigation">
          <ul className="flex gap-1.5 min-w-max pb-2" role="list">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap',
                      'border border-slate-200 dark:border-slate-700',
                      'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                      'transition-colors duration-100',
                      active && 'bg-primary border-primary text-white'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
          {/* Sidebar — desktop only */}
          <nav className="hidden lg:block space-y-1 lg:sticky lg:top-20 lg:self-start" aria-label="Admin navigation">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
