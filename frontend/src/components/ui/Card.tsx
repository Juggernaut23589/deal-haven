import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Removes default padding from all child sections. */
  noPadding?: boolean;
  /** Applies a hover elevation effect. */
  hoverable?: boolean;
  /** Makes the card visually flat (no shadow). */
  flat?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, noPadding, hoverable, flat, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-card bg-white dark:bg-surface-dark',
        !flat && 'shadow-card',
        hoverable && [
          'transition-shadow duration-200 cursor-pointer',
          'hover:shadow-card-hover',
        ],
        'border border-slate-100 dark:border-slate-800',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// ─── CardHeader ───────────────────────────────────────────────────────────────

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

// ─── CardTitle ────────────────────────────────────────────────────────────────

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

// ─── CardDescription ─────────────────────────────────────────────────────────

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// ─── CardContent ─────────────────────────────────────────────────────────────

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

// ─── CardFooter ───────────────────────────────────────────────────────────────

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aligns children to the right. */
  alignRight?: boolean;
  /** Adds a top border separator. */
  bordered?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, alignRight, bordered, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-0 gap-3',
        alignRight && 'justify-end',
        bordered && 'mt-2 pt-4 border-t border-slate-100 dark:border-slate-800',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// ─── CardBadge ────────────────────────────────────────────────────────────────

/** Positioned overlay badge, typically used in the top corner of a card. */
const CardBadge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('absolute top-2 left-2 z-10', className)}
      {...props}
    />
  )
);
CardBadge.displayName = 'CardBadge';

// ─── CardImage ────────────────────────────────────────────────────────────────

const CardImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative overflow-hidden rounded-t-card', className)}
      {...props}
    />
  )
);
CardImage.displayName = 'CardImage';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBadge,
  CardImage,
};
