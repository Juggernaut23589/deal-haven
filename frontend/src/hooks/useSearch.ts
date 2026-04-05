'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { searchApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import type { AutocompleteResult, Category } from '@/types/listing';
import type { SavedSearch } from '@/types/order';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const searchKeys = {
  autocomplete: (query: string) => ['search', 'autocomplete', query] as const,
  categories: () => ['search', 'categories'] as const,
  categoryTree: () => ['search', 'categoryTree'] as const,
  categoryBySlug: (slug: string) => ['search', 'category', slug] as const,
  savedSearches: () => ['search', 'saved'] as const,
};

// ─── Debounce Hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ─── useSearch ────────────────────────────────────────────────────────────────

interface UseSearchReturn {
  query: string;
  debouncedQuery: string;
  setQuery: (q: string) => void;
  results: AutocompleteResult | undefined;
  isLoading: boolean;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

const RECENT_SEARCHES_KEY = 'dh_recent_searches';
const MAX_RECENT_SEARCHES = 8;

function getStoredSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

/**
 * Debounced search with autocomplete support.
 * Manages recent searches in localStorage.
 *
 * @param initialQuery - Optional initial query value
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
export function useSearch(
  initialQuery: string = '',
  debounceMs: number = 300
): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>(getStoredSearches);
  const debouncedQuery = useDebounce(query, debounceMs);

  const { data: results, isLoading } = useQuery<AutocompleteResult>({
    queryKey: searchKeys.autocomplete(debouncedQuery),
    queryFn: () => searchApi.autocomplete(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Storage quota exceeded — ignore
      }
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    query,
    debouncedQuery,
    setQuery,
    results,
    isLoading: isLoading && debouncedQuery.length >= 2,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}

// ─── useCategories ────────────────────────────────────────────────────────────

/**
 * Fetches and caches the full category tree.
 * Very long stale time since categories rarely change.
 */
export function useCategories(
  options?: Omit<UseQueryOptions<Category[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Category[]>({
    queryKey: searchKeys.categoryTree(),
    queryFn: () => searchApi.categoryTree(),
    staleTime: 30 * 60_000, // 30 minutes
    gcTime: 60 * 60_000, // 1 hour
    ...options,
  });
}

/**
 * Fetches a single category by slug.
 */
export function useCategoryBySlug(
  slug: string,
  options?: Omit<UseQueryOptions<Category>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Category>({
    queryKey: searchKeys.categoryBySlug(slug),
    queryFn: () => searchApi.categoryBySlug(slug),
    enabled: !!slug,
    staleTime: 30 * 60_000,
    ...options,
  });
}

// ─── useSavedSearches ─────────────────────────────────────────────────────────

/**
 * Fetches the authenticated user's saved searches.
 */
export function useSavedSearches() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<SavedSearch[]>({
    queryKey: searchKeys.savedSearches(),
    queryFn: () => searchApi.getSavedSearches(),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

// ─── useSaveSearch ────────────────────────────────────────────────────────────

interface SaveSearchPayload {
  name: string;
  query: string;
  filters: Record<string, unknown>;
  alertEnabled?: boolean;
  alertFrequency?: 'instant' | 'daily' | 'weekly';
}

/**
 * Mutation for saving a search query.
 */
export function useSaveSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SavedSearch, Error, SaveSearchPayload>({
    mutationFn: (payload) => searchApi.saveSearch(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedSearches() });
      toast.success('Search saved', `"${data.name}" will alert you to new matches.`);
    },
    onError: () => {
      toast.error('Failed to save search', 'Please try again.');
    },
  });
}

/**
 * Mutation for deleting a saved search.
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (id) => searchApi.deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedSearches() });
      toast.info('Saved search removed', 'You will no longer receive alerts for this search.');
    },
    onError: () => {
      toast.error('Failed to remove saved search', 'Please try again.');
    },
  });
}

/**
 * Mutation for updating a saved search (e.g. toggle alerts).
 */
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SavedSearch, Error, { id: string; payload: Partial<SavedSearch> }>({
    mutationFn: ({ id, payload }) => searchApi.updateSavedSearch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedSearches() });
    },
    onError: () => {
      toast.error('Failed to update saved search', 'Please try again.');
    },
  });
}
