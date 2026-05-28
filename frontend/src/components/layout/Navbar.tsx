'use client';

import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Tag,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  LayoutDashboard,
  Store,
  Settings,
  Plus,
  Heart,
  ShoppingBag,
  MapPin,
  Grid3X3,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { messagesApi, notificationsApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';

// ─── Category Links ───────────────────────────────────────────────────────────

const NAV_CATEGORIES: { label: string; href: Route; icon: string }[] = [
  { label: 'Automobiles', href: '/category/automobiles' as Route, icon: '🚗' },
  { label: 'Real Estate', href: '/category/real-estate' as Route, icon: '🏠' },
  { label: 'Electronics', href: '/category/electronics' as Route, icon: '📱' },
  { label: 'Clothing', href: '/category/clothing' as Route, icon: '👗' },
  { label: 'Furniture & Home', href: '/category/furniture-home' as Route, icon: '🛋️' },
  { label: 'Services', href: '/category/services' as Route, icon: '🔧' },
  { label: 'Jobs & Gigs', href: '/category/jobs-gigs' as Route, icon: '💼' },
  { label: 'Sports & Outdoors', href: '/category/sports-outdoors' as Route, icon: '⚽' },
  { label: 'Books & Media', href: '/category/books-media' as Route, icon: '📚' },
  { label: 'Toys & Games', href: '/category/toys-games' as Route, icon: '🎮' },
  { label: 'Pet Supplies', href: '/category/pet-supplies' as Route, icon: '🐾' },
  { label: 'Collectibles & Art', href: '/category/collectibles-art' as Route, icon: '🎨' },
];

// ─── Compact Search Bar ───────────────────────────────────────────────────────

function NavSearchBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const openSearchModal = useUIStore((s) => s.openSearchModal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 max-w-xl mx-4 hidden md:flex items-center"
      role="search"
      aria-label="Search listings"
    >
      <div className="relative flex w-full">
        <label htmlFor="navbar-search" className="sr-only">
          Search Ashimarket
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
        <input
          id="navbar-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => openSearchModal(query)}
          placeholder="Search for anything..."
          className={cn(
            'h-10 w-full rounded-l-lg border border-r-0 border-slate-200',
            'bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'focus-visible:border-primary transition-colors',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
          )}
        />
        <button
          type="submit"
          className={cn(
            'flex items-center rounded-r-lg bg-primary px-4',
            'text-sm font-medium text-white',
            'hover:bg-primary-dark transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
          )}
          aria-label="Submit search"
        >
          Search
        </button>
      </div>
    </form>
  );
}

// ─── Categories Dropdown ──────────────────────────────────────────────────────

function CategoriesMenu() {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'hidden md:flex items-center gap-1.5 rounded-md px-3 py-2',
            'text-sm font-medium text-slate-700 dark:text-slate-300',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            open && 'bg-slate-100 dark:bg-slate-800'
          )}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Browse categories"
        >
          <Grid3X3 className="h-4 w-4" aria-hidden="true" />
          <span>Categories</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-slate-400 transition-transform duration-150',
              open && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className={cn(
            'z-dropdown w-[min(480px,90vw)] rounded-xl border border-slate-100 bg-white p-4 shadow-xl',
            'dark:border-slate-700 dark:bg-slate-900',
            'animate-scale-in'
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Browse by Category
            </span>
            <Link
              href="/search"
              className="text-xs font-medium text-primary hover:text-primary-dark"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {NAV_CATEGORIES.map((cat) => (
              <DropdownMenu.Item key={cat.href} asChild>
                <Link
                  href={cat.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2',
                    'text-sm text-slate-700 dark:text-slate-300',
                    'hover:bg-slate-50 dark:hover:bg-slate-800',
                    'focus-visible:bg-slate-50 focus-visible:outline-none',
                    'transition-colors duration-100'
                  )}
                  onClick={() => setOpen(false)}
                >
                  <span aria-hidden="true" className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </Link>
              </DropdownMenu.Item>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ─── User Menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-full p-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            'hover:ring-2 hover:ring-primary/30 transition-all'
          )}
          aria-label={`Account menu for ${user.profile.displayName}`}
        >
          <Avatar
            src={user.profile.avatarUrl}
            name={user.profile.displayName}
            size="sm"
          />
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-dropdown w-60 rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl',
            'dark:border-slate-700 dark:bg-slate-900',
            'animate-scale-in'
          )}
        >
          {/* User info header */}
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user.profile.displayName}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          {/* Navigation items */}
          {([
            {
              icon: LayoutDashboard,
              label: 'Dashboard',
              href: '/dashboard' as Route,
            },
            { icon: ShoppingBag, label: 'My Orders', href: '/dashboard/orders' as Route },
            { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' as Route },
            { icon: User, label: 'Profile', href: '/dashboard/settings/profile' as Route },
          ] as { icon: React.ElementType; label: string; href: Route }[]).map((item) => (
            <DropdownMenu.Item key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm',
                  'text-slate-700 dark:text-slate-300',
                  'hover:bg-slate-50 dark:hover:bg-slate-800',
                  'focus-visible:bg-slate-50 focus-visible:outline-none',
                  'transition-colors duration-100 cursor-pointer'
                )}
              >
                <item.icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {item.label}
              </Link>
            </DropdownMenu.Item>
          ))}

          {user.isSeller && (
            <>
              <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
              <DropdownMenu.Item asChild>
                <Link
                  href="/seller"
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm',
                    'text-slate-700 dark:text-slate-300',
                    'hover:bg-slate-50 dark:hover:bg-slate-800',
                    'focus-visible:outline-none cursor-pointer'
                  )}
                >
                  <Store className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Seller Dashboard
                </Link>
              </DropdownMenu.Item>
            </>
          )}

          {user.isAdmin && (
            <DropdownMenu.Item asChild>
              <Link
                href={"/admin" as Route}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm',
                  'text-primary dark:text-primary-light font-medium',
                  'hover:bg-primary/5 focus-visible:outline-none cursor-pointer'
                )}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Admin Panel
              </Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          <DropdownMenu.Item
            onSelect={() => logout()}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm',
              'text-error cursor-pointer',
              'hover:bg-error/5 focus-visible:bg-error/5 focus-visible:outline-none',
              'transition-colors duration-100'
            )}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ─── Dark Mode Toggle ─────────────────────────────────────────────────────────

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" aria-hidden="true" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg',
        'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
        'hover:text-slate-700 dark:hover:text-slate-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'transition-colors duration-150'
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
}

// ─── Mobile Menu Drawer ───────────────────────────────────────────────────────

function MobileMenuDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-fixed bg-black/50 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="mobile-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className={cn(
              'fixed inset-y-0 left-0 z-modal w-[85vw] max-w-xs',
              'bg-white dark:bg-slate-900',
              'flex flex-col shadow-2xl overflow-y-auto',
              'md:hidden'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={onClose}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <Tag className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Ashi<span className="text-primary">market</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <form onSubmit={handleSearch} role="search">
                <label htmlFor="mobile-search" className="sr-only">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className={cn(
                      'h-10 w-full rounded-lg border border-slate-200 bg-slate-50',
                      'pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    )}
                  />
                </div>
              </form>
            </div>

            {/* User section */}
            {user ? (
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                <Avatar
                  src={user.profile.avatarUrl}
                  name={user.profile.displayName}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.profile.displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-4 border-b border-slate-100 dark:border-slate-800">
                <Button asChild size="default">
                  <Link href="/auth/login" onClick={onClose}>Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="default">
                  <Link href="/auth/register" onClick={onClose}>Create Account</Link>
                </Button>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 p-4" aria-label="Mobile navigation">
              {user && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    My Account
                  </p>
                  {([
                    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' as Route },
                    { icon: ShoppingBag, label: 'My Orders', href: '/dashboard/orders' as Route },
                    { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' as Route },
                    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' as Route },
                    ...(user.isSeller ? [{ icon: Store, label: 'Seller Dashboard', href: '/seller' as Route }] : []),
                  ] as { icon: React.ElementType; label: string; href: Route }[]).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5',
                        'text-sm font-medium text-slate-700 dark:text-slate-300',
                        'hover:bg-slate-100 dark:hover:bg-slate-800',
                        'transition-colors duration-100'
                      )}
                    >
                      <item.icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Categories
              </p>
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2',
                    'text-sm text-slate-700 dark:text-slate-300',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    'transition-colors duration-100'
                  )}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
            </nav>

            {/* Footer actions */}
            {user && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { logout(); onClose(); }}
                  className="flex items-center gap-2 text-sm text-error hover:text-error/80 transition-colors"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useUIStore();
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Detect scroll for glass effect
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { isAuthenticated: isAuth, accessToken } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  React.useEffect(() => {
    if (!isAuth) return;
    messagesApi.getConversations(1)
      .then((res) => {
        const total = (res.data ?? []).reduce((sum: number, c: { unreadCount?: number }) => sum + (c.unreadCount ?? 0), 0);
        setUnreadMessages(total);
      })
      .catch(() => {});
    notificationsApi.getUnreadCount()
      .then((res: { count?: number; data?: { count?: number } }) => setUnreadNotifications((res as { count?: number }).count ?? (res as { data?: { count?: number } }).data?.count ?? 0))
      .catch(() => {});
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (!isAuth || !accessToken) return;
    const socket = getSocket(accessToken);
    const onUnread = () => {
      messagesApi.getConversations(1)
        .then((res) => {
          const total = (res.data ?? []).reduce((sum: number, c: { unreadCount?: number }) => sum + (c.unreadCount ?? 0), 0);
          setUnreadMessages(total);
        })
        .catch(() => {});
    };
    socket.on('unread_count_changed', onUnread);
    return () => { socket.off('unread_count_changed', onUnread); };
  }, [isAuth, accessToken]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-sticky w-full',
          'border-b border-slate-200 dark:border-slate-800',
          'bg-white dark:bg-slate-900',
          isScrolled && 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm',
          'transition-all duration-150'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-2 sm:gap-4">
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={openMobileMenu}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Logo */}
            <Logo height={38} />

            {/* Categories */}
            <CategoriesMenu />

            {/* Search */}
            <NavSearchBar />

            {/* Mobile search trigger */}
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ml-auto"
              onClick={() => useUIStore.getState().openSearchModal()}
              aria-label="Search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-1 ml-auto">
              {/* Theme toggle */}
              <ThemeToggle />

              {isAuthenticated && user ? (
                <>
                  {/* Messages */}
                  <Link
                    href={"/dashboard/messages" as Route}
                    className={cn(
                      'relative flex h-9 w-9 items-center justify-center rounded-lg',
                      'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                      'hover:text-slate-700 dark:hover:text-slate-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'transition-colors duration-150'
                    )}
                    aria-label={
                      unreadMessages > 0
                        ? `Messages — ${unreadMessages} unread`
                        : 'Messages'
                    }
                  >
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                    {unreadMessages > 0 && (
                      <span
                        className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-2xs font-bold text-white"
                        aria-hidden="true"
                      >
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <Link
                    href={"/dashboard/notifications" as Route}
                    className={cn(
                      'relative flex h-9 w-9 items-center justify-center rounded-lg',
                      'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                      'hover:text-slate-700 dark:hover:text-slate-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'transition-colors duration-150'
                    )}
                    aria-label={
                      unreadNotifications > 0
                        ? `Notifications — ${unreadNotifications} unread`
                        : 'Notifications'
                    }
                  >
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    {unreadNotifications > 0 && (
                      <span
                        className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-0.5 text-2xs font-bold text-white"
                        aria-hidden="true"
                      >
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </Link>

                  {/* Sell button */}
                  <Button asChild size="sm" className="ml-2">
                    <Link href="/listing/create">
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Sell
                    </Link>
                  </Button>

                  {/* User avatar dropdown */}
                  <div className="ml-1">
                    <UserMenu />
                  </div>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenuDrawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}

export default Navbar;
