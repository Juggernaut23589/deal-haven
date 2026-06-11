-- Add area field to listings table for neighbourhood/street detail
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "area" VARCHAR(200);

-- Fix default country from 'US' to 'NG' for new listings
ALTER TABLE "listings" ALTER COLUMN "country" SET DEFAULT 'NG';
