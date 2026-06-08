'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import {
  LayoutDashboard, ShoppingBag, Tag, Heart,
  MessageSquare, Bell, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const DASHBOARD_LINKS: { href: Route; label: string; icon: React.ElementType }[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders' as Route, label: 'My Orders', icon: ShoppingBag },
  { href: '/dashboard/offers' as Route, label: 'My Offers', icon: Tag },
  { href: '/dashboard/wishlist' as Route, label: 'Wishlist', icon: Heart },
  { href: '/dashboard/messages' as Route, label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/notifications' as Route, label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings' as Route, label: 'Settings', icon: Settings },
];

export function DashboardMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 overflow-x-auto scrollbar-hide" aria-label="Dashboard navigation">
      <ul className="flex gap-1.5 min-w-max pb-2" role="list">
        {DASHBOARD_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href as string);
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap',
                  'border border-slate-200 dark:border-slate-700',
                  'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-colors duration-100',
                  isActive && 'bg-primary/10 border-primary/30 text-primary dark:text-primary-light font-semibold'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
