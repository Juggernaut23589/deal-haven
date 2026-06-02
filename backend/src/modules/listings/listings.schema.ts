import { z } from 'zod';
import { LISTING } from '../../config/constants';

const attributeSchema = z.object({
  categoryAttributeId: z.string().uuid(),
  value: z.string().min(1).max(1000),
});

// Accept free-text carrier names from the frontend
const shippingOptionSchema = z.object({
  carrier: z.string().max(100).nullable().optional(),
  // Accept both 'serviceName' and 'name' (frontend uses 'name')
  serviceName: z.string().max(100).optional(),
  name: z.string().max(100).optional(),
  price: z.number().min(0),
  estimatedDaysMin: z.number().int().min(0).optional().nullable(),
  estimatedDaysMax: z.number().int().min(0).optional().nullable(),
  isFree: z.boolean().optional().default(false),
  isLocalPickup: z.boolean().optional().default(false),
  regions: z.array(z.string()).optional(),
});

const auctionSchema = z.object({
  startPrice: z.number().positive(),
  reservePrice: z.number().positive().optional(),
  buyItNowPrice: z.number().positive().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  durationDays: z.number().int().min(1).max(30).optional(),
});

// Map frontend lowercase condition values to Prisma uppercase enums
const conditionEnum = z
  .enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS', 'new', 'like_new', 'good', 'fair', 'for_parts'])
  .transform((v) => v.toUpperCase() as 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'FOR_PARTS');

// Map frontend listing type values to Prisma uppercase enums
// Frontend sends: 'fixed_price' | 'auction' | 'make_offer'
// Backend enum:   'FIXED_PRICE' | 'AUCTION' | 'FIXED_AND_OFFER'
const listingTypeEnum = z
  .enum(['FIXED_PRICE', 'AUCTION', 'FIXED_AND_OFFER', 'fixed_price', 'auction', 'make_offer', 'fixed_and_offer'])
  .transform((v): 'FIXED_PRICE' | 'AUCTION' | 'FIXED_AND_OFFER' => {
    const map: Record<string, 'FIXED_PRICE' | 'AUCTION' | 'FIXED_AND_OFFER'> = {
      fixed_price: 'FIXED_PRICE',
      make_offer: 'FIXED_AND_OFFER',
      auction: 'AUCTION',
      FIXED_PRICE: 'FIXED_PRICE',
      AUCTION: 'AUCTION',
      FIXED_AND_OFFER: 'FIXED_AND_OFFER',
      fixed_and_offer: 'FIXED_AND_OFFER',
    };
    return map[v] ?? 'FIXED_PRICE';
  });

export const createListingSchema = z
  .object({
    // categoryId may be a UUID or a slug — service handles both
    categoryId: z.string().min(1),
    title: z.string().min(3, 'Title must be at least 3 characters').max(LISTING.MAX_TITLE_LENGTH),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(LISTING.MAX_DESCRIPTION_LENGTH),
    condition: conditionEnum,
    // Accept both 'listingType' (internal) and 'type' (frontend)
    listingType: listingTypeEnum.optional(),
    type: listingTypeEnum.optional(),
    price: z.number().min(0).default(0),
    // Accept both 'originalPrice' and 'compareAtPrice' (frontend)
    originalPrice: z.number().positive().optional(),
    compareAtPrice: z.number().positive().optional(),
    currency: z.string().length(3).optional().default('NGN'),
    // Accept both 'quantity' and 'stockQuantity' (frontend)
    quantity: z.number().int().min(1).optional().default(1),
    stockQuantity: z.number().int().min(1).optional(),
    offersEnabled: z.boolean().optional().default(false),
    // Accept both internal names and frontend names
    autoAcceptPrice: z.number().positive().optional(),
    offerAutoAcceptThreshold: z.number().positive().optional(),
    autoDeclinePrice: z.number().positive().optional(),
    offerAutoDeclineThreshold: z.number().positive().optional(),
    // Accept both separate city/state and combined 'location' string
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    country: z.string().length(2).optional().default('NG'),
    zipCode: z.string().max(20).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    localPickup: z.boolean().optional().default(false),
    shipsNationally: z.boolean().optional().default(true),
    shipsInternationally: z.boolean().optional().default(false),
    attributes: z.array(attributeSchema).optional(),
    shippingOptions: z.array(shippingOptionSchema).optional(),
    auction: auctionSchema.optional(),
    tags: z.array(z.string()).optional(),
    imageIds: z.array(z.string()).optional(),
  })
  .transform((data) => {
    // Normalize listingType — accept either field name
    const resolvedType = data.listingType ?? data.type ?? 'FIXED_PRICE';

    // Normalize quantity — accept either field name
    const resolvedQuantity = data.quantity ?? data.stockQuantity ?? 1;

    // Normalize price fields
    const resolvedOriginalPrice = data.originalPrice ?? data.compareAtPrice;
    const resolvedAutoAccept = data.autoAcceptPrice ?? data.offerAutoAcceptThreshold;
    const resolvedAutoDecline = data.autoDeclinePrice ?? data.offerAutoDeclineThreshold;

    // Parse 'location' string → city + state if not provided separately
    let resolvedCity = data.city;
    let resolvedState = data.state;
    if (!resolvedCity && !resolvedState && data.location) {
      const parts = data.location.split(',').map((p) => p.trim());
      resolvedCity = parts[0] ?? undefined;
      resolvedState = parts[1] ?? parts[0] ?? undefined;
    }

    return {
      ...data,
      listingType: resolvedType,
      quantity: resolvedQuantity,
      originalPrice: resolvedOriginalPrice,
      autoAcceptPrice: resolvedAutoAccept,
      autoDeclinePrice: resolvedAutoDecline,
      city: resolvedCity,
      state: resolvedState,
    };
  })
  .refine(
    (data) => {
      if (data.listingType === 'AUCTION' && !data.auction) {
        return false;
      }
      return true;
    },
    { message: 'Auction details are required for auction listings', path: ['auction'] },
  )
  .refine(
    (data) => {
      if (data.autoAcceptPrice && data.autoDeclinePrice) {
        return data.autoAcceptPrice > data.autoDeclinePrice;
      }
      return true;
    },
    {
      message: 'Auto-accept price must be higher than auto-decline price',
      path: ['autoAcceptPrice'],
    },
  );

export const updateListingSchema = z.object({
  title: z.string().min(3).max(LISTING.MAX_TITLE_LENGTH).optional(),
  description: z.string().min(10).max(LISTING.MAX_DESCRIPTION_LENGTH).optional(),
  condition: conditionEnum.optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional().nullable(),
  quantity: z.number().int().min(1).optional(),
  offersEnabled: z.boolean().optional(),
  autoAcceptPrice: z.number().positive().optional().nullable(),
  autoDeclinePrice: z.number().positive().optional().nullable(),
  localPickup: z.boolean().optional(),
  shipsNationally: z.boolean().optional(),
  shipsInternationally: z.boolean().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  attributes: z.array(attributeSchema).optional(),
});

export const searchListingsSchema = z.object({
  q: z.string().max(255).optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  type: z.string().optional(),
  sellerId: z.string().uuid().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional(),
  sort: z
    .enum(['relevance', 'price_asc', 'price_desc', 'newest', 'oldest', 'distance', 'deal_score', 'popularity'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsQuery = z.infer<typeof searchListingsSchema>;
