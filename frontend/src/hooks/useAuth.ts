'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/store/uiStore';
import { authApi, storeTokens, clearTokens } from '@/lib/api';
import type { LoginPayload, RegisterPayload } from '@/types/user';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Primary authentication hook for Deal Haven.
 *
 * Wraps the Zustand auth store with React Query for server-state hydration.
 * Call this hook wherever authentication state or auth actions are needed.
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading: isStoreLoading,
    setAuth,
    clearAuth,
    setLoading,
    updateUser,
  } = useAuthStore();

  // Track whether we've attempted to rehydrate to avoid duplicate calls
  const hasAttemptedRehydration = useRef(false);

  // ─── Rehydrate User from API ───────────────────────────────────────────────

  /**
   * When the app mounts with a stored access token but no user object,
   * we call /auth/me to restore the full user from the API.
   */
  const {
    data: rehydratedUser,
    isLoading: isMeLoading,
    isError: isMeError,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authApi.me(),
    // Only run if we have a token but no user
    enabled: !!accessToken && !user,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (rehydratedUser && accessToken) {
      setAuth(rehydratedUser, accessToken);
    }
  }, [rehydratedUser, accessToken, setAuth]);

  useEffect(() => {
    if (isMeError && accessToken) {
      // Token is invalid / expired and refresh failed
      clearAuth();
      clearTokens();
    }
  }, [isMeError, accessToken, clearAuth]);

  // ─── Listen for global unauthorized events ─────────────────────────────────

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
      clearTokens();
      queryClient.clear();
      router.push('/auth/login');
    };

    window.addEventListener('dh:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('dh:unauthorized', handleUnauthorized);
  }, [clearAuth, queryClient, router]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const login = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      setLoading(true);
      try {
        const result = await authApi.login(payload);
        storeTokens(result.tokens);
        setAuth(result.user, result.tokens.accessToken);
        queryClient.setQueryData(AUTH_QUERY_KEY, result.user);
        toast.success('Welcome back!', `Signed in as ${result.user.profile.displayName}`);

        // Redirect to dashboard or originally requested page
        const params = new URLSearchParams(window.location.search);
        const redirect = (params.get('redirect') ?? '/dashboard') as Route;
        router.push(redirect);
      } catch (error: unknown) {
        setLoading(false);
        const message =
          isAxiosError(error) && error.response?.data?.message
            ? String(error.response.data.message)
            : 'Invalid email or password. Please try again.';
        toast.error('Sign in failed', message);
        throw error;
      }
    },
    [setAuth, setLoading, queryClient, router, toast]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<void> => {
      setLoading(true);
      try {
        const result = await authApi.register(payload);
        storeTokens(result.tokens);
        setAuth(result.user, result.tokens.accessToken);
        queryClient.setQueryData(AUTH_QUERY_KEY, result.user);
        toast.success(
          'Account created!',
          'Welcome to Deal Haven. Please verify your email address.'
        );
        router.push('/dashboard');
      } catch (error: unknown) {
        setLoading(false);
        const message =
          isAxiosError(error) && error.response?.data?.message
            ? String(error.response.data.message)
            : 'Registration failed. Please try again.';
        toast.error('Registration failed', message);
        throw error;
      }
    },
    [setAuth, setLoading, queryClient, router, toast]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Swallow errors — we log out locally regardless
    } finally {
      clearAuth();
      clearTokens();
      queryClient.clear();
      router.push('/');
      toast.info('Signed out', 'You have been successfully signed out.');
    }
  }, [clearAuth, queryClient, router, toast]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const updated = await authApi.me();
      if (accessToken) {
        setAuth(updated, accessToken);
        queryClient.setQueryData(AUTH_QUERY_KEY, updated);
      }
    } catch {
      // Silent fail — user data stays as-is
    }
  }, [accessToken, setAuth, queryClient]);

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    user,
    isAuthenticated,
    isLoading: isStoreLoading || (!!accessToken && !user && isMeLoading),
    isSeller: user?.isSeller ?? false,
    isAdmin: user?.isAdmin ?? false,
    isModerator: user?.isModerator ?? false,
    login,
    logout,
    register,
    updateUser,
    refreshUser,
  };
}

// ─── Guard Hook ───────────────────────────────────────────────────────────────

/**
 * Redirects to login if the user is not authenticated.
 * Use inside page components that require auth.
 */
export function useRequireAuth(redirectTo: Route = '/auth/login'): ReturnType<typeof useAuth> {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const currentPath =
        typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      const redirectUrl = (currentPath
        ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        : redirectTo) as Route;
      router.replace(redirectUrl);
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo]);

  return auth;
}

/**
 * Redirects authenticated users away (e.g. from login/register pages).
 */
export function useRedirectIfAuthenticated(redirectTo: Route = '/dashboard'): void {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);
}

// ─── Type Guard ───────────────────────────────────────────────────────────────

function isAxiosError(
  error: unknown
): error is { response?: { data?: { message?: unknown }; status?: number } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}
