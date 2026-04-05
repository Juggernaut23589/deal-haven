import type { FastifyRequest } from 'fastify';
import type { User, UserRole } from '@prisma/client';

// Authenticated user attached to request by auth middleware
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
  isPremium: boolean;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Search
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  condition?: string[];
  minPrice?: number;
  maxPrice?: number;
  listingType?: string[];
  sellerId?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  attributes?: Record<string, string | string[]>;
  sortBy?: SearchSortField;
  sortOrder?: 'asc' | 'desc';
}

export type SearchSortField =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'oldest'
  | 'distance'
  | 'deal_score'
  | 'popularity';

// File upload
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  url?: string;
  thumbnailUrl?: string;
  webpUrl?: string;
  width?: number;
  height?: number;
}

// JWT Payload
export interface JwtPayload {
  sub: string; // userId
  email: string;
  username: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // userId
  tokenId: string;
  iat: number;
  exp: number;
}

// Notification data shapes
export type NotificationData =
  | { orderId: string; orderNumber: string; status: string }
  | { offerId: string; listingTitle: string; amount: number }
  | { conversationId: string; senderName: string }
  | { reviewId: string; rating: number }
  | { disputeId: string; status: string }
  | { listingId: string; title: string }
  | Record<string, unknown>;

// Seller analytics
export interface SellerAnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalOrders: number;
  totalListings: number;
  averageOrderValue: number;
  conversionRate: number;
  topListings: Array<{
    id: string;
    title: string;
    revenue: number;
    orders: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

// Platform fee calculation
export interface FeeCalculation {
  subtotal: number;
  platformFee: number;
  platformFeeRate: number;
  sellerPayout: number;
}

// Omit user sensitive fields for public consumption
export type PublicUser = Omit<
  User,
  'passwordHash' | 'twoFactorSecret' | 'oauthProviderId' | 'deletedAt'
>;
