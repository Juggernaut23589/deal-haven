'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Plus, Trash2, Pencil, Home, Building2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { getApiError } from '@/lib/api';
import apiClient from '@/lib/api';
import { useToast } from '@/store/uiStore';
import { DashboardMobileNav } from '@/components/layout/DashboardNav';

interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  recipientName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  type: z.enum(['home', 'work', 'other']),
  recipientName: z.string().min(1, 'Recipient name is required').max(100),
  line1: z.string().min(5, 'Address is required').max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().max(30).optional(),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const TYPE_ICON = { home: Home, work: Building2, other: MapPin };
const TYPE_LABEL = { home: 'Home', work: 'Work', other: 'Other' };

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

function AddressModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Partial<AddressFormValues> | null;
  onClose: () => void;
  onSave: (values: AddressFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initial?.label ?? '',
      type: initial?.type ?? 'home',
      recipientName: initial?.recipientName ?? '',
      line1: initial?.line1 ?? '',
      line2: initial?.line2 ?? '',
      city: initial?.city ?? '',
      state: initial?.state ?? '',
      postalCode: initial?.postalCode ?? '',
      country: initial?.country ?? 'Nigeria',
      phone: initial?.phone ?? '',
      isDefault: initial?.isDefault ?? false,
    },
  });

  const inputCls = (hasError?: boolean) =>
    cn(
      'h-10 w-full rounded-lg border px-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors',
      hasError ? 'border-error focus-visible:ring-error' : 'border-slate-200 dark:border-slate-700',
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {initial?.line1 ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} noValidate className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Label *</label>
              <input {...register('label')} placeholder="e.g. Home, Office" className={inputCls(!!errors.label)} />
              {errors.label && <p className="mt-1 text-xs text-error">{errors.label.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type *</label>
              <select {...register('type')} className={cn(inputCls(), 'cursor-pointer')}>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Recipient Name *</label>
            <input {...register('recipientName')} placeholder="Full name of recipient" className={inputCls(!!errors.recipientName)} />
            {errors.recipientName && <p className="mt-1 text-xs text-error">{errors.recipientName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address Line 1 *</label>
            <input {...register('line1')} placeholder="House number, street name" className={inputCls(!!errors.line1)} />
            {errors.line1 && <p className="mt-1 text-xs text-error">{errors.line1.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address Line 2</label>
            <input {...register('line2')} placeholder="Flat, estate, landmark (optional)" className={inputCls()} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">City *</label>
              <input {...register('city')} placeholder="e.g. Lagos" className={inputCls(!!errors.city)} />
              {errors.city && <p className="mt-1 text-xs text-error">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">State *</label>
              <select {...register('state')} className={cn(inputCls(!!errors.state), 'cursor-pointer')}>
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="mt-1 text-xs text-error">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Postal Code</label>
              <input {...register('postalCode')} placeholder="e.g. 100001" className={inputCls()} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
              <input {...register('phone')} type="tel" placeholder="+234 800 000 0000" className={inputCls()} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Country *</label>
            <input {...register('country')} className={inputCls(!!errors.country)} />
            {errors.country && <p className="mt-1 text-xs text-error">{errors.country.message}</p>}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register('isDefault')}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Set as default address</span>
          </label>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Saving…">Save Address</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddressesSettingsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const fetchAddresses = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: Address[] }>('/users/me/addresses');
      setAddresses(res.data.data ?? []);
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleSave = async (values: AddressFormValues) => {
    try {
      if (editingAddress) {
        const res = await apiClient.patch<{ data: Address }>(`/users/me/addresses/${editingAddress.id}`, values);
        setAddresses((prev) => prev.map((a) => a.id === editingAddress.id ? res.data.data : a));
        toast.success('Address updated');
      } else {
        const res = await apiClient.post<{ data: Address }>('/users/me/addresses', values);
        setAddresses((prev) => [...prev, res.data.data]);
        toast.success('Address added');
      }
      if (values.isDefault) {
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === (editingAddress?.id ?? '') || (editingAddress === null && a === prev[prev.length - 1]) })));
      }
      setModalOpen(false);
      setEditingAddress(null);
      await fetchAddresses();
    } catch (err: unknown) {
      const msg = getApiError(err, 'Failed to save address');
      toast.error('Save failed', msg);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiClient.delete(`/users/me/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    } finally {
      setDeleting(null);
    }
  };

  const openAdd = () => { setEditingAddress(null); setModalOpen(true); };
  const openEdit = (addr: Address) => { setEditingAddress(addr); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingAddress(null); };

  if (authLoading) return null;

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <DashboardMobileNav />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <Link href="/dashboard/settings" className="text-slate-500 hover:text-primary transition-colors">Settings</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Addresses</span>
        </nav>

        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Addresses</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage your delivery and pickup addresses</p>
            </div>
          </div>
          <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />} size="sm">
            Add Address
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No saved addresses</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Add an address for faster checkout and order delivery</p>
            <Button size="sm" onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const Icon = TYPE_ICON[addr.type] ?? MapPin;
              return (
                <div
                  key={addr.id}
                  className={cn(
                    'relative rounded-xl border p-4 bg-white dark:bg-surface-dark shadow-card transition-colors',
                    addr.isDefault ? 'border-primary/30' : 'border-slate-100 dark:border-slate-800',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', addr.isDefault ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800')}>
                        <Icon className={cn('h-4 w-4', addr.isDefault ? 'text-primary' : 'text-slate-500')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{addr.label}</span>
                          <span className="text-xs text-slate-400">{TYPE_LABEL[addr.type]}</span>
                          {addr.isDefault && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0.5">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{addr.recipientName}</p>
                        <address className="text-xs text-slate-500 not-italic mt-1 space-y-0.5">
                          <p>{addr.line1}</p>
                          {addr.line2 && <p>{addr.line2}</p>}
                          <p>{addr.city}, {addr.state}</p>
                          {addr.postalCode && <p>{addr.postalCode}</p>}
                          {addr.phone && <p>{addr.phone}</p>}
                        </address>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(addr)}
                        className="rounded-lg p-2 text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Edit address"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(addr.id)}
                        disabled={deleting === addr.id}
                        className="rounded-lg p-2 text-slate-400 hover:text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {!addr.isDefault && (
                    <button
                      onClick={async () => {
                        try {
                          await apiClient.patch(`/users/me/addresses/${addr.id}`, { isDefault: true });
                          await fetchAddresses();
                          toast.success('Default address updated');
                        } catch {
                          toast.error('Failed to update default address');
                        }
                      }}
                      className="mt-3 ml-12 text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Set as default
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {modalOpen && (
        <AddressModal
          initial={editingAddress ? {
            label: editingAddress.label,
            type: editingAddress.type,
            recipientName: editingAddress.recipientName,
            line1: editingAddress.line1,
            line2: editingAddress.line2 ?? '',
            city: editingAddress.city,
            state: editingAddress.state,
            postalCode: editingAddress.postalCode ?? '',
            country: editingAddress.country,
            phone: editingAddress.phone ?? '',
            isDefault: editingAddress.isDefault,
          } : null}
          onClose={closeModal}
          onSave={(v) => handleSave(v)}
        />
      )}
    </>
  );
}
