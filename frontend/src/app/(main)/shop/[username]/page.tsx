'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Clock,
  Package,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useListings } from '@/hooks/useListings';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Banner images per seller slug for visual richness ───────────────────────

const SELLER_BANNERS: Record<string, string> = {
  techhub: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=400&fit=crop',
  autodeals: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&h=400&fit=crop',
  homestyle: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&h=400&fit=crop',
  fashionfwd: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=400&fit=crop',
};

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&h=400&fit=crop';

// ─── Mock seller data (replaced by API in production) ───────────────��────────

function useSellerProfile(username: string) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const seller = {
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1).replace(/([A-Z])/g, ' $1'),
    avatarUrl: `https://i.pravatar.cc/120?u=${username}`,
    bio: 'Trusted seller on Deal Haven. Fast shipping, great prices, and quality items guaranteed. We stand behind every sale with our satisfaction promise.',
    location: 'New York, NY',
    memberSince: 'January 2024',
    verified: true,
    rating: 4.8,
    reviewCount: 247,
    totalSales: 1_284,
    responseTime: 'Within 2 hours',
    shipTime: 'Ships in 1-2 days',
    bannerUrl: SELLER_BANNERS[username] ?? DEFAULT_BANNER,
  };

  return { seller, isLoading };
}

// ─── Stat pill component ─────────────────────────────────────────────────────

function StatPill({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100/50 dark:border-slate-700/50">
      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────��─────────

export default function ShopPage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const { seller, isLoading: sellerLoading } = useSellerProfile(username);
  const { data, isLoading: listingsLoading } = useListings({
    query: username,
    limit: 24,
  });

  const listings = data?.listings ?? [];

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* ── Shop banner ────────────────────────────────────────────────── */}
        <section className="relative">
          {/* Banner image */}
          <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
            {sellerLoading ? (
              <Skeleton className="absolute inset-0" />
            ) : (
              <>
                <Image
                  src={seller.bannerUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              </>
            )}
          </div>

          {/* Profile card overlapping the banner */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'rounded-2xl p-5 sm:p-8',
                'bg-white dark:bg-surface-dark',
                'border border-slate-100 dark:border-slate-800',
                'shadow-xl',
              )}
            >
              {sellerLoading ? (
                <div className="flex items-start gap-6">
                  <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={seller.avatarUrl}
                      alt={`${seller.displayName} avatar`}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg"
                    />
                    {seller.verified && (
                      <span
                        className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md"
                        aria-label="Verified seller"
                        title="Verified Seller"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
                        {seller.displayName}
                      </h1>
                      {seller.verified && (
                        <Badge variant="success" size="sm">Verified Seller</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl text-sm sm:text-base">
                      {seller.bio}
                    </p>

                    {/* Stats row */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <StatPill icon={Star}>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {seller.rating}
                        </span>
                        <span className="text-slate-400">({seller.reviewCount})</span>
                      </StatPill>
                      <StatPill icon={Package}>
                        {seller.totalSales.toLocaleString()} sales
                      </StatPill>
                      <StatPill icon={MapPin}>{seller.location}</StatPill>
                      <StatPill icon={Calendar}>Since {seller.memberSince}</StatPill>
                      <StatPill icon={Clock}>{seller.responseTime}</StatPill>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-3">
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        Contact Seller
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Listings ───────────────────────────────────────────────────── */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
          aria-labelledby="shop-listings-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2
                  id="shop-listings-heading"
                  className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100"
                >
                  Listings
                </h2>
                {!listingsLoading && listings.length > 0 && (
                  <Badge variant="muted" size="sm">
                    {listings.length} items
                  </Badge>
                )}
              </div>
            </div>

            {listingsLoading ? (
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
              <div className="text-center py-20">
                <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No listings yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  This seller hasn&apos;t posted any listings yet. Check back soon!
                </p>
                <Button asChild variant="outline">
                  <Link href="/">
                    Browse Other Listings
                    <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
