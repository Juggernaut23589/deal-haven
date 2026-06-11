'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Camera, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { usersApi , getApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { DashboardMobileNav } from '@/components/layout/DashboardNav';

// ─── Schema ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores allowed'),
  displayName: z.string().min(1, 'Display name is required').max(100),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  phoneNumber: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [avatarSrc, setAvatarSrc] = React.useState<string | null | undefined>(undefined);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [serverError, setServerError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      displayName: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      bio: '',
      city: '',
      state: '',
    },
  });

  // Populate form once user data loads
  React.useEffect(() => {
    if (!user) return;
    setAvatarSrc(user.profile?.avatarUrl);
    reset({
      username: user.username ?? '',
      displayName: user.profile?.displayName ?? '',
      firstName: (user.profile as any)?.firstName ?? '',
      lastName: (user.profile as any)?.lastName ?? '',
      phoneNumber: (user as any).phoneNumber ?? '',
      bio: user.profile?.bio ?? '',
      city: (user.profile as any)?.city ?? '',
      state: (user.profile as any)?.state ?? '',
    });
  }, [user, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setServerError(null);
    setSaveStatus('saving');
    try {
      const updated = await usersApi.updateProfile({
        username: values.username,
        displayName: values.displayName,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        bio: values.bio,
        city: values.city,
        state: values.state,
      });
      updateUser(updated as any);
      reset(values); // mark form as not dirty
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: unknown) {
      setServerError(getApiError(err, 'Failed to save changes. Please try again.'));
      setSaveStatus('error');
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show preview immediately
    setAvatarSrc(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const result = await usersApi.uploadAvatar(file);
      setAvatarSrc(result.avatarUrl);
      updateUser({ profile: { ...user?.profile, avatarUrl: result.avatarUrl } } as any);
    } catch {
      setAvatarSrc(user?.profile?.avatarUrl ?? null);
      setServerError('Avatar upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  if (authLoading) return null;

  const inputCls = (hasError?: boolean) => cn(
    'h-10 w-full rounded-lg border px-3 text-sm',
    'bg-white dark:bg-slate-900',
    'text-slate-900 dark:text-slate-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
    'transition-colors duration-150',
    hasError
      ? 'border-error focus-visible:ring-error'
      : 'border-slate-200 dark:border-slate-700',
  );

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <DashboardMobileNav />
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Edit Profile</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-8">
          Edit Profile
        </h1>

        {/* Server error */}
        {serverError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-error mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-error">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                src={avatarSrc ?? undefined}
                name={user?.profile?.displayName ?? user?.username ?? 'User'}
                size="xl"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={avatarUploading}
                className={cn(
                  'absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center',
                  'rounded-full bg-primary text-white shadow-md',
                  'hover:bg-primary-dark transition-colors',
                  avatarUploading && 'opacity-60 cursor-wait',
                )}
                aria-label="Change avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={handleAvatarChange}
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Profile Photo</p>
              <p className="text-sm text-slate-500 mt-0.5">JPG, PNG, GIF, or WebP. Max 5MB.</p>
              {avatarUploading && (
                <p className="text-xs text-primary mt-1">Uploading…</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <div className="flex items-center">
              <span className="flex items-center h-10 px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500">
                @
              </span>
              <input
                id="username"
                type="text"
                autoComplete="username"
                aria-describedby={errors.username ? 'username-error' : undefined}
                aria-invalid={!!errors.username}
                {...register('username', { setValueAs: (v: string) => v.toLowerCase().trim() })}
                className={cn(inputCls(!!errors.username), 'rounded-l-none')}
              />
            </div>
            {errors.username && (
              <p id="username-error" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Name + email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name <span className="text-error">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                aria-invalid={!!errors.displayName}
                {...register('displayName')}
                className={inputCls(!!errors.displayName)}
              />
              {errors.displayName && (
                <p role="alert" className="mt-1.5 text-xs text-error">{errors.displayName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                className={cn(
                  'h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-slate-50 dark:bg-slate-800 px-3 text-sm',
                  'text-slate-500 dark:text-slate-400 cursor-not-allowed',
                )}
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed here.</p>
            </div>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                First Name
              </label>
              <input id="firstName" type="text" {...register('firstName')} className={inputCls()} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Last Name
              </label>
              <input id="lastName" type="text" {...register('lastName')} className={inputCls()} />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+234 800 000 0000"
                {...register('phoneNumber')}
                className={inputCls()}
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                City
              </label>
              <input id="city" type="text" placeholder="e.g. Lagos" {...register('city')} className={inputCls()} />
            </div>
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              State
            </label>
            <input id="state" type="text" placeholder="e.g. Lagos State" {...register('state')} className={inputCls()} />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              placeholder="Tell others about yourself…"
              {...register('bio')}
              className={cn(
                'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 px-3 py-2 text-sm',
                'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'resize-none',
              )}
            />
            {errors.bio && (
              <p role="alert" className="mt-1.5 text-xs text-error">{errors.bio.message}</p>
            )}
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Changes saved
              </span>
            )}
            <Button
              type="submit"
              isLoading={isSubmitting || saveStatus === 'saving'}
              loadingText="Saving…"
              disabled={isSubmitting || saveStatus === 'saving' || (!isDirty && saveStatus !== 'error')}
              leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
