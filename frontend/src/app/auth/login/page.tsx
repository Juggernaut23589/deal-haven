'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Tag, AlertCircle, Chrome } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useRedirectIfAuthenticated } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/store/uiStore';

// ─── Validation ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  useRedirectIfAuthenticated('/dashboard');

  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login({ email: values.email, password: values.password, rememberMe: values.rememberMe });
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Invalid email or password. Please try again.';
      setServerError(msg);
    }
  };

  const handleGoogleOAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/google`;
  };

  const isPending = isLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className={cn(
            'rounded-2xl p-8',
            'bg-white dark:bg-surface-dark',
            'border border-slate-100 dark:border-slate-800',
            'shadow-xl'
          )}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label="Ashimarket home"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-sm">
                <Tag className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Ashi<span className="text-primary">market</span>
              </span>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sign in to your Ashimarket account
              </p>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleOAuth}
            leftIcon={<Chrome className="h-4 w-4" />}
            type="button"
            aria-label="Continue with Google"
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative flex items-center mb-5">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" aria-hidden="true" />
            <span className="mx-3 text-xs font-medium text-slate-400 bg-white dark:bg-surface-dark px-1">
              or continue with email
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" aria-hidden="true" />
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className={cn(
                'mb-5 flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 px-4 py-3'
              )}
            >
              <AlertCircle className="h-4 w-4 text-error mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-error">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                {...register('email')}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-sm',
                  'bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                  'transition-colors duration-150',
                  errors.email
                    ? 'border-error focus-visible:ring-error'
                    : 'border-slate-200 dark:border-slate-700'
                )}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  href={"/auth/forgot-password" as Route}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                  {...register('password')}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 pr-10 text-sm',
                    'bg-white dark:bg-slate-900',
                    'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                    'transition-colors duration-150',
                    errors.password
                      ? 'border-error focus-visible:ring-error'
                      : 'border-slate-200 dark:border-slate-700'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2',
                    'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                    'focus-visible:outline-none'
                  )}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="accent-primary h-4 w-4 rounded"
                aria-label="Remember me"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Remember me for 30 days
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isPending}
              loadingText="Signing in..."
              disabled={isPending}
            >
              Sign In
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Create one for free
              </Link>
            </p>
            <Link
              href="/"
              className="block text-xs text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Continue as guest →
            </Link>
          </div>
        </div>

        {/* Legal */}
        <p className="mt-6 text-center text-xs text-slate-400">
          By signing in, you agree to our{' '}
          <Link href={"/terms" as Route} className="underline hover:text-primary">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href={"/privacy" as Route} className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
