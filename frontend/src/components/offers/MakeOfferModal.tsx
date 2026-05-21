'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, ChevronUp, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { offersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MakeOfferModalProps {
  /** Controls modal visibility. */
  open: boolean;
  /** Called when the modal should close. */
  onClose: () => void;
  /** The ID of the listing being offered on. */
  listingId: string;
  /** Display title of the listing. */
  listingTitle: string;
  /** Listed price of the item (used to compute quick-offer percentages). */
  listingPrice: number;
  /**
   * If provided, the modal is in counter-offer response mode.
   * Displays the counter amount and adjusts copy accordingly.
   */
  counterOfferId?: string;
  counterOfferAmount?: number;
  /** Called after a successful offer submission. */
  onSuccess?: (offerId: string) => void;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function buildSchema(listingPrice: number) {
  return z.object({
    amount: z
      .number({ invalid_type_error: 'Please enter a valid amount' })
      .min(1, 'Offer must be at least ₦1')
      .max(listingPrice * 0.99, `Offer must be less than the listed price (${formatPrice(listingPrice)})`)
      .refine(
        (v) => v > 0,
        'Offer amount must be greater than zero'
      ),
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  });
}

type OfferFormValues = {
  amount: number;
  message?: string;
};

// ─── Quick percentage buttons ──────────────────────────────────────────────────

const QUICK_PERCENTAGES = [
  { label: '-10%', pct: 0.9 },
  { label: '-20%', pct: 0.8 },
  { label: '-30%', pct: 0.7 },
] as const;

// ─── Explanation accordion ─────────────────────────────────────────────────────

function OfferExplanation() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3',
          'text-sm font-medium text-slate-600 dark:text-slate-400',
          'hover:bg-slate-50 dark:hover:bg-slate-800',
          'transition-colors duration-100',
          'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary'
        )}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
          What happens next?
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="explanation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5">
              {[
                {
                  icon: '📨',
                  text: 'Your offer is sent to the seller. They have 48 hours to respond.',
                },
                {
                  icon: '✅',
                  text: 'Seller can accept, decline, or counter your offer.',
                },
                {
                  icon: '⏱️',
                  text: 'Counter-offers expire after 24 hours if not responded to.',
                },
                {
                  icon: '💳',
                  text: 'No payment is taken until your offer is accepted and you confirm the purchase.',
                },
                {
                  icon: '🔒',
                  text: 'You may have up to 3 active offers on the same listing at once.',
                },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                  <span className="text-base shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MakeOfferModal({
  open,
  onClose,
  listingId,
  listingTitle,
  listingPrice,
  counterOfferId,
  counterOfferAmount,
  onSuccess,
}: MakeOfferModalProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedOfferId, setSubmittedOfferId] = React.useState<string | null>(null);

  const isCounter = !!counterOfferId;

  const schema = React.useMemo(() => buildSchema(listingPrice), [listingPrice]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: counterOfferAmount
        ? Math.round(counterOfferAmount)
        : Math.round(listingPrice * 0.9),
      message: '',
    },
  });

  const amountValue = watch('amount');
  const messageValue = watch('message', '');

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setSubmitted(false);
      setSubmittedOfferId(null);
      reset({
        amount: counterOfferAmount
          ? Math.round(counterOfferAmount)
          : Math.round(listingPrice * 0.9),
        message: '',
      });
    }
  }, [open, listingPrice, counterOfferAmount, reset]);

  const onSubmit = async (values: OfferFormValues) => {
    try {
      const result = isCounter && counterOfferId
        ? await offersApi.respond(
            counterOfferId,
            'counter',
            values.amount,
            values.message
          )
        : await offersApi.create(listingId, values.amount, values.message);

      setSubmittedOfferId(result.id);
      setSubmitted(true);
      toast.success(
        isCounter ? 'Counter sent!' : 'Offer sent!',
        `Your ${isCounter ? 'counter-offer' : 'offer'} of ${formatPrice(values.amount)} has been submitted.`
      );
      onSuccess?.(result.id);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Failed to send offer. Please try again.';
      toast.error('Offer failed', msg);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setSubmittedOfferId(null);
    }, 300);
  };

  const savingsAmount = listingPrice - (amountValue || 0);
  const savingsPct = listingPrice > 0 ? ((savingsAmount / listingPrice) * 100).toFixed(0) : '0';
  const isValidAmount =
    amountValue > 0 && amountValue < listingPrice && !errors.amount;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isCounter ? 'Respond to Counter Offer' : 'Make an Offer'}
      description={
        isCounter
          ? 'The seller countered. Submit your response below.'
          : 'Negotiate a price with the seller.'
      }
      size="md"
    >
      {submitted ? (
        // ── Success state ────────────────────────────────────────────────────
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isCounter ? 'Counter-offer sent!' : 'Offer submitted!'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your offer of{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-mono">
                {formatPrice(amountValue)}
              </strong>{' '}
              has been sent to the seller.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              The seller has 48 hours to respond. You&apos;ll be notified immediately.
            </p>
          </div>

          <div className="w-full mt-2">
            <ModalFooter className="border-0 bg-transparent p-0 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </ModalFooter>
          </div>
        </div>
      ) : (
        // ── Form state ───────────────────────────────────────────────────────
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Listing context */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Listing</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
              {listingTitle}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-slate-500">Listed price:</span>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {formatPrice(listingPrice)}
              </span>
            </div>
          </div>

          {/* Counter offer context */}
          {isCounter && counterOfferAmount && (
            <div className="rounded-lg bg-accent/5 border border-accent/20 px-4 py-3">
              <p className="text-xs font-semibold text-accent-dark mb-1">Seller&apos;s Counter Offer</p>
              <p className="text-xl font-bold font-mono tabular-nums text-accent-dark">
                {formatPrice(counterOfferAmount)}
              </p>
            </div>
          )}

          {/* Quick percentage buttons */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick select
            </p>
            <div
              className="flex gap-2"
              role="group"
              aria-label="Quick offer amount presets"
            >
              {QUICK_PERCENTAGES.map(({ label, pct }) => {
                const amount = Math.round(listingPrice * pct);
                const isSelected = amountValue === amount;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setValue('amount', amount, { shouldValidate: true })}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex flex-1 flex-col items-center rounded-lg border px-2 py-2.5 text-xs',
                      'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/50'
                    )}
                  >
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="font-mono tabular-nums">{formatPrice(amount)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Offer amount input */}
          <div>
            <label
              htmlFor="offer-amount"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Your offer amount
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium"
                aria-hidden="true"
              >
                $
              </span>
              <input
                id="offer-amount"
                type="number"
                min={1}
                max={listingPrice - 1}
                step={0.01}
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'}
                {...register('amount', { valueAsNumber: true })}
                className={cn(
                  'w-full rounded-lg border py-3 pl-7 pr-4 text-lg font-bold font-mono tabular-nums',
                  'bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                  'transition-colors duration-150',
                  errors.amount
                    ? 'border-error focus-visible:ring-error'
                    : 'border-slate-200 dark:border-slate-700'
                )}
                placeholder="0.00"
              />
            </div>

            {errors.amount ? (
              <p id="amount-error" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                {errors.amount.message}
              </p>
            ) : isValidAmount ? (
              <p
                id="amount-hint"
                className="mt-1.5 text-xs text-success flex items-center gap-1"
                aria-live="polite"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                You save {formatPrice(savingsAmount)} ({savingsPct}% off listed price)
              </p>
            ) : null}
          </div>

          {/* Message to seller */}
          <div>
            <label
              htmlFor="offer-message"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Message to seller{' '}
              <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="offer-message"
              rows={3}
              maxLength={500}
              aria-describedby="message-count"
              {...register('message')}
              placeholder="Hi, I'm interested in this item. Would you accept this price?"
              className={cn(
                'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 px-3 py-2.5 text-sm',
                'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'resize-none transition-colors duration-150'
              )}
            />
            <p
              id="message-count"
              className="mt-1 text-xs text-slate-400 text-right"
              aria-live="polite"
            >
              {(messageValue ?? '').length}/500
            </p>
          </div>

          {/* Explanation accordion */}
          <OfferExplanation />

          {/* Footer actions */}
          <ModalFooter className="border-0 bg-transparent p-0 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText="Sending offer..."
              disabled={isSubmitting || !isValidAmount}
            >
              {isCounter ? 'Send Counter Offer' : 'Send Offer'}
              {isValidAmount && !isSubmitting && (
                <span className="ml-1.5 text-xs font-normal opacity-80">
                  {formatPrice(amountValue)}
                </span>
              )}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}

export default MakeOfferModal;
