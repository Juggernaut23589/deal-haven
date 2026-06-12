'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Search,
  MapPin,
  X,
  Clock,
  Tag,
  ChevronRight,
  Loader2,
  Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { useSearch } from '@/hooks/useSearch';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SearchBarProps {
  /** Size variant: 'hero' for homepage, 'navbar' for top nav. */
  variant?: 'hero' | 'navbar';
  /** Initial query value. */
  defaultQuery?: string;
  /** Called when the user submits a search. */
  onSearch?: (query: string, location?: string) => void;
  /** Hides the location pill selector. */
  hideLocation?: boolean;
  className?: string;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
}

// ─── Location Selector ────────────────────────────────────────────────────────

function LocationPill({
  location,
  onChange,
}: {
  location: string;
  onChange: (loc: string) => void;
}) {
  const [requesting, setRequesting] = React.useState(false);

  const requestGeolocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        onChange('Current Location');
        setRequesting(false);
      },
      () => setRequesting(false),
      { timeout: 8000 }
    );
  };

  return (
    <button
      type="button"
      onClick={requestGeolocation}
      disabled={requesting}
      className={cn(
        'flex shrink-0 items-center gap-1.5 border-r border-slate-200 dark:border-slate-700',
        'px-3 py-2 text-sm text-slate-600 dark:text-slate-400',
        'hover:bg-slate-50 dark:hover:bg-slate-800',
        'transition-colors duration-100',
        'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary',
        'whitespace-nowrap'
      )}
      aria-label={requesting ? 'Getting location…' : 'Set location'}
    >
      {requesting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
      ) : (
        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
      )}
      <span className="max-w-[8rem] truncate">{location || 'Location'}</span>
    </button>
  );
}

// ─── Autocomplete Dropdown ────────────────────────────────────────────────────

interface AutocompleteDropdownProps {
  query: string;
  results: ReturnType<typeof useSearch>['results'];
  isLoading: boolean;
  recentSearches: string[];
  onSelect: (term: string) => void;
  onClearRecent: () => void;
  activeIndex: number;
  onClose: () => void;
}

function AutocompleteDropdown({
  query,
  results,
  isLoading,
  recentSearches,
  onSelect,
  onClearRecent,
  activeIndex,
  onClose,
}: AutocompleteDropdownProps) {
  const showSuggestions = query.trim().length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'absolute top-full left-0 right-0 mt-1 z-dropdown',
        'rounded-xl border border-slate-200 bg-white shadow-xl',
        'dark:border-slate-700 dark:bg-slate-900',
        'overflow-hidden max-h-[420px] overflow-y-auto'
      )}
      role="listbox"
      aria-label="Search suggestions"
    >
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Searching…
        </div>
      )}

      {/* Recent searches (when query is empty) */}
      {!showSuggestions && !isLoading && recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Searches
            </span>
            <button
              type="button"
              onClick={onClearRecent}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:underline"
            >
              Clear
            </button>
          </div>
          {recentSearches.map((term, i) => (
            <button
              key={term}
              type="button"
              role="option"
              aria-selected={activeIndex === i}
              onClick={() => onSelect(term)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5',
                'text-sm text-slate-700 dark:text-slate-300',
                'hover:bg-slate-50 dark:hover:bg-slate-800',
                activeIndex === i && 'bg-slate-50 dark:bg-slate-800',
                'transition-colors duration-100'
              )}
            >
              <Clock className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Autocomplete results */}
      {showSuggestions && !isLoading && results && (
        <>
          {/* Suggestions */}
          {results.suggestions.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Suggestions
                </span>
              </div>
              {results.suggestions.map((suggestion, i) => (
                <button
                  key={suggestion}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === i}
                  onClick={() => onSelect(suggestion)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2',
                    'text-sm text-slate-700 dark:text-slate-300',
                    'hover:bg-slate-50 dark:hover:bg-slate-800',
                    activeIndex === i && 'bg-slate-50 dark:bg-slate-800',
                    'transition-colors duration-100'
                  )}
                >
                  <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>
                    {/* Bold the non-matching prefix */}
                    <span className="font-medium">{query}</span>
                    {suggestion.slice(query.length)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Category matches */}
          {results.categories.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Categories
                </span>
              </div>
              {results.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}?q=${encodeURIComponent(query)}` as Route}
                  onClick={onClose}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-2',
                    'text-sm text-slate-700 dark:text-slate-300',
                    'hover:bg-slate-50 dark:hover:bg-slate-800',
                    'transition-colors duration-100'
                  )}
                  role="option"
                  aria-selected={false}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span>
                      Search <span className="font-medium">&ldquo;{query}&rdquo;</span> in{' '}
                      <span className="text-primary">{cat.name}</span>
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}

          {/* Listing matches */}
          {results.listings.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Listings
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}` as Route}
                  onClick={onClose}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  See all
                </Link>
              </div>
              {results.listings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listing/${item.id}` as Route}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5',
                    'hover:bg-slate-50 dark:hover:bg-slate-800',
                    'transition-colors duration-100'
                  )}
                  role="option"
                  aria-selected={false}
                >
                  <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        width={40}
                        height={40}
                        unoptimized={item.coverImageUrl.includes('/uploads/')}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Tag className="h-5 w-5 text-slate-300" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs font-semibold text-primary font-mono tabular-nums">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {results.suggestions.length === 0 &&
            results.categories.length === 0 &&
            results.listings.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
        </>
      )}

      {/* Submit hint */}
      {query.trim().length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="submit"
            className="flex w-full items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Search for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── SearchBar Component ──────────────────────────────────────────────────────

export function SearchBar({
  variant = 'navbar',
  defaultQuery = '',
  onSearch,
  hideLocation = false,
  className,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [location, setLocation] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const { query, setQuery, results, isLoading, recentSearches, addRecentSearch, clearRecentSearches } =
    useSearch(defaultQuery);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    addRecentSearch(q);
    setIsOpen(false);
    if (onSearch) {
      onSearch(q, location);
    } else {
      const params = new URLSearchParams({ q });
      if (location) params.set('location', location);
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleSelect = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
    setIsOpen(false);
    if (onSearch) {
      onSearch(term, location);
    } else {
      const params = new URLSearchParams({ q: term });
      if (location) params.set('location', location);
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems =
      (results?.suggestions.length ?? 0) +
      (recentSearches.length > 0 && query.trim().length < 2 ? recentSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, totalItems - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case 'Enter':
        if (activeIndex >= 0 && results?.suggestions[activeIndex]) {
          e.preventDefault();
          handleSelect(results.suggestions[activeIndex]);
        }
        break;
      default:
        setActiveIndex(-1);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search Ashimarket listings"
      >
        <div
          className={cn(
            'flex items-center overflow-hidden',
            'border bg-white dark:bg-slate-900',
            'transition-all duration-150',
            isOpen
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-slate-200 dark:border-slate-700',
            isHero
              ? 'rounded-xl shadow-lg'
              : 'rounded-lg'
          )}
        >
          {/* Location selector */}
          {!hideLocation && (
            <LocationPill location={location} onChange={setLocation} />
          )}

          {/* Search input */}
          <div className="relative flex-1 flex items-center">
            <Search
              className={cn(
                'pointer-events-none absolute left-3 shrink-0',
                'text-slate-400',
                isHero ? 'h-5 w-5' : 'h-4 w-4'
              )}
              aria-hidden="true"
            />
            <label htmlFor="search-input" className="sr-only">
              Search for listings
            </label>
            <input
              ref={inputRef}
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={
                isHero
                  ? 'Search for cars, electronics, homes, services…'
                  : 'Search for anything…'
              }
              autoFocus={autoFocus}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-autocomplete="list"
              aria-controls="search-listbox"
              aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
              aria-expanded={isOpen}
              role="combobox"
              className={cn(
                'flex-1 bg-transparent',
                isHero ? 'h-14 pl-10 pr-4 text-base' : 'h-10 pl-9 pr-4 text-sm',
                'text-slate-900 dark:text-slate-100',
                'placeholder:text-slate-400',
                'focus-visible:outline-none'
              )}
            />

            {/* Clear button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus-visible:outline-none rounded"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className={cn(
              'shrink-0 bg-primary text-white font-medium',
              'hover:bg-primary-dark active:bg-primary-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              'transition-colors duration-150',
              isHero ? 'h-14 px-6 text-base rounded-r-xl' : 'h-10 px-4 text-sm rounded-r-lg'
            )}
            aria-label="Search"
          >
            {isHero ? 'Search' : <Search className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {isOpen && (
          <AutocompleteDropdown
            query={query}
            results={results}
            isLoading={isLoading}
            recentSearches={recentSearches}
            onSelect={handleSelect}
            onClearRecent={clearRecentSearches}
            activeIndex={activeIndex}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;
