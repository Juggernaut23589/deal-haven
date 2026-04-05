'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthenticatedUser } from '@/types/user';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: AuthenticatedUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthenticatedUser>) => void;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Store ────────────────────────────────────────────────────────────────────

/**
 * Zustand authentication store.
 *
 * The access token is persisted to localStorage for page reloads.
 * Sensitive user data is NOT stored in localStorage — only the token.
 * On mount the app should call `authApi.me()` to restore the full user object.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ─── State ─────────────────────────────────────────────────────────────
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ─── Actions ────────────────────────────────────────────────────────────

      /**
       * Called after a successful login / registration.
       * Stores the access token and sets the user in memory.
       */
      setAuth: (user: AuthenticatedUser, token: string) => {
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      /**
       * Clears all authentication state.
       * Called on logout or when the token refresh fails.
       */
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      /**
       * Merges a partial user update into the current user object.
       * Useful for profile edits without requiring a full re-fetch.
       */
      updateUser: (partial: Partial<AuthenticatedUser>) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...partial } });
      },

      /**
       * Sets the global loading state for auth operations.
       */
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'dh-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : sessionStorage
      ),
      /**
       * Only persist the access token, not the full user object.
       * The user is re-hydrated from the API on app start via useAuth().
       */
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
      /**
       * When rehydrating from storage, mark as not authenticated until
       * the /auth/me call succeeds and setAuth() is called.
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          // We have a token from storage but no user yet — isLoading
          // will be set to true by the useAuth hook until /me resolves.
          state.isAuthenticated = false;
          state.user = null;
        }
      },
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectAccessToken = (state: AuthStore) => state.accessToken;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectIsSeller = (state: AuthStore) => state.user?.isSeller ?? false;
export const selectIsAdmin = (state: AuthStore) => state.user?.isAdmin ?? false;
