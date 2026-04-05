'use client';

import * as React from 'react';
import { LayoutGrid, LayoutList, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListingCard, ListingCardSkeleton } from './ListingCard';
import { Button } from '@/components/ui/Button';
import type { ListingCard as ListingCardType } from '@/types/listing';

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  title = 'No listings found',
  description = 'Try adjusting your search filters or browse a different category.',
  cta,
}: {
  title?: string;
  description?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
        <Tag className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}

// ─── Skeleton Grid ────────────────────────────────────────────────────────────

function SkeletonGrid({
  count = 12,
  listView = false,
}: {
  count?: number;
  listView?: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton
          key={i}
          className={cn(listView && 'flex-row')}
        />
      ))}
    </>
  );
}

// ─── View Toggle ─────────────────────────────────────────────────────────────

function ViewToggle({
  listView,
  onToggle,
}: {
  listView: boolean;
  onToggle: (list: boolean) => void;
}) {
  return (
    <div
      className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      role="group"
      aria-label="View mode"
    >
      <button
        onClick={() => onToggle(false)}
        aria-label="Grid view"
        aria-pressed={!listView}
        className={cn(
          'flex h-8 w-8 items-center justify-center transition-colors duration-100',
          !listView
            ? 'bg-primary text-white'
            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
        )}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => onToggle(true)}
        aria-label="List view"
        aria-pressed={listView}
        className={cn(
          'flex h-8 w-8 items-center justify-center transition-colors duration-100',
          listView
            ? 'bg-primary text-white'
            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
        )}
      >
        <LayoutList className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ListingGridProps {
  listings?: ListingCardType[];
  isLoading?: boolean;
  skeletonCount?: number;
  /**
   * When true, the grid header (result count + view toggle) is rendered.
   */
  showHeader?: boolean;
  resultCount?: number;
  /** Additional content rendered in the header (e.g. sort dropdown). */
  headerActions?: React.ReactNode;
  /** Content shown in the empty state CTA area. */
  emptyStateCta?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
  /** Render priority images for above-the-fold cards. */
  priorityCount?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingGrid({
  listings = [],
  isLoading = false,
  skeletonCount = 12,
  showHeader = true,
  resultCount,
  headerActions,
  emptyStateCta,
  emptyStateTitle,
  emptyStateDescription,
  className,
  priorityCount = 4,
}: ListingGridProps) {
  const [listView, setListView] = React.useState(false);

  const isEmpty = !isLoading && listings.length === 0;

  const gridClass = cn(
    listView
      ? 'flex flex-col gap-3'
      : [
          'grid gap-4',
          'grid-cols-1',
          'sm:grid-cols-2',
          'lg:grid-cols-3',
          'xl:grid-cols-4',
        ]
  );

  return (
    <section className={cn('w-full', className)} aria-label="Listings">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {resultCount !== undefined && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {resultCount.toLocaleString()}
                </span>{' '}
                {resultCount === 1 ? 'listing' : 'listings'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {headerActions}
            <ViewToggle listView={listView} onToggle={setListView} />
          </div>
        </div>
      )}

      {/* Grid */}
      {isEmpty ? (
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          cta={emptyStateCta}
        />
      ) : (
        <div className={gridClass}>
          {isLoading ? (
            <SkeletonGrid count={skeletonCount} listView={listView} />
          ) : (
            listings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                listView={listView}
                priority={index < priorityCount}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default ListingGrid;
