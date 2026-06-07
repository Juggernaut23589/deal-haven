'use client';

import * as React from 'react';
import { NIGERIA_STATES, getLGAs } from '@/lib/nigeriaLocations';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Crown,
  X,
  UploadCloud,
  GripVertical,
  Tag,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,

  Plus,
  Trash2,
  Eye,
  Save,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { useCreateListing, useUploadListingImages, usePublishListing } from '@/hooks/useListings';
import { useToast } from '@/store/uiStore';
import { listingsApi, usersApi, getApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/formatters';
import type { ListingCondition, ListingType } from '@/types/listing';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface UploadedImage {
  /** Local preview URL or uploaded URL. */
  url: string;
  /** Server-assigned ID after upload (null while pending). */
  id: string | null;
  file?: File;
  uploading?: boolean;
  error?: boolean;
}

interface ShippingOption {
  name: string;
  carrier: string;
  price: number;
  isFree: boolean;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isLocalPickup: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TOP_LEVEL_CATEGORIES = [
  { id: 'automobiles', slug: 'automobiles', label: 'Automobiles', icon: '🚗' },
  { id: 'real-estate', slug: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'electronics', slug: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'clothing', slug: 'clothing', label: 'Clothing & Fashion', icon: '👗' },
  { id: 'furniture', slug: 'furniture-home', label: 'Furniture & Home', icon: '🛋️' },
  { id: 'services', slug: 'services', label: 'Services', icon: '🔧' },
  { id: 'jobs', slug: 'jobs-gigs', label: 'Jobs & Gigs', icon: '💼' },
  { id: 'sports', slug: 'sports-outdoors', label: 'Sports & Outdoors', icon: '⚽' },
  { id: 'books', slug: 'books-media', label: 'Books & Media', icon: '📚' },
  { id: 'toys', slug: 'toys-games', label: 'Toys & Games', icon: '🎮' },
  { id: 'pets', slug: 'pet-supplies', label: 'Pet Supplies', icon: '🐾' },
  { id: 'collectibles', slug: 'collectibles-art', label: 'Collectibles & Art', icon: '🎨' },
];

const SUBCATEGORIES: Record<string, { id: string; label: string }[]> = {
  automobiles: [
    { id: 'cars', label: 'Cars & Trucks' },
    { id: 'motorcycles', label: 'Motorcycles' },
    { id: 'parts', label: 'Parts & Accessories' },
    { id: 'commercial', label: 'Commercial Vehicles' },
  ],
  electronics: [
    { id: 'phones', label: 'Phones & Tablets' },
    { id: 'computers', label: 'Computers & Laptops' },
    { id: 'tvs', label: 'TVs & Monitors' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'audio', label: 'Audio' },
    { id: 'cameras', label: 'Cameras' },
  ],
  'real-estate': [
    { id: 'houses', label: 'Houses for Sale' },
    { id: 'apartments', label: 'Apartments / Condos' },
    { id: 'land', label: 'Land' },
    { id: 'commercial', label: 'Commercial Property' },
    { id: 'rentals', label: 'Rentals' },
  ],
};

const CONDITIONS: { value: ListingCondition; label: string; description: string; icon: string }[] = [
  { value: 'new', label: 'New', description: 'Brand new, never used, original packaging', icon: '✨' },
  { value: 'like_new', label: 'Like New', description: 'Used once or twice, no visible signs of use', icon: '⭐' },
  { value: 'good', label: 'Good', description: 'Minor wear, fully functional', icon: '👍' },
  { value: 'fair', label: 'Fair', description: 'Visible wear or light damage, functional', icon: '🔸' },
  { value: 'for_parts', label: 'For Parts', description: 'Not fully functional, sold for parts', icon: '🔧' },
];

const MAX_IMAGES = 20;

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { step: 1, label: 'Category' },
  { step: 2, label: 'Photos' },
  { step: 3, label: 'Details' },
  { step: 4, label: 'Pricing' },
  { step: 5, label: 'Shipping' },
  { step: 6, label: 'Review' },
] as const;

function StepIndicator({ current }: { current: Step }) {
  return (
    <nav
      aria-label="Listing creation steps"
      className="mb-8"
    >
      <ol
        className="flex items-center justify-between sm:justify-start sm:gap-0"
        role="list"
      >
        {STEPS.map(({ step, label }, i) => {
          const isDone = step < current;
          const isCurrent = step === current;

          return (
            <React.Fragment key={step}>
              <li
                className="flex flex-col items-center gap-1"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    isDone && 'bg-success text-white',
                    isCurrent && 'bg-primary text-white ring-4 ring-primary/20',
                    !isDone && !isCurrent && 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  )}
                  aria-hidden="true"
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : step}
                </div>
                <span
                  className={cn(
                    'hidden sm:block text-xs font-medium transition-colors',
                    isCurrent ? 'text-primary' : isDone ? 'text-success' : 'text-slate-400'
                  )}
                >
                  {label}
                </span>
              </li>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-colors',
                    step < current ? 'bg-success' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Step 1 — Category ────────────────────────────────────────────────────────

function Step1Category({
  selected,
  selectedSub,
  onSelect,
  onSelectSub,
}: {
  selected: string;
  selectedSub: string;
  onSelect: (id: string, slug: string) => void;
  onSelectSub: (id: string) => void;
}) {
  const subs = selected ? (SUBCATEGORIES[selected] ?? []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-1">
          Choose a Category
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select the most relevant category for your listing.
        </p>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        role="listbox"
        aria-label="Categories"
        aria-required="true"
      >
        {TOP_LEVEL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="option"
            aria-selected={selected === cat.id}
            onClick={() => onSelect(cat.id, cat.slug)}
            className={cn(
              'flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 text-center',
              'transition-all duration-150 hover:border-primary/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selected === cat.id
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark'
            )}
          >
            <span className="text-3xl" aria-hidden="true">{cat.icon}</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
              {cat.label}
            </span>
            {selected === cat.id && (
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* Subcategories */}
      {subs.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Subcategory (optional)
          </p>
          <div className="flex flex-wrap gap-2" role="listbox" aria-label="Subcategories">
            {subs.map((sub) => (
              <button
                key={sub.id}
                type="button"
                role="option"
                aria-selected={selectedSub === sub.id}
                onClick={() => onSelectSub(sub.id)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium',
                  'transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  selectedSub === sub.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2 — Photos ──────────────────────────────────────────────────────────

function Step2Photos({
  images,
  onAdd,
  onRemove,
  onReorder,
}: {
  images: UploadedImage[];
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
}) {
  const canAddMore = images.length < MAX_IMAGES;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxFiles: MAX_IMAGES - images.length,
    disabled: !canAddMore,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onAdd(acceptedFiles);
    },
  });

  const dragFromIdx = React.useRef<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-1">
          Add Photos
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The first photo will be your cover image. Up to {MAX_IMAGES} photos allowed.
        </p>
      </div>

      {/* Drop zone */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 bg-slate-50 dark:bg-slate-900/50'
          )}
          role="button"
          aria-label="Upload photos"
          tabIndex={0}
        >
          <input {...getInputProps()} aria-label="Photo file input" />
          <UploadCloud
            className={cn(
              'h-10 w-10 transition-colors',
              isDragActive ? 'text-primary' : 'text-slate-300'
            )}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-slate-600 dark:text-slate-400">
              {isDragActive ? 'Drop photos here' : 'Drag & drop photos here'}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              or click to browse — JPG, PNG, WebP (max 10 MB each)
            </p>
          </div>
          {images.length > 0 && (
            <p className="text-xs text-slate-400">
              {images.length}/{MAX_IMAGES} photos added
            </p>
          )}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
          role="list"
          aria-label="Uploaded photos"
        >
          {images.map((img, idx) => (
            <div
              key={img.url}
              role="listitem"
              draggable
              onDragStart={() => { dragFromIdx.current = idx; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFromIdx.current !== null && dragFromIdx.current !== idx) {
                  onReorder(dragFromIdx.current, idx);
                  dragFromIdx.current = null;
                }
              }}
              className={cn(
                'group relative aspect-square rounded-lg overflow-hidden',
                'border-2 cursor-grab active:cursor-grabbing',
                idx === 0 ? 'border-accent' : 'border-slate-200 dark:border-slate-700'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover badge */}
              {idx === 0 && (
                <div
                  className="absolute top-1 left-1 flex items-center gap-1 rounded-full bg-accent/90 px-1.5 py-0.5"
                  aria-label="Cover photo"
                >
                  <Crown className="h-2.5 w-2.5 text-white" aria-hidden="true" />
                  <span className="text-2xs text-white font-semibold">Cover</span>
                </div>
              )}

              {/* Upload spinner */}
              {img.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 text-white animate-spin" aria-hidden="true" />
                </div>
              )}

              {/* Error */}
              {img.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-error/40">
                  <AlertCircle className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className={cn(
                  'absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full',
                  'bg-black/60 text-white',
                  'opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:opacity-100'
                )}
                aria-label={`Remove photo ${idx + 1}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {/* Drag handle */}
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-2" role="status">
          No photos added yet. At least 1 photo is recommended.
        </p>
      )}
    </div>
  );
}

// ─── Step 3 — Details ─────────────────────────────────────────────────────────

const detailsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title is too long (max 120)'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description is too long'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'for_parts'] as const),
});

type DetailsValues = z.infer<typeof detailsSchema>;

function Step3Details({
  values,
  onChange,
}: {
  values: DetailsValues;
  onChange: (values: DetailsValues) => void;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: values,
  });

  const titleValue = watch('title', values.title);
  const descValue = watch('description', values.description);
  const conditionValue = watch('condition', values.condition);

  // Sync to parent on change
  React.useEffect(() => {
    onChange({ title: titleValue, description: descValue, condition: conditionValue });
  }, [titleValue, descValue, conditionValue, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-1">
          Listing Details
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Describe your item clearly and honestly to attract buyers.
        </p>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="listing-title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Title <span className="text-error" aria-hidden="true">*</span>
          </label>
          <span className="text-xs text-slate-400 tabular-nums">
            {titleValue.length}/120
          </span>
        </div>
        <input
          id="listing-title"
          type="text"
          maxLength={120}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          {...register('title')}
          placeholder="e.g. Apple iPhone 15 Pro Max 256GB Natural Titanium"
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm',
            'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
            errors.title ? 'border-error' : 'border-slate-200 dark:border-slate-700'
          )}
        />
        {errors.title && (
          <p id="title-error" role="alert" className="mt-1 text-xs text-error flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" /> {errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="listing-desc" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Description <span className="text-error" aria-hidden="true">*</span>
          </label>
          <span className="text-xs text-slate-400 tabular-nums">
            {descValue.length}/5000
          </span>
        </div>
        <textarea
          id="listing-desc"
          rows={6}
          maxLength={5000}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'desc-error' : 'desc-hint'}
          {...register('description')}
          placeholder="Describe your item in detail — model, features, what's included, any defects or wear..."
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm',
            'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
            'resize-none',
            errors.description ? 'border-error' : 'border-slate-200 dark:border-slate-700'
          )}
        />
        {errors.description ? (
          <p id="desc-error" role="alert" className="mt-1 text-xs text-error flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" /> {errors.description.message}
          </p>
        ) : (
          <p id="desc-hint" className="mt-1 text-xs text-slate-400">
            Be specific — better descriptions get more views and higher offers.
          </p>
        )}
      </div>

      {/* Condition */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Condition <span className="text-error" aria-hidden="true">*</span>
        </p>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Item condition"
          aria-required="true"
        >
          {CONDITIONS.map(({ value, label, description, icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={conditionValue === value}
              onClick={() => setValue('condition', value, { shouldValidate: true })}
              className={cn(
                'flex items-start gap-3 rounded-xl border-2 p-4 text-left',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                conditionValue === value
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-100 dark:border-slate-800 hover:border-primary/40'
              )}
            >
              <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
              </div>
              {conditionValue === value && (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-auto" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Pricing ─────────────────────────────────────────────────────────

interface PricingValues {
  type: ListingType;
  price: number | '';
  compareAtPrice: number | '';
  offersEnabled: boolean;
  offerAutoAccept: number | '';
  offerAutoDecline: number | '';
  // Auction fields
  auctionStartPrice: number | '';
  auctionReservePrice: number | '';
  auctionBuyItNow: number | '';
  auctionDurationDays: 3 | 5 | 7 | 10 | 14;
  // Quantity
  stockQuantity: number;
}

function Step4Pricing({
  values,
  onChange,
}: {
  values: PricingValues;
  onChange: (v: Partial<PricingValues>) => void;
}) {
  const { type } = values;

  const isAuction = type === 'auction';
  const isFixedOrOffer = type === 'fixed_price' || type === 'make_offer';
  const showOfferSettings = values.offersEnabled || type === 'make_offer';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-1">
          Pricing
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set your price and choose your listing type.
        </p>
      </div>

      {/* Listing type */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Listing Type <span className="text-error" aria-hidden="true">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Listing type">
          {[
            { value: 'fixed_price', label: 'Buy It Now', icon: '💰', desc: 'Fixed price, buy immediately' },
            { value: 'auction', label: 'Auction', icon: '🔨', desc: 'Timed bidding — highest bid wins' },
            { value: 'make_offer', label: 'Make Offer', icon: '🤝', desc: 'Fixed price + accept offers' },
          ].map(({ value, label, icon, desc }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => onChange({ type: value as ListingType })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center',
                'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                type === value
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-100 dark:border-slate-800 hover:border-primary/40'
              )}
            >
              <span className="text-2xl" aria-hidden="true">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed price fields */}
      {isFixedOrOffer && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Price (₦) <span className="text-error" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium" aria-hidden="true">₦</span>
              <input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={values.price}
                onChange={(e) => onChange({ price: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="0.00"
                className={cn(
                  'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 pl-7 pr-3 py-2.5 text-sm font-mono',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              />
            </div>
          </div>
          <div>
            <label htmlFor="compare-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Was Price (₦) <span className="text-xs font-normal text-slate-400">optional</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium" aria-hidden="true">₦</span>
              <input
                id="compare-price"
                type="number"
                min={0}
                step={0.01}
                value={values.compareAtPrice}
                onChange={(e) => onChange({ compareAtPrice: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="Original price"
                className={cn(
                  'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 pl-7 pr-3 py-2.5 text-sm font-mono',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Offers enabled (for fixed_price type) */}
      {type === 'fixed_price' && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={values.offersEnabled}
            onChange={(e) => onChange({ offersEnabled: e.target.checked })}
            className="accent-primary h-4 w-4"
            aria-label="Allow buyers to make offers"
          />
          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Allow buyers to make offers
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Buyers can negotiate. You can accept, decline, or counter.
            </p>
          </div>
        </label>
      )}

      {/* Offer thresholds */}
      {showOfferSettings && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 space-y-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Auto-response Settings <span className="text-xs font-normal text-slate-400">(optional)</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="auto-accept" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Auto-accept offers above (₦)
              </label>
              <input
                id="auto-accept"
                type="number"
                min={0}
                value={values.offerAutoAccept}
                onChange={(e) => onChange({ offerAutoAccept: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="e.g. 450"
                className={cn(
                  'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              />
            </div>
            <div>
              <label htmlFor="auto-decline" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Auto-decline offers below (₦)
              </label>
              <input
                id="auto-decline"
                type="number"
                min={0}
                value={values.offerAutoDecline}
                onChange={(e) => onChange({ offerAutoDecline: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="e.g. 300"
                className={cn(
                  'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Auction fields */}
      {isAuction && (
        <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Auction Settings</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="auction-start" className="block text-xs text-slate-500 mb-1">Starting Bid (₦) *</label>
              <input
                id="auction-start"
                type="number"
                min={0}
                step={0.01}
                value={values.auctionStartPrice}
                onChange={(e) => onChange({ auctionStartPrice: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="1.00"
                className={cn('w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}
              />
            </div>
            <div>
              <label htmlFor="auction-reserve" className="block text-xs text-slate-500 mb-1">Reserve Price (₦) <span className="text-slate-400">optional</span></label>
              <input
                id="auction-reserve"
                type="number"
                min={0}
                step={0.01}
                value={values.auctionReservePrice}
                onChange={(e) => onChange({ auctionReservePrice: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="Hidden from buyers"
                className={cn('w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}
              />
            </div>
            <div>
              <label htmlFor="auction-bin" className="block text-xs text-slate-500 mb-1">Buy It Now Price (₦) <span className="text-slate-400">optional</span></label>
              <input
                id="auction-bin"
                type="number"
                min={0}
                step={0.01}
                value={values.auctionBuyItNow}
                onChange={(e) => onChange({ auctionBuyItNow: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="Instant purchase option"
                className={cn('w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}
              />
            </div>
            <div>
              <label htmlFor="auction-duration" className="block text-xs text-slate-500 mb-1">Duration *</label>
              <select
                id="auction-duration"
                value={values.auctionDurationDays}
                onChange={(e) => onChange({ auctionDurationDays: parseInt(e.target.value) as PricingValues['auctionDurationDays'] })}
                className={cn('w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}
              >
                {[3, 5, 7, 10, 14].map((d) => (
                  <option key={d} value={d}>{d} days</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={9999}
          value={values.stockQuantity}
          onChange={(e) => onChange({ stockQuantity: Math.max(1, parseInt(e.target.value) || 1) })}
          className={cn(
            'w-24 rounded-lg border border-slate-200 dark:border-slate-700',
            'bg-white dark:bg-slate-900 px-3 py-2 text-sm text-center font-mono',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
        />
        <p className="text-xs text-slate-400">Units available for sale</p>
      </div>
    </div>
  );
}

// ─── Step 5 — Shipping & Location ─────────────────────────────────────────────

function Step5Shipping({
  locationState,
  setLocationState,
  locationLga,
  setLocationLga,
  localPickup,
  setLocalPickup,
  shipsNationally,
  setShipsNationally,
  shippingOptions,
  setShippingOptions,
}: {
  locationState: string;
  setLocationState: (v: string) => void;
  locationLga: string;
  setLocationLga: (v: string) => void;
  localPickup: boolean;
  setLocalPickup: (v: boolean) => void;
  shipsNationally: boolean;
  setShipsNationally: (v: boolean) => void;
  shippingOptions: ShippingOption[];
  setShippingOptions: (v: ShippingOption[]) => void;
}) {
  const handleAddOption = () => {
    setShippingOptions([
      ...shippingOptions,
      {
        name: 'Standard Shipping',
        carrier: 'GIG_LOGISTICS',
        price: 0,
        isFree: false,
        estimatedDaysMin: 3,
        estimatedDaysMax: 7,
        isLocalPickup: false,
      },
    ]);
  };

  const handleRemoveOption = (idx: number) => {
    setShippingOptions(shippingOptions.filter((_, i) => i !== idx));
  };

  const handleUpdateOption = (idx: number, patch: Partial<ShippingOption>) => {
    setShippingOptions(shippingOptions.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-1">
          Shipping & Location
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Let buyers know where you are and how you ship.
        </p>
      </div>

      {/* Location */}
      <div>
        <p className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Item Location <span className="text-error" aria-hidden="true">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="item-state" className="block text-xs text-slate-500 mb-1">State</label>
            <select
              id="item-state"
              value={locationState}
              onChange={(e) => { setLocationState(e.target.value); setLocationLga(''); }}
              required
              className={cn(
                'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 px-3 py-2.5 text-sm',
                'text-slate-900 dark:text-slate-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <option value="">Select state</option>
              {NIGERIA_STATES.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="item-lga" className="block text-xs text-slate-500 mb-1">Local Government Area</label>
            <select
              id="item-lga"
              value={locationLga}
              onChange={(e) => setLocationLga(e.target.value)}
              disabled={!locationState}
              required
              className={cn(
                'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 px-3 py-2.5 text-sm',
                'text-slate-900 dark:text-slate-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                !locationState && 'opacity-50 cursor-not-allowed'
              )}
            >
              <option value="">{locationState ? 'Select LGA' : 'Select state first'}</option>
              {getLGAs(locationState).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pickup + national shipping toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={localPickup}
            onChange={(e) => setLocalPickup(e.target.checked)}
            className="accent-primary h-4 w-4"
            aria-label="Offer local pickup"
          />
          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Offer local pickup
            </span>
            <p className="text-xs text-slate-400 mt-0.5">Buyers in your area can pick up in person.</p>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={shipsNationally}
            onChange={(e) => setShipsNationally(e.target.checked)}
            className="accent-primary h-4 w-4"
            aria-label="Ships nationally"
          />
          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Ships nationally
            </span>
            <p className="text-xs text-slate-400 mt-0.5">Show this listing to buyers across the country.</p>
          </div>
        </label>
      </div>

      {/* Shipping options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Shipping Options
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Option
          </Button>
        </div>

        {shippingOptions.length === 0 && (
          <p className="text-sm text-slate-400 py-3">
            No shipping options added. Add at least one or enable local pickup.
          </p>
        )}

        <div className="space-y-3">
          {shippingOptions.map((opt, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Option {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="text-slate-400 hover:text-error transition-colors focus-visible:outline-none"
                  aria-label={`Remove shipping option ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={opt.name}
                    onChange={(e) => handleUpdateOption(idx, { name: e.target.value })}
                    placeholder="e.g. Standard Shipping"
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Carrier</label>
                  <input
                    type="text"
                    value={opt.carrier}
                    onChange={(e) => handleUpdateOption(idx, { carrier: e.target.value })}
                    placeholder="GIG Logistics, DHL, NIPOST..."
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Price (₦)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={opt.isFree ? 0 : opt.price}
                      disabled={opt.isFree}
                      onChange={(e) => handleUpdateOption(idx, { price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                    />
                    <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={opt.isFree}
                        onChange={(e) => handleUpdateOption(idx, { isFree: e.target.checked, price: 0 })}
                        className="accent-primary"
                      />
                      Free
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Est. Days</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      value={opt.estimatedDaysMin}
                      onChange={(e) => handleUpdateOption(idx, { estimatedDaysMin: parseInt(e.target.value) || 1 })}
                      className="w-12 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Minimum days"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                      type="number"
                      min={1}
                      value={opt.estimatedDaysMax}
                      onChange={(e) => handleUpdateOption(idx, { estimatedDaysMax: parseInt(e.target.value) || 1 })}
                      className="w-12 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Maximum days"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 6 — Review & Publish ────────────────────────────────────────────────

function Step6Review({
  data,
  onGoToStep,
  isPublishing,
  isSavingDraft,
  onPublish,
  onSaveDraft,
}: {
  data: {
    category: string;
    subcategory: string;
    images: UploadedImage[];
    title: string;
    description: string;
    condition: string;
    type: string;
    price: number | '';
    location: string;
    localPickup: boolean;
    shipsNationally: boolean;
    shippingOptions: ShippingOption[];
  };
  onGoToStep: (step: Step) => void;
  isPublishing: boolean;
  isSavingDraft: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
}) {
  const coverImage = data.images[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-1">
          Review & Publish
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Check everything looks correct before publishing.
        </p>
      </div>

      {/* Preview card */}
      <div
        className={cn(
          'rounded-xl overflow-hidden',
          'bg-white dark:bg-surface-dark',
          'border border-slate-100 dark:border-slate-800',
          'shadow-card'
        )}
      >
        {/* Cover image preview — use plain <img> to support blob: URLs */}
        <div className="aspect-video relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage.url}
              alt="Cover image preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Tag className="h-12 w-12 text-slate-300" aria-hidden="true" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="solid" size="sm">
              {data.images.length} photo{data.images.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {data.title || <span className="text-slate-400">No title yet</span>}
          </h3>

          {data.price && (
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {formatPrice(Number(data.price))}
            </p>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Category', value: data.category || '—', step: 1 as Step },
              { label: 'Condition', value: data.condition || '—', step: 3 as Step },
              { label: 'Listing Type', value: data.type || '—', step: 4 as Step },
              { label: 'Location', value: data.location || '—', step: 5 as Step },
              {
                label: 'Shipping',
                value: data.localPickup && data.shipsNationally
                  ? 'Local Pickup + Ships'
                  : data.localPickup
                  ? 'Local Pickup Only'
                  : data.shipsNationally
                  ? 'Ships Nationally'
                  : data.shippingOptions.length > 0
                  ? `${data.shippingOptions.length} option${data.shippingOptions.length !== 1 ? 's' : ''}`
                  : 'Not specified',
                step: 5 as Step,
              },
            ].map(({ label, value, step }) => (
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="flex items-center gap-1 mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                  <span className="capitalize">{value}</span>
                  <button
                    type="button"
                    onClick={() => onGoToStep(step)}
                    className="text-primary hover:text-primary-dark text-xs focus-visible:outline-none focus-visible:underline"
                    aria-label={`Edit ${label}`}
                  >
                    Edit
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Description preview */}
      {data.description && (
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-2">Description preview</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line line-clamp-6">
            {data.description}
          </p>
        </div>
      )}

      {/* Publish actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          className="flex-1 sm:flex-none sm:min-w-[160px]"
          size="lg"
          onClick={onPublish}
          isLoading={isPublishing}
          loadingText="Publishing..."
          disabled={isPublishing || isSavingDraft}
          leftIcon={!isPublishing ? <Eye className="h-4 w-4" /> : undefined}
        >
          Publish Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onSaveDraft}
          isLoading={isSavingDraft}
          loadingText="Saving..."
          disabled={isPublishing || isSavingDraft}
          leftIcon={!isSavingDraft ? <Save className="h-4 w-4" /> : undefined}
        >
          Save as Draft
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateListingPage() {
  const { user } = useRequireAuth();

  const router = useRouter();
  const { mutateAsync: createListing } = useCreateListing();
  const { mutateAsync: uploadImages } = useUploadListingImages();
  const { mutateAsync: publishListing } = usePublishListing();
  const { toast } = useToast();
  const [showBecomeSeller, setShowBecomeSeller] = React.useState(false);
  const [isUpgradingSeller, setIsUpgradingSeller] = React.useState(false);

  // ── Multi-step state ─────────────────────────────────────────────────────
  const [step, setStep] = React.useState<Step>(1);

  // Step 1 — Category
  const [categoryId, setCategoryId] = React.useState('');
  const [categorySlug, setCategorySlug] = React.useState('');
  const [subcategoryId, setSubcategoryId] = React.useState('');

  // Step 2 — Photos
  const [images, setImages] = React.useState<UploadedImage[]>([]);

  // Step 3 — Details
  const [details, setDetails] = React.useState<DetailsValues>({
    title: '',
    description: '',
    condition: 'good',
  });

  // Step 4 — Pricing
  const [pricing, setPricing] = React.useState<PricingValues>({
    type: 'fixed_price',
    price: '',
    compareAtPrice: '',
    offersEnabled: false,
    offerAutoAccept: '',
    offerAutoDecline: '',
    auctionStartPrice: '',
    auctionReservePrice: '',
    auctionBuyItNow: '',
    auctionDurationDays: 7,
    stockQuantity: 1,
  });

  // Step 5 — Shipping
  const [locationState, setLocationState] = React.useState('');
  const [locationLga, setLocationLga] = React.useState('');
  const [localPickup, setLocalPickup] = React.useState(false);
  const [shipsNationally, setShipsNationally] = React.useState(true);
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([]);

  // Publishing state
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  // ── Photo handlers ────────────────────────────────────────────────────────
  // Images are stored locally and uploaded at publish/save time (after listing ID exists)

  const handleAddImages = React.useCallback(
    (files: File[]) => {
      const newFiles = files.slice(0, MAX_IMAGES - images.length);
      const previews: UploadedImage[] = newFiles.map((file) => ({
        url: URL.createObjectURL(file),
        id: null,
        file,
        uploading: false,
      }));
      setImages((prev) => [...prev, ...previews]);
    },
    [images.length]
  );

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed.url.startsWith('blob:')) URL.revokeObjectURL(removed.url);
      return copy;
    });
  };

  const handleReorderImages = (from: number, to: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  // ── Build payload and publish/save ─────────────────────────────────────

  function buildPayload(status: 'active' | 'draft') {
    return {
      title: details.title,
      description: details.description,
      categoryId: subcategoryId || categoryId,
      condition: details.condition as ListingCondition,
      type: pricing.type,
      price: Number(pricing.price) || 0,
      compareAtPrice: pricing.compareAtPrice ? Number(pricing.compareAtPrice) : undefined,
      stockQuantity: pricing.stockQuantity,
      offersEnabled: pricing.offersEnabled || pricing.type === 'make_offer',
      offerAutoAcceptThreshold: pricing.offerAutoAccept ? Number(pricing.offerAutoAccept) : undefined,
      offerAutoDeclineThreshold: pricing.offerAutoDecline ? Number(pricing.offerAutoDecline) : undefined,
      ...(pricing.type === 'auction' && pricing.auctionStartPrice
        ? {
            auction: {
              startPrice: Number(pricing.auctionStartPrice),
              reservePrice: pricing.auctionReservePrice ? Number(pricing.auctionReservePrice) : undefined,
              buyItNowPrice: pricing.auctionBuyItNow ? Number(pricing.auctionBuyItNow) : undefined,
              durationDays: pricing.auctionDurationDays,
            },
          }
        : {}),
      location: locationLga ? `${locationLga}, ${locationState}` : locationState,
      tags: [],
      imageIds: images.filter((i) => i.id !== null).map((i) => i.id as string),
      shippingOptions: [
        ...(localPickup
          ? [{ name: 'Local Pickup', carrier: null, price: 0, isFree: true, isLocalPickup: true, estimatedDaysMin: null, estimatedDaysMax: null, regions: [] }]
          : []),
        ...shippingOptions.map((o) => ({
          name: o.name,
          carrier: o.carrier || null,
          price: o.price,
          isFree: o.isFree,
          isLocalPickup: false,
          estimatedDaysMin: o.estimatedDaysMin,
          estimatedDaysMax: o.estimatedDaysMax,
          regions: shipsNationally ? ['NG'] : [],
        })),
      ],
    };
  }

  // Upload pending images to an already-created listing
  const uploadPendingImages = async (listingId: string) => {
    const pendingFiles = images.filter((i) => i.file && i.id === null).map((i) => i.file!);
    if (pendingFiles.length === 0) return;
    const form = new FormData();
    pendingFiles.forEach((f) => form.append('images', f));
    // Let errors propagate — caller shows the real reason
    await listingsApi.uploadImages(listingId, form);
  };

  const handleBecomeSeller = async () => {
    setIsUpgradingSeller(true);
    try {
      await usersApi.becomeSeller();
      // Refresh the user profile so isSeller updates immediately
      window.location.reload();
    } catch (err: unknown) {
      toast.error('Upgrade failed', getApiError(err, 'Could not activate seller account. Please try again.'));
      setIsUpgradingSeller(false);
    }
  };

  const handlePublish = async () => {
    if (!user?.isSeller && !user?.isAdmin) {
      setShowBecomeSeller(true);
      return;
    }
    if (!categoryId) { toast.error('Select a category first'); return; }
    if (details.title.length < 5) { toast.error('Title too short', 'Please enter a more descriptive title.'); return; }
    if (!pricing.price && pricing.type !== 'auction') { toast.error('Price required', 'Please enter a price for your listing.'); return; }
    if (!locationState) { toast.error('Location required', 'Please select your state and LGA.'); return; }

    setIsPublishing(true);
    try {
      const listing = await createListing(buildPayload('active'));

      // Upload images — if this fails we still publish the listing
      // but show the user exactly what went wrong with the photos
      try {
        await uploadPendingImages(listing.id);
      } catch (uploadErr: unknown) {
        const uploadMsg = getApiError(uploadErr, 'Unknown upload error');
        toast.warning('Photos not uploaded', `Listing published without photos. Reason: ${uploadMsg}`);
      }

      await publishListing(listing.id);
      router.push(`/listing/${listing.id}` as Route);
    } catch (err: unknown) {
      const msg = getApiError(err, 'Please check all fields and try again.');
      toast.error('Failed to publish listing', msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.isSeller && !user?.isAdmin) {
      setShowBecomeSeller(true);
      return;
    }
    setIsSavingDraft(true);
    try {
      const listing = await createListing(buildPayload('draft'));
      try {
        await uploadPendingImages(listing.id);
      } catch (uploadErr: unknown) {
        const uploadMsg = getApiError(uploadErr, 'Unknown upload error');
        toast.warning('Photos not uploaded', `Draft saved without photos. Reason: ${uploadMsg}`);
      }
      toast.success('Draft saved', 'You can finish it anytime from My Listings.');
      router.push('/seller/listings' as Route);
    } catch (err: unknown) {
      const msg = getApiError(err, 'Please check all fields and try again.');
      toast.error('Failed to save draft', msg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Step validation (basic) ───────────────────────────────────────────────

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!categoryId;
      case 2: return true; // Photos are optional for draft
      case 3: return details.title.length >= 5 && details.description.length >= 20;
      case 4: return pricing.type === 'auction'
        ? !!pricing.auctionStartPrice
        : !!pricing.price;
      case 5: return !!locationState && !!locationLga;
      default: return true;
    }
  }

  const goNext = () => {
    if (step < 6) setStep((s) => (s + 1) as Step);
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
            Create a Listing
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            List your item in under 2 minutes.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Step content */}
        <div
          className={cn(
            'rounded-2xl p-6 sm:p-8',
            'bg-white dark:bg-surface-dark',
            'border border-slate-100 dark:border-slate-800',
            'shadow-card'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
            >
              {step === 1 && (
                <Step1Category
                  selected={categoryId}
                  selectedSub={subcategoryId}
                  onSelect={(id, slug) => { setCategoryId(id); setCategorySlug(slug); setSubcategoryId(''); }}
                  onSelectSub={setSubcategoryId}
                />
              )}
              {step === 2 && (
                <Step2Photos
                  images={images}
                  onAdd={handleAddImages}
                  onRemove={handleRemoveImage}
                  onReorder={handleReorderImages}
                />
              )}
              {step === 3 && (
                <Step3Details
                  values={details}
                  onChange={setDetails}
                />
              )}
              {step === 4 && (
                <Step4Pricing
                  values={pricing}
                  onChange={(patch) => setPricing((v) => ({ ...v, ...patch }))}
                />
              )}
              {step === 5 && (
                <Step5Shipping
                  locationState={locationState}
                  setLocationState={setLocationState}
                  locationLga={locationLga}
                  setLocationLga={setLocationLga}
                  localPickup={localPickup}
                  setLocalPickup={setLocalPickup}
                  shipsNationally={shipsNationally}
                  setShipsNationally={setShipsNationally}
                  shippingOptions={shippingOptions}
                  setShippingOptions={setShippingOptions}
                />
              )}
              {step === 6 && (
                <Step6Review
                  data={{
                    category: TOP_LEVEL_CATEGORIES.find((c) => c.id === categoryId)?.label ?? '',
                    subcategory: subcategoryId,
                    images,
                    title: details.title,
                    description: details.description,
                    condition: details.condition.replace(/_/g, ' '),
                    type: pricing.type.replace(/_/g, ' '),
                    price: pricing.price,
                    location: locationLga ? `${locationLga}, ${locationState}` : locationState,
                    localPickup,
                    shipsNationally,
                    shippingOptions,
                  }}
                  onGoToStep={setStep}
                  isPublishing={isPublishing}
                  isSavingDraft={isSavingDraft}
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraft}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons — always visible */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrev}
              disabled={step === 1}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Back
            </Button>

            {step < 6 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                {step === 5 ? 'Review Listing' : 'Continue'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Become a Seller modal */}
      {showBecomeSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Activate Seller Account
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Your account is currently set up as a buyer. Activate your free seller account to start posting listings on Ashimarket.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBecomeSeller(false)}
                disabled={isUpgradingSeller}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleBecomeSeller}
                disabled={isUpgradingSeller}
              >
                {isUpgradingSeller ? 'Activating…' : 'Activate Seller Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
