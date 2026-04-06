-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION', 'DELETED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('FIXED_PRICE', 'AUCTION', 'FIXED_AND_OFFER');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'SOLD', 'RESERVED', 'EXPIRED', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COUNTERED', 'EXPIRED', 'WITHDRAWN', 'VOIDED', 'CONVERTED_TO_ORDER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAYMENT_FAILED', 'PAID', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'WALLET');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FROZEN');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPENED', 'EVIDENCE_COLLECTION', 'UNDER_REVIEW', 'RESOLVED_FULL_REFUND', 'RESOLVED_PARTIAL_REFUND', 'RESOLVED_NO_REFUND', 'RESOLVED_RETURN_FOR_REFUND', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('ITEM_NOT_RECEIVED', 'ITEM_NOT_AS_DESCRIBED', 'COUNTERFEIT', 'DAMAGED', 'WRONG_ITEM', 'OTHER');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED', 'RESERVE_NOT_MET');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_STATUS_UPDATE', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'OFFER_COUNTERED', 'OFFER_EXPIRED', 'AUCTION_BID', 'AUCTION_OUTBID', 'AUCTION_WON', 'AUCTION_ENDED', 'MESSAGE_RECEIVED', 'REVIEW_RECEIVED', 'DISPUTE_OPENED', 'DISPUTE_UPDATED', 'DISPUTE_RESOLVED', 'LISTING_APPROVED', 'LISTING_REJECTED', 'LISTING_EXPIRING', 'PRICE_DROP', 'SAVED_SEARCH_MATCH', 'PAYOUT_PROCESSED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('PROHIBITED_ITEM', 'COUNTERFEIT', 'SCAM', 'SPAM', 'OFFENSIVE_CONTENT', 'WRONG_CATEGORY', 'DUPLICATE', 'PRICE_MANIPULATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED_REMOVED', 'RESOLVED_NO_ACTION', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('LISTING', 'USER', 'REVIEW', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ShippingCarrier" AS ENUM ('UPS', 'FEDEX', 'USPS', 'DHL', 'LOCAL_DELIVERY', 'OTHER');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('FEATURED_HOME', 'SEARCH_BOOST', 'CATEGORY_SPOTLIGHT', 'BANNER_AD');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'BOOLEAN', 'DATE', 'RANGE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "username" VARCHAR(50) NOT NULL,
    "roles" "UserRole"[] DEFAULT ARRAY['BUYER']::"UserRole"[],
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "phone_number" VARCHAR(20),
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" VARCHAR(255),
    "oauth_provider" VARCHAR(50),
    "oauth_provider_id" VARCHAR(255),
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "premium_expires_at" TIMESTAMP(3),
    "listings_this_week" INTEGER NOT NULL DEFAULT 0,
    "listings_this_month" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "display_name" VARCHAR(100),
    "avatar_url" VARCHAR(500),
    "bio" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "zip_code" VARCHAR(20),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "preferred_currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "preferred_locale" VARCHAR(10) NOT NULL DEFAULT 'en-US',
    "dark_mode" BOOLEAN NOT NULL DEFAULT false,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "shop_name" VARCHAR(100) NOT NULL,
    "shop_slug" VARCHAR(100) NOT NULL,
    "shop_description" VARCHAR(2000),
    "shop_banner_url" VARCHAR(500),
    "shop_logo_url" VARCHAR(500),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "is_star_seller" BOOLEAN NOT NULL DEFAULT false,
    "return_policy" VARCHAR(2000),
    "shipping_policy" VARCHAR(2000),
    "custom_order_policy" VARCHAR(2000),
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "response_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "avg_response_time" INTEGER,
    "avg_ship_time" DECIMAL(5,2),
    "cancellation_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "stripe_account_id" VARCHAR(255),
    "payout_enabled" BOOLEAN NOT NULL DEFAULT false,
    "business_name" VARCHAR(255),
    "business_license_url" VARCHAR(500),
    "id_verification_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "device_info" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "label" VARCHAR(50),
    "full_name" VARCHAR(100) NOT NULL,
    "line1" VARCHAR(255) NOT NULL,
    "line2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "phone_number" VARCHAR(20),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "icon_url" VARCHAR(500),
    "image_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "attribute_type" "AttributeType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_filterable" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "unit" VARCHAR(20),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seller_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" VARCHAR(5000) NOT NULL,
    "condition" "ListingCondition" NOT NULL,
    "listing_type" "ListingType" NOT NULL DEFAULT 'FIXED_PRICE',
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "price" DECIMAL(12,2) NOT NULL,
    "original_price" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sold_count" INTEGER NOT NULL DEFAULT 0,
    "offers_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_accept_price" DECIMAL(12,2),
    "auto_decline_price" DECIMAL(12,2),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "zip_code" VARCHAR(20),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "local_pickup" BOOLEAN NOT NULL DEFAULT false,
    "ships_nationally" BOOLEAN NOT NULL DEFAULT true,
    "ships_internationally" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "watcher_count" INTEGER NOT NULL DEFAULT 0,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "deal_score" INTEGER,
    "deal_score_label" VARCHAR(20),
    "market_avg_price" DECIMAL(12,2),
    "search_vector" tsvector,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "webp_url" VARCHAR(500),
    "alt_text" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "size_bytes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "category_attribute_id" UUID NOT NULL,
    "value" VARCHAR(1000) NOT NULL,

    CONSTRAINT "listing_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "price_delta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" VARCHAR(100),
    "image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listing_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_shipping_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "carrier" "ShippingCarrier" NOT NULL,
    "service_name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "estimated_days_min" INTEGER,
    "estimated_days_max" INTEGER,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "listing_shipping_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "start_price" DECIMAL(12,2) NOT NULL,
    "reserve_price" DECIMAL(12,2),
    "buy_it_now_price" DECIMAL(12,2),
    "buy_it_now_active" BOOLEAN NOT NULL DEFAULT true,
    "current_bid" DECIMAL(12,2),
    "bid_count" INTEGER NOT NULL DEFAULT 0,
    "min_bid_increment" DECIMAL(10,2) NOT NULL,
    "winner_id" UUID,
    "winner_bid_id" UUID,
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "original_ends_at" TIMESTAMP(3) NOT NULL,
    "extend_count" INTEGER NOT NULL DEFAULT 0,
    "reserve_met" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auction_id" UUID NOT NULL,
    "bidder_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "is_auto_bid" BOOLEAN NOT NULL DEFAULT false,
    "max_amount" DECIMAL(12,2),
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "original_offer_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "message" VARCHAR(500),
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "is_counter" BOOLEAN NOT NULL DEFAULT false,
    "auto_accepted" BOOLEAN NOT NULL DEFAULT false,
    "auto_declined" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_number" VARCHAR(20) NOT NULL,
    "buyer_id" UUID NOT NULL,
    "offer_id" UUID,
    "shipping_address_id" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "platform_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "coupon_discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "tracking_number" VARCHAR(100),
    "tracking_carrier" "ShippingCarrier",
    "tracking_url" VARCHAR(500),
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "auto_release_at" TIMESTAMP(3),
    "buyer_note" VARCHAR(500),
    "seller_note" VARCHAR(500),
    "cancel_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "variant_id" UUID,
    "shipping_option_id" UUID,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "listing_title" VARCHAR(80) NOT NULL,
    "listing_image_url" VARCHAR(500),
    "seller_username" VARCHAR(50) NOT NULL,
    "seller_id" UUID NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod" NOT NULL DEFAULT 'CARD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_intent_id" VARCHAR(255),
    "stripe_charge_id" VARCHAR(255),
    "refund_id" VARCHAR(255),
    "refund_amount" DECIMAL(12,2),
    "failure_reason" VARCHAR(500),
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "held_amount" DECIMAL(12,2) NOT NULL,
    "platform_fee" DECIMAL(10,2) NOT NULL,
    "seller_payout" DECIMAL(12,2) NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'HELD',
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "refund_amount" DECIMAL(12,2),
    "stripe_transfer_id" VARCHAR(255),
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPENED',
    "description" VARCHAR(2000) NOT NULL,
    "buyer_evidence" JSONB,
    "seller_evidence" JSONB,
    "resolution" VARCHAR(2000),
    "refund_amount" DECIMAL(12,2),
    "resolved_by_id" UUID,
    "evidence_deadline" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID,
    "subject" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "last_read_at" TIMESTAMP(3),
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id","user_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "attachments" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "is_system_message" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "reviewee_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(100),
    "content" VARCHAR(1000),
    "seller_response" VARCHAR(1000),
    "seller_response_at" TIMESTAMP(3),
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "edit_locked_at" TIMESTAMP(3),
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "data" JSONB,
    "action_url" VARCHAR(500),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "price_at_save" DECIMAL(12,2),
    "notify_on_price_drop" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100),
    "query" VARCHAR(255),
    "category_id" UUID,
    "filters" JSONB,
    "alert_enabled" BOOLEAN NOT NULL DEFAULT true,
    "alert_frequency" VARCHAR(20) NOT NULL DEFAULT 'INSTANT',
    "last_checked_at" TIMESTAMP(3),
    "new_matches_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporter_id" UUID NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" UUID NOT NULL,
    "reported_user_id" UUID,
    "listing_id" UUID,
    "reason" "ReportReason" NOT NULL,
    "description" VARCHAR(1000),
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "resolution" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "type" "PromotionType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "budget_cents" INTEGER,
    "spent_cents" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "discount_type" VARCHAR(20) NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "minimum_order" DECIMAL(10,2),
    "maximum_discount" DECIMAL(10,2),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "user_limit" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coupon_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_fees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "min_amount" DECIMAL(12,2),
    "max_amount" DECIMAL(12,2),
    "fee_percent" DECIMAL(5,4) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" UUID NOT NULL,
    "changes" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "session_id" VARCHAR(255),
    "query" VARCHAR(255) NOT NULL,
    "category_id" UUID,
    "filters" JSONB,
    "result_count" INTEGER,
    "clicked_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "session_id" VARCHAR(255),
    "path" VARCHAR(500) NOT NULL,
    "referrer" VARCHAR(500),
    "listing_id" UUID,
    "category_id" UUID,
    "duration_ms" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seller_profiles_user_id_key" ON "seller_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seller_profiles_shop_slug_key" ON "seller_profiles"("shop_slug");

-- CreateIndex
CREATE INDEX "seller_profiles_shop_slug_idx" ON "seller_profiles"("shop_slug");

-- CreateIndex
CREATE INDEX "seller_profiles_verification_status_idx" ON "seller_profiles"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_attributes_category_id_slug_key" ON "category_attributes"("category_id", "slug");

-- CreateIndex
CREATE INDEX "listings_seller_id_idx" ON "listings"("seller_id");

-- CreateIndex
CREATE INDEX "listings_category_id_idx" ON "listings"("category_id");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_listing_type_idx" ON "listings"("listing_type");

-- CreateIndex
CREATE INDEX "listings_price_idx" ON "listings"("price");

-- CreateIndex
CREATE INDEX "listings_condition_idx" ON "listings"("condition");

-- CreateIndex
CREATE INDEX "listings_created_at_idx" ON "listings"("created_at");

-- CreateIndex
CREATE INDEX "listings_expires_at_idx" ON "listings"("expires_at");

-- CreateIndex
CREATE INDEX "listings_latitude_longitude_idx" ON "listings"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "listings_seller_id_slug_key" ON "listings"("seller_id", "slug");

-- CreateIndex
CREATE INDEX "listing_images_listing_id_idx" ON "listing_images"("listing_id");

-- CreateIndex
CREATE INDEX "listing_attributes_listing_id_idx" ON "listing_attributes"("listing_id");

-- CreateIndex
CREATE INDEX "listing_attributes_category_attribute_id_idx" ON "listing_attributes"("category_attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_attributes_listing_id_category_attribute_id_key" ON "listing_attributes"("listing_id", "category_attribute_id");

-- CreateIndex
CREATE INDEX "listing_variants_listing_id_idx" ON "listing_variants"("listing_id");

-- CreateIndex
CREATE INDEX "listing_shipping_options_listing_id_idx" ON "listing_shipping_options"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "auctions_listing_id_key" ON "auctions"("listing_id");

-- CreateIndex
CREATE INDEX "auctions_status_idx" ON "auctions"("status");

-- CreateIndex
CREATE INDEX "auctions_ends_at_idx" ON "auctions"("ends_at");

-- CreateIndex
CREATE INDEX "bids_auction_id_idx" ON "bids"("auction_id");

-- CreateIndex
CREATE INDEX "bids_bidder_id_idx" ON "bids"("bidder_id");

-- CreateIndex
CREATE INDEX "bids_amount_idx" ON "bids"("amount");

-- CreateIndex
CREATE INDEX "offers_listing_id_idx" ON "offers"("listing_id");

-- CreateIndex
CREATE INDEX "offers_buyer_id_idx" ON "offers"("buyer_id");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- CreateIndex
CREATE INDEX "offers_expires_at_idx" ON "offers"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "orders_offer_id_key" ON "orders"("offer_id");

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_listing_id_idx" ON "order_items"("listing_id");

-- CreateIndex
CREATE INDEX "order_items_seller_id_idx" ON "order_items"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_charge_id_key" ON "payments"("stripe_charge_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_stripe_payment_intent_id_idx" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_transactions_order_id_key" ON "escrow_transactions"("order_id");

-- CreateIndex
CREATE INDEX "escrow_transactions_status_idx" ON "escrow_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_order_id_key" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "disputes_buyer_id_idx" ON "disputes"("buyer_id");

-- CreateIndex
CREATE INDEX "conversations_listing_id_idx" ON "conversations"("listing_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");

-- CreateIndex
CREATE INDEX "reviews_reviewee_id_idx" ON "reviews"("reviewee_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "reviews_listing_id_idx" ON "reviews"("listing_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_listing_id_key" ON "wishlist_items"("user_id", "listing_id");

-- CreateIndex
CREATE INDEX "saved_searches_user_id_idx" ON "saved_searches"("user_id");

-- CreateIndex
CREATE INDEX "saved_searches_alert_enabled_idx" ON "saved_searches"("alert_enabled");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_listing_id_key" ON "promotions"("listing_id");

-- CreateIndex
CREATE INDEX "promotions_is_active_ends_at_idx" ON "promotions"("is_active", "ends_at");

-- CreateIndex
CREATE INDEX "promotions_seller_id_idx" ON "promotions"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_is_active_expires_at_idx" ON "coupons"("is_active", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_coupon_id_user_id_key" ON "coupon_usages"("coupon_id", "user_id");

-- CreateIndex
CREATE INDEX "admin_logs_admin_id_idx" ON "admin_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_logs_target_type_target_id_idx" ON "admin_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs"("created_at");

-- CreateIndex
CREATE INDEX "search_history_user_id_idx" ON "search_history"("user_id");

-- CreateIndex
CREATE INDEX "search_history_query_idx" ON "search_history"("query");

-- CreateIndex
CREATE INDEX "search_history_created_at_idx" ON "search_history"("created_at");

-- CreateIndex
CREATE INDEX "page_views_user_id_idx" ON "page_views"("user_id");

-- CreateIndex
CREATE INDEX "page_views_listing_id_idx" ON "page_views"("listing_id");

-- CreateIndex
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_profiles" ADD CONSTRAINT "seller_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_attributes" ADD CONSTRAINT "listing_attributes_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_attributes" ADD CONSTRAINT "listing_attributes_category_attribute_id_fkey" FOREIGN KEY ("category_attribute_id") REFERENCES "category_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_variants" ADD CONSTRAINT "listing_variants_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_shipping_options" ADD CONSTRAINT "listing_shipping_options_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_original_offer_id_fkey" FOREIGN KEY ("original_offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "listing_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_shipping_option_id_fkey" FOREIGN KEY ("shipping_option_id") REFERENCES "listing_shipping_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.6.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
