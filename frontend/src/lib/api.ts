import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type {
  AuthResult,
  LoginPayload,
  RegisterPayload,
  AuthenticatedUser,
  TokenPair,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateNotificationPreferencesPayload,
} from '@/types/user';
import type {
  Listing,
  ListingCard,
  ListingDetail,
  SearchFilters,
  SearchResults,
  AutocompleteResult,
  Category,
  CreateListingPayload,
  UpdateListingPayload,
} from '@/types/listing';
import type {
  Order,
  Offer,
  OfferStatus,
  Dispute,
  Review,
  Notification,
  WishlistItem,
  SavedSearch,
  Conversation,
  Message,
  PaginatedResponse,
} from '@/types/order';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://ashimarket.com/api/v1';
const STORAGE_ACCESS_TOKEN = 'dh_access_token';
const STORAGE_REFRESH_TOKEN = 'dh_refresh_token';

// ─── Token Helpers ────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_ACCESS_TOKEN);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_REFRESH_TOKEN);
}

export function storeTokens(tokens: TokenPair): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_REFRESH_TOKEN, tokens.refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN);
}

// ─── Error Extraction Helper ──────────────────────────────────────────────────

/**
 * Extracts a human-readable message from an API error response.
 *
 * Backend error shape:  { success: false, error: { code, message, details? } }
 * If validation failed the top-level message is generic ("Request validation
 * failed") — in that case we surface the first field-level detail instead.
 */
export function getApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) return fallback;

  // Shape 1 — our custom error handler: { success: false, error: { code, message, details? } }
  const apiError = data.error as { message?: string; details?: Array<{ field?: string; message?: string }> } | undefined;
  if (apiError && typeof apiError === 'object') {
    if (apiError.details?.length) {
      return apiError.details
        .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
        .filter(Boolean)
        .join(' · ') || apiError.message || fallback;
    }
    if (apiError.message) return apiError.message;
  }

  // Shape 2 — Fastify native / our re-wrapped format: { message: "..." }
  // message may be a JSON-stringified Zod errors array e.g. "[{\"code\":\"too_small\"...}]"
  if (typeof data.message === 'string' && data.message.length > 0) {
    const raw = data.message;
    // Try to parse as Zod JSON array
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((e: { path?: string[]; message?: string }) =>
            e.path?.length ? `${e.path.join('.')}: ${e.message}` : e.message
          )
          .filter(Boolean)
          .join(' · ') || fallback;
      }
    } catch {
      // Not JSON — return as plain message
    }
    return raw;
  }

  return fallback;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // When sending FormData, remove the default Content-Type: application/json
    // so the browser's XHR sets multipart/form-data with the correct boundary.
    // If Content-Type stays as application/json the server rejects with
    // "the request is not multipart".
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap the backend's { success, data } envelope
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 429) {
      // Rate limit — show toast via a custom event the UI layer listens to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('dh:ratelimit', {
            detail: {
              retryAfter: error.response.headers['retry-after'] ?? 60,
            },
          })
        );
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token as string}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dh:unauthorized'));
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{ success: boolean; data: TokenPair }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        const tokens = data.data ?? (data as unknown as TokenPair);
        storeTokens(tokens);
        apiClient.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;
        processQueue(null, tokens.accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dh:unauthorized'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Generic Request Helpers ──────────────────────────────────────────────────

async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.patch<T>(url, data, config);
  return res.data;
}

async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload): Promise<AuthResult> =>
    post<AuthResult>('/auth/login', payload),

  register: (payload: RegisterPayload): Promise<AuthResult> =>
    post<AuthResult>('/auth/register', payload),

  logout: (): Promise<void> => post<void>('/auth/logout'),

  refresh: (refreshToken: string): Promise<{ tokens: TokenPair }> =>
    post<{ tokens: TokenPair }>('/auth/refresh', { refreshToken }),

  me: (): Promise<AuthenticatedUser> => get<AuthenticatedUser>('/auth/me'),

  forgotPassword: (payload: ForgotPasswordPayload): Promise<{ message: string }> =>
    post<{ message: string }>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload): Promise<{ message: string }> =>
    post<{ message: string }>('/auth/reset-password', payload),

  verifyEmail: (token: string): Promise<{ message: string }> =>
    post<{ message: string }>('/auth/verify-email', { token }),

  resendVerification: (): Promise<{ message: string }> =>
    post<{ message: string }>('/auth/resend-verification'),

  changePassword: (payload: ChangePasswordPayload): Promise<{ message: string }> =>
    post<{ message: string }>('/auth/change-password', payload),
};

// ─── User / Profile Endpoints ─────────────────────────────────────────────────

export const usersApi = {
  updateProfile: (payload: UpdateProfilePayload): Promise<AuthenticatedUser> =>
    patch<AuthenticatedUser>('/users/me/profile', payload),

  updateNotificationPreferences: (
    payload: UpdateNotificationPreferencesPayload
  ): Promise<AuthenticatedUser> =>
    patch<AuthenticatedUser>('/users/me/notification-preferences', payload),

  uploadAvatar: (file: File): Promise<{ avatarUrl: string }> => {
    const form = new FormData();
    form.append('avatar', file);
    // Let axios auto-set Content-Type with correct boundary
    return post<{ avatarUrl: string }>('/users/me/avatar', form);
  },

  getPublicUser: (username: string): Promise<import('@/types/user').PublicUser> =>
    get(`/users/${username}`),
};

// ─── Listing Endpoints ────────────────────────────────────────────────────────

export const listingsApi = {
  search: (filters: SearchFilters): Promise<SearchResults> =>
    get<SearchResults>('/listings', { params: filters }),

  get: (id: string): Promise<ListingDetail> => get<ListingDetail>(`/listings/${id}`),

  getBySlug: (slug: string): Promise<ListingDetail> =>
    get<ListingDetail>(`/listings/slug/${slug}`),

  create: (payload: CreateListingPayload): Promise<Listing> =>
    post<Listing>('/listings', payload),

  update: (id: string, payload: UpdateListingPayload): Promise<Listing> =>
    patch<Listing>(`/listings/${id}`, payload),

  delete: (id: string): Promise<void> => del<void>(`/listings/${id}`),

  publish: (id: string): Promise<Listing> => post<Listing>(`/listings/${id}/publish`),

  unpublish: (id: string): Promise<Listing> => post<Listing>(`/listings/${id}/unpublish`),

  renew: (id: string): Promise<Listing> => post<Listing>(`/listings/${id}/renew`),

  placeBid: (id: string, amount: number): Promise<{ bid: unknown; endsAt: string; currentBid: number; reserveMet: boolean }> =>
    post(`/listings/${id}/bid`, { amount }),

  getBids: (id: string): Promise<{ bids: unknown[]; auction: unknown }> =>
    get(`/listings/${id}/bids`),

  getMyListings: (
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ListingCard>> =>
    get<PaginatedResponse<ListingCard>>('/listings/me', { params: { status, page, limit } }),

  getSimilar: (id: string, limit: number = 8): Promise<ListingCard[]> =>
    get<ListingCard[]>(`/listings/${id}/similar`, { params: { limit } }),

  getSellerListings: (
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ListingCard>> =>
    get<PaginatedResponse<ListingCard>>(`/listings/seller/${sellerId}`, {
      params: { page, limit },
    }),

  uploadImages: (
    listingIdOrFiles: string | File[],
    formData?: FormData
  ): Promise<Array<{ id: string; url: string; thumbnailUrl: string }>> => {
    if (typeof listingIdOrFiles === 'string') {
      // DO NOT set Content-Type manually — axios auto-sets multipart/form-data
      // with the correct boundary when it detects a FormData body.
      return post(`/listings/${listingIdOrFiles}/images`, formData);
    }
    const form = new FormData();
    listingIdOrFiles.forEach((f) => form.append('images', f));
    return post('/listings/images/upload', form);
  },

  deleteImage: (imageId: string): Promise<void> =>
    del<void>(`/listings/images/${imageId}`),

  reorderImages: (listingId: string, imageIds: string[]): Promise<void> =>
    put<void>(`/listings/${listingId}/images/reorder`, { imageIds }),

  report: (
    id: string,
    reason: string,
    description?: string
  ): Promise<{ message: string }> =>
    post<{ message: string }>(`/listings/${id}/report`, { reason, description }),
};

// ─── Offer Endpoints ──────────────────────────────────────────────────────────

export const offersApi = {
  create: (
    listingId: string,
    amount: number,
    message?: string
  ): Promise<Offer> =>
    post<Offer>('/offers', { listingId, amount, message }),

  // Seller responds to a buyer's offer (accept / decline / counter)
  respond: (
    offerId: string,
    action: 'accept' | 'decline' | 'counter',
    counterAmount?: number,
    counterMessage?: string
  ): Promise<Offer> =>
    patch<Offer>(`/offers/${offerId}/respond`, {
      action,
      counterAmount,
      counterMessage,
    }),

  // Buyer responds to a seller's counter-offer (accept / decline)
  respondToCounter: (
    offerId: string,
    action: 'accept' | 'decline'
  ): Promise<Offer> =>
    patch<Offer>(`/offers/${offerId}/respond-counter`, { action }),

  withdraw: (offerId: string): Promise<Offer> =>
    patch<Offer>(`/offers/${offerId}/withdraw`),

  getMyOffers: (
    type: 'sent' | 'received',
    status?: OfferStatus,
    page: number = 1
  ): Promise<PaginatedResponse<Offer>> =>
    get<PaginatedResponse<Offer>>('/offers/me', { params: { type, status, page } }),

  getForListing: (listingId: string): Promise<Offer[]> =>
    get<Offer[]>(`/offers/listing/${listingId}`),
};

// ─── Order Endpoints ──────────────────────────────────────────────────────────

export const ordersApi = {
  create: (payload: {
    listingId: string;
    quantity?: number;
    shippingOptionId?: string;
    shippingAddressId?: string;
    buyerNote?: string;
  }): Promise<Order> =>
    post<Order>('/orders', payload),

  get: (orderId: string): Promise<Order> => get<Order>(`/orders/${orderId}`),

  getMyOrders: (
    type: 'buying' | 'selling',
    status?: string,
    page: number = 1
  ): Promise<PaginatedResponse<Order>> =>
    get<PaginatedResponse<Order>>('/orders/me', { params: { type, status, page } }),

  // Seller confirms they received private payment — moves order to PROCESSING
  sellerConfirmPayment: (orderId: string): Promise<Order> =>
    post<Order>(`/orders/${orderId}/confirm-payment-received`),

  ship: (
    orderId: string,
    payload: {
      carrier: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
    }
  ): Promise<Order> => post<Order>(`/orders/${orderId}/ship`, payload),

  confirmDelivery: (orderId: string): Promise<Order> =>
    post<Order>(`/orders/${orderId}/confirm-delivery`),

  cancel: (orderId: string, reason: string): Promise<Order> =>
    post<Order>(`/orders/${orderId}/cancel`, { reason }),

  openDispute: (
    orderId: string,
    payload: { reason: string; description: string }
  ): Promise<Dispute> => post<Dispute>(`/orders/${orderId}/dispute`, payload),
};

// ─── Message Endpoints ────────────────────────────────────────────────────────

export const messagesApi = {
  getConversations: (page: number = 1): Promise<PaginatedResponse<Conversation>> =>
    get<PaginatedResponse<Conversation>>('/messages', { params: { page } }),

  getOrCreateConversation: (listingId: string, sellerId: string): Promise<Conversation> =>
    post<Conversation>('/messages', { listingId, sellerId }),

  getMessages: (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Message>> =>
    get<PaginatedResponse<Message>>(`/messages/${conversationId}/messages`, {
      params: { page, limit },
    }),

  sendMessage: (
    conversationId: string,
    body: string,
    attachments?: File[]
  ): Promise<Message> => {
    if (attachments && attachments.length > 0) {
      const form = new FormData();
      form.append('body', body);
      attachments.forEach((f) => form.append('attachments', f));
      return post<Message>(`/messages/${conversationId}/messages`, form);
    }
    return post<Message>(`/messages/${conversationId}/messages`, { body });
  },

  markRead: (conversationId: string): Promise<void> =>
    patch<void>(`/messages/${conversationId}/read`),
};

// ─── Review Endpoints ─────────────────────────────────────────────────────────

export const reviewsApi = {
  create: (payload: {
    orderId: string;
    rating: number;
    title?: string;
    content: string;
  }): Promise<Review> => post<Review>('/reviews', payload),

  respond: (reviewId: string, response: string): Promise<Review> =>
    patch<Review>(`/reviews/${reviewId}/respond`, { response }),

  getForSeller: (
    sellerId: string,
    page: number = 1
  ): Promise<PaginatedResponse<Review>> =>
    get<PaginatedResponse<Review>>(`/reviews/seller/${sellerId}`, { params: { page } }),

  getForListing: (listingId: string, page: number = 1): Promise<PaginatedResponse<Review>> =>
    get<PaginatedResponse<Review>>(`/reviews/listing/${listingId}`, { params: { page } }),

  markHelpful: (reviewId: string): Promise<{ helpfulCount: number }> =>
    post<{ helpfulCount: number }>(`/reviews/${reviewId}/helpful`),
};

// ─── Wishlist Endpoints ───────────────────────────────────────────────────────

export const wishlistApi = {
  get: (page: number = 1): Promise<PaginatedResponse<WishlistItem>> =>
    get<PaginatedResponse<WishlistItem>>('/wishlist', { params: { page } }),

  toggle: (
    listingId: string
  ): Promise<{ added: boolean }> =>
    post('/wishlist', { listingId }),

  updateAlerts: (
    itemId: string,
    notifyOnPriceDrop: boolean,
    targetPrice?: number
  ): Promise<WishlistItem> =>
    patch<WishlistItem>(`/wishlist/${itemId}`, { notifyOnPriceDrop, targetPrice }),

  remove: (listingId: string): Promise<void> =>
    del<void>(`/wishlist/${listingId}`),
};

// ─── Notification Endpoints ───────────────────────────────────────────────────

export const notificationsApi = {
  get: (page: number = 1, onlyUnread: boolean = false): Promise<PaginatedResponse<Notification>> =>
    get<PaginatedResponse<Notification>>('/notifications', { params: { page, onlyUnread } }),

  markRead: (notificationId: string): Promise<Notification> =>
    patch<Notification>(`/notifications/${notificationId}/read`),

  markAllRead: (): Promise<{ count: number }> =>
    patch<{ count: number }>('/notifications/read-all'),

  getUnreadCount: (): Promise<{ count: number }> =>
    get<{ count: number }>('/notifications/unread-count'),

  delete: (notificationId: string): Promise<void> =>
    del<void>(`/notifications/${notificationId}`),
};

// ─── Search Endpoints ─────────────────────────────────────────────────────────

export const searchApi = {
  autocomplete: (query: string, limit: number = 8): Promise<AutocompleteResult> =>
    get<AutocompleteResult>('/search/autocomplete', { params: { q: query, limit } }),

  categories: (): Promise<Category[]> => get<Category[]>('/search/categories'),

  categoryTree: (): Promise<Category[]> => get<Category[]>('/search/categories'),

  categoryBySlug: (slug: string): Promise<Category> =>
    get<Category>(`/search/categories/${slug}/attributes`),

  getSavedSearches: (): Promise<SavedSearch[]> =>
    get<SavedSearch[]>('/search/saved'),

  saveSearch: (payload: {
    name: string;
    query: string;
    filters: Record<string, unknown>;
    alertEnabled?: boolean;
    alertFrequency?: 'instant' | 'daily' | 'weekly';
  }): Promise<SavedSearch> => post<SavedSearch>('/search/saved', payload),

  updateSavedSearch: (id: string, payload: Partial<SavedSearch>): Promise<SavedSearch> =>
    patch<SavedSearch>(`/search/saved/${id}`, payload),

  deleteSavedSearch: (id: string): Promise<void> =>
    del<void>(`/search/saved/${id}`),
};

// ─── Dispute Endpoints ────────────────────────────────────────────────────────

export const disputesApi = {
  get: (disputeId: string): Promise<Dispute> => get<Dispute>(`/disputes/${disputeId}`),

  submitEvidence: (
    disputeId: string,
    payload: { type: 'text' | 'image' | 'document'; content: string; file?: File }
  ): Promise<Dispute> => {
    if (payload.file) {
      const form = new FormData();
      form.append('type', payload.type);
      form.append('content', payload.content);
      form.append('file', payload.file);
      return post<Dispute>(`/disputes/${disputeId}/evidence`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return post<Dispute>(`/disputes/${disputeId}/evidence`, {
      type: payload.type,
      content: payload.content,
    });
  },
};

// ─── Upload Endpoint ──────────────────────────────────────────────────────────

export const uploadApi = {
  uploadFile: (
    file: File,
    purpose: 'listing_image' | 'avatar' | 'document' | 'message_attachment'
  ): Promise<{ id: string; url: string; thumbnailUrl?: string }> => {
    const form = new FormData();
    form.append('file', file);
    form.append('purpose', purpose);
    return post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default apiClient;
