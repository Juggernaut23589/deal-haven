'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle, Save, ArrowLeft, Loader2, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NIGERIA_STATES, getLGAs } from '@/lib/nigeriaLocations';
import { useRequireAuth } from '@/hooks/useAuth';
import { listingsApi , getApiError } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { ListingDetail } from '@/types/listing';

const CONDITIONS = [
  { value: 'new',       label: 'New',       desc: 'Brand new, never used' },
  { value: 'like_new',  label: 'Like New',  desc: 'Used once or twice' },
  { value: 'good',      label: 'Good',      desc: 'Minor wear, fully functional' },
  { value: 'fair',      label: 'Fair',      desc: 'Visible wear, functional' },
  { value: 'for_parts', label: 'For Parts', desc: 'Not fully functional' },
] as const;

const editSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  condition:   z.enum(['new', 'like_new', 'good', 'fair', 'for_parts']),
  price:       z.number({ invalid_type_error: 'Price must be a number' }).min(1, 'Price must be greater than 0'),
  compareAtPrice: z.number().optional(),
  offersEnabled:  z.boolean(),
  quantity:    z.number().int().min(1),
  state:       z.string().min(1, 'Please select your state'),
  lga:         z.string().min(1, 'Please select your LGA'),
  localPickup:     z.boolean(),
  shipsNationally: z.boolean(),
});

type EditFormValues = z.infer<typeof editSchema>;

// Map Prisma UPPERCASE condition back to lowercase for form
function normCondition(v: string): EditFormValues['condition'] {
  const m: Record<string, EditFormValues['condition']> = {
    NEW: 'new', LIKE_NEW: 'like_new', GOOD: 'good', FAIR: 'fair', FOR_PARTS: 'for_parts',
  };
  return m[v] ?? (v as EditFormValues['condition']);
}

export default function EditListingPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const { user } = useRequireAuth();
  const { toast } = useToast();

  const [listing, setListing]     = React.useState<ListingDetail | null>(null);
  const [isFetching, setFetching] = React.useState(true);
  const [isSaving, setSaving]     = React.useState(false);

  const { register, handleSubmit, reset, control, watch, formState: { errors, isDirty } } =
    useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  const selectedState = watch('state');

  // Load existing listing data
  React.useEffect(() => {
    listingsApi.get(params.id)
      .then((data) => {
        setListing(data);
        const locationParts = (data.location ?? '').split(',').map((p: string) => p.trim());
        reset({
          title:           data.title,
          description:     data.description,
          condition:       normCondition(data.condition),
          price:           data.price,
          compareAtPrice:  data.originalPrice ?? data.compareAtPrice ?? undefined,
          offersEnabled:   data.offersEnabled,
          quantity:        data.stockQuantity ?? data.quantity ?? 1,
          state:           locationParts[1] ?? locationParts[0] ?? '',
          lga:             locationParts[0] ?? '',
          localPickup:     data.localPickup ?? false,
          shipsNationally: data.shipsNationally ?? true,
        });
      })
      .catch(() => toast.error('Failed to load listing'))
      .finally(() => setFetching(false));
  }, [params.id, reset, toast]);

  // Verify ownership
  React.useEffect(() => {
    if (listing && user && listing.seller?.id !== user.id && !user.isAdmin) {
      router.push('/seller/listings');
    }
  }, [listing, user, router]);

  const onSubmit = async (values: EditFormValues) => {
    setSaving(true);
    try {
      await listingsApi.update(params.id, {
        title:           values.title,
        description:     values.description,
        condition:       values.condition,
        price:           values.price,
        compareAtPrice:  values.compareAtPrice,
        offersEnabled:   values.offersEnabled,
        stockQuantity:   values.quantity,
        location:        values.lga ? `${values.lga}, ${values.state}` : values.state,
        localPickup:     values.localPickup,
        shipsNationally: values.shipsNationally,
      });
      toast.success('Listing updated', 'Your changes have been saved.');
      router.push(`/listing/${params.id}` as Route);
    } catch (err: unknown) {
      const msg = getApiError(err, 'Failed to save changes.');
      toast.error('Update failed', msg);
    } finally {
      setSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-error mx-auto mb-3" />
          <p className="text-slate-600">Listing not found.</p>
          <Link href="/seller/listings" className="text-primary text-sm mt-2 inline-block hover:underline">← Back to listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/seller/listings" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Edit Listing</h1>
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{listing.title}</p>
          </div>
          <Link href={`/listing/${params.id}` as Route}>
            <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>View</Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card wrapper */}
          <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-6 space-y-6">

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title <span className="text-error">*</span>
              </label>
              <input
                id="title"
                {...register('title')}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  errors.title ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                )}
              />
              {errors.title && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                {...register('description')}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-sm resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  errors.description ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                )}
              />
              {errors.description && <p className="mt-1 text-xs text-error flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.description.message}</p>}
            </div>

            {/* Condition */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Condition <span className="text-error">*</span></p>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CONDITIONS.map(({ value, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'rounded-xl border-2 p-3 text-left transition-all',
                          field.value === value
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-100 dark:border-slate-800 hover:border-primary/40'
                        )}
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Pricing card */}
          <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Price (₦) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₦</span>
                  <input
                    id="price"
                    type="number"
                    min={1}
                    step={0.01}
                    {...register('price', { valueAsNumber: true })}
                    className={cn(
                      'w-full rounded-lg border pl-7 pr-3 py-2.5 text-sm font-mono bg-white dark:bg-slate-900',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      errors.price ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                    )}
                  />
                </div>
                {errors.price && <p className="mt-1 text-xs text-error">{errors.price.message}</p>}
              </div>
              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Was Price (₦) <span className="text-xs font-normal text-slate-400">optional</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₦</span>
                  <input
                    id="compareAtPrice"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register('compareAtPrice', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 pl-7 pr-3 py-2.5 text-sm font-mono bg-white dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  {...register('quantity', { valueAsNumber: true })}
                  className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-center font-mono bg-white dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <Controller name="offersEnabled" control={control} render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="accent-primary h-4 w-4" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Accept offers</span>
                </label>
              )} />
            </div>
          </div>

          {/* Location card */}
          <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Location & Shipping</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-xs text-slate-500 mb-1">State</label>
                <select
                  id="state"
                  {...register('state')}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    errors.state ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                  )}
                >
                  <option value="">Select state</option>
                  {NIGERIA_STATES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
                {errors.state && <p className="mt-1 text-xs text-error">{errors.state.message}</p>}
              </div>
              <div>
                <label htmlFor="lga" className="block text-xs text-slate-500 mb-1">Local Government Area</label>
                <select
                  id="lga"
                  {...register('lga')}
                  disabled={!selectedState}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    !selectedState && 'opacity-50 cursor-not-allowed',
                    errors.lga ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                  )}
                >
                  <option value="">{selectedState ? 'Select LGA' : 'Select state first'}</option>
                  {getLGAs(selectedState).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.lga && <p className="mt-1 text-xs text-error">{errors.lga.message}</p>}
              </div>
            </div>
            <div className="flex gap-6">
              <Controller name="localPickup" control={control} render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="accent-primary h-4 w-4" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Local pickup</span>
                </label>
              )} />
              <Controller name="shipsNationally" control={control} render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="accent-primary h-4 w-4" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ships nationally</span>
                </label>
              )} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              isLoading={isSaving}
              loadingText="Saving…"
              disabled={isSaving || !isDirty}
              leftIcon={!isSaving ? <Save className="h-4 w-4" /> : undefined}
              className="flex-1 sm:flex-none sm:min-w-[160px]"
              size="lg"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
