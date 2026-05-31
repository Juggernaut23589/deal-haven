'use client';

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type InfiniteData,
} from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type {
  Listing,
  ListingCard,
  ListingDetail,
  SearchFilters,
  SearchResults,
  CreateListingPayload,
  UpdateListingPayload,
  ListingStatus,
} from '@/types/listing';
import type { PaginatedResponse, WishlistItem } from '@/types/order';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const listingKeys = {
  all: ['listings'] as const,
  search: (filters: SearchFilters) => ['listings', 'search', filters] as const,
  detail: (id: string) => ['listings', 'detail', id] as const,
  myListings: (status?: string) => ['listings', 'mine', status] as const,
  sellerListings: (sellerId: string, page?: number) =>
    ['listings', 'seller', sellerId, page] as const,
  similar: (id: string) => ['listings', 'similar', id] as const,
  infinite: (filters: SearchFilters) => ['listings', 'infinite', filters] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches a paginated list of listings with optional filters.
 */
export function useListings(
  filters: SearchFilters = {},
  options?: Omit<UseQueryOptions<SearchResults>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SearchResults>({
    queryKey: listingKeys.search(filters),
    queryFn: () => listingsApi.search(filters),
    staleTime: 30_000, // 30 seconds
    placeholderData: (prev) => prev,
    ...options,
  });
}

/**
 * Fetches a single listing by ID for the detail page.
 */
export function useListing(
  id: string,
  options?: Omit<UseQueryOptions<ListingDetail>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListingDetail>({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingsApi.get(id),
    enabled: !!id,
    staleTime: 60_000, // 1 minute
    ...options,
  });
}

/**
 * Fetches the authenticated seller's listings.
 */
export function useMyListings(status?: string) {
  return useQuery<PaginatedResponse<ListingCard>>({
    queryKey: listingKeys.myListings(status),
    queryFn: () => listingsApi.getMyListings(status),
    staleTime: 30_000,
  });
}

/**
 * Fetches listings for a public seller storefront.
 */
export function useSellerListings(sellerId: string, page: number = 1) {
  return useQuery<PaginatedResponse<ListingCard>>({
    queryKey: listingKeys.sellerListings(sellerId, page),
    queryFn: () => listingsApi.getSellerListings(sellerId, page),
    enabled: !!sellerId,
    staleTime: 60_000,
  });
}

/**
 * Fetches similar listings for the detail page.
 */
export function useSimilarListings(listingId: string, limit: number = 8) {
  return useQuery<ListingCard[]>({
    queryKey: listingKeys.similar(listingId),
    queryFn: () => listingsApi.getSimilar(listingId, limit),
    enabled: !!listingId,
    staleTime: 5 * 60_000,
  });
}

/**
 * Infinite scroll variant of useListings.
 * Each page is appended to the previous results.
 */
export function useInfiniteListings(filters: Omit<SearchFilters, 'page'> = {}) {
  return useInfiniteQuery<
    SearchResults,
    Error,
    InfiniteData<SearchResults>,
    ReturnType<typeof listingKeys.infinite>,
    number
  >({
    queryKey: listingKeys.infinite(filters),
    queryFn: ({ pageParam }) =>
      listingsApi.search({ ...filters, page: pageParam, limit: filters.limit ?? 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 30_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates a new listing draft.
 */
export function useCreateListing(
  options?: UseMutationOptions<Listing, Error, CreateListingPayload>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Listing, Error, CreateListingPayload>({
    mutationFn: (payload) => listingsApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      toast.success('Listing created', `"${data.title}" has been saved as a draft.`);
    },
    onError: () => {
      toast.error('Failed to create listing', 'Please check your details and try again.');
    },
    ...options,
  });
}

/**
 * Updates an existing listing.
 */
export function useUpdateListing(
  id: string,
  options?: UseMutationOptions<Listing, Error, UpdateListingPayload>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Listing, Error, UpdateListingPayload>({
    mutationFn: (payload) => listingsApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(listingKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      toast.success('Listing updated', 'Your changes have been saved.');
    },
    onError: () => {
      toast.error('Failed to update listing', 'Please try again.');
    },
    ...options,
  });
}

/**
 * Deletes (soft-deletes) a listing.
 */
export function useDeleteListing(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (listingId) => listingsApi.delete(listingId),
    onSuccess: (_, listingId) => {
      queryClient.removeQueries({ queryKey: listingKeys.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      toast.success('Listing deleted', 'Your listing has been removed.');
    },
    onError: () => {
      toast.error('Failed to delete listing', 'Please try again.');
    },
    ...options,
  });
}

/**
 * Publishes a draft listing (changes status to active).
 */
export function usePublishListing(
  options?: UseMutationOptions<Listing, Error, string>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Listing, Error, string>({
    mutationFn: (listingId) => listingsApi.publish(listingId),
    onSuccess: (data) => {
      queryClient.setQueryData(listingKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      toast.success('Listing published!', `"${data.title}" is now live.`);
    },
    onError: () => {
      toast.error('Failed to publish listing', 'Please ensure all required fields are filled.');
    },
    ...options,
  });
}

/**
 * Uploads images for a listing and returns their metadata.
 */
export function useUploadListingImages(
  options?: UseMutationOptions<
    Array<{ id: string; url: string; thumbnailUrl: string }>,
    Error,
    File[]
  >
) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (files: File[]) => listingsApi.uploadImages(files),
    onError: () => {
      toast.error('Upload failed', 'Some images could not be uploaded. Please try again.');
    },
    ...options,
  });
}

/**
 * Toggles wishlist status for a listing with optimistic update.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { added: boolean },
    Error,
    { listingId: string; currentlySaved: boolean }
  >({
    mutationFn: ({ listingId }) =>
      import('@/lib/api').then(({ wishlistApi }) => wishlistApi.toggle(listingId)),

    onMutate: async ({ listingId, currentlySaved }) => {
      // Optimistic update: flip the isSaved flag on all cached search results
      await queryClient.cancelQueries({ queryKey: listingKeys.all });

      queryClient.setQueriesData<SearchResults>(
        { queryKey: listingKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            listings: old.listings.map((l) =>
              l.id === listingId ? { ...l, isSaved: !currentlySaved } : l
            ),
          };
        }
      );

      return { previouslySaved: currentlySaved };
    },

    onError: (_err, { listingId, currentlySaved }, context) => {
      // Rollback
      queryClient.setQueriesData<SearchResults>(
        { queryKey: listingKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            listings: old.listings.map((l) =>
              l.id === listingId ? { ...l, isSaved: currentlySaved } : l
            ),
          };
        }
      );
      toast.error('Failed to update wishlist', 'Please try again.');
    },

    onSuccess: ({ added }) => {
      if (added) {
        toast.success('Saved', 'Item added to your wishlist.');
      } else {
        toast.info('Removed', 'Item removed from your wishlist.');
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
