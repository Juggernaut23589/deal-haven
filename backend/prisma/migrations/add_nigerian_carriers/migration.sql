-- Add Nigerian shipping carriers to ShippingCarrier enum
ALTER TYPE "ShippingCarrier" ADD VALUE IF NOT EXISTS 'GIG_LOGISTICS';
ALTER TYPE "ShippingCarrier" ADD VALUE IF NOT EXISTS 'NIPOST';
ALTER TYPE "ShippingCarrier" ADD VALUE IF NOT EXISTS 'REDSTAR_EXPRESS';
