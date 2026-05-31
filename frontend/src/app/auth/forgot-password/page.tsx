'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowLeft, Mail } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch {
      // Always show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link
            href={'/auth/login' as Route}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-7 w-7 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm mb-6">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link href={'/auth/login' as Route} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Reset your password</h1>
              <p className="text-slate-500 text-sm mb-8">
                Enter the email address for your account and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
