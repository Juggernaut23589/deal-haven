'use client';

import * as React from 'react';
import Link from 'next/link';
import { MessageSquare, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Mock conversations ──────────────────────────────────────────────────────

const MOCK_CONVERSATIONS = [
  {
    id: 'conv_1',
    otherUser: { name: 'TechHub Store', avatar: 'https://i.pravatar.cc/40?img=11' },
    lastMessage: 'Your order has been shipped! Tracking number: 1Z999AA10123456784',
    timestamp: '2h ago',
    unread: true,
    listingTitle: 'Apple MacBook Pro 14"',
  },
  {
    id: 'conv_2',
    otherUser: { name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/40?img=5' },
    lastMessage: 'Is the price negotiable? I can pick up today.',
    timestamp: '5h ago',
    unread: true,
    listingTitle: 'Vintage Coffee Table',
  },
  {
    id: 'conv_3',
    otherUser: { name: 'AutoDeals Pro', avatar: 'https://i.pravatar.cc/40?img=22' },
    lastMessage: 'Thanks for your purchase! Let us know if you have any questions.',
    timestamp: '1d ago',
    unread: false,
    listingTitle: '2022 Toyota Camry SE',
  },
  {
    id: 'conv_4',
    otherUser: { name: 'James W.', avatar: 'https://i.pravatar.cc/40?img=8' },
    lastMessage: 'Sounds good, I can meet at the location tomorrow at 3pm.',
    timestamp: '2d ago',
    unread: false,
    listingTitle: 'PlayStation 5 Console',
  },
];

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
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
          <span className="font-medium text-slate-900 dark:text-slate-100">Messages</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-6">
          Messages
        </h1>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : MOCK_CONVERSATIONS.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No messages yet
            </h3>
            <p className="text-slate-500 mb-6">
              When you message a seller or receive a message, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {MOCK_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                className={cn(
                  'flex items-center gap-3 w-full p-3 sm:gap-4 sm:p-4 rounded-xl text-left',
                  'border border-slate-100 dark:border-slate-800',
                  'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                  'transition-colors',
                  conv.unread
                    ? 'bg-primary/5 dark:bg-primary/10 border-primary/20'
                    : 'bg-white dark:bg-surface-dark'
                )}
              >
                <Avatar
                  src={conv.otherUser.avatar}
                  name={conv.otherUser.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      'text-sm truncate',
                      conv.unread
                        ? 'font-bold text-slate-900 dark:text-slate-100'
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    )}>
                      {conv.otherUser.name}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Re: {conv.listingTitle}
                  </p>
                  <p className={cn(
                    'text-sm mt-1 truncate',
                    conv.unread
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-500 dark:text-slate-400'
                  )}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" aria-label="Unread" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
