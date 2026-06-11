'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { authApi, getApiError } from '@/lib/api';
import { DashboardMobileNav } from '@/components/layout/DashboardNav';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function SecuritySettingsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSaveStatus('saving');
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: unknown) {
      setServerError(getApiError(err, 'Failed to change password. Please try again.'));
      setSaveStatus('error');
    }
  };

  if (authLoading) return null;

  const inputCls = (hasError?: boolean) =>
    cn(
      'h-10 w-full rounded-lg border px-3 pr-10 text-sm',
      'bg-white dark:bg-slate-900',
      'text-slate-900 dark:text-slate-100',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
      'transition-colors duration-150',
      hasError ? 'border-error focus-visible:ring-error' : 'border-slate-200 dark:border-slate-700',
    );

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <DashboardMobileNav />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <Link href="/dashboard/settings" className="text-slate-500 hover:text-primary transition-colors">Settings</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Security</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Security</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your password and account security</p>
          </div>
        </div>

        {serverError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-error mt-0.5 shrink-0" />
            <p className="text-sm text-error">{serverError}</p>
          </div>
        )}

        {saveStatus === 'saved' && (
          <div role="status" className="mb-6 flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <p className="text-sm text-success font-medium">Password changed successfully.</p>
          </div>
        )}

        {/* Password section */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Change Password</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Current password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  {...register('currentPassword')}
                  className={inputCls(!!errors.currentPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />{errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  {...register('newPassword')}
                  className={inputCls(!!errors.newPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword ? (
                <p role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />{errors.newPassword.message}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">At least 8 characters, one uppercase letter, and one number.</p>
              )}
            </div>

            {/* Confirm new password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                  className={inputCls(!!errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />{errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting || saveStatus === 'saving'}
                loadingText="Changing password…"
                disabled={isSubmitting || saveStatus === 'saving'}
                leftIcon={<Lock className="h-4 w-4" />}
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>

        {/* Account info tip */}
        <p className="mt-6 text-xs text-slate-400 text-center">
          Forgot your current password?{' '}
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Reset via email
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
