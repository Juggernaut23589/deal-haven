'use client';

import * as React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore, type Toast, type ToastType } from '@/store/uiStore';

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ToastIcon: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles: Record<ToastType, string> = {
  success: 'border-success/20 bg-success/5 dark:bg-success/10',
  error: 'border-error/20 bg-error/5 dark:bg-error/10',
  warning: 'border-warning/20 bg-warning/5 dark:bg-warning/10',
  info: 'border-primary/20 bg-primary/5 dark:bg-primary/10',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-primary',
};

const progressStyles: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-primary',
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const Icon = ToastIcon[toast.type];

  React.useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <RadixToast.Root
      open
      onOpenChange={(open) => {
        if (!open) removeToast(toast.id);
      }}
      duration={toast.duration}
      asChild
    >
      <motion.li
        layout
        initial={{ opacity: 0, x: 48, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 48, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative flex w-full max-w-sm items-start gap-3',
          'rounded-lg border p-4 shadow-lg',
          'bg-white dark:bg-slate-900',
          toastStyles[toast.type],
          'overflow-hidden'
        )}
      >
        {/* Icon */}
        <Icon
          className={cn('mt-0.5 h-5 w-5 shrink-0', iconStyles[toast.type])}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 min-w-0 gap-0.5">
          <RadixToast.Title className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {toast.title}
          </RadixToast.Title>
          {toast.message && (
            <RadixToast.Description className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {toast.message}
            </RadixToast.Description>
          )}
        </div>

        {/* Close button */}
        <RadixToast.Close
          className={cn(
            'shrink-0 rounded p-0.5 text-slate-400',
            'hover:text-slate-600 dark:hover:text-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'transition-colors duration-100',
            '-mt-0.5 -mr-0.5'
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </RadixToast.Close>

        {/* Auto-dismiss progress bar */}
        <motion.div
          className={cn(
            'absolute bottom-0 left-0 h-0.5',
            progressStyles[toast.type]
          )}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          aria-hidden="true"
        />
      </motion.li>
    </RadixToast.Root>
  );
}

// ─── Toaster (viewport) ───────────────────────────────────────────────────────

/**
 * Renders the toast notification stack.
 * Mount this once in the root layout.
 */
export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <RadixToast.Provider swipeDirection="right">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>

      <RadixToast.Viewport
        className={cn(
          'fixed bottom-0 right-0 z-toast',
          'flex flex-col gap-2 p-4 sm:p-6',
          'w-full max-w-sm',
          'list-none outline-none',
          'pointer-events-none',
          '[&>*]:pointer-events-auto'
        )}
        aria-label="Notifications"
      />
    </RadixToast.Provider>
  );
}

export default Toaster;

// Re-export useToast for convenience
export { useToast } from '@/store/uiStore';
