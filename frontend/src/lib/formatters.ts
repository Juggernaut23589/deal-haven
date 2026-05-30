import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(relativeTime);
dayjs.extend(calendar);

// ─── Price Formatters ────────────────────────────────────────────────────────

/**
 * Formats a numeric amount as a localized price string.
 * @example formatPrice(1299) → "₦1,299.00"
 */
export function formatPrice(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a numeric amount as a compact price string.
 * @example formatPriceCompact(1300) → "₦1.3K"
 */
export function formatPriceCompact(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

// ─── Date Formatters ─────────────────────────────────────────────────────────

/**
 * Formats a date value to a human-readable date string.
 * @example formatDate(new Date('2026-03-22')) → "Mar 22, 2026"
 */
export function formatDate(date: Date | string | number): string {
  return dayjs(date).format('MMM D, YYYY');
}

/**
 * Formats a date value to a human-readable date+time string.
 * @example formatDateTime(new Date('2026-03-22T15:45:00')) → "Mar 22, 2026 at 3:45 PM"
 */
export function formatDateTime(date: Date | string | number): string {
  return dayjs(date).format('MMM D, YYYY [at] h:mm A');
}

/**
 * Returns a relative time string from a date value.
 * Automatically selects "just now" for very recent times.
 * @example formatRelativeTime(Date.now() - 7200000) → "2 hours ago"
 * @example formatRelativeTime(new Date()) → "just now"
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = dayjs(date);
  const diffSeconds = dayjs().diff(d, 'second');
  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  return d.fromNow();
}

/**
 * Returns a calendar-style relative date (Today, Yesterday, or full date).
 * @example formatCalendarTime(yesterday) → "Yesterday at 5:30 PM"
 */
export function formatCalendarTime(date: Date | string | number): string {
  return dayjs(date).calendar(null, {
    sameDay: '[Today at] h:mm A',
    lastDay: '[Yesterday at] h:mm A',
    lastWeek: 'dddd [at] h:mm A',
    sameElse: 'MMM D, YYYY',
  });
}

// ─── Listing Formatters ───────────────────────────────────────────────────────

export type ListingCondition =
  | 'new'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'for_parts'
  | string;

export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'disputed'
  | string;

export type ListingType =
  | 'fixed_price'
  | 'auction'
  | 'make_offer'
  | 'free'
  | string;

/**
 * Returns a human-readable label for a listing condition enum value.
 * @example formatListingCondition('like_new') → "Like New"
 */
export function formatListingCondition(condition: ListingCondition): string {
  const map: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    for_parts: 'For Parts / Not Working',
  };
  return map[condition] ?? condition.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Returns the Tailwind background + text color classes for a listing condition badge.
 */
export function getConditionColorClass(condition: ListingCondition): string {
  const map: Record<string, string> = {
    new: 'bg-success/10 text-success border-success/20',
    like_new: 'bg-primary/10 text-primary border-primary/20',
    good: 'bg-accent/10 text-accent-dark border-accent/20',
    fair: 'bg-warning/10 text-warning border-warning/20',
    for_parts: 'bg-error/10 text-error border-error/20',
  };
  return map[condition] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

/**
 * Returns a human-readable label and Tailwind color class for an order status.
 */
export function formatOrderStatus(status: OrderStatus): {
  label: string;
  colorClass: string;
} {
  const map: Record<string, { label: string; colorClass: string }> = {
    PENDING: { label: 'Awaiting Payment', colorClass: 'bg-warning/10 text-warning' },
    PAID: { label: 'Paid', colorClass: 'bg-primary/10 text-primary' },
    PROCESSING: { label: 'Processing', colorClass: 'bg-primary/10 text-primary' },
    SHIPPED: { label: 'Shipped', colorClass: 'bg-accent/10 text-accent-dark' },
    IN_TRANSIT: { label: 'In Transit', colorClass: 'bg-accent/10 text-accent-dark' },
    DELIVERED: { label: 'Delivered', colorClass: 'bg-success/10 text-success' },
    COMPLETED: { label: 'Completed', colorClass: 'bg-success/10 text-success' },
    CANCELLED: { label: 'Cancelled', colorClass: 'bg-slate-100 text-slate-500' },
    REFUNDED: { label: 'Refunded', colorClass: 'bg-error/10 text-error' },
    DISPUTED: { label: 'Disputed', colorClass: 'bg-error/10 text-error' },
    pending: { label: 'Awaiting Payment', colorClass: 'bg-warning/10 text-warning' },
    pending_payment: {
      label: 'Awaiting Payment',
      colorClass: 'bg-warning/10 text-warning',
    },
    payment_confirmed: {
      label: 'Payment Confirmed',
      colorClass: 'bg-primary/10 text-primary',
    },
    processing: {
      label: 'Processing',
      colorClass: 'bg-primary/10 text-primary',
    },
    shipped: {
      label: 'Shipped',
      colorClass: 'bg-accent/10 text-accent-dark',
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      colorClass: 'bg-accent/10 text-accent-dark',
    },
    delivered: {
      label: 'Delivered',
      colorClass: 'bg-success/10 text-success',
    },
    completed: {
      label: 'Completed',
      colorClass: 'bg-success/10 text-success',
    },
    cancelled: {
      label: 'Cancelled',
      colorClass: 'bg-slate-100 text-slate-500',
    },
    refunded: {
      label: 'Refunded',
      colorClass: 'bg-error/10 text-error',
    },
    disputed: {
      label: 'Disputed',
      colorClass: 'bg-error/10 text-error',
    },
  };
  return (
    map[status] ?? {
      label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      colorClass: 'bg-slate-100 text-slate-500',
    }
  );
}

/**
 * Returns a human-readable label for a listing type enum value.
 * @example formatListingType('fixed_price') → "Buy It Now"
 */
export function formatListingType(type: ListingType): string {
  const map: Record<string, string> = {
    fixed_price: 'Buy It Now',
    auction: 'Auction',
    make_offer: 'Make Offer',
    free: 'Free',
  };
  return map[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Formats a rating number (0–5) for display.
 * @example formatRating(4.7) → "4.7"
 * @example formatRating(5) → "5.0"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Formats a platform fee percentage based on transaction amount.
 */
export function calculatePlatformFee(amount: number): number {
  if (amount < 500) return amount * 0.05;
  if (amount <= 5000) return amount * 0.03;
  return amount * 0.02;
}

/**
 * Returns a formatted string for how long ago a listing was posted.
 * Provides natural-language output suitable for listing cards.
 */
export function formatPostedAgo(date: Date | string | number): string {
  const d = dayjs(date);
  const diffMinutes = dayjs().diff(d, 'minute');
  if (diffMinutes < 1) return 'Just posted';
  if (diffMinutes < 60) return `Posted ${diffMinutes}m ago`;
  const diffHours = dayjs().diff(d, 'hour');
  if (diffHours < 24) return `Posted ${diffHours}h ago`;
  const diffDays = dayjs().diff(d, 'day');
  if (diffDays === 1) return 'Posted yesterday';
  if (diffDays < 7) return `Posted ${diffDays} days ago`;
  if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  return `Posted on ${formatDate(date)}`;
}
