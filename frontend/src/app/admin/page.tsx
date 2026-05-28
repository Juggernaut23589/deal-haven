'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Users, Package, ShoppingBag, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/lib/adminApi';

interface Stats {
  users: number;
  listings: number;
  orders: number;
  disputes: number;
  openDisputes: number;
}

function StatCard({ label, value, icon: Icon, href, accent = false }: {
  label: string; value: number | undefined; icon: React.ElementType; href: string; accent?: boolean;
}) {
  return (
    <Link href={href as Route} className={cn(
      'rounded-xl border p-5 flex items-start justify-between gap-4 shadow-card hover:shadow-lg transition-shadow',
      accent
        ? 'bg-error/5 border-error/20'
        : 'bg-white dark:bg-surface-dark border-slate-100 dark:border-slate-800'
    )}>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {value === undefined
          ? <Skeleton className="h-8 w-20 mt-1 rounded" />
          : <p className={cn('text-3xl font-bold mt-1 tabular-nums', accent ? 'text-error' : 'text-slate-900 dark:text-slate-100')}>{value.toLocaleString()}</p>
        }
      </div>
      <div className={cn('rounded-xl p-3', accent ? 'bg-error/10' : 'bg-primary/10')}>
        <Icon className={cn('h-5 w-5', accent ? 'text-error' : 'text-primary')} />
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<Stats | undefined>(undefined);

  React.useEffect(() => {
    adminApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview and moderation queue.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.users} icon={Users} href="/admin/users" />
        <StatCard label="Active Listings" value={stats?.listings} icon={Package} href="/admin/listings" />
        <StatCard label="Total Orders" value={stats?.orders} icon={ShoppingBag} href="/admin/orders" />
        <StatCard label="Open Disputes" value={stats?.openDisputes} icon={AlertTriangle} href="/admin/disputes" accent />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: '/admin/users?status=SUSPENDED', label: 'Review Suspended Users', desc: 'Users pending status review', icon: Users },
          { href: '/admin/listings?status=PENDING_REVIEW', label: 'Approve Listings', desc: 'Listings awaiting moderation', icon: Package },
          { href: '/admin/disputes?status=OPENED', label: 'New Disputes', desc: 'Disputes needing attention', icon: AlertTriangle },
          { href: '/admin/reports?status=PENDING', label: 'Pending Reports', desc: 'Reported content to review', icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href as Route} className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-4 shadow-card hover:shadow-lg transition-shadow">
              <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
