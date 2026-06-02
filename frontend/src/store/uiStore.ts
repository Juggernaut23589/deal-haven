'use client';

import * as React from 'react';
import { create } from 'zustand';
import { generateId } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
  createdAt: number;
}

export interface SearchModalState {
  isOpen: boolean;
  initialQuery: string;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];

  // Search modal
  searchModal: SearchModalState;

  // Mobile nav drawer
  isMobileMenuOpen: boolean;

  // Global loading overlay (used for page transitions)
  isPageLoading: boolean;

  // Category mega menu
  isCategoryMenuOpen: boolean;
}

interface UIActions {
  // Toast actions
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Search modal
  openSearchModal: (initialQuery?: string) => void;
  closeSearchModal: () => void;

  // Mobile menu
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  // Category menu
  openCategoryMenu: () => void;
  closeCategoryMenu: () => void;
  toggleCategoryMenu: () => void;

  // Page loading
  setPageLoading: (loading: boolean) => void;
}

type UIStore = UIState & UIActions;

// ─── Default Durations by Type ────────────────────────────────────────────────

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────────────

  toasts: [],
  searchModal: { isOpen: false, initialQuery: '' },
  isMobileMenuOpen: false,
  isPageLoading: false,
  isCategoryMenuOpen: false,

  // ─── Toast Actions ────────────────────────────────────────────────────────

  /**
   * Adds a toast notification to the queue.
   * Returns the generated toast ID so callers can dismiss it programmatically.
   */
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ): string => {
    const id = generateId();
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration: duration ?? DEFAULT_DURATIONS[type],
      createdAt: Date.now(),
    };

    set((state) => ({
      // Cap at 5 simultaneous toasts, removing the oldest if needed
      toasts: [...state.toasts.slice(-4), toast],
    }));

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),

  // ─── Search Modal Actions ─────────────────────────────────────────────────

  openSearchModal: (initialQuery: string = '') => {
    set({ searchModal: { isOpen: true, initialQuery } });
  },

  closeSearchModal: () => {
    set({ searchModal: { isOpen: false, initialQuery: '' } });
  },

  // ─── Mobile Menu Actions ──────────────────────────────────────────────────

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // ─── Category Menu Actions ────────────────────────────────────────────────

  openCategoryMenu: () => set({ isCategoryMenuOpen: true }),
  closeCategoryMenu: () => set({ isCategoryMenuOpen: false }),
  toggleCategoryMenu: () =>
    set((state) => ({ isCategoryMenuOpen: !state.isCategoryMenuOpen })),

  // ─── Page Loading ─────────────────────────────────────────────────────────

  setPageLoading: (loading: boolean) => set({ isPageLoading: loading }),
}));

// ─── Convenience Selectors ────────────────────────────────────────────────────

export const selectToasts = (state: UIStore) => state.toasts;
export const selectSearchModal = (state: UIStore) => state.searchModal;
export const selectIsMobileMenuOpen = (state: UIStore) => state.isMobileMenuOpen;
export const selectIsPageLoading = (state: UIStore) => state.isPageLoading;

// ─── Convenience Hook ─────────────────────────────────────────────────────────

/**
 * Convenience hook that returns only the toast-related actions.
 * Prevents unnecessary re-renders from unrelated UI state changes.
 */
export function useToast() {
  const addToast = useUIStore((s) => s.addToast);
  const removeToast = useUIStore((s) => s.removeToast);

  // Memoize the toast object so its reference is stable across renders.
  // Without this, any useCallback/useEffect that lists `toast` as a
  // dependency triggers an infinite re-render loop because a new object
  // is created on every render even though the functions are equivalent.
  const toast = React.useMemo(
    () => ({
      success: (title: string, message?: string) => addToast('success', title, message),
      error: (title: string, message?: string) => addToast('error', title, message),
      warning: (title: string, message?: string) => addToast('warning', title, message),
      info: (title: string, message?: string) => addToast('info', title, message),
    }),
    [addToast],
  );

  return { toast, dismiss: removeToast };
}
