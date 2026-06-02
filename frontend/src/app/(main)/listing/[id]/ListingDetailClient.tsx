'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Share2,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Eye,
  Bookmark,
  Star,
  MapPin,
  Truck,
  Package,
  Flag,
  BadgeCheck,
  Clock,
  Copy,
  Twitter,
  Facebook,
  ZoomIn,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPrice, formatDate, formatPostedAgo, formatListingCondition, getConditionColorClass } from '@/lib/formatters';
import { calculateDealScoreColor, getDealScoreLabel } from '@/lib/utils';
import { useListing, useSimilarListings, useToggleWishlist } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { ListingCard } from '@/components/listings/ListingCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MakeOfferModal } from '@/components/offers/MakeOfferModal';
import { reviewsApi, ordersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { ListingImage, ListingShippingOption } from '@/types/listing';
import type { Review } from '@/types/order';

// ─── Image Gallery ─────────────────────────────────────────────────────────────

function ImageGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const active = images[activeIdx];

  const prev = () => setActiveIdx((i) => Math.max(0, i - 1));
  const next = () => setActiveIdx((i) => Math.min(images.length - 1, i + 1));

  // Keyboard navigation
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Tag className="h-16 w-16 text-slate-300" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
          {active && (
            <Image
              src={active.url}
              alt={active.alt ?? title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          )}

          {/* Image count badge */}
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {activeIdx + 1} / {images.length}
          </span>

          {/* Zoom button */}
          <button
            onClick={() => setLightboxOpen(true)}
            className={cn(
              'absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full',
              'bg-black/60 text-white',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
            )}
            aria-label="Open full-size image"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Prev / next arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={activeIdx === 0}
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  'bg-black/60 text-white',
                  'disabled:opacity-30',
                  'hover:bg-black/80 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                )}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={next}
                disabled={activeIdx === images.length - 1}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2',
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  'bg-black/60 text-white',
                  'disabled:opacity-30',
                  'hover:bg-black/80 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                )}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200"
            role="tablist"
            aria-label="Image thumbnails"
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIdx(i)}
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={`Image ${i + 1}`}
                className={cn(
                  'relative h-16 w-20 shrink-0 rounded-lg overflow-hidden',
                  'border-2 transition-colors duration-100',
                  i === activeIdx
                    ? 'border-primary'
                    : 'border-transparent hover:border-slate-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              >
                <Image
                  src={img.thumbnailUrl || img.url}
                  alt={img.alt ?? `Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && active && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal bg-black/95 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
              aria-label="Close lightbox"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full max-w-5xl max-h-[90vh] mx-4">
              <Image
                src={active.url}
                alt={active.alt ?? title}
                width={active.width ?? 1200}
                height={active.height ?? 800}
                className="object-contain w-full h-full max-h-[85vh]"
              />
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={prev}
                  disabled={activeIdx === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-white/80">
                  {activeIdx + 1} / {images.length}
                </span>
                <button
                  onClick={next}
                  disabled={activeIdx === images.length - 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Deal Score Badge ──────────────────────────────────────────────────────────

function DealScoreBadge({ score }: { score: number }) {
  const label = getDealScoreLabel(score);
  const colorClass = calculateDealScoreColor(score);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  return (
    <div className="relative inline-flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold',
          colorClass
        )}
        title={`Deal Score: ${score}/100`}
      >
        <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
        {label}
        <span className="font-mono text-xs opacity-70">({score}/100)</span>
      </span>
      <button
        onClick={() => setTooltipOpen((v) => !v)}
        className="text-slate-400 hover:text-slate-600 focus-visible:outline-none"
        aria-label="Deal Score explanation"
        aria-expanded={tooltipOpen}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <AnimatePresence>
        {tooltipOpen && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={cn(
              'absolute top-full left-0 mt-2 z-tooltip w-64',
              'rounded-lg bg-slate-900 dark:bg-slate-700 p-3 text-xs text-white shadow-lg'
            )}
            role="tooltip"
          >
            Deal Score compares this listing&apos;s price to recent market data for similar items.
            Score of {score}/100 means this is a{' '}
            <strong>{label.toLowerCase()}</strong>. Scores update daily.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Auction Countdown ─────────────────────────────────────────────────────────

function AuctionCountdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = React.useState('');
  const [isUrgent, setIsUrgent] = React.useState(false);

  React.useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended');
        setIsUrgent(false);
        return;
      }
      setIsUrgent(diff < 3_600_000);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h > 48) {
        const d = Math.floor(h / 24);
        setTimeLeft(`${d}d ${h % 24}h`);
      } else {
        setTimeLeft(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        );
      }
    }
    calc();
    const t = setInterval(calc, 1_000);
    return () => clearInterval(t);
  }, [endsAt]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-3',
        isUrgent
          ? 'bg-error/10 border border-error/20'
          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
      )}
    >
      <Clock
        className={cn('h-5 w-5 shrink-0', isUrgent ? 'text-error' : 'text-slate-400')}
        aria-hidden="true"
      />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Auction ends in</p>
        <p
          className={cn(
            'text-xl font-bold font-mono tabular-nums',
            isUrgent ? 'text-error' : 'text-slate-900 dark:text-slate-100'
          )}
          aria-live="polite"
          aria-label={`Auction ends in ${timeLeft}`}
        >
          {timeLeft}
        </p>
      </div>
    </div>
  );
}

// ─── Share Dropdown ────────────────────────────────────────────────────────────

function ShareButton() {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        leftIcon={<Share2 className="h-3.5 w-3.5" />}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Share
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="share-menu"
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.12 }}
              className={cn(
                'absolute right-0 top-full mt-2 z-40 w-44',
                'rounded-xl border border-slate-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900',
                'py-1.5 overflow-hidden'
              )}
              role="menu"
            >
              <button
                onClick={handleCopy}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                role="menuitem"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <Twitter className="h-4 w-4" aria-hidden="true" />
                Share on X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
                Share on Facebook
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shipping Options ──────────────────────────────────────────────────────────

function ShippingOptions({ options }: { options: ListingShippingOption[] }) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <div
          key={opt.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 px-4 py-3"
        >
          <div className="flex items-center gap-2.5">
            {opt.isLocalPickup ? (
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
            ) : (
              <Truck className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{opt.name}</p>
              {opt.carrier && (
                <p className="text-xs text-slate-400">{opt.carrier}</p>
              )}
              {opt.estimatedDaysMin !== null && opt.estimatedDaysMax !== null && (
                <p className="text-xs text-slate-400">
                  {opt.estimatedDaysMin}–{opt.estimatedDaysMax} business days
                </p>
              )}
            </div>
          </div>
          <span
            className={cn(
              'text-sm font-semibold tabular-nums shrink-0',
              opt.isFree ? 'text-success' : 'text-slate-900 dark:text-slate-100'
            )}
          >
            {opt.isFree ? 'FREE' : formatPrice(opt.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Q&A Section ─────────────────────────────────────────────────────────────

function QASection({ listingId, sellerId }: { listingId: string; sellerId: string }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [question, setQuestion] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !isAuthenticated) return;
    setSending(true);
    try {
      const { messagesApi } = await import('@/lib/api');
      const conv = await messagesApi.getOrCreateConversation(listingId, sellerId);
      await messagesApi.sendMessage(conv.id, question.trim());
      toast.success('Question sent!', 'The seller will reply in your messages.');
      router.push(`/dashboard/messages?listing=${listingId}&seller=${sellerId}` as Route);
    } catch {
      toast.error('Failed to send question');
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-labelledby="qa-heading" className="space-y-4">
      <h2 id="qa-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Ask the Seller
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Have a question about this item? Message the seller directly and get a quick answer.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="flex gap-2">
          <textarea
            id="ask-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Is this still available? Can you deliver to Abuja?"
            rows={2}
            disabled={!isAuthenticated || sending}
            className={cn(
              'flex-1 rounded-lg border border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-900 px-3 py-2 text-sm',
              'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none',
              (!isAuthenticated || sending) && 'opacity-50 cursor-not-allowed'
            )}
          />
          <Button type="submit" size="sm" disabled={!isAuthenticated || !question.trim() || sending}
            isLoading={sending} className="self-end">
            Send
          </Button>
        </div>
        {!isAuthenticated && (
          <p className="text-xs text-slate-400">
            <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>{' '}
            to ask the seller a question.
          </p>
        )}
      </form>
    </section>
  );
}

// ─── Request to Buy Button ────────────────────────────────────────────────────

function BuyButton({
  listingId, isAuthenticated, sellerId, onLoginRequired,
}: {
  listingId: string;
  isAuthenticated: boolean;
  sellerId: string;
  onLoginRequired: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [ordered, setOrdered] = React.useState(false);

  const handleBuy = async () => {
    if (!isAuthenticated) { onLoginRequired(); return; }
    setLoading(true);
    try {
      const order = await ordersApi.create({ listingId, quantity: 1 });
      setOrdered(true);
      toast.success('Order placed!', 'Contact the seller to arrange payment and pickup.');
      router.push(`/dashboard/orders/${order.id}` as Route);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Could not place order. Please try again.';
      toast.error('Order failed', msg);
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <Button className="w-full" size="lg" variant="outline" disabled>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Order Requested
      </Button>
    );
  }

  return (
    <Button className="w-full" size="lg" onClick={handleBuy} disabled={loading}>
      {loading ? 'Placing request…' : 'Request to Buy'}
    </Button>
  );
}

// ─── Reviews Section ──────────────────────────────────────────────────────────

function ReviewsSection({ listingId, sellerId }: { listingId: string; sellerId: string }) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    reviewsApi.getForListing(listingId)
      .then((res) => setReviews(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [listingId]);

  if (isLoading) {
    return (
      <section className="mt-12">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="mt-12" aria-labelledby="reviews-heading">
      <div className="flex items-center gap-3 mb-6">
        <h2 id="reviews-heading" className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
          Reviews
        </h2>
        <span className="flex items-center gap-1 text-amber-400 font-semibold">
          <Star className="h-4 w-4 fill-current" />
          {avg}
        </span>
        <span className="text-sm text-slate-400">({reviews.length})</span>
      </div>

      <div className="space-y-4">
        {reviews.slice(0, 5).map((review) => (
          <div key={review.id} className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={review.reviewer.profile.avatarUrl ?? `https://i.pravatar.cc/36?u=${review.reviewerId}`}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {review.reviewer.profile.displayName}
                </p>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={cn('h-3 w-3', s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                  ))}
                </div>
              </div>
              <span className="ml-auto text-xs text-slate-400">{formatPostedAgo(review.createdAt)}</span>
            </div>
            {review.title && <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{review.title}</p>}
            <p className="text-sm text-slate-600 dark:text-slate-400">{review.body}</p>
            {review.response && (
              <div className="mt-3 pl-3 border-l-4 border-primary">
                <p className="text-xs font-semibold text-primary mb-0.5">Seller response</p>
                <p className="text-sm text-slate-500">{review.response}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length > 5 && (
        <Link
          href={`/shop/${sellerId}` as Route}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all {reviews.length} reviews <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ListingDetailClient({ id }: { id: string }) {
  const params = { id };
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: listing, isLoading, isError } = useListing(params.id);
  const { data: similarListings, isLoading: isSimilarLoading } = useSimilarListings(params.id, 4);
  const { mutate: toggleWishlist, isPending: isWishlistPending } = useToggleWishlist();

  const [offerModalOpen, setOfferModalOpen] = React.useState(false);
  const [bidAmount, setBidAmount] = React.useState('');
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (listing) setIsSaved(listing.isSaved);
  }, [listing]);

  const handleWishlist = () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    setIsSaved((v) => !v);
    toggleWishlist({ listingId: params.id, currentlySaved: listing?.isSaved ?? false });
  };

  const handleMessageSeller = () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const sellerId = listing?.seller?.id ?? '';
    router.push(`/dashboard/messages?listing=${params.id}&seller=${sellerId}` as Route);
  };

  const handleIsAvailable = () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const sellerId = listing?.seller?.id ?? '';
    router.push(`/dashboard/messages?listing=${params.id}&seller=${sellerId}&quick=available` as Route);
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="h-8 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (isError || !listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Listing Not Found
        </h1>
        <p className="text-slate-500 mb-6">
          This listing may have been removed or the link is incorrect.
        </p>
        <Button asChild>
          <Link href="/search">Browse All Listings</Link>
        </Button>
      </div>
    );
  }

  const isAuction = listing.type === 'auction' && listing.auction !== null;
  const conditionLabel = formatListingCondition(listing.condition);
  const conditionColor = getConditionColorClass(listing.condition);
  const discount =
    listing.compareAtPrice && listing.compareAtPrice > listing.price
      ? Math.round(((listing.compareAtPrice - listing.price) / listing.compareAtPrice) * 100)
      : null;

  return (
    <>
      <div className="min-h-screen bg-background dark:bg-background-dark">
        {/* Breadcrumb */}
        <nav
          className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark"
          aria-label="Breadcrumb"
        >
          <ol className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
            <li>
              <Link
                href={`/category/${listing.category.slug}` as Route}
                className="hover:text-primary transition-colors"
              >
                {listing.category.name}
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
            <li className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">
              {listing.title}
            </li>
          </ol>
        </nav>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left / Main ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image gallery */}
              <ImageGallery images={listing.images} title={listing.title} />

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100 leading-snug">
                  {listing.title}
                </h1>

                {/* Meta row */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', conditionColor)}>
                    {conditionLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    {listing.viewCount.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                    {listing.watcherCount} watchers
                  </span>
                  <span>{formatPostedAgo(listing.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              <section aria-labelledby="description-heading">
                <h2
                  id="description-heading"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
                >
                  Description
                </h2>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed"
                >
                  {listing.description}
                </div>
              </section>

              {/* Category attributes */}
              {listing.attributes.length > 0 && (
                <section aria-labelledby="attributes-heading">
                  <h2
                    id="attributes-heading"
                    className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
                  >
                    Item Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    {listing.attributes.map((attr, i) => (
                      <div
                        key={attr.id}
                        className={cn(
                          'flex items-start justify-between gap-4 px-4 py-3',
                          i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-white dark:bg-surface-dark',
                          'border-b border-slate-100 dark:border-slate-800 last:border-b-0'
                        )}
                      >
                        <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                          {attr.attributeLabel}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right">
                          {attr.value}
                          {attr.unit && ` ${attr.unit}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Shipping options */}
              {listing.shippingOptions.length > 0 && (
                <section aria-labelledby="shipping-heading">
                  <h2
                    id="shipping-heading"
                    className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
                  >
                    Shipping Options
                  </h2>
                  <ShippingOptions options={listing.shippingOptions} />
                </section>
              )}

              {/* Q&A */}
              <QASection listingId={params.id} sellerId={listing.seller.id} />

              {/* Report link */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:underline">
                  <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                  Report this listing
                </button>
              </div>
            </div>

            {/* ── Right Sticky Sidebar ─────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 space-y-4">
                {/* Price card */}
                <div
                  className={cn(
                    'rounded-xl p-6 space-y-4',
                    'bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800',
                    'shadow-card'
                  )}
                >
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span
                        className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100"
                        aria-label={`Price: ${formatPrice(isAuction ? (listing.auction?.currentPrice ?? listing.price) : listing.price)}`}
                      >
                        {formatPrice(isAuction ? (listing.auction?.currentPrice ?? listing.price) : listing.price)}
                      </span>
                      {listing.compareAtPrice && listing.compareAtPrice > listing.price && (
                        <span className="text-lg text-slate-400 line-through tabular-nums">
                          {formatPrice(listing.compareAtPrice)}
                        </span>
                      )}
                      {discount && (
                        <Badge variant="solid-accent">-{discount}%</Badge>
                      )}
                    </div>

                    {isAuction && listing.auction && (
                      <p className="text-xs text-slate-500 mt-1">
                        {listing.auction.bidCount} {listing.auction.bidCount === 1 ? 'bid' : 'bids'}
                      </p>
                    )}
                  </div>

                  {/* Deal Score */}
                  {listing.dealScore !== null && (
                    <DealScoreBadge score={listing.dealScore} />
                  )}

                  {/* Auction section */}
                  {isAuction && listing.auction && (
                    <div className="space-y-3">
                      <AuctionCountdown endsAt={listing.auction.endsAt} />
                      {!listing.auction.isEnded && (
                        <div className="space-y-2">
                          <label htmlFor="bid-amount" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Your bid (min. {formatPrice(listing.auction.currentPrice + listing.auction.minBidIncrement)})
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="bid-amount"
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              min={listing.auction.currentPrice + listing.auction.minBidIncrement}
                              step={listing.auction.minBidIncrement}
                              placeholder={formatPrice(listing.auction.currentPrice + listing.auction.minBidIncrement)}
                              className={cn(
                                'flex-1 rounded-lg border border-slate-200 dark:border-slate-700',
                                'bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                              )}
                            />
                          </div>
                          <Button
                            className="w-full"
                            disabled={!isAuthenticated || !bidAmount}
                            onClick={() => {
                              if (!isAuthenticated) router.push('/auth/login');
                              // biddingApi.placeBid(params.id, Number(bidAmount))
                            }}
                          >
                            Place Bid
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Request to Buy */}
                  {(!isAuction || (listing.auction?.buyItNowAvailable)) && (
                    <BuyButton
                      listingId={params.id}
                      isAuthenticated={isAuthenticated}
                      sellerId={listing.seller.id}
                      onLoginRequired={() => router.push('/auth/login')}
                    />
                  )}

                  {/* Make Offer */}
                  {listing.offersEnabled && !isAuction && (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        if (!isAuthenticated) { router.push('/auth/login'); return; }
                        setOfferModalOpen(true);
                      }}
                    >
                      Make an Offer
                    </Button>
                  )}

                  {/* Wishlist + Share row */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={cn('flex-1', isSaved && 'border-error/30 bg-error/5 text-error')}
                      leftIcon={
                        <Heart
                          className={cn('h-4 w-4', isSaved && 'fill-error text-error')}
                          aria-hidden="true"
                        />
                      }
                      onClick={handleWishlist}
                      isLoading={isWishlistPending}
                      aria-pressed={isSaved}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <ShareButton />
                  </div>
                </div>

                {/* Seller card */}
                <div
                  className={cn(
                    'rounded-xl p-5 space-y-4',
                    'bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800',
                    'shadow-card'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={listing.seller.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.seller.displayName)}&background=0D7377&color=fff`}
                        alt={`${listing.seller.displayName} avatar`}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${listing.seller.username}` as Route}
                        className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors"
                      >
                        {listing.seller.displayName}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" aria-hidden="true" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                          {listing.seller.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({listing.seller.reviewCount.toLocaleString()} reviews)
                        </span>
                      </div>
                    </div>
                    {listing.seller.isVerified && (
                      <BadgeCheck className="h-5 w-5 text-primary shrink-0" aria-label="Verified seller" />
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Member since</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {formatDate(listing.seller.memberSince)}
                      </span>
                    </div>
                    {listing.seller.responseTimeHours !== null && (
                      <div className="flex justify-between">
                        <span>Avg. response time</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {listing.seller.responseTimeHours < 1
                            ? '< 1 hour'
                            : `${listing.seller.responseTimeHours}h`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                      onClick={handleMessageSeller}
                    >
                      Message Seller
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:text-primary-dark"
                      size="sm"
                      onClick={handleIsAvailable}
                    >
                      Is this still available?
                    </Button>
                    <Link
                      href={`/shop/${listing.seller.username}` as Route}
                      className="block text-center text-xs text-primary hover:text-primary-dark transition-colors py-1"
                    >
                      View seller&apos;s shop →
                    </Link>
                  </div>
                </div>

                {/* Buyer protection */}
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-xl px-4 py-3',
                    'bg-success/5 border border-success/20'
                  )}
                >
                  <ShieldCheck className="h-5 w-5 text-success mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-success">Buyer Protection</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Arrange payment directly with the seller. Confirm receipt once you&apos;ve
                      received your item to complete the transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Reviews ────────────────────────────────────────────────── */}
          <ReviewsSection listingId={params.id} sellerId={listing.seller.id} />

          {/* ── Similar Listings ───────────────────────────────────────── */}
          <section className="mt-16" aria-labelledby="similar-heading">
            <div className="flex items-end justify-between mb-6">
              <h2
                id="similar-heading"
                className="text-xl font-bold font-display text-slate-900 dark:text-slate-100"
              >
                Similar Listings
              </h2>
              <Link
                href={`/search?category=${listing.category.slug}` as Route}
                className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
              >
                View all in {listing.category.name}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" role="list">
              {isSimilarLoading
                ? [1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-72 rounded-card bg-slate-100 dark:bg-slate-800 animate-pulse" role="listitem" aria-hidden="true" />
                  ))
                : (similarListings ?? []).map((l) => (
                    <div key={l.id} role="listitem">
                      <ListingCard listing={l} />
                    </div>
                  ))}
            </div>
          </section>
        </div>
      </div>

      {/* Make Offer Modal */}
      <MakeOfferModal
        open={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        listingId={params.id}
        listingTitle={listing.title}
        listingPrice={listing.price}
      />
    </>
  );
}
