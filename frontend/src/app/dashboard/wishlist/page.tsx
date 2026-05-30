'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Heart, ChevronRight, Trash2, Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatPostedAgo } from '@/lib/formatters';
import { wishlistApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { WishlistItem } from '@/types/order';

export default function WishlistPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [removing, setRemoving] = React.useState<string | null>(null);
  const [toggling, setToggling] = React.useState<string | null>(null);

  const fetchWishlist = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await wishlistApi.get();
      setItems(res.data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleRemove = async (listingId: string) => {
    setRemoving(listingId);
    try {
      await wishlistApi.remove(listingId);
      setItems((prev) => prev.filter((i) => i.listingId !== listingId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const handleToggleAlert = async (item: WishlistItem) => {
    setToggling(item.id);
    try {
      await wishlistApi.updateAlerts(item.id, !item.notifyOnPriceDrop);
      setItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, notifyOnPriceDrop: !i.notifyOnPriceDrop } : i)
      );
      toast.success(item.notifyOnPriceDrop ? 'Price alert off' : 'Price alert on');
    } catch {
      toast.error('Failed to update alert');
    } finally {
      setToggling(null);
    }
  };

  if (authLoading) return null;

  const getCoverImage = (item: WishlistItem): string => {
    const img = item.listing?.coverImage;
    if (!img) return `https://picsum.photos/seed/${item.listingId}/400/300`;
    if (typeof img === 'string') return img;
    return (img as { url?: string }).url ?? `https://picsum.photos/seed/${item.listingId}/400/300`;
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            My Wishlist
            {!isLoading && items.length > 0 && (
              <span className="ml-2 text-lg font-normal text-slate-400">({items.length})</span>
            )}
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="h-16 w-16 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Your wishlist is empty</p>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Save items you like by tapping the heart icon on any listing.
            </p>
            <Button asChild>
              <Link href="/search">Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'group relative rounded-xl overflow-hidden flex flex-col',
                  'bg-white dark:bg-surface-dark',
                  'border border-slate-100 dark:border-slate-800 shadow-card'
                )}
              >
                <Link href={`/listing/${item.listingId}` as Route} className="block relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCoverImage(item)}
                    alt={item.listing?.title ?? ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.listing?.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="default">Sold</Badge>
                    </div>
                  )}
                </Link>

                <div className="p-3 flex-1 flex flex-col gap-1">
                  <Link href={`/listing/${item.listingId}` as Route}>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-primary transition-colors">
                      {item.listing?.title}
                    </p>
                  </Link>
                  <p className="text-base font-bold font-mono text-primary">
                    {formatPrice(item.listing?.price ?? 0)}
                  </p>
                  <p className="text-xs text-slate-400">Added {formatPostedAgo(item.addedAt)}</p>
                </div>

                <div className="px-3 pb-3 flex gap-2">
                  <button
                    onClick={() => handleToggleAlert(item)}
                    disabled={toggling === item.id}
                    title={item.notifyOnPriceDrop ? 'Turn off price alert' : 'Turn on price alert'}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors',
                      item.notifyOnPriceDrop
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {item.notifyOnPriceDrop
                      ? <><Bell className="h-3.5 w-3.5" />{' '}Alert On</>
                      : <><BellOff className="h-3.5 w-3.5" />{' '}Alert Off</>}
                  </button>
                  <button
                    onClick={() => handleRemove(item.listingId)}
                    disabled={removing === item.listingId}
                    title="Remove from wishlist"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
