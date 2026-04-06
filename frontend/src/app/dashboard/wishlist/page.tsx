'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, ChevronRight, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { data, isLoading } = useListings({ limit: 12 });
  const listings = data?.listings ?? [];

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
          <span className="font-medium text-slate-900 dark:text-slate-100">Wishlist</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-6">
          My Wishlist
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-slate-500 mb-6">Save items you love to come back to them later.</p>
            <Button asChild>
              <Link href="/search">
                Start Browsing
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
