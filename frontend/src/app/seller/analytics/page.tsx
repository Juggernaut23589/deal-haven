'use client';

import { SellerSidebar, SellerMobileNav } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import {
  TrendingUp, Eye, ShoppingBag, Star, BarChart3, Package, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/formatters';
import { usersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';

type SellerStats = Awaited<ReturnType<typeof usersApi.getSellerStats>>;

function StatCard({
  label, value, icon: Icon, sub, className,
}: { label: string; value: string; icon: React.ElementType; sub?: string; className?: string }) {
  return (
    <div className={cn('rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card', className)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function SellerAnalyticsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [range, setRange] = React.useState<'7d' | '30d'>('30d');
  const [stats, setStats] = React.useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const load = React.useCallback(() => {
    setIsLoading(true);
    usersApi.getSellerStats(range)
      .then(setStats)
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setIsLoading(false));
  }, [range, toast]);

  React.useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 py-8 flex gap-8">
          <SellerSidebar />
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalRevenue = stats?.chartData.reduce((s, d) => s + d.revenue, 0) ?? 0;

  const chartData = (stats?.chartData ?? []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <SellerMobileNav />
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Analytics</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={load}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <div className="flex gap-1 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                  {(['7d', '30d'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                        range === r
                          ? 'bg-primary text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {r === '7d' ? 'Last 7 days' : 'Last 30 days'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Listings"
                value={String(stats?.totalListings ?? 0)}
                icon={Package}
                sub={`${stats?.activeListings ?? 0} active`}
              />
              <StatCard
                label="Total Orders"
                value={String(stats?.totalOrders ?? 0)}
                icon={ShoppingBag}
                sub={stats?.pendingOrders ? `${stats.pendingOrders} pending` : 'All fulfilled'}
              />
              <StatCard
                label="Avg. Rating"
                value={stats?.averageRating ? `${Number(stats.averageRating).toFixed(1)} ★` : 'N/A'}
                icon={Star}
                sub={`${stats?.totalReviews ?? 0} reviews`}
              />
              <StatCard
                label={`Revenue (${range})`}
                value={formatPrice(totalRevenue)}
                icon={TrendingUp}
                sub={`${stats?.totalSales ?? 0} total sales`}
              />
            </div>

            {/* Revenue chart */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Revenue Over Time</h2>
                <span className="text-xs text-slate-400 ml-auto">₦ values from completed orders</span>
              </div>
              {chartData.length === 0 || totalRevenue === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Eye className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm text-slate-400">No revenue data for this period</p>
                  <p className="text-xs text-slate-300 mt-1">Orders will appear here once completed</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D7377" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v as number).toLocaleString()}`} />
                    <Tooltip
                      formatter={(v) => [`₦${(v as number).toLocaleString()}`, 'Revenue']}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0D7377"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Response rate */}
            {stats && (
              <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-5">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Performance</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Response Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all"
                          style={{ width: `${Math.min(100, Number(stats.responseRate))}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 w-10">
                        {Number(stats.responseRate).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Sales (all time)</p>
                    <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                      {stats.totalSales}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
