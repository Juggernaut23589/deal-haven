'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { ListingCard } from '@/components/listings/ListingCard';
import { cn } from '@/lib/utils';

// ─── Today's Best Deals ────────────────────────────────────────────────────────

function TodaysBestDeals() {
  const { data, isLoading } = useListings(
    { sort: 'deal_score', limit: 8 },
    { staleTime: 5 * 60_000 }
  );

  return (
    <section
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16"
      aria-labelledby="best-deals-heading"
    >
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="best-deals-heading"
              className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100"
            >
              Today&apos;s Best Deals
            </h2>
            <span className="group relative inline-flex items-center">
              <Info
                className="h-4 w-4 text-slate-400 cursor-help"
                aria-label="About Deal Score"
                tabIndex={0}
              />
              <span
                role="tooltip"
                className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-tooltip',
                  'w-60 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white leading-relaxed shadow-lg',
                  'opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100',
                  'transition-opacity duration-150'
                )}
              >
                Listings are ranked by our AI-powered Deal Score, which compares prices to recent
                market data. Higher score = better deal for you.
              </span>
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            AI-ranked listings with the best prices vs. market value
          </p>
        </div>
        <Link
          href="/search?sort=deal_score"
          className="flex items-center gap-1.5 shrink-0 text-sm font-medium text-primary hover:text-primary-dark dark:text-primary-light focus-visible:outline-none focus-visible:underline transition-colors"
        >
          View All Deals
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ListingGrid
        listings={data?.listings}
        isLoading={isLoading}
        skeletonCount={8}
        showHeader={false}
        priorityCount={4}
        emptyStateTitle="No deals right now"
        emptyStateDescription="Check back soon — new listings are added every minute."
      />
    </section>
  );
}

// ─── Recently Added ────────────────────────────────────────────────────────────

function RecentlyAdded() {
  const { data, isLoading } = useListings(
    { sort: 'newest', limit: 6 },
    { staleTime: 2 * 60_000 }
  );

  const skeletonIds = React.useMemo(
    () => Array.from({ length: 6 }, (_, i) => `skel-${i}`),
    []
  );

  return (
    <section
      className="bg-slate-50 dark:bg-slate-900/30 py-16"
      aria-labelledby="recently-added-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2
              id="recently-added-heading"
              className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100"
            >
              Recently Added
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Fresh listings — posted in the last few hours
            </p>
          </div>
          <Link
            href="/search?sort=newest"
            className="flex items-center gap-1.5 shrink-0 text-sm font-medium text-primary hover:text-primary-dark dark:text-primary-light focus-visible:outline-none focus-visible:underline transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Horizontal scroll row */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
          role="list"
          aria-label="Recently added listings"
        >
          {isLoading
            ? skeletonIds.map((id) => (
                <div
                  key={id}
                  className="flex-shrink-0 w-56"
                  role="listitem"
                  aria-hidden="true"
                >
                  <div className="h-72 rounded-card bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              ))
            : (data?.listings ?? []).map((listing, i) => (
                <div
                  key={listing.id}
                  className="flex-shrink-0 w-56"
                  role="listitem"
                >
                  <ListingCard listing={listing} priority={i < 2} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

// ─── Composed export ──────────────────────────────────────────────────────────

export default function HomepageListingSections() {
  return (
    <>
      <TodaysBestDeals />
      <RecentlyAdded />
    </>
  );
}
