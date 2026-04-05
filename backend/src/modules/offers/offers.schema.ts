import { z } from 'zod';

export const createOfferSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.number().positive('Offer amount must be positive'),
  message: z.string().max(500).optional(),
});

export const respondToOfferSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE', 'COUNTER']),
  counterAmount: z.number().positive().optional(),
  counterMessage: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.action === 'COUNTER' && !data.counterAmount) return false;
    return true;
  },
  { message: 'Counter amount is required for COUNTER action', path: ['counterAmount'] },
);

export const respondToCounterSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE']),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;
