import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Merges Tailwind CSS class names, handling conflicts intelligently.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a localized currency string.
 * @example formatCurrency(1299.99) → "$1,299.99"
 * @example formatCurrency(1299.99, 'EUR') → "€1,299.99"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as a compact currency string.
 * @example formatCurrencyCompact(1299) → "$1.3K"
 * @example formatCurrencyCompact(2100000) → "$2.1M"
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Formats a relative time string using dayjs.
 * @example formatRelativeTime(new Date(Date.now() - 7200000)) → "2 hours ago"
 * @example formatRelativeTime(new Date()) → "a few seconds ago"
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = dayjs(date);
  const diffSeconds = dayjs().diff(d, 'second');
  if (diffSeconds < 10) return 'just now';
  return d.fromNow();
}

/**
 * Formats a number with locale-aware thousands separators.
 * @example formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Truncates a string to a maximum length, appending an ellipsis.
 * @example truncate("Hello World", 5) → "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength).trimEnd()}...`;
}

/**
 * Extracts initials from a full name (up to 2 characters).
 * @example getInitials("John Doe") → "JD"
 * @example getInitials("Alice") → "A"
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return '?';
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Converts a string to a URL-safe slug.
 * @example slugify("Hello World! 123") → "hello-world-123"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Deal score tiers used for classifying listing prices vs. market.
 */
export type DealScore = 'great' | 'good' | 'fair' | 'high' | 'unknown';

/**
 * Calculates a deal score tier from a numeric score (0–100).
 * Score interpretation: higher = better deal for buyer.
 */
export function getDealScoreTier(score: number): DealScore {
  if (score >= 80) return 'great';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 0) return 'high';
  return 'unknown';
}

/**
 * Returns Tailwind CSS badge color classes for a given deal score.
 * @example calculateDealScoreColor(85) → "bg-success/10 text-success border-success/20"
 */
export function calculateDealScoreColor(score: number): string {
  const tier = getDealScoreTier(score);
  const map: Record<DealScore, string> = {
    great: 'bg-success/10 text-success border-success/20',
    good: 'bg-primary/10 text-primary border-primary/20',
    fair: 'bg-accent/10 text-accent-dark border-accent/20',
    high: 'bg-error/10 text-error border-error/20',
    unknown: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return map[tier];
}

/**
 * Returns a human-readable deal score label.
 */
export function getDealScoreLabel(score: number): string {
  const tier = getDealScoreTier(score);
  const map: Record<DealScore, string> = {
    great: 'Great Deal',
    good: 'Good Deal',
    fair: 'Fair Price',
    high: 'Above Market',
    unknown: 'No Data',
  };
  return map[tier];
}

/**
 * Formats a file size in bytes to a human-readable string.
 * @example formatFileSize(1536) → "1.5 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Checks if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Generates a random UUID v4 (browser-compatible).
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Deep-clones a serializable object.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Returns true if the code is running in the browser.
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Converts a distance in meters to a human-readable string.
 * @example formatDistance(500) → "500 m"
 * @example formatDistance(1500) → "1.5 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Pluralizes a word based on count.
 * @example pluralize(1, 'item') → "1 item"
 * @example pluralize(3, 'item') → "3 items"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const p = plural ?? `${singular}s`;
  return `${formatNumber(count)} ${count === 1 ? singular : p}`;
}
