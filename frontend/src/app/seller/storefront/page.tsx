'use client';

import { SellerSidebar } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Store, Camera, Save, LayoutDashboard, ListChecks,
  Tag, ShoppingBag, BarChart3, DollarSign, Star,
  Zap, Settings, Plus, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';

export default function SellerStorefrontPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [tagline, setTagline] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (user && !initialized) {
      setDisplayName(user.profile.displayName ?? '');
      setBio(user.profile.bio ?? '');
      setLocation(user.profile.location ?? '');
      setInitialized(true);
    }
  }, [user, initialized]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({ displayName, bio, location });
      toast.success('Storefront updated');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />
          <main className="flex-1 min-w-0 space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Storefront</h1>
              {user && (
                <Button asChild variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  <Link href={`/shop/${user.username}` as Route} target="_blank">Preview</Link>
                </Button>
              )}
            </div>

            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-6 space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.profile.avatarUrl ?? `https://picsum.photos/seed/${user?.id ?? 'av'}/80/80`}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                />
                <div>
                  <Button variant="outline" size="sm" leftIcon={<Camera className="h-3.5 w-3.5" />}>
                    Change Photo
                  </Button>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP. Max 2 MB.</p>
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Shop / Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your shop name"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tagline <span className="text-slate-400 font-normal">(shown below your shop name)</span>
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Quality electronics at fair prices"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  About Your Shop
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell buyers about yourself, what you sell, and why they should shop with you..."
                />
                <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/500</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Lagos, Nigeria"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                leftIcon={<Save className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
