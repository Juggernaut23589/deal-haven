'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  Package,
  Tag,
  MessageSquare,
  Star,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    icon: Package,
    title: 'Order Shipped',
    description: 'Your order DH-20260001 (MacBook Pro 14") has been shipped.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n2',
    icon: Tag,
    title: 'New Offer Received',
    description: 'Sarah M. made an offer of ₦650,000 on your "Vintage Coffee Table" listing.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'n3',
    icon: MessageSquare,
    title: 'New Message',
    description: 'AutoDeals Pro sent you a message about "2022 Toyota Camry SE".',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n4',
    icon: TrendingDown,
    title: 'Price Drop Alert',
    description: 'A listing in your saved search "Sony cameras" dropped by 15%.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n5',
    icon: Star,
    title: 'New Review',
    description: 'A buyer left you a 5-star review: "Great seller, fast shipping!"',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n6',
    icon: ShieldCheck,
    title: 'Account Verified',
    description: 'Your identity has been verified. You now have the Verified Seller badge.',
    time: '1 week ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Notifications</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-6">
          Notifications
        </h1>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : MOCK_NOTIFICATIONS.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No notifications
            </h3>
            <p className="text-slate-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {MOCK_NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 p-3 sm:gap-4 sm:p-4 rounded-xl',
                    'border border-slate-100 dark:border-slate-800',
                    'transition-colors',
                    n.read
                      ? 'bg-white dark:bg-surface-dark'
                      : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
                      n.read
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        'text-sm',
                        n.read
                          ? 'font-medium text-slate-700 dark:text-slate-300'
                          : 'font-bold text-slate-900 dark:text-slate-100'
                      )}>
                        {n.title}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {n.description}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1" aria-label="Unread" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
