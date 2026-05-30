'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  DollarSign, TrendingUp, Clock, CheckCircle2, ChevronRight,
  LayoutDashboard, ListChecks, Tag, ShoppingBag, BarChart3,
  Store, Star, Zap, Settings, Plus, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/formatters';

const MOCK_TRANSACTIONS = [
  { id: 't1', orderNumber: 'DH-20260101', item: 'iPhone 15 Pro Max', buyer: 'john_d', amount: 1_650_000, fee: 49_500, net: 1_600_500, date: '2026-05-20', status: 'completed' },
  { id: 't2', orderNumber: 'DH-20260098', item: 'Herman Miller Aeron Chair', buyer: 'sarah_k', amount: 2_100_000, fee: 63_000, net: 2_037_000, date: '2026-05-18', status: 'completed' },
  { id: 't3', orderNumber: 'DH-20260091', item: 'Sony A7 IV Camera Kit', buyer: 'mike_r', amount: 3_900_000, fee: 117_000, net: 3_783_000, date: '2026-05-14', status: 'pending' },
  { id: 't4', orderNumber: 'DH-20260085', item: 'MacBook Pro 14" M3', buyer: 'alex_w', amount: 2_700_000, fee: 81_000, net: 2_619_000, date: '2026-05-10', status: 'completed' },
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
                  label === 'Earnings' && 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                )}
                aria-current={label === 'Earnings' ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
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

export default function SellerEarningsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  if (authLoading) return null;

  const totalEarned = MOCK_TRANSACTIONS.filter(t => t.status === 'completed').reduce((s, t) => s + t.net, 0);
  const pending = MOCK_TRANSACTIONS.filter(t => t.status === 'pending').reduce((s, t) => s + t.net, 0);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Earnings</h1>

            {/* Info banner — no payment processing */}
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Payments are handled directly between you and buyers. This page tracks your completed sales and estimated earnings for your records.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Earned', value: formatPrice(totalEarned), icon: CheckCircle2, color: 'text-success' },
                { label: 'Pending Release', value: formatPrice(pending), icon: Clock, color: 'text-warning' },
                { label: 'Platform Fee (3%)', value: formatPrice(MOCK_TRANSACTIONS.reduce((s,t) => s + t.fee, 0)), icon: TrendingUp, color: 'text-slate-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn('h-4 w-4', color)} />
                    <p className="text-sm text-slate-500">{label}</p>
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>

            {/* Transaction history */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Transaction History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Order', 'Item', 'Buyer', 'Sale Price', 'Platform Fee', 'Net', 'Date', 'Status'].map((h) => (
                        <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {MOCK_TRANSACTIONS.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.orderNumber}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[180px]">
                          <span className="line-clamp-1">{t.item}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">@{t.buyer}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{formatPrice(t.amount)}</td>
                        <td className="px-4 py-3 font-mono text-slate-500 tabular-nums text-error">-{formatPrice(t.fee)}</td>
                        <td className="px-4 py-3 font-mono font-bold text-success tabular-nums">{formatPrice(t.net)}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={t.status === 'completed' ? 'success' : 'warning'}>
                            {t.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
