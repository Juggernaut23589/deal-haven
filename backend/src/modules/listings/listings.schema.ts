import { z } from 'zod';
import { LISTING } from '../../config/constants';

const attributeSchema = z.object({
  categoryAttributeId: z.string().uuid(),
  value: z.string().min(1).max(1000),
});

const shippingOptionSchema = z.object({
  carrier: z.enum(['UPS', 'FEDEX', 'USPS', 'DHL', 'LOCAL_DELIVERY', 'OTHER']),
  serviceName: z.string().max(100),
  price: z.number().min(0),
  estimatedDaysMin: z.number().int().min(0).optional(),
  estimatedDaysMax: z.number().int().min(0).optional(),
  isFree: z.boolean().optional().default(false),
});

const auctionSchema = z.object({
  startPrice: z.number().positive(),
  reservePrice: z.number().positive().optional(),
  buyItNowPrice: z.number().positive().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
});

export const createListingSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(LISTING.MAX_TITLE_LENGTH),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(LISTING.MAX_DESCRIPTION_LENGTH),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS']),
  listingType: z.enum(['FIXED_PRICE', 'AUCTION', 'FIXED_AND_OFFER']),
  price: z.number().positive('Price must be greater than 0'),
  originalPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional().default('USD'),
  quantity: z.number().int().min(1).optional().default(1),
  offersEnabled: z.boolean().optional().default(false),
  autoAcceptPrice: z.number().positive().optional(),
  autoDeclinePrice: z.number().positive().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().length(2).optional().default('US'),
  zipCode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  localPickup: z.boolean().optional().default(false),
  shipsNationally: z.boolean().optional().default(true),
  shipsInternationally: z.boolean().optional().default(false),
  attributes: z.array(attributeSchema).optional(),
  shippingOptions: z.array(shippingOptionSchema).optional(),
  auction: auctionSchema.optional(),
}).refine(
  (data) => {
    if (data.listingType === 'AUCTION' && !data.auction) {
      return false;
    }
    return true;
  },
  { message: 'Auction details are required for auction listings', path: ['auction'] },
).refine(
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
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS']).optional(),
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
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsQuery = z.infer<typeof searchListingsSchema>;
