import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { PLATFORM_FEE } from '../config/constants';
import type { FeeCalculation } from './types';

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function createUniqueSlug(text: string): string {
  const base = createSlug(text);
  return `${base}-${nanoid(6)}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(4).toUpperCase();
  return `DH-${timestamp}-${random}`;
}

export function calculatePlatformFee(subtotal: number): FeeCalculation {
  let feeRate: number;

  if (subtotal < PLATFORM_FEE.TIER_1_MAX) {
    feeRate = PLATFORM_FEE.TIER_1_RATE;
  } else if (subtotal <= PLATFORM_FEE.TIER_2_MAX) {
    feeRate = PLATFORM_FEE.TIER_2_RATE;
  } else {
    feeRate = PLATFORM_FEE.TIER_3_RATE;
  }

  const platformFee = Math.round(subtotal * feeRate * 100) / 100;
  const sellerPayout = Math.round((subtotal - platformFee) * 100) / 100;

  return {
    subtotal,
    platformFee,
    platformFeeRate: feeRate,
    sellerPayout,
  };
}

export function calculateMinBidIncrement(currentBid: number): number {
  const percentageIncrement = Math.round(currentBid * 0.05 * 100) / 100;
  return Math.max(percentageIncrement, 1);
}

export function sanitizeHtml(input: string): string {
  // Strip all HTML tags for plain text fields
  return input.replace(/<[^>]*>/g, '').trim();
}

export function formatCurrency(
  amount: number,
  currency = 'NGN',
  locale = 'en-NG',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Haversine formula — returns distance in km
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinWindow(date: Date, windowDays: number): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= windowDays;
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function hashString(str: string): string {
  // Simple deterministic hash for cache keys — not for security
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>,
  );
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

export function paginate(page: number, limit: number) {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(Math.max(1, limit), 100);
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
