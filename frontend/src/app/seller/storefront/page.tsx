'use client';

import { SellerSidebar } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Camera, Save, ExternalLink, Loader2 } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export default function SellerStorefrontPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();
  const { toast } = useToast();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [displayName, setDisplayName] = React.useState('');
  const [shopName, setShopName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [avatarSrc, setAvatarSrc] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user && !initialized) {
      setDisplayName(user.profile?.displayName ?? '');
      setShopName((user as { sellerProfile?: { shopName?: string } }).sellerProfile?.shopName ?? '');
      setBio(user.profile?.bio ?? '');
      setLocation(user.profile?.location ?? '');
      setInitialized(true);
    }
  }, [user, initialized]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('File too large', 'Maximum size is 2 MB.'); return; }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarSrc(objectUrl);

    setAvatarUploading(true);
    try {
      const res = await usersApi.uploadAvatar(file);
      updateUser({ profile: { ...user!.profile, avatarUrl: res.avatarUrl } } as never);
      toast.success('Photo updated');
    } catch {
      setAvatarSrc(null);
      toast.error('Failed to upload photo');
    } finally {
      setAvatarUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({
        displayName,
        bio,
        location,
        shopName: shopName || undefined,
      } as never);
      toast.success('Storefront updated', 'Your changes are live on your shop page.');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;

  const avatarUrl = avatarSrc ?? user?.profile?.avatarUrl
    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Shop')}&background=0D7377&color=fff&size=80`;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
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
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl} alt="Shop avatar" className="h-20 w-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700" />
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                    onChange={(e) => void handleAvatarChange(e)} aria-label="Upload avatar" />
                  <Button variant="outline" size="sm" leftIcon={<Camera className="h-3.5 w-3.5" />}
                    onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                    Change Photo
                  </Button>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP. Max 2 MB.</p>
                </div>
              </div>

              {/* Shop name (sellerProfile.shopName) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Shop Name <span className="text-xs font-normal text-slate-400">(shown on your storefront)</span>
                </label>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} maxLength={80}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Emeka's Electronics" />
              </div>

              {/* Display name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Name <span className="text-xs font-normal text-slate-400">(your public name)</span>
                </label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  About Your Shop
                </label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell buyers about yourself, what you sell, and why they should shop with you..." />
                <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/500</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Ikeja, Lagos" />
              </div>

              <Button onClick={() => void handleSave()} disabled={saving} isLoading={saving} loadingText="Saving…"
                leftIcon={!saving ? <Save className="h-4 w-4" /> : undefined} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
