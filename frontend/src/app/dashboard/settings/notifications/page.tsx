'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Bell, Mail, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { usersApi, getApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { DashboardMobileNav } from '@/components/layout/DashboardNav';
import type { NotificationPreferences } from '@/types/user';

const EMAIL_PREFS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'emailOnMessage', label: 'New messages', description: 'When a buyer or seller sends you a message' },
  { key: 'emailOnOffer', label: 'Offer activity', description: 'New offers, counter-offers, and responses on your listings' },
  { key: 'emailOnOrderUpdate', label: 'Order updates', description: 'Status changes on your purchases and sales' },
  { key: 'emailOnPriceAlert', label: 'Price alerts', description: 'When a wishlisted item drops in price' },
  { key: 'emailOnNewListing', label: 'Saved search matches', description: 'New listings matching your saved searches' },
];

const PUSH_PREFS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'pushOnMessage', label: 'New messages', description: 'Instant notification for new chat messages' },
  { key: 'pushOnOffer', label: 'Offer activity', description: 'Offers and counter-offers in real time' },
  { key: 'pushOnOrderUpdate', label: 'Order updates', description: 'Shipping updates and order status changes' },
];

function Toggle({
  checked,
  onChange,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [prefs, setPrefs] = React.useState<NotificationPreferences | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saved' | 'error'>('idle');
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const p = user?.notificationPreferences ?? (user?.profile as any)?.notificationPreferences;
    if (p) setPrefs(p as NotificationPreferences);
  }, [user]);

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPrefs((p) => (p ? { ...p, [key]: value } : p));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!prefs) return;
    setIsSaving(true);
    setServerError(null);
    try {
      const updated = await usersApi.updateNotificationPreferences(prefs);
      updateUser(updated as any);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: unknown) {
      setServerError(getApiError(err, 'Failed to save preferences'));
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
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
          <span className="font-medium text-slate-900 dark:text-slate-100">Notifications</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="text-sm text-slate-500 mt-0.5">Choose how and when you get notified</p>
          </div>
        </div>

        {serverError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-error mt-0.5 shrink-0" />
            <p className="text-sm text-error">{serverError}</p>
          </div>
        )}

        {!prefs ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <Mail className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Email Notifications</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {EMAIL_PREFS.map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`toggle-${key}`}
                        className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
                      >
                        {label}
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                    <Toggle
                      id={`toggle-${key}`}
                      checked={prefs[key] as boolean}
                      onChange={(v) => handleToggle(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Push */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <Smartphone className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">In-App &amp; Push Notifications</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {PUSH_PREFS.map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`toggle-${key}`}
                        className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
                      >
                        {label}
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                    <Toggle
                      id={`toggle-${key}`}
                      checked={prefs[key] as boolean}
                      onChange={(v) => handleToggle(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between gap-4">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Preferences saved
                </span>
              )}
              <div className="ml-auto">
                <Button onClick={() => void handleSave()} isLoading={isSaving} loadingText="Saving…">
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
