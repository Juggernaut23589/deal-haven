// ─── Enums ────────────────────────────────────────────────────────────────────

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'sold'
  | 'expired'
  | 'cancelled'
  | 'suspended';

export type ListingCondition =
  | 'new'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'for_parts';

export type ListingType =
  | 'fixed_price'
  | 'auction'
  | 'make_offer'
  | 'free';

export type SearchSortField =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'oldest'
  | 'distance'
  | 'deal_score'
  | 'popularity';

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parent: Category | null;
  children: Category[];
  listingCount: number;
  sortOrder: number;
  isActive: boolean;
}

export type CategorySummary = Pick<
  Category,
  'id' | 'name' | 'slug' | 'iconName' | 'imageUrl' | 'listingCount'
>;

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'range';
  options: string[] | null;
  isRequired: boolean;
  isFilterable: boolean;
  unit: string | null;
  sortOrder: number;
}

// ─── Listing Images ───────────────────────────────────────────────────────────

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  thumbnailUrl: string;
  alt: string | null;
  sortOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
}

// ─── Listing Attributes (EAV) ─────────────────────────────────────────────────

export interface ListingAttribute {
  id: string;
  listingId: string;
  categoryAttributeId: string;
  attributeName: string;
  attributeLabel: string;
  value: string;
  unit: string | null;
}

// ─── Listing Variants ─────────────────────────────────────────────────────────

export interface ListingVariant {
  id: string;
  listingId: string;
  title: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  options: Record<string, string>;
  imageUrl: string | null;
  isDefault: boolean;
}

// ─── Shipping ─────────────────────────────────────────────────────────────────

export interface ListingShippingOption {
  id: string;
  listingId: string;
  name: string;
  carrier: string | null;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
  price: number;
  isFree: boolean;
  isLocalPickup: boolean;
  regions: string[];
}

// ─── Seller Summary (embedded in listing) ────────────────────────────────────

export interface ListingSellerSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  memberSince: string;
  responseTimeHours: number | null;
}

// ─── Auction ─────────────────────────────────────────────────────────────────

export interface Auction {
  id: string;
  listingId: string;
  startPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  reserveMet: boolean;
  buyItNowPrice: number | null;
  buyItNowAvailable: boolean;
  minBidIncrement: number;
  bidCount: number;
  highestBidderId: string | null;
  startsAt: string;
  endsAt: string;
  isEnded: boolean;
  endedAt: string | null;
  winnerId: string | null;
}

export interface Bid {
  id: string;
  auctionId: string;
  listingId: string;
  bidderId: string;
  bidder: Pick<ListingSellerSummary, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  amount: number;
  isWinning: boolean;
  isAutoBid: boolean;
  maxAutoBidAmount: number | null;
  createdAt: string;
}

// ─── Core Listing Types ───────────────────────────────────────────────────────

/**
 * Minimal listing data used for cards and list views.
 */
export interface ListingCard {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  condition: ListingCondition;
  type: ListingType;
  status: ListingStatus;
  coverImage: ListingImage | null;
  imageCount: number;
  category: CategorySummary;
  seller: ListingSellerSummary;
  location: string | null;
  city: string | null;
  area: string | null;
  lga: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceMeters: number | null;
  dealScore: number | null;
  isPromoted: boolean;
  offersEnabled: boolean;
  viewCount: number;
  watcherCount: number;
  isSaved: boolean;
  createdAt: string;
  expiresAt: string | null;
  auction: Pick<Auction, 'currentPrice' | 'bidCount' | 'endsAt' | 'isEnded'> | null;
}

/**
 * Full listing data for the detail page.
 */
export interface ListingDetail extends ListingCard {
  description: string;
  attributes: ListingAttribute[];
  images: ListingImage[];
  variants: ListingVariant[];
  shippingOptions: ListingShippingOption[];
  tags: string[];
  allowBundleDiscount: boolean;
  isDigital: boolean;
  digitalFileUrl: string | null;
  stockQuantity: number;
  quantity?: number;
  originalPrice?: number | null;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  acceptsReturns: boolean;
  returnDays: number | null;
  returnPolicy: string | null;
  offerAutoAcceptThreshold: number | null;
  offerAutoDeclineThreshold: number | null;
  localPickup?: boolean;
  shipsNationally?: boolean;
  viewCount: number;
  watcherCount: number;
  auction: Auction | null;
  updatedAt: string;
  publishedAt: string | null;
}

/**
 * Full listing entity as stored (includes all relations, used in seller dashboard).
 */
export interface Listing extends ListingDetail {
  sellerId: string;
  categoryId: string;
  deletedAt: string | null;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  condition?: ListingCondition[];
  type?: ListingType[];
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  city?: string;
  area?: string;
  lga?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRating?: number;
  isVerifiedSeller?: boolean;
  offersEnabled?: boolean;
  hasImages?: boolean;
  isFreeShipping?: boolean;
  isLocalPickup?: boolean;
  attributes?: Record<string, string | string[]>;
  sort?: SearchSortField;
  page?: number;
  limit?: number;
}

export interface SearchResultsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  query: string | null;
  appliedFilters: Partial<SearchFilters>;
}

export interface SearchResults {
  listings: ListingCard[];
  meta: SearchResultsMeta;
  facets: SearchFacets;
}

export interface SearchFacets {
  categories: Array<{ id: string; name: string; count: number }>;
  conditions: Array<{ value: ListingCondition; label: string; count: number }>;
  priceRange: { min: number; max: number };
  attributes: Record<string, Array<{ value: string; count: number }>>;
}

export interface AutocompleteResult {
  listings: Array<{ id: string; title: string; price: number; coverImageUrl: string | null }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  suggestions: string[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateListingPayload {
  title: string;
  description: string;
  categoryId: string;
  condition: ListingCondition;
  type: ListingType;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  offersEnabled?: boolean;
  offerAutoAcceptThreshold?: number;
  offerAutoDeclineThreshold?: number;
  allowBundleDiscount?: boolean;
  isDigital?: boolean;
  location?: string;
  city?: string;
  area?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  localPickup?: boolean;
  shipsNationally?: boolean;
  tags?: string[];
  acceptsReturns?: boolean;
  returnDays?: number;
  returnPolicy?: string;
  attributes?: Array<{ categoryAttributeId: string; value: string }>;
  shippingOptions?: Array<Omit<ListingShippingOption, 'id' | 'listingId'>>;
  imageIds?: string[];
}

export interface UpdateListingPayload extends Partial<CreateListingPayload> {
  status?: Extract<ListingStatus, 'active' | 'cancelled'>;
}
