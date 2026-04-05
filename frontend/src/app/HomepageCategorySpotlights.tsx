'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowRight } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { cn } from '@/lib/utils';

// ─── Spotlight Section ────────────────────────────────────────────────────────

interface SpotlightProps {
  categorySlug: string;
  title: string;
  subtitle: string;
  headerBg: string;
  href: Route;
}

function CategorySpotlight({
  categorySlug,
  title,
  subtitle,
  headerBg,
  href,
}: SpotlightProps) {
  const { data, isLoading } = useListings(
    { categorySlug, sort: 'deal_score', limit: 4 },
    { staleTime: 5 * 60_000 }
  );

  const skeletonIds = React.useMemo(() => ['a', 'b', 'c', 'd'], []);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card"
      aria-labelledby={`spotlight-${categorySlug}-heading`}
    >
      {/* Colored header */}
      <div className={cn('px-6 py-5 flex items-center justify-between', headerBg)}>
        <div>
          <h2
            id={`spotlight-${categorySlug}-heading`}
            className="text-lg font-bold font-display text-white"
          >
            {title}
          </h2>
          <p className="text-sm text-white/75 mt-0.5">{subtitle}</p>
        </div>
        <Link
          href={href}
          className={cn(
            'flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30',
            'px-4 py-2 text-sm font-medium text-white',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
          )}
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Listings */}
      <div className="bg-white dark:bg-surface-dark p-5">
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
          aria-label={`${title} listings`}
        >
          {isLoading
            ? skeletonIds.map((id) => (
                <div
                  key={id}
                  className="h-72 rounded-card bg-slate-100 dark:bg-slate-800 animate-pulse"
                  role="listitem"
                  aria-hidden="true"
                />
              ))
            : (data?.listings ?? []).map((listing, i) => (
                <div key={listing.id} role="listitem">
                  <ListingCard listing={listing} priority={i < 2} />
                </div>
              ))}

          {!isLoading && (data?.listings ?? []).length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-slate-400">
              No listings available right now. Check back soon!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function HomepageCategorySpotlights() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <CategorySpotlight
        categorySlug="electronics"
        title="Electronics Deals"
        subtitle="Top picks in phones, laptops, gaming & more"
        headerBg="bg-gradient-to-r from-slate-800 to-slate-700"
        href={"/category/electronics" as Route}
      />
      <CategorySpotlight
        categorySlug="automobiles"
        title="Automobile Picks"
        subtitle="Cars, trucks, motorcycles & parts at great prices"
        headerBg="bg-gradient-to-r from-primary-dark to-primary"
        href={"/category/automobiles" as Route}
      />
    </div>
  );
}
