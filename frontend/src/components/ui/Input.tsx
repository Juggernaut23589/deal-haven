'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label shown above the input. */
  label?: string;
  /** Helper text shown below the input. */
  helperText?: string;
  /** Error message; when provided the input enters the error state. */
  error?: string;
  /** Icon or element rendered on the left side inside the input. */
  leftIcon?: React.ReactNode;
  /** Icon or element rendered on the right side inside the input. */
  rightIcon?: React.ReactNode;
  /** Whether to show a character counter (requires maxLength). */
  showCharCount?: boolean;
  /** Additional class applied to the wrapper div. */
  wrapperClassName?: string;
  /** Additional class applied to the label element. */
  labelClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      labelClassName,
      type = 'text',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      showCharCount,
      id: providedId,
      maxLength,
      value,
      defaultValue,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Generate a stable id if one is not provided
    const generatedId = React.useId();
    const id = providedId ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = !!error;
    const charCount =
      showCharCount && maxLength !== undefined
        ? String(value ?? defaultValue ?? '').length
        : null;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-slate-700 dark:text-slate-300',
              disabled && 'opacity-60',
              labelClassName
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-error" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span
              className={cn(
                'pointer-events-none absolute left-3 flex items-center text-slate-400',
                hasError && 'text-error/70'
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : null, helperText ? helperId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={cn(
              // Base
              'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
              'text-slate-900 placeholder:text-slate-400',
              'transition-colors duration-150',
              // Focus
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0',
              'focus-visible:border-primary',
              // Dark mode
              'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
              // Default border
              'border-slate-200 dark:border-slate-700',
              // Error state
              hasError &&
                'border-error focus-visible:ring-error text-error dark:border-error/60',
              // Disabled
              disabled && 'cursor-not-allowed opacity-60 bg-slate-50 dark:bg-slate-800',
              // Icon padding
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <span
              className={cn(
                'absolute right-3 flex items-center text-slate-400',
                hasError && 'text-error/70'
              )}
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* Footer row: error / helper + char count */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {hasError ? (
              <p
                id={errorId}
                role="alert"
                className="text-xs text-error font-medium"
              >
                {error}
              </p>
            ) : helperText ? (
              <p
                id={helperId}
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                {helperText}
              </p>
            ) : null}
          </div>

          {charCount !== null && maxLength !== undefined && (
            <span
              className={cn(
                'shrink-0 text-xs tabular-nums',
                charCount >= maxLength
                  ? 'text-error font-medium'
                  : charCount >= maxLength * 0.85
                  ? 'text-warning'
                  : 'text-slate-400'
              )}
              aria-live="polite"
              aria-label={`${charCount} of ${maxLength} characters used`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
