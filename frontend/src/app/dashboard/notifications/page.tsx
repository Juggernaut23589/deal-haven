'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Bell, ChevronRight, Package, Tag, MessageSquare,
  Star, TrendingDown, ShieldCheck, CheckCheck, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPostedAgo } from '@/lib/formatters';
import { notificationsApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Notification } from '@/types/order';

const TYPE_ICON: Record<string, React.ElementType> = {
  new_message: MessageSquare,
  new_offer: Tag,
  offer_accepted: Tag,
  offer_declined: Tag,
  offer_countered: Tag,
  order_placed: Package,
  order_shipped: Package,
  order_delivered: Package,
  order_completed: Package,
  order_cancelled: Package,
  new_review: Star,
  price_drop: TrendingDown,
  account_verified: ShieldCheck,
  saved_search_match: Bell,
  system: Bell,
};

export default function NotificationsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [marking, setMarking] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.get();
      setNotifications(res.data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setMarking(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  if (authLoading) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Notifications</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary text-white text-xs font-bold px-2 py-0.5">{unreadCount}</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={marking}
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
            >
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Bell className="h-14 w-14 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-sm text-slate-500 mt-1">No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              const dest = n.actionUrl as Route | undefined;
              const content = (
                <div
                  className={cn(
                    'group flex items-start gap-3 p-4 rounded-xl cursor-default',
                    'border transition-colors',
                    n.isRead
                      ? 'bg-white dark:bg-surface-dark border-slate-100 dark:border-slate-800'
                      : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
                  )}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
                    n.isRead ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-primary/10 text-primary'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm', n.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-slate-100')}>
                        {n.title}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0">{formatPostedAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.isRead && <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-label="Unread" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                      className="hidden group-hover:block text-slate-300 hover:text-error transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );

              return dest ? (
                <Link key={n.id} href={dest}>{content}</Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
