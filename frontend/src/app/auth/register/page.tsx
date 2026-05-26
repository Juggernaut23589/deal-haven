'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShoppingBag,
  Store,
  Users,
  Eye,
  EyeOff,
  Tag,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth, useRedirectIfAuthenticated } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

// ─── Validation ───────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, _ and -'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreedToTerms: z
      .boolean()
      .refine((v) => v === true, 'You must agree to the Terms of Service'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type AccountType = 'buyer' | 'seller' | 'both';

// ─── Password Strength ────────────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(4, score);

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: '', color: '' },
    1: { label: 'Weak', color: 'bg-error' },
    2: { label: 'Fair', color: 'bg-warning' },
    3: { label: 'Good', color: 'bg-accent' },
    4: { label: 'Strong', color: 'bg-success' },
  };

  return { score, ...levels[score] };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1" aria-live="polite" aria-label={`Password strength: ${label}`}>
      <div className="flex gap-1" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i <= score ? color : 'bg-slate-200 dark:bg-slate-700'
            )}
          />
        ))}
      </div>
      {label && (
        <p className={cn('text-xs font-medium', {
          'text-error': score === 1,
          'text-warning': score === 2,
          'text-accent-dark': score === 3,
          'text-success': score === 4,
        })}>
          {label} password
        </p>
      )}
    </div>
  );
}

// ─── Account type cards ───────────────────────────────────────────────────────

const ACCOUNT_TYPES: {
  value: AccountType;
  title: string;
  description: string;
  icon: React.ElementType;
  perks: string[];
}[] = [
  {
    value: 'buyer',
    title: 'Buyer',
    description: 'Shop millions of listings with buyer protection.',
    icon: ShoppingBag,
    perks: ['Browse & buy listings', 'Make offers', 'Secure payments', 'Buyer protection'],
  },
  {
    value: 'seller',
    title: 'Seller',
    description: 'List your items and reach thousands of buyers.',
    icon: Store,
    perks: ['Create a storefront', 'List up to 10 items free', 'Earnings dashboard', 'Promoted listings'],
  },
  {
    value: 'both',
    title: 'Buyer & Seller',
    description: 'The full Ashimarket experience — buy and sell.',
    icon: Users,
    perks: ['Everything in Buyer', 'Everything in Seller', 'One unified dashboard'],
  },
];

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8" aria-label="Registration steps" role="list">
      {[
        { step: 1, label: 'Account type' },
        { step: 2, label: 'Your details' },
      ].map(({ step, label }) => (
        <React.Fragment key={step}>
          <div
            role="listitem"
            className="flex items-center gap-2"
            aria-current={current === step ? 'step' : undefined}
          >
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-colors',
                current === step
                  ? 'bg-primary text-white'
                  : current > step
                  ? 'bg-success text-white'
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
              )}
            >
              {current > step ? <CheckCircle2 className="h-4 w-4" /> : step}
            </div>
            <span
              className={cn(
                'text-sm font-medium hidden sm:block',
                current === step
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-400 dark:text-slate-600'
              )}
            >
              {label}
            </span>
          </div>
          {step < 2 && (
            <div
              className={cn(
                'flex-1 h-0.5 rounded-full transition-colors',
                current > step ? 'bg-success' : 'bg-slate-200 dark:bg-slate-700'
              )}
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  useRedirectIfAuthenticated('/dashboard');

  const { register: registerUser, isLoading } = useAuth();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [accountType, setAccountType] = React.useState<AccountType>('buyer');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        asSeller: accountType === 'seller' || accountType === 'both',
      });
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Registration failed. Please try again.';
      setServerError(msg);
    }
  };

  const isPending = isLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
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
          <div className="flex flex-col items-center gap-2 mb-6">
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
                Create your account
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Join millions of buyers and sellers on Ashimarket
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* ── Step 1: Account Type ─────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  I want to…
                </p>
                <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Account type">
                  {ACCOUNT_TYPES.map(({ value, title, description, icon: Icon, perks }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={accountType === value}
                      onClick={() => setAccountType(value)}
                      className={cn(
                        'flex items-start gap-4 rounded-xl border-2 p-4 text-left',
                        'transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        accountType === value
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          accountType === value
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {title}
                          </p>
                          {accountType === value && (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {description}
                        </p>
                        <ul className="mt-2 space-y-0.5">
                          {perks.map((perk) => (
                            <li
                              key={perk}
                              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
                            >
                              <span className="text-success" aria-hidden="true">✓</span>
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* ── Step 2: Details ────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-5 transition-colors focus-visible:outline-none focus-visible:underline"
                  aria-label="Back to account type selection"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </button>

                {/* Server error */}
                {serverError && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 px-4 py-3"
                  >
                    <AlertCircle className="h-4 w-4 text-error mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-sm text-error">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                        {...register('firstName')}
                        placeholder="Jane"
                        className={cn(
                          'w-full rounded-lg border px-3 py-2.5 text-sm',
                          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                          errors.firstName ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                        )}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" role="alert" className="mt-1 text-xs text-error">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                        {...register('lastName')}
                        placeholder="Doe"
                        className={cn(
                          'w-full rounded-lg border px-3 py-2.5 text-sm',
                          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                          errors.lastName ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                        )}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" role="alert" className="mt-1 text-xs text-error">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? 'username-error' : 'username-hint'}
                      {...register('username', {
                        setValueAs: (v: string) => v.toLowerCase().trim(),
                      })}
                      placeholder="janedoe123"
                      className={cn(
                        'w-full rounded-lg border px-3 py-2.5 text-sm',
                        'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                        errors.username ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                      )}
                    />
                    {errors.username ? (
                      <p id="username-error" role="alert" className="mt-1 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        {errors.username.message}
                      </p>
                    ) : (
                      <p id="username-hint" className="mt-1 text-xs text-slate-400">
                        This will be your public profile URL: ashimarket.com/shop/username
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'reg-email-error' : undefined}
                      {...register('email')}
                      placeholder="you@example.com"
                      className={cn(
                        'w-full rounded-lg border px-3 py-2.5 text-sm',
                        'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                        errors.email ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                      )}
                    />
                    {errors.email && (
                      <p id="reg-email-error" role="alert" className="mt-1 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'reg-password-error' : 'password-strength'}
                        {...register('password')}
                        placeholder="Min. 8 characters"
                        className={cn(
                          'w-full rounded-lg border px-3 py-2.5 pr-10 text-sm',
                          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                          errors.password ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password ? (
                      <p id="reg-password-error" role="alert" className="mt-1 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        {errors.password.message}
                      </p>
                    ) : (
                      <div id="password-strength">
                        <PasswordStrengthBar password={passwordValue} />
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                        {...register('confirmPassword')}
                        placeholder="Repeat your password"
                        className={cn(
                          'w-full rounded-lg border px-3 py-2.5 pr-10 text-sm',
                          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                          errors.confirmPassword ? 'border-error' : 'border-slate-200 dark:border-slate-700'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        aria-pressed={showConfirm}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p id="confirm-error" role="alert" className="mt-1 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('agreedToTerms')}
                        className="accent-primary h-4 w-4 mt-0.5 shrink-0"
                        aria-describedby={errors.agreedToTerms ? 'terms-error' : undefined}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        I agree to Ashimarket&apos;s{' '}
                        <Link href={"/terms" as Route} target="_blank" className="font-medium text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href={"/privacy" as Route} target="_blank" className="font-medium text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.agreedToTerms && (
                      <p id="terms-error" role="alert" className="mt-1 text-xs text-error flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        {errors.agreedToTerms.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isPending}
                    loadingText="Creating account..."
                    disabled={isPending}
                  >
                    Create Account
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
