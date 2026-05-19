-- Change default currency from USD to NGN on all tables
ALTER TABLE "user_profiles" ALTER COLUMN "preferred_currency" SET DEFAULT 'NGN';
ALTER TABLE "listings" ALTER COLUMN "currency" SET DEFAULT 'NGN';
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'NGN';
ALTER TABLE "order_items" ALTER COLUMN "currency" SET DEFAULT 'NGN';

-- Update all existing USD rows to NGN
UPDATE "user_profiles" SET "preferred_currency" = 'NGN' WHERE "preferred_currency" = 'USD';
UPDATE "listings" SET "currency" = 'NGN' WHERE "currency" = 'USD';
UPDATE "orders" SET "currency" = 'NGN' WHERE "currency" = 'USD';
UPDATE "order_items" SET "currency" = 'NGN' WHERE "currency" = 'USD';
