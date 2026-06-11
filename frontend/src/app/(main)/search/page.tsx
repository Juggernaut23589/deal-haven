'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import {
  SlidersHorizontal,
  X,
  ChevronRight,
  Star,
  Bookmark,
  BellRing,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NIGERIA_STATES } from '@/lib/nigeriaLocations';
import { useListings } from '@/hooks/useListings';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import type { SearchFilters, SearchSortField, ListingCondition, ListingType } from '@/types/listing';

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SearchSortField; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'deal_score', label: 'Best Deal Score' },
  { value: 'popularity', label: 'Most Popular' },
];

const CONDITION_OPTIONS: { value: ListingCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'for_parts', label: 'For Parts / Not Working' },
];

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'fixed_price', label: 'Buy It Now' },
  { value: 'auction', label: 'Auction' },
  { value: 'make_offer', label: 'Make Offer' },
  { value: 'free', label: 'Free' },
];


const CATEGORIES = [
  { label: 'Automobiles', slug: 'automobiles', icon: '🚗' },
  { label: 'Real Estate', slug: 'real-estate', icon: '🏠' },
  { label: 'Electronics', slug: 'electronics', icon: '📱' },
  { label: 'Clothing & Fashion', slug: 'clothing', icon: '👗' },
  { label: 'Furniture & Home', slug: 'furniture-home', icon: '🛋️' },
  { label: 'Services', slug: 'services', icon: '🔧' },
  { label: 'Jobs & Gigs', slug: 'jobs-gigs', icon: '💼' },
  { label: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽' },
  { label: 'Books & Media', slug: 'books-media', icon: '📚' },
  { label: 'Toys & Games', slug: 'toys-games', icon: '🎮' },
  { label: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' },
  { label: 'Collectibles & Art', slug: 'collectibles-art', icon: '🎨' },
];

// ─── URL param helpers ────────────────────────────────────────────────────────

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return isNaN(n) ? undefined : n;
}

function parseFloatParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = parseFloat(value);
  return isNaN(n) ? undefined : n;
}

// ─── Collapsible filter section ───────────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3',
          'text-sm font-semibold text-slate-700 dark:text-slate-300',
          'hover:bg-slate-50 dark:hover:bg-slate-800/50',
          'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary',
          'transition-colors duration-100'
        )}
        aria-expanded={open}
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Price Range Slider ───────────────────────────────────────────────────────

function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
}: {
  minPrice: string;
  maxPrice: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="price-min" className="text-xs text-slate-500 mb-1 block">
            Min (₦)
          </label>
          <input
            id="price-min"
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder="0"
            className={cn(
              'w-full rounded-md border border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-900 px-3 py-1.5 text-sm',
              'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          />
        </div>
        <span className="text-slate-400 mt-4">—</span>
        <div className="flex-1">
          <label htmlFor="price-max" className="text-xs text-slate-500 mb-1 block">
            Max (₦)
          </label>
          <input
            id="price-max"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder="Any"
            className={cn(
              'w-full rounded-md border border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-900 px-3 py-1.5 text-sm',
              'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Star Rating Filter ───────────────────────────────────────────────────────

function RatingFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {[4, 3, 2, 1].map((rating) => (
        <label
          key={rating}
          className={cn(
            'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5',
            'hover:bg-slate-50 dark:hover:bg-slate-800',
            value === rating && 'bg-primary/5'
          )}
        >
          <input
            type="radio"
            name="min-rating"
            checked={value === rating}
            onChange={() => onChange(value === rating ? 0 : rating)}
            className="accent-primary"
            aria-label={`Minimum ${rating} star rating`}
          />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i < rating ? 'fill-accent text-accent' : 'text-slate-300'
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">& up</span>
        </label>
      ))}
    </div>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

interface FilterState {
  categorySlug: string;
  minPrice: string;
  maxPrice: string;
  conditions: ListingCondition[];
  types: ListingType[];
  state: string;
  city: string;
  minRating: number;
}

function FilterSidebar({
  filters,
  setFilter,
  activeCount,
  onClearAll,
}: {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void;
  activeCount: number;
  onClearAll: () => void;
}) {
  function toggleArrayValue<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl overflow-hidden',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Filters</span>
          {activeCount > 0 && (
            <Badge variant="solid" size="sm">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-0.5" role="listbox" aria-label="Category filter">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() =>
                setFilter('categorySlug', filters.categorySlug === cat.slug ? '' : cat.slug)
              }
              role="option"
              aria-selected={filters.categorySlug === cat.slug}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                'transition-colors duration-100',
                filters.categorySlug === cat.slug
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <span aria-hidden="true">{cat.icon}</span>
              <span className="flex-1 text-left">{cat.label}</span>
              {filters.categorySlug === cat.slug && (
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinChange={(v) => setFilter('minPrice', v)}
          onMaxChange={(v) => setFilter('maxPrice', v)}
        />
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        <div className="space-y-2">
          {CONDITION_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer rounded-md px-1 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <input
                type="checkbox"
                checked={filters.conditions.includes(value)}
                onChange={() =>
                  setFilter('conditions', toggleArrayValue(filters.conditions, value))
                }
                className="accent-primary h-3.5 w-3.5"
                aria-label={label}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location">
        <div className="space-y-3">
          <div>
            <label htmlFor="state-filter" className="text-xs text-slate-500 mb-1 block">State</label>
            <select
              id="state-filter"
              value={filters.state}
              onChange={(e) => setFilter('state', e.target.value)}
              className={cn(
                'w-full rounded-md border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 px-3 py-1.5 text-sm',
                'text-slate-900 dark:text-slate-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <option value="">All states</option>
              {NIGERIA_STATES.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="city-filter" className="text-xs text-slate-500 mb-1 block">City / Town</label>
            <input
              id="city-filter"
              type="text"
              value={filters.city}
              onChange={(e) => setFilter('city', e.target.value)}
              placeholder="e.g. Ikeja, Lekki, Aba"
              className={cn(
                'w-full rounded-md border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 px-3 py-1.5 text-sm',
                'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            />
          </div>
        </div>
      </FilterSection>

      {/* Seller Rating */}
      <FilterSection title="Minimum Rating" defaultOpen={false}>
        <RatingFilter
          value={filters.minRating}
          onChange={(v) => setFilter('minRating', v)}
        />
      </FilterSection>

      {/* Listing Type */}
      <FilterSection title="Listing Type" defaultOpen={false}>
        <div className="space-y-2">
          {LISTING_TYPE_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer rounded-md px-1 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <input
                type="checkbox"
                checked={filters.types.includes(value)}
                onChange={() =>
                  setFilter('types', toggleArrayValue(filters.types, value))
                }
                className="accent-primary h-3.5 w-3.5"
                aria-label={label}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

// ─── Active Filter Chip ────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/20',
        'bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="flex items-center justify-center hover:text-primary-dark focus-visible:outline-none"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

// ─── Save Search Button ────────────────────────────────────────────────────────

function SaveSearchButton({ searchQuery }: { searchQuery: string }) {
  const [saved, setSaved] = React.useState(false);
  const [alertEnabled, setAlertEnabled] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
  };

  if (!searchQuery) return null;

  return (
    <div className="flex items-center gap-2">
      {!saved ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          leftIcon={<Bookmark className="h-3.5 w-3.5" />}
        >
          Save Search
        </Button>
      ) : (
        <button
          onClick={() => setAlertEnabled((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium',
            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            alertEnabled
              ? 'border-accent/30 bg-accent/10 text-accent-dark'
              : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
          )}
          aria-pressed={alertEnabled}
          aria-label={alertEnabled ? 'Disable price alerts' : 'Enable price alerts'}
        >
          <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
          {alertEnabled ? 'Alerts On' : 'Get Alerts'}
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SearchPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Read URL params ──────────────────────────────────────────────────────
  const query = searchParams.get('q') ?? '';
  const page = parseIntParam(searchParams.get('page')) ?? 1;
  const sort = (searchParams.get('sort') as SearchSortField) ?? 'relevance';

  // ── Local filter state (synced to URL) ───────────────────────────────────
  const [filters, setFiltersState] = React.useState<FilterState>({
    categorySlug: searchParams.get('category') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    conditions: (searchParams.getAll('condition') as ListingCondition[]),
    types: (searchParams.getAll('type') as ListingType[]),
    state: searchParams.get('state') ?? '',
    city: searchParams.get('city') ?? '',
    minRating: parseIntParam(searchParams.get('minRating')) ?? 0,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [currentSort, setCurrentSort] = React.useState<SearchSortField>(sort);

  // ── Debounce filter changes to avoid excessive URL updates ───────────────
  const pendingRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }

  // Build SearchFilters from state
  const searchFilters: SearchFilters = React.useMemo(
    () => ({
      query: query || undefined,
      categorySlug: filters.categorySlug || undefined,
      minPrice: parseFloatParam(filters.minPrice),
      maxPrice: parseFloatParam(filters.maxPrice),
      condition: filters.conditions.length > 0 ? filters.conditions : undefined,
      type: filters.types.length > 0 ? filters.types : undefined,
      state: filters.state || undefined,
      city: filters.city || undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      sort: currentSort,
      page,
      limit: 24,
    }),
    [query, filters, currentSort, page]
  );

  // Sync filters → URL (debounced)
  React.useEffect(() => {
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (filters.categorySlug) params.set('category', filters.categorySlug);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      filters.conditions.forEach((c) => params.append('condition', c));
      filters.types.forEach((t) => params.append('type', t));
      if (filters.state) params.set('state', filters.state);
      if (filters.city) params.set('city', filters.city);
      if (filters.minRating > 0) params.set('minRating', String(filters.minRating));
      if (currentSort !== 'relevance') params.set('sort', currentSort);
      if (page > 1) params.set('page', String(page));

      router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
    }, 400);
    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentSort]);

  const { data, isLoading, isFetching } = useListings(searchFilters);

  // ── Active filter count ──────────────────────────────────────────────────
  const activeFilterCount = [
    filters.categorySlug,
    filters.minPrice,
    filters.maxPrice,
    ...filters.conditions,
    ...filters.types,
    filters.state,
    filters.city,
    filters.minRating > 0 ? 'rating' : '',
  ].filter(Boolean).length;

  function handleClearAll() {
    setFiltersState({
      categorySlug: '',
      minPrice: '',
      maxPrice: '',
      conditions: [],
      types: [],
      state: '',
      city: '',
      minRating: 0,
    });
    setCurrentSort('relevance');
  }

  // ── Active filter chips ──────────────────────────────────────────────────
  const activeChips: { label: string; remove: () => void }[] = [
    ...(filters.categorySlug
      ? [
          {
            label: CATEGORIES.find((c) => c.slug === filters.categorySlug)?.label ?? filters.categorySlug,
            remove: () => setFilter('categorySlug', ''),
          },
        ]
      : []),
    ...(filters.minPrice || filters.maxPrice
      ? [
          {
            label: `₦${filters.minPrice || '0'} – ₦${filters.maxPrice || '∞'}`,
            remove: () => { setFilter('minPrice', ''); setFilter('maxPrice', ''); },
          },
        ]
      : []),
    ...filters.conditions.map((c) => ({
      label: CONDITION_OPTIONS.find((o) => o.value === c)?.label ?? c,
      remove: () => setFilter('conditions', filters.conditions.filter((v) => v !== c)),
    })),
    ...filters.types.map((t) => ({
      label: LISTING_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t,
      remove: () => setFilter('types', filters.types.filter((v) => v !== t)),
    })),
    ...(filters.state
      ? [{
          label: `📍 ${filters.state}`,
          remove: () => setFilter('state', ''),
        }]
      : []),
    ...(filters.city
      ? [{
          label: `🏙 ${filters.city}`,
          remove: () => setFilter('city', ''),
        }]
      : []),
    ...(filters.minRating > 0
      ? [
          {
            label: `${filters.minRating}+ Stars`,
            remove: () => setFilter('minRating', 0),
          },
        ]
      : []),
  ];

  const resultCount = data?.meta?.total ?? 0;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      {/* Breadcrumb */}
      <nav
        className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark"
        aria-label="Breadcrumb"
      >
        <ol
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-slate-500"
          role="list"
        >
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link href="/search" className="hover:text-primary transition-colors">
              Search
            </Link>
          </li>
          {filters.categorySlug && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li className="text-slate-700 dark:text-slate-300 font-medium capitalize">
                {CATEGORIES.find((c) => c.slug === filters.categorySlug)?.label ?? filters.categorySlug}
              </li>
            </>
          )}
          {query && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">
                &ldquo;{query}&rdquo;
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* ── Desktop Filter Sidebar ─────────────────────────────────── */}
          <aside
            className="hidden lg:block w-[280px] shrink-0 sticky top-20"
            aria-label="Search filters"
          >
            <FilterSidebar
              filters={filters}
              setFilter={setFilter}
              activeCount={activeFilterCount}
              onClearAll={handleClearAll}
            />
          </aside>

          {/* ── Main Results Area ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Mobile filter button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                  leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                  aria-expanded={mobileFiltersOpen}
                  aria-controls="mobile-filters"
                >
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="solid" size="sm" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                <p
                  className="text-sm text-slate-500 dark:text-slate-400"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  ) : (
                    <>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {resultCount.toLocaleString()}
                      </span>{' '}
                      {resultCount === 1 ? 'result' : 'results'}
                      {query ? ` for "${query}"` : ''}
                    </>
                  )}
                </p>

                <SaveSearchButton searchQuery={query} />
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-slate-500 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={currentSort}
                  onChange={(e) => setCurrentSort(e.target.value as SearchSortField)}
                  className={cn(
                    'rounded-md border border-slate-200 dark:border-slate-700',
                    'bg-white dark:bg-slate-900 px-3 py-1.5 text-sm',
                    'text-slate-900 dark:text-slate-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-2 mb-4"
                role="list"
                aria-label="Active filters"
              >
                {activeChips.map((chip) => (
                  <div key={chip.label} role="listitem">
                    <FilterChip label={chip.label} onRemove={chip.remove} />
                  </div>
                ))}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-slate-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Listings */}
            <ListingGrid
              listings={data?.listings}
              isLoading={isLoading || isFetching}
              skeletonCount={24}
              showHeader={false}
              priorityCount={6}
              emptyStateTitle={query ? `No results for "${query}"` : 'No listings found'}
              emptyStateDescription="Try adjusting your filters or broadening your search."
            />

            {/* Pagination */}
            {!isLoading && data && data.meta.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={data.meta.page}
                  totalPages={data.meta.totalPages}
                  onPageChange={(p) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (p === 1) {
                      params.delete('page');
                    } else {
                      params.set('page', String(p));
                    }
                    router.push(`${pathname}?${params.toString()}` as Route);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              key="mobile-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-modal-backdrop bg-black/50 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="mobile-filter-drawer"
              id="mobile-filters"
              role="dialog"
              aria-modal="true"
              aria-label="Search filters"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className={cn(
                'fixed inset-y-0 left-0 z-modal w-[85vw] max-w-xs',
                'bg-white dark:bg-slate-900',
                'overflow-y-auto shadow-2xl lg:hidden'
              )}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Filters</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                setFilter={setFilter}
                activeCount={activeFilterCount}
                onClearAll={handleClearAll}
              />
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  className="w-full"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Show {resultCount.toLocaleString()} Results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 shrink-0">
            <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-48 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageInner />
    </React.Suspense>
  );
}
