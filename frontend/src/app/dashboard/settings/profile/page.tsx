'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, User, Camera, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export default function ProfileSettingsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <Link href="/dashboard/settings/profile" className="text-slate-500 hover:text-primary transition-colors">
            Settings
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Profile</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-8">
          Edit Profile
        </h1>

        <form
          onSubmit={(e) => { e.preventDefault(); }}
          className="space-y-8"
        >
          {/* Avatar section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                src={user?.profile.avatarUrl}
                name={user?.profile.displayName ?? 'User'}
                size="xl"
              />
              <button
                type="button"
                className={cn(
                  'absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center',
                  'rounded-full bg-primary text-white shadow-md',
                  'hover:bg-primary-dark transition-colors'
                )}
                aria-label="Change avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Profile Photo</p>
              <p className="text-sm text-slate-500 mt-0.5">JPG, PNG, or GIF. Max 5MB.</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                defaultValue={user?.profile.displayName ?? ''}
                className={cn(
                  'h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 px-3 text-sm',
                  'text-slate-900 dark:text-slate-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                defaultValue={user?.email ?? ''}
                className={cn(
                  'h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-slate-50 dark:bg-slate-800 px-3 text-sm',
                  'text-slate-500 dark:text-slate-400 cursor-not-allowed'
                )}
                disabled
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className={cn(
                  'h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 px-3 text-sm',
                  'text-slate-900 dark:text-slate-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="City, State"
                className={cn(
                  'h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 px-3 text-sm',
                  'text-slate-900 dark:text-slate-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              placeholder="Tell others about yourself..."
              className={cn(
                'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 px-3 py-2 text-sm',
                'text-slate-900 dark:text-slate-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'resize-none'
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Save Changes
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
