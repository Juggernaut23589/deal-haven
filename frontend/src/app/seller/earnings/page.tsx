'use client';

import { SellerSidebar } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  DollarSign, TrendingUp, Clock, CheckCircle2,
  LayoutDashboard, ListChecks, Tag, ShoppingBag, BarChart3,
  Store, Star, Zap, Settings, Plus, Info, Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types/order';

// Tiered platform fee: 5% under ₦500, 3% ₦500-₦5000, 2% over ₦5000
function getFeeRate(total: number): number {
  if (total < 500) return 0.05;
  if (total <= 5000) return 0.03;
  return 0.02;
}
function calcFee(total: number): number { return total * getFeeRate(total); }

export default function SellerEarningsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    ordersApi.getMyOrders('selling', undefined, 1)
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (authLoading) return null;

  const completed = orders.filter((o) => ['COMPLETED', 'DELIVERED', 'completed', 'delivered'].includes(o.status));
  const pending = orders.filter((o) => ['PENDING', 'PROCESSING', 'pending', 'processing'].includes(o.status));

  const totalEarned = completed.reduce((s, o) => s + (o.total - calcFee(o.total)), 0);
  const pendingValue = pending.reduce((s, o) => s + (o.total - calcFee(o.total)), 0);
  const totalFees = [...completed, ...pending].reduce((s, o) => s + calcFee(o.total), 0);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Earnings</h1>

            <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Payments are handled directly between you and buyers. This page tracks your completed sales and estimated earnings. Platform fee: 5% (under ₦500) · 3% (₦500–₦5,000) · 2% (over ₦5,000).
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Earned (net)', value: isLoading ? '—' : formatPrice(totalEarned), icon: CheckCircle2, color: 'text-success' },
                { label: 'Pending Orders', value: isLoading ? '—' : formatPrice(pendingValue), icon: Clock, color: 'text-warning' },
                { label: 'Total Platform Fees', value: isLoading ? '—' : formatPrice(totalFees), icon: TrendingUp, color: 'text-slate-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn('h-4 w-4', color)} />
                    <p className="text-sm text-slate-500">{label}</p>
                  </div>
                  {isLoading ? <Skeleton className="h-8 w-24 rounded" /> : (
                    <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Transaction history */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Transaction History</h2>
              </div>

              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-10 text-center">
                  <Package className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No transactions yet. Complete your first sale to see it here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {['Order', 'Item', 'Buyer', 'Sale Price', 'Platform Fee', 'Net Payout', 'Date', 'Status'].map(h => (
                          <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {orders.map((order) => {
                        const item = order.items[0];
                        const fee = calcFee(order.total);
                        const net = order.total - fee;
                        const { label, colorClass } = formatOrderStatus(order.status);
                        return (
                          <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{order.orderNumber}</td>
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[160px]">
                              <span className="line-clamp-1">{item?.listingTitle ?? '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">@{order.buyer?.username ?? '—'}</td>
                            <td className="px-4 py-3 font-mono font-semibold tabular-nums">{formatPrice(order.total)}</td>
                            <td className="px-4 py-3 font-mono text-error tabular-nums">-{formatPrice(fee)}</td>
                            <td className="px-4 py-3 font-mono font-bold text-success tabular-nums">{formatPrice(net)}</td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-3">
                              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', colorClass)}>{label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
