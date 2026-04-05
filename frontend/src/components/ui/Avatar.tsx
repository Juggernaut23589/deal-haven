import * as React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

// ─── Size Map ─────────────────────────────────────────────────────────────────

const sizeClasses = {
  xs: 'h-6 w-6 text-2xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
} as const;

const indicatorSizes = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
} as const;

export type AvatarSize = keyof typeof sizeClasses;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AvatarProps {
  /** URL of the avatar image. Falls back to initials if not provided or fails. */
  src?: string | null;
  /** Full name of the user, used to generate initials fallback. */
  name?: string;
  /** Alt text for the image. Defaults to name. */
  alt?: string;
  /** Avatar size preset. */
  size?: AvatarSize;
  /** Shows a green online indicator dot. */
  isOnline?: boolean;
  /** Content rendered as an overlay badge (e.g. verified checkmark). */
  badge?: React.ReactNode;
  /** Additional class for the root wrapper. */
  className?: string;
  /** Additional class for the fallback text. */
  fallbackClassName?: string;
}

// ─── Fallback Color from Name ─────────────────────────────────────────────────

const fallbackColors = [
  'bg-primary/20 text-primary-dark dark:bg-primary/30 dark:text-primary-light',
  'bg-accent/20 text-accent-dark dark:bg-accent/30',
  'bg-success/20 text-success-dark dark:bg-success/30',
  'bg-warning/20 text-warning-dark dark:bg-warning/30',
  'bg-error/20 text-error-dark dark:bg-error/30',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
];

function getColorForName(name: string): string {
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackColors[hash % fallbackColors.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      name = '',
      alt,
      size = 'md',
      isOnline,
      badge,
      className,
      fallbackClassName,
    },
    ref
  ) => {
    const initials = getInitials(name);
    const colorClass = getColorForName(name);

    return (
      <span
        ref={ref}
        className={cn('relative inline-flex shrink-0', className)}
      >
        <RadixAvatar.Root
          className={cn(
            'inline-flex items-center justify-center rounded-full overflow-hidden',
            'bg-slate-100 dark:bg-slate-800',
            'font-semibold select-none',
            sizeClasses[size]
          )}
        >
          {src && (
            <RadixAvatar.Image
              src={src}
              alt={alt ?? name}
              className="h-full w-full object-cover"
            />
          )}
          <RadixAvatar.Fallback
            delayMs={src ? 300 : 0}
            className={cn(
              'flex h-full w-full items-center justify-center rounded-full',
              colorClass,
              fallbackClassName
            )}
          >
            {initials}
          </RadixAvatar.Fallback>
        </RadixAvatar.Root>

        {/* Online indicator */}
        {isOnline && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full',
              'bg-success ring-2 ring-white dark:ring-slate-900',
              indicatorSizes[size]
            )}
            aria-label="Online"
          />
        )}

        {/* Badge overlay */}
        {badge && (
          <span className="absolute -bottom-1 -right-1">{badge}</span>
        )}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';

// ─── AvatarGroup ─────────────────────────────────────────────────────────────

export interface AvatarGroupProps {
  users: Array<{ src?: string | null; name?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  users,
  max = 4,
  size = 'sm',
  className,
}: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((user, i) => (
        <Avatar
          key={i}
          src={user.src}
          name={user.name}
          size={size}
          className="ring-2 ring-white dark:ring-slate-900"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
            'font-medium ring-2 ring-white dark:ring-slate-900 text-xs',
            sizeClasses[size]
          )}
          aria-label={`${overflow} more users`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

export { Avatar };
export default Avatar;
