-- Change default currency from USD to NGN on tables that have the currency column
ALTER TABLE "user_profiles" ALTER COLUMN "preferred_currency" SET DEFAULT 'NGN';
ALTER TABLE "listings" ALTER COLUMN "currency" SET DEFAULT 'NGN';
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'NGN';
ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'NGN';

-- Backfill any existing USD rows
UPDATE "user_profiles" SET "preferred_currency" = 'NGN' WHERE "preferred_currency" = 'USD';
UPDATE "listings" SET "currency" = 'NGN' WHERE "currency" = 'USD';
UPDATE "orders" SET "currency" = 'NGN' WHERE "currency" = 'USD';
UPDATE "payments" SET "currency" = 'NGN' WHERE "currency" = 'USD';
