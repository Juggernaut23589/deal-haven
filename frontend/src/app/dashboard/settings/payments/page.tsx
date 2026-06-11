'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, CreditCard, Building2, Plus, Trash2, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
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

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string | null;
  isDefault: boolean;
  createdAt: string;
}

const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank',
  'First Bank of Nigeria', 'First City Monument Bank (FCMB)', 'Globus Bank',
  'Guaranty Trust Bank (GTBank)', 'Heritage Bank', 'Keystone Bank',
  'Kuda Microfinance Bank', 'Opay', 'Palmpay', 'Polaris Bank',
  'Providus Bank', 'Stanbic IBTC Bank', 'Standard Chartered Bank',
  'Sterling Bank', 'SunTrust Bank', 'Union Bank of Nigeria',
  'United Bank for Africa (UBA)', 'Unity Bank', 'VFD Microfinance Bank',
  'Wema Bank', 'Zenith Bank',
];

const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(3, 'Account name is required').max(100),
  accountNumber: z
    .string()
    .min(10, 'Account number must be 10 digits')
    .max(10, 'Account number must be 10 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  isDefault: z.boolean(),
});

type BankFormValues = z.infer<typeof bankSchema>;

function BankModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (values: BankFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: { bankName: '', accountName: '', accountNumber: '', isDefault: false },
  });

  const inputCls = (hasError?: boolean) =>
    cn(
      'h-10 w-full rounded-lg border px-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors',
      hasError ? 'border-error focus-visible:ring-error' : 'border-slate-200 dark:border-slate-700',
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add Bank Account</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} noValidate className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your bank details are only used by buyers to send payment directly to you. Ashimarket does not process any bank transfers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bank *</label>
            <select {...register('bankName')} className={cn(inputCls(!!errors.bankName), 'cursor-pointer')}>
              <option value="">Select your bank</option>
              {NIGERIAN_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value="Other">Other</option>
            </select>
            {errors.bankName && <p className="mt-1 text-xs text-error">{errors.bankName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Number *</label>
            <input
              {...register('accountNumber')}
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="0123456789"
              className={cn(inputCls(!!errors.accountNumber), 'font-mono tracking-widest')}
            />
            {errors.accountNumber ? (
              <p className="mt-1 text-xs text-error">{errors.accountNumber.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Enter your 10-digit NUBAN account number</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Name *</label>
            <input
              {...register('accountName')}
              type="text"
              placeholder="As it appears on your bank statement"
              className={inputCls(!!errors.accountName)}
            />
            {errors.accountName && <p className="mt-1 text-xs text-error">{errors.accountName.message}</p>}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register('isDefault')}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Set as default payment account</span>
          </label>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Saving…">Add Account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentSettingsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = React.useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const fetchAccounts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: BankAccount[] }>('/users/me/bank-accounts');
      setAccounts(res.data.data ?? []);
    } catch {
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSave = async (values: BankFormValues) => {
    try {
      const res = await apiClient.post<{ data: BankAccount }>('/users/me/bank-accounts', values);
      setAccounts((prev) => [...prev, res.data.data]);
      toast.success('Bank account added');
      setModalOpen(false);
      await fetchAccounts();
    } catch (err: unknown) {
      const msg = getApiError(err, 'Failed to add bank account');
      toast.error('Save failed', msg);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiClient.delete(`/users/me/bank-accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Bank account removed');
    } catch {
      toast.error('Failed to remove bank account');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.patch(`/users/me/bank-accounts/${id}`, { isDefault: true });
      await fetchAccounts();
      toast.success('Default account updated');
    } catch {
      toast.error('Failed to update default account');
    }
  };

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
          <span className="font-medium text-slate-900 dark:text-slate-100">Payment Info</span>
        </nav>

        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Payment Info</h1>
              <p className="text-sm text-slate-500 mt-0.5">Add your bank account for receiving payments</p>
            </div>
          </div>
          {accounts.length < 3 && (
            <Button onClick={() => setModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />} size="sm">
              Add Account
            </Button>
          )}
        </div>

        {/* How payment works */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">How payments work on Ashimarket</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Buyers and sellers settle payments privately. Your bank account details are shared with buyers so they can transfer funds directly to you. Ashimarket does not hold or process payments.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No bank accounts added</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Add a bank account so buyers know where to send payment</p>
            <Button size="sm" onClick={() => setModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
              Add Bank Account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={cn(
                  'relative rounded-xl border p-4 bg-white dark:bg-surface-dark shadow-card',
                  account.isDefault ? 'border-primary/30' : 'border-slate-100 dark:border-slate-800',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', account.isDefault ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800')}>
                      <Building2 className={cn('h-4 w-4', account.isDefault ? 'text-primary' : 'text-slate-500')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{account.bankName}</span>
                        {account.isDefault && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0.5">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-0.5 tracking-wider">
                        {account.accountNumber}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{account.accountName}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => void handleDelete(account.id)}
                    disabled={deleting === account.id}
                    className="rounded-lg p-2 text-slate-400 hover:text-error hover:bg-error/5 transition-colors disabled:opacity-50 shrink-0"
                    aria-label="Remove bank account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {!account.isDefault && (
                  <button
                    onClick={() => void handleSetDefault(account.id)}
                    className="mt-3 ml-12 text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Set as default
                  </button>
                )}
              </div>
            ))}

            {accounts.length >= 3 && (
              <p className="text-xs text-slate-400 text-center mt-2">Maximum of 3 bank accounts allowed.</p>
            )}
          </div>
        )}
      </main>
      <Footer />

      {modalOpen && (
        <BankModal
          onClose={() => setModalOpen(false)}
          onSave={(v) => handleSave(v)}
        />
      )}
    </>
  );
}
