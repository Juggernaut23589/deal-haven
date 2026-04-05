'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Variants ─────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'font-medium transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-white shadow-sm',
          'hover:bg-primary-dark active:bg-primary-dark',
          'dark:bg-primary dark:hover:bg-primary-dark',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground shadow-xs',
          'hover:bg-secondary/80',
        ],
        destructive: [
          'bg-error text-white shadow-xs',
          'hover:bg-error/dark active:bg-error/90',
        ],
        outline: [
          'border border-slate-200 bg-white text-slate-900 shadow-xs',
          'hover:bg-slate-50 hover:border-slate-300',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          'dark:hover:bg-slate-800',
        ],
        ghost: [
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
          'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        ],
        link: [
          'text-primary underline-offset-4 hover:underline',
          'dark:text-primary-light',
          'shadow-none',
        ],
        accent: [
          'bg-accent text-white shadow-sm',
          'hover:bg-accent-dark active:bg-accent-dark',
        ],
        success: [
          'bg-success text-white shadow-sm',
          'hover:bg-success-dark active:bg-success/90',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded',
        default: 'h-10 px-4 py-2 text-sm',
        lg: 'h-11 px-6 text-base rounded-lg',
        xl: 'h-12 px-8 text-base rounded-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** When true, renders the child element as the button (using Radix Slot). */
  asChild?: boolean;
  /** Shows a loading spinner and disables the button. */
  isLoading?: boolean;
  /** Loading text shown alongside the spinner. */
  loadingText?: string;
  /** Icon rendered before the button label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the button label. */
  rightIcon?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || isLoading;

    // When asChild is true we can't add extra children (spinner etc),
    // so we pass through without modification.
    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          disabled={isDisabled}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;
