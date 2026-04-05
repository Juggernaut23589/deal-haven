import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Base Skeleton ────────────────────────────────────────────────────────────

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders as a circle (useful for avatars). */
  circle?: boolean;
}

export function Skeleton({ className, circle, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-700',
        circle ? 'rounded-full' : 'rounded-md',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

// ─── SkeletonText ─────────────────────────────────────────────────────────────

export interface SkeletonTextProps {
  /** Number of text lines to render. */
  lines?: number;
  /** Makes the last line shorter (typical paragraph style). */
  lastLineShort?: boolean;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineShort = true,
  className,
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            lastLineShort && i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// ─── SkeletonAvatar ───────────────────────────────────────────────────────────

export interface SkeletonAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes: Record<NonNullable<SkeletonAvatarProps['size']>, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  return (
    <Skeleton circle className={cn(avatarSizes[size], className)} />
  );
}

// ─── ListingCardSkeleton ──────────────────────────────────────────────────────

export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-card border border-slate-100 dark:border-slate-800 overflow-hidden',
        'bg-white dark:bg-surface-dark shadow-card',
        className
      )}
      aria-hidden="true"
    >
      {/* Image */}
      <Skeleton className="h-48 w-full rounded-none" />

      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        {/* Price */}
        <Skeleton className="h-6 w-1/3 mt-1" />

        {/* Meta row */}
        <div className="flex items-center gap-2 pt-1">
          <SkeletonAvatar size="xs" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </div>
    </div>
  );
}

// ─── ListingDetailSkeleton ────────────────────────────────────────────────────

export function ListingDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8" aria-hidden="true">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-md" />
            ))}
          </div>
          {/* Description */}
          <div className="mt-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <SkeletonText lines={6} />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonAvatar size="md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SellerCardSkeleton ───────────────────────────────────────────────────────

export function SellerCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-card border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark space-y-3', className)} aria-hidden="true">
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}

// ─── TableRowSkeleton ─────────────────────────────────────────────────────────

export function TableRowSkeleton({
  cols = 4,
  rows = 5,
}: {
  cols?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-slate-100 dark:border-slate-800" aria-hidden="true">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default Skeleton;
