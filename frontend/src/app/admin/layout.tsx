'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, AlertTriangle, Flag,
  Settings, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { useRequireAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/listings', label: 'Listings', icon: Package },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useRequireAuth();
  const pathname = usePathname();

  if (isLoading) return null;

  const isAdmin = user?.roles?.includes('admin');
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
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm mb-6 text-slate-500">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-primary font-semibold">Admin Panel</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-slate-100 font-medium capitalize">
            {pathname.replace('/admin', '').replace('/', '') || 'Dashboard'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <nav className="space-y-1 lg:sticky lg:top-20 lg:self-start" aria-label="Admin navigation">
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
