'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Current page number (1-indexed). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Called with the new page number when navigation occurs. */
  onPageChange: (page: number) => void;
  /** Number of sibling pages shown on each side of the current page. */
  siblingCount?: number;
  /** Shows a compact variant (no page numbers, just prev/next). */
  compact?: boolean;
  /** Shows a "Jump to page" input for large page counts. */
  showJumpInput?: boolean;
  /** Total result count shown alongside navigation. */
  totalItems?: number;
  /** Items per page (used for label). */
  pageSize?: number;
  className?: string;
}

// ─── Range Generator ──────────────────────────────────────────────────────────

function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | '...')[] {
  const totalPageNumbers = siblingCount * 2 + 5; // siblings + current + first + last + 2 ellipses

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => i + 1
    );
    return [...leftRange, '...', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => totalPages - (3 + 2 * siblingCount) + 1 + i
    );
    return [1, '...', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, '...', ...middleRange, '...', totalPages];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  compact = false,
  showJumpInput = false,
  totalItems,
  pageSize,
  className,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = React.useState('');

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const pages = generatePageRange(currentPage, totalPages, siblingCount);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num);
      setJumpValue('');
    }
  };

  // Range label e.g. "Showing 21–40 of 245 results"
  const rangeLabel =
    totalItems !== undefined && pageSize !== undefined
      ? `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalItems)}–${Math.min(
          currentPage * pageSize,
          totalItems
        )} of ${totalItems.toLocaleString()} results`
      : null;

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn('flex flex-wrap items-center justify-between gap-4', className)}
      aria-label="Pagination"
    >
      {/* Result range label */}
      {rangeLabel && (
        <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
          {rangeLabel}
        </span>
      )}

      <div className="flex items-center gap-1 flex-wrap">
        {/* First page */}
        {!compact && totalPages > 5 && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrev}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous */}
        <Button
          variant="outline"
          size={compact ? 'default' : 'icon-sm'}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {compact && <span className="ml-1">Previous</span>}
        </Button>

        {/* Page numbers */}
        {!compact &&
          pages.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-slate-400"
                aria-hidden="true"
              >
                &hellip;
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="icon-sm"
                onClick={() => onPageChange(page as number)}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  'min-w-[2rem]',
                  page === currentPage &&
                    'pointer-events-none font-semibold'
                )}
              >
                {page}
              </Button>
            )
          )}

        {/* Next */}
        <Button
          variant="outline"
          size={compact ? 'default' : 'icon-sm'}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Go to next page"
        >
          {compact && <span className="mr-1">Next</span>}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* Last page */}
        {!compact && totalPages > 5 && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Jump to page */}
      {showJumpInput && !compact && totalPages > 10 && (
        <form
          onSubmit={handleJump}
          className="hidden lg:flex items-center gap-2"
        >
          <label htmlFor="page-jump" className="text-sm text-slate-500 whitespace-nowrap">
            Go to
          </label>
          <input
            id="page-jump"
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            className={cn(
              'h-8 w-16 rounded-md border border-slate-200 bg-white px-2 text-sm',
              'text-center tabular-nums',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
            )}
            placeholder={String(currentPage)}
            aria-label="Jump to page number"
          />
          <Button type="submit" variant="outline" size="sm">
            Go
          </Button>
        </form>
      )}
    </nav>
  );
}

export default Pagination;
