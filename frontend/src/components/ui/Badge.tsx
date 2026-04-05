import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ─── Variants ─────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full border font-medium',
    'transition-colors duration-150',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-primary/20 bg-primary/10 text-primary',
          'dark:border-primary/30 dark:bg-primary/20 dark:text-primary-light',
        ],
        secondary: [
          'border-secondary/20 bg-secondary/10 text-secondary-foreground',
          'dark:border-secondary/30',
        ],
        destructive: [
          'border-error/20 bg-error/10 text-error',
          'dark:border-error/30 dark:bg-error/20',
        ],
        outline: [
          'border-slate-200 bg-transparent text-slate-700',
          'dark:border-slate-700 dark:text-slate-300',
        ],
        success: [
          'border-success/20 bg-success/10 text-success-dark',
          'dark:border-success/30 dark:bg-success/20 dark:text-success-light',
        ],
        warning: [
          'border-warning/20 bg-warning/10 text-warning-dark',
          'dark:border-warning/30 dark:bg-warning/20 dark:text-warning-light',
        ],
        info: [
          'border-blue-200 bg-blue-50 text-blue-700',
          'dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        ],
        accent: [
          'border-accent/20 bg-accent/10 text-accent-dark',
          'dark:border-accent/30 dark:bg-accent/20',
        ],
        solid: [
          'border-transparent bg-primary text-white',
        ],
        'solid-accent': [
          'border-transparent bg-accent text-white',
        ],
        'solid-success': [
          'border-transparent bg-success text-white',
        ],
        'solid-destructive': [
          'border-transparent bg-error text-white',
        ],
        'solid-warning': [
          'border-transparent bg-warning text-white',
        ],
        muted: [
          'border-slate-200 bg-slate-100 text-slate-600',
          'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
        ],
      },
      size: {
        sm: 'px-1.5 py-0 text-2xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon rendered before the text. */
  icon?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {icon && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export default Badge;
