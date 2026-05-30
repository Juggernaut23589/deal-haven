'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  BarChart3, TrendingUp, Eye, Heart, MessageSquare,
  ShoppingBag, ChevronRight, LayoutDashboard, ListChecks,
  Tag, DollarSign, Store, Star, Zap, Settings, Plus,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Mock analytics data ───────────────────────────────────────────────────────

const VIEWS_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  views: Math.floor(Math.random() * 400 + 50),
  messages: Math.floor(Math.random() * 30 + 2),
}));

const CATEGORY_DATA = [
  { name: 'Electronics', views: 1240, color: '#0D7377' },
  { name: 'Vehicles', views: 890, color: '#F59E0B' },
  { name: 'Real Estate', views: 540, color: '#10B981' },
  { name: 'Clothing', views: 320, color: '#6366F1' },
  { name: 'Furniture', views: 210, color: '#EF4444' },
];

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
  { href: '/seller' as Route, label: 'Settings', icon: Settings },
];

function SellerSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0" aria-label="Seller navigation">
      <nav>
        <ul className="space-y-0.5" role="list">
          {SELLER_SIDEBAR_LINKS.map(({ href, label, icon: Icon }, i) => (
            <li key={i}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'text-slate-600 dark:text-slate-400',
                  'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                  label === 'Analytics' && 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                )}
                aria-current={label === 'Analytics' ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <Button asChild size="sm" className="w-full" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          <Link href="/listing/create">New Listing</Link>
        </Button>
      </div>
    </aside>
  );
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
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
  const [range, setRange] = React.useState<'7d' | '30d'>('30d');

  if (authLoading) return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );

  const chartData = range === '7d' ? VIEWS_DATA.slice(-7) : VIEWS_DATA;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Analytics</h1>
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

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Views" value="8,432" icon={Eye} sub="+12% vs last period" />
              <StatCard label="Saved / Wishlist" value="241" icon={Heart} sub="across all listings" />
              <StatCard label="Messages" value="87" icon={MessageSquare} sub="from interested buyers" />
              <StatCard label="Orders Placed" value="14" icon={ShoppingBag} sub="this period" />
            </div>

            {/* Views chart */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Views &amp; Messages</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#0D7377" strokeWidth={2} dot={false} name="Views" />
                  <Line type="monotone" dataKey="messages" stroke="#F59E0B" strokeWidth={2} dot={false} name="Messages" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Views by Category</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CATEGORY_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]}>
                    {CATEGORY_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
