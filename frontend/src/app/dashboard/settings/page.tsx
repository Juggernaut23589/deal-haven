'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ChevronRight, User, Lock, Bell, MapPin, CreditCard } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';

const SETTINGS_SECTIONS = [
  {
    href: '/dashboard/settings/profile' as Route,
    icon: User,
    label: 'Profile',
    description: 'Update your display name, bio, avatar and contact info',
  },
  {
    href: '/dashboard/settings/security' as Route,
    icon: Lock,
    label: 'Security',
    description: 'Change your password and manage account security',
  },
  {
    href: '/dashboard/settings/notifications' as Route,
    icon: Bell,
    label: 'Notifications',
    description: 'Choose what alerts you receive and how',
  },
  {
    href: '/dashboard/settings/addresses' as Route,
    icon: MapPin,
    label: 'Addresses',
    description: 'Manage your saved delivery and pickup addresses',
  },
  {
    href: '/dashboard/settings/payments' as Route,
    icon: CreditCard,
    label: 'Payment Info',
    description: 'Add bank account or payment details for receiving funds',
  },
];

export default function SettingsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  if (authLoading) return null;

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Settings</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-6">
          Account Settings
        </h1>

        <div className="space-y-2">
          {SETTINGS_SECTIONS.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card hover:border-primary/30 hover:shadow-card-hover transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
