'use client';

import { SellerSidebar } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Zap, LayoutDashboard, ListChecks, Tag, ShoppingBag,
  BarChart3, DollarSign, Store, Star, Settings, Plus,
  TrendingUp, Eye, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const PROMOTION_TIERS = [
  {
    name: 'Boost',
    icon: TrendingUp,
    description: '3× more views for 7 days. Your listing appears at the top of category results.',
    price: 'Free (Beta)',
    badge: 'Popular' as const,
  },
  {
    name: 'Featured',
    icon: Star,
    description: 'Homepage featured section for 14 days. "Featured" badge on your listing.',
    price: 'Coming soon',
    badge: null,
  },
  {
    name: 'Spotlight',
    icon: Eye,
    description: 'Premium placement across the entire platform for 30 days.',
    price: 'Coming soon',
    badge: null,
  },
];

export default function SellerPromotionsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Promotions</h1>

            <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Promotions help your listings get more visibility. During beta, Boost is free for all sellers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROMOTION_TIERS.map(({ name, icon: Icon, description, price, badge }) => (
                <div
                  key={name}
                  className={cn(
                    'rounded-xl p-5 bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800 shadow-card',
                    'flex flex-col gap-4'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{name}</p>
                    </div>
                    {badge && <Badge variant="accent">{badge}</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 flex-1">{description}</p>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">{price}</p>
                    <Button
                      variant={name === 'Boost' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      disabled={name !== 'Boost'}
                      asChild={name === 'Boost'}
                    >
                      {name === 'Boost'
                        ? <Link href="/seller/listings">Boost a Listing</Link>
                        : <span>Coming Soon</span>}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
