'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { cn } from '@/lib/utils';

// ─── Animation variants ─────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Spotlight Section ──────────────────────────────────────────────────────

interface SpotlightProps {
  categorySlug: string;
  title: string;
  subtitle: string;
  headerImage: string;
  headerGradient: string;
  href: Route;
}

function CategorySpotlight({
  categorySlug,
  title,
  subtitle,
  headerImage,
  headerGradient,
  href,
}: SpotlightProps) {
  const { data, isLoading } = useListings(
    { categorySlug, sort: 'deal_score', limit: 4 },
    { staleTime: 5 * 60_000 }
  );

  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const skeletonIds = React.useMemo(() => ['a', 'b', 'c', 'd'], []);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card"
      aria-labelledby={`spotlight-${categorySlug}-heading`}
    >
      {/* Colored header with real photo background */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        <Image
          src={headerImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <div className={cn('absolute inset-0', headerGradient)} />
        <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-8">
          <div className="relative z-10">
            <h2
              id={`spotlight-${categorySlug}-heading`}
              className="text-xl sm:text-2xl font-bold font-display text-white drop-shadow-md"
            >
              {title}
            </h2>
            <p className="text-sm text-white/80 mt-1 drop-shadow-sm">{subtitle}</p>
          </div>
          <Link
            href={href}
            className={cn(
              'relative z-10 flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30',
              'px-4 py-2 text-sm font-medium text-white backdrop-blur-sm',
              'transition-all duration-200 hover:scale-105',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
            )}
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Listings */}
      <div className="bg-white dark:bg-surface-dark p-5">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
          aria-label={`${title} listings`}
        >
          {isLoading
            ? skeletonIds.map((id) => (
                <motion.div
                  key={id}
                  variants={fadeUp}
                  className="h-72 rounded-card bg-slate-100 dark:bg-slate-800 animate-pulse"
                  role="listitem"
                  aria-hidden="true"
                />
              ))
            : (data?.listings ?? []).map((listing, i) => (
                <motion.div key={listing.id} role="listitem" variants={fadeUp}>
                  <ListingCard listing={listing} priority={i < 2} />
                </motion.div>
              ))}

          {!isLoading && (data?.listings ?? []).length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-slate-400">
              No listings available right now. Check back soon!
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export default function HomepageCategorySpotlights() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
      <CategorySpotlight
        categorySlug="electronics"
        title="Electronics Deals"
        subtitle="Top picks in phones, laptops, gaming & more"
        headerImage="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop"
        headerGradient="bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/30"
        href={"/category/electronics" as Route}
      />
      <CategorySpotlight
        categorySlug="automobiles"
        title="Automobile Picks"
        subtitle="Cars, trucks, motorcycles & parts at great prices"
        headerImage="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=400&fit=crop"
        headerGradient="bg-gradient-to-r from-primary-dark/90 via-primary/60 to-primary/20"
        href={"/category/automobiles" as Route}
      />
      <CategorySpotlight
        categorySlug="clothing"
        title="Fashion & Style"
        subtitle="Trending outfits, shoes, and accessories"
        headerImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop"
        headerGradient="bg-gradient-to-r from-rose-900/85 via-rose-900/50 to-rose-900/20"
        href={"/category/clothing" as Route}
      />
    </div>
  );
}
