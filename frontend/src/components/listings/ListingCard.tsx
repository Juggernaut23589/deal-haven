'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { Heart, MapPin, Star, Images, Clock, Tag, Zap, TrendingUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPrice, formatPostedAgo, formatListingCondition, getConditionColorClass } from '@/lib/formatters';
import { calculateDealScoreColor, getDealScoreLabel } from '@/lib/utils';
import { useToggleWishlist } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { ListingCardSkeleton } from '@/components/ui/Skeleton';
import type { ListingCard as ListingCardType } from '@/types/listing';

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating.toFixed(1)} out of 5 (${count} reviews)`}>
      <Star className="h-3 w-3 fill-accent text-accent shrink-0" aria-hidden="true" />
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums">
        {rating.toFixed(1)}
      </span>
      <span className="text-xs text-slate-400">({count})</span>
    </div>
  );
}

// ─── Deal Score Badge ─────────────────────────────────────────────────────────

function DealScoreBadge({ score }: { score: number }) {
  const label = getDealScoreLabel(score);
  const colorClass = calculateDealScoreColor(score);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold',
        colorClass
      )}
      title={`Deal Score: ${score}/100`}
    >
      <TrendingUp className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

// ─── Auction Countdown ────────────────────────────────────────────────────────

function AuctionTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setTimeLeft(`${d}d ${h % 24}h`);
      } else {
        setTimeLeft(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        );
      }
    }
    calc();
    const interval = setInterval(calc, 1_000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const diff = new Date(endsAt).getTime() - Date.now();
  const isUrgent = diff < 3_600_000 && diff > 0; // < 1 hour

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-mono font-semibold',
        isUrgent ? 'text-error' : 'text-slate-500'
      )}
      aria-label={`Auction ends in ${timeLeft}`}
    >
      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
      {timeLeft}
    </span>
  );
}

// ─── Wishlist Button ──────────────────────────────────────────────────────────

function WishlistButton({
  listingId,
  isSaved,
}: {
  listingId: string;
  isSaved: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const { mutate: toggle, isPending } = useToggleWishlist();
  const [optimistic, setOptimistic] = React.useState(isSaved);

  React.useEffect(() => setOptimistic(isSaved), [isSaved]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    setOptimistic((prev) => !prev);
    toggle({ listingId, currentlySaved: isSaved });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'absolute top-2 right-2 z-10',
        'flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full',
        'bg-white/90 shadow-sm backdrop-blur-sm',
        'hover:bg-white hover:scale-110',
        'dark:bg-slate-800/90 dark:hover:bg-slate-800',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
      aria-label={optimistic ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={optimistic}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors duration-150',
          optimistic
            ? 'fill-error text-error'
            : 'text-slate-500 dark:text-slate-400'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

// ─── Listing Image (with fallback) ───────────────────────────────────────────

function ListingImage({
  src,
  alt,
  listView,
  priority,
}: {
  src: string | null;
  alt: string;
  listView: boolean;
  priority: boolean;
}) {
  const [errored, setErrored] = React.useState(false);

  if (!src || errored) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-100 dark:bg-slate-800',
          listView ? 'h-full w-full' : 'absolute inset-0'
        )}
      >
        <Tag className="h-10 w-10 text-slate-300" aria-hidden="true" />
      </div>
    );
  }

  // Use unoptimized for user-uploaded images served from /uploads/ to bypass
  // Next.js hostname restrictions and avoid /_next/image proxy failures.
  const isUpload = src.includes('/uploads/');

  return (
    <Image
      src={src}
      alt={alt}
      fill={!listView}
      width={listView ? 192 : undefined}
      height={listView ? 128 : undefined}
      unoptimized={isUpload}
      onError={() => setErrored(true)}
      className={cn(
        'object-cover',
        listView ? 'h-full w-full' : 'absolute inset-0',
        'transition-transform duration-300 group-hover:scale-105'
      )}
      sizes={
        listView
          ? '192px'
          : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
      }
      priority={priority}
    />
  );
}

// ─── WhatsApp Copy Button ─────────────────────────────────────────────────────

function WhatsAppCopyButton({ whatsappNumber, isAuthenticated }: { whatsappNumber?: string | null; isAuthenticated: boolean }) {
  const [copied, setCopied] = React.useState(false);
  if (!whatsappNumber && !isAuthenticated) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    if (!whatsappNumber) return;
    navigator.clipboard.writeText(whatsappNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={copied ? 'Copied!' : 'Copy WhatsApp number'}
      className={cn(
        'flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium transition-colors',
        copied
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      )}
      aria-label={copied ? 'WhatsApp number copied' : 'Copy WhatsApp number'}
    >
      <MessageCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {copied ? 'Copied!' : 'WhatsApp'}
    </button>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export interface ListingCardProps {
  listing: ListingCardType;
  /** Display in horizontal list layout. */
  listView?: boolean;
  /** Placeholder mode — renders skeleton. */
  isLoading?: boolean;
  className?: string;
  /** Priority image loading (use for above-the-fold cards). */
  priority?: boolean;
}

export function ListingCard({
  listing,
  listView = false,
  isLoading = false,
  className,
  priority = false,
}: ListingCardProps) {
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return <ListingCardSkeleton className={className} />;
  }

  const {
    id,
    title,
    slug,
    price,
    compareAtPrice,
    condition,
    type,
    coverImage,
    imageCount,
    seller,
    location,
    city,
    area,
    lga,
    state,
    distanceMeters,
    dealScore,
    isPromoted,
    offersEnabled,
    isSaved,
    createdAt,
    auction,
  } = listing;

  const conditionLabel = formatListingCondition(condition);
  const conditionColor = getConditionColorClass(condition);
  const isAuction = type === 'auction' && auction;
  const displayPrice = isAuction ? auction.currentPrice : price;
  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const href = `/listing/${id}` as Route;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group relative flex rounded-card overflow-hidden',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card hover:shadow-card-hover',
        'transition-shadow duration-200',
        listView ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {/* Promoted label */}
      {isPromoted && (
        <div className="absolute top-0 left-0 right-0 z-10 flex">
          <span className="flex items-center gap-1 bg-accent/90 text-white text-2xs font-semibold px-2 py-0.5 rounded-tr-md">
            <Zap className="h-2.5 w-2.5" aria-hidden="true" />
            Sponsored
          </span>
        </div>
      )}

      {/* Image block */}
      <div
        className={cn(
          'relative overflow-hidden bg-slate-100 dark:bg-slate-800',
          listView
            ? 'h-full w-36 sm:w-48 shrink-0'
            : cn('w-full', isPromoted ? 'pt-5' : '')
        )}
        style={listView ? undefined : { paddingTop: '66.67%' } /* 3:2 aspect ratio */}
      >
        <Link href={href} aria-hidden="true" tabIndex={-1}>
          <ListingImage
            src={coverImage?.url ?? null}
            alt={coverImage?.alt ?? title}
            listView={listView}
            priority={priority}
          />
        </Link>

        {/* Overlays on image */}
        {!listView && (
          <>
            {/* Image count */}
            {imageCount > 1 && (
              <span
                className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-2xs font-medium text-white"
                aria-label={`${imageCount} photos`}
              >
                <Images className="h-3 w-3" aria-hidden="true" />
                {imageCount}
              </span>
            )}

            {/* Condition badge */}
            <span
              className={cn(
                'absolute bottom-2 left-2 rounded-full border px-2 py-0.5 text-2xs font-semibold',
                conditionColor
              )}
            >
              {conditionLabel}
            </span>
          </>
        )}

        {/* Wishlist heart */}
        <WishlistButton listingId={id} isSaved={isSaved} />
      </div>

      {/* Content */}
      <div className={cn('flex flex-col', listView ? 'flex-1 min-w-0 p-3' : 'p-4')}>
        {/* Title */}
        <Link
          href={href}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <h3
            className={cn(
              'font-medium text-slate-900 dark:text-slate-100',
              'leading-snug line-clamp-2',
              'hover:text-primary dark:hover:text-primary-light',
              'transition-colors duration-100',
              listView ? 'text-sm' : 'text-sm'
            )}
            title={title}
          >
            {title}
          </h3>
        </Link>

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span
            className={cn(
              'font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100',
              isAuction ? 'text-base' : 'text-lg'
            )}
          >
            {isAuction ? (
              <>
                <span className="text-xs font-sans font-normal text-slate-400 mr-0.5">
                  Current bid
                </span>
                {formatPrice(displayPrice)}
              </>
            ) : (
              formatPrice(displayPrice)
            )}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-slate-400 line-through tabular-nums">
              {formatPrice(compareAtPrice)}
            </span>
          )}
          {discount && (
            <Badge variant="solid-accent" size="sm">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Auction timer or deal score */}
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {isAuction && auction && (
            <>
              <AuctionTimer endsAt={auction.endsAt} />
              <span className="text-xs text-slate-400">
                {auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'}
              </span>
            </>
          )}
          {dealScore !== null && <DealScoreBadge score={dealScore} />}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Meta: location + seller */}
        <div className="mt-3 space-y-1.5">
          {/* Location */}
          {(area || lga || state || location) && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {[area, lga, state].filter(Boolean).join(', ') || location}
              </span>
              {distanceMeters !== null && distanceMeters !== undefined && (
                <span className="shrink-0 text-slate-300">
                  &middot;{' '}
                  {distanceMeters < 1000
                    ? `${Math.round(distanceMeters)}m`
                    : `${(distanceMeters / 1000).toFixed(1)}km`}
                </span>
              )}
            </div>
          )}

          {/* Seller + time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-slate-500 truncate">{seller.displayName}</span>
              {seller.isVerified && (
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary text-2xs font-bold shrink-0"
                  aria-label="Verified seller"
                  title="Verified Seller"
                >
                  ✓
                </span>
              )}
            </div>
            <StarRating rating={seller.rating} count={seller.reviewCount} />
          </div>

          {/* WhatsApp */}
          {seller.whatsappNumber && (
            <WhatsAppCopyButton whatsappNumber={seller.whatsappNumber} isAuthenticated={isAuthenticated} />
          )}

          {/* Posted time */}
          <p className="text-2xs text-slate-400">{formatPostedAgo(createdAt)}</p>
        </div>

        {/* CTA: Make Offer */}
        {offersEnabled && !isAuction && (
          <Link
            href={`/listing/${id}/make-offer` as Route}
            className={cn(
              'mt-3 flex h-8 items-center justify-center rounded-lg',
              'border border-primary/30 text-xs font-medium text-primary',
              'hover:bg-primary/5 dark:hover:bg-primary/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'transition-colors duration-150'
            )}
            aria-label={`Make an offer on ${title}`}
          >
            Make an Offer
          </Link>
        )}

        {!offersEnabled && !isAuction && (
          <Link
            href={href}
            className={cn(
              'mt-3 flex h-8 items-center justify-center rounded-lg',
              'bg-primary text-xs font-medium text-white',
              'hover:bg-primary-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'transition-colors duration-150'
            )}
            aria-label={`View ${title}`}
          >
            View Listing
          </Link>
        )}
      </div>
    </motion.article>
  );
}

export { ListingCardSkeleton };
export default ListingCard;
