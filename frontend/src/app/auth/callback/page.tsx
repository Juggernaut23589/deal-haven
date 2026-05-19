'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient, { storeTokens } from '@/lib/api';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Signing you in…</p>
    </div>
  </div>
);

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error || !accessToken || !refreshToken) {
      const msg = error === 'google_cancelled' ? '' : `?error=${encodeURIComponent(error ?? 'oauth_failed')}`;
      router.replace((`/auth/login${msg}`) as Parameters<typeof router.replace>[0]);
      return;
    }

    storeTokens({ accessToken, refreshToken, expiresIn: 0 });

    apiClient
      .get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => {
        const user = res.data;
        setAuth(user, accessToken);
        const isNew = searchParams.get('newUser') === 'true';
        router.replace(isNew ? '/dashboard/settings/profile' : '/dashboard');
      })
      .catch(() => {
        router.replace('/auth/login?error=oauth_failed');
      });
  }, [router, searchParams, setAuth]);

  return <Spinner />;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
