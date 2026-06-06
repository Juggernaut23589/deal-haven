'use client';

import * as React from 'react';
import { Percent } from 'lucide-react';

interface FeeRule {
  label: string;
  range: string;
  rate: string;
  example: string;
}

const FEE_RULES: FeeRule[] = [
  {
    label: 'Standard',
    range: 'Orders under ₦500',
    rate: '5%',
    example: '₦500 order → ₦25 platform fee, seller receives ₦475',
  },
  {
    label: 'Mid-tier',
    range: '₦500 – ₦5,000',
    rate: '3%',
    example: '₦1,000 order → ₦30 platform fee, seller receives ₦970',
  },
  {
    label: 'High-value',
    range: 'Orders above ₦5,000',
    rate: '2%',
    example: '₦10,000 order → ₦200 platform fee, seller receives ₦9,800',
  },
];

const LISTING_RULES = [
  { label: 'Individual sellers', value: 'First 10 listings free per month, then standard fee applies' },
  { label: 'Premium sellers', value: 'Unlimited listings, priority placement, reduced transaction fee' },
  { label: 'Offer/Counter-offer', value: 'No additional fee — same transaction fee as Buy It Now' },
];

export default function AdminFeesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Platform Fees</h1>
        <p className="text-sm text-slate-500 mt-0.5">Current fee structure applied to all transactions</p>
      </div>

      {/* Transaction fees */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Transaction Fees</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEE_RULES.map((rule) => (
            <div key={rule.label} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{rule.label}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{rule.range}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{rule.rate}</p>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">{rule.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Listing rules */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Listing Allowances</h2>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {LISTING_RULES.map((rule) => (
              <div key={rule.label} className="px-5 py-4 flex items-start gap-4">
                <div className="w-36 shrink-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{rule.label}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{rule.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escrow / payout policy */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Payout Policy</h2>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p>Buyers and sellers settle payments privately. The platform records the transaction and tracks order status.</p>
          <p>Auto-release is triggered <strong className="text-slate-800 dark:text-slate-200">14 days</strong> after the order is marked delivered, if the buyer has not confirmed or opened a dispute.</p>
          <p>Disputes can be opened within <strong className="text-slate-800 dark:text-slate-200">30 days</strong> of delivery and are resolved within 7 business days.</p>
        </div>
      </div>

      <p className="text-xs text-slate-400">Fee configuration is managed in the codebase (<code className="font-mono">backend/src/config/constants.ts</code>). Contact your developer to update fee rates.</p>
    </div>
  );
}
