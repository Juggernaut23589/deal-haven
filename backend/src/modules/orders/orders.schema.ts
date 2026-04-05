import { z } from 'zod';

export const createOrderSchema = z.object({
  listingId: z.string().uuid(),
  quantity: z.number().int().min(1).optional().default(1),
  shippingAddressId: z.string().uuid().optional(),
  shippingOptionId: z.string().uuid().optional(),
  couponCode: z.string().max(50).optional(),
  buyerNote: z.string().max(500).optional(),
});

export const shipOrderSchema = z.object({
  trackingNumber: z.string().min(1).max(100),
  carrier: z.enum(['UPS', 'FEDEX', 'USPS', 'DHL', 'LOCAL_DELIVERY', 'OTHER']),
  trackingUrl: z.string().url().optional(),
  sellerNote: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason').max(500),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ShipOrderInput = z.infer<typeof shipOrderSchema>;
