'use client';

import * as React from 'react';
import { Settings, Bell, Shield, Globe, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingGroup {
  title: string;
  icon: React.ElementType;
  items: Array<{ label: string; value: string; note?: string }>;
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'Platform',
    icon: Globe,
    items: [
      { label: 'Platform Name', value: 'Ashimarket' },
      { label: 'Default Currency', value: 'Nigerian Naira (₦)' },
      { label: 'Default Language', value: 'English (Nigeria)' },
      { label: 'Marketplace Type', value: 'Multi-vendor marketplace (buyers & sellers)' },
    ],
  },
  {
    title: 'Listings',
    icon: Database,
    items: [
      { label: 'Max images per listing', value: '20' },
      { label: 'Listing expiry', value: '30 days (renewable)' },
      { label: 'New seller posting limit', value: 'No restriction', note: 'Restriction was removed' },
      { label: 'Duplicate detection', value: 'Enabled' },
    ],
  },
  {
    title: 'Offers & Auctions',
    icon: Settings,
    items: [
      { label: 'Offer expiry', value: '48 hours' },
      { label: 'Counter-offer expiry', value: '24 hours' },
      { label: 'Max active offers per listing (per buyer)', value: '3' },
      { label: 'Auction anti-snipe extension', value: '2 minutes (if bid in last 2 min)' },
      { label: 'Min bid increment', value: '5% of current price or ₦1, whichever is greater' },
    ],
  },
  {
    title: 'Reviews',
    icon: Bell,
    items: [
      { label: 'Review window', value: '60 days after delivery' },
      { label: 'Review edit window', value: '48 hours after submission' },
      { label: 'Who can review', value: 'Only buyers with a completed transaction' },
      { label: 'Seller response', value: '1 response per review allowed' },
    ],
  },
  {
    title: 'Disputes',
    icon: Shield,
    items: [
      { label: 'Dispute window', value: '30 days after delivery' },
      { label: 'Admin resolution SLA', value: '7 business days' },
      { label: 'Auto-release after delivery', value: '14 days' },
      { label: 'Resolution options', value: 'Full refund · Partial refund · No refund · Return for refund' },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Current business rules and platform configuration</p>
      </div>

      {SETTING_GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">{group.title}</h2>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.items.map((item) => (
                  <div key={item.label} className={cn('px-5 py-3.5 flex items-start justify-between gap-6')}>
                    <p className="text-sm text-slate-500 shrink-0 w-56">{item.label}</p>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.value}</p>
                      {item.note && <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-slate-400">
        Business rules are enforced in the backend (<code className="font-mono">backend/src/config/constants.ts</code> and service files). Contact your developer to modify these settings.
      </p>
    </div>
  );
}
