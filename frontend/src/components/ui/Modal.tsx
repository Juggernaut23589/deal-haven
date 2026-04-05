'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Size Map ─────────────────────────────────────────────────────────────────

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-[95vw] h-[90vh]',
} as const;

type ModalSize = keyof typeof sizeClasses;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ModalProps {
  /** Controls open state. */
  open: boolean;
  /** Called when the modal should close (backdrop click, X button, Escape key). */
  onClose: () => void;
  /** Modal heading. */
  title?: React.ReactNode;
  /** Optional description shown below the title. */
  description?: React.ReactNode;
  /** Max-width size preset. */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the modal. @default true */
  closeOnBackdropClick?: boolean;
  /** Hides the close button in the top-right corner. */
  hideCloseButton?: boolean;
  /** Additional class applied to the modal panel. */
  className?: string;
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdropClick = true,
  hideCloseButton = false,
  className,
  children,
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm"
                onClick={closeOnBackdropClick ? onClose : undefined}
              />
            </Dialog.Overlay>

            {/* Panel */}
            <Dialog.Content
              asChild
              onPointerDownOutside={(e) => {
                if (!closeOnBackdropClick) e.preventDefault();
              }}
              onEscapeKeyDown={onClose}
            >
              <motion.div
                key="modal-panel"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'fixed left-1/2 top-1/2 z-modal w-full',
                  '-translate-x-1/2 -translate-y-1/2',
                  'rounded-modal bg-white shadow-xl',
                  'dark:bg-surface-dark dark:border dark:border-slate-700',
                  'focus:outline-none',
                  'flex flex-col max-h-[90vh]',
                  sizeClasses[size],
                  className
                )}
                aria-modal="true"
              >
                {/* Header */}
                {(title || !hideCloseButton) && (
                  <div className="flex items-start justify-between gap-4 p-6 pb-4 shrink-0">
                    <div className="flex-1 min-w-0">
                      {title && (
                        <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>

                    {!hideCloseButton && (
                      <Dialog.Close
                        className={cn(
                          'shrink-0 rounded-md p-1.5 text-slate-400',
                          'hover:bg-slate-100 hover:text-slate-600',
                          'dark:hover:bg-slate-800 dark:hover:text-slate-300',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-primary focus-visible:ring-offset-1',
                          'transition-colors duration-150',
                          '-mt-1 -mr-1'
                        )}
                        aria-label="Close dialog"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Dialog.Close>
                    )}
                  </div>
                )}

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 pb-6">
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ─── Modal Footer ─────────────────────────────────────────────────────────────

export function ModalFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4',
        'border-t border-slate-100 dark:border-slate-800',
        'bg-slate-50/50 dark:bg-slate-900/30',
        'rounded-b-modal shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Modal;
