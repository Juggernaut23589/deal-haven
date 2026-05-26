'use client';

import * as React from 'react';
import { NIGERIA_STATES, getLGAs } from '@/lib/nigeriaLocations';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  state: string;
  lga: string;
  onStateChange: (state: string) => void;
  onLgaChange: (lga: string) => void;
  className?: string;
  selectClassName?: string;
  stateLabel?: string;
  lgaLabel?: string;
  required?: boolean;
}

export function LocationPicker({
  state,
  lga,
  onStateChange,
  onLgaChange,
  className,
  selectClassName,
  stateLabel = 'State',
  lgaLabel = 'Local Government Area',
  required,
}: LocationPickerProps) {
  const lgas = getLGAs(state);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStateChange(e.target.value);
    onLgaChange('');
  };

  const baseSelect = cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm',
    'bg-white dark:bg-slate-900',
    'text-slate-900 dark:text-slate-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
    'transition-colors duration-150',
    'border-slate-200 dark:border-slate-700',
    selectClassName
  );

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {stateLabel}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
        <select
          value={state}
          onChange={handleStateChange}
          required={required}
          className={baseSelect}
          aria-label={stateLabel}
        >
          <option value="">Select state</option>
          {NIGERIA_STATES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {lgaLabel}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
        <select
          value={lga}
          onChange={(e) => onLgaChange(e.target.value)}
          disabled={!state}
          required={required}
          className={cn(baseSelect, !state && 'opacity-50 cursor-not-allowed')}
          aria-label={lgaLabel}
        >
          <option value="">{state ? 'Select LGA' : 'Select state first'}</option>
          {lgas.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
