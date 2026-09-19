'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I contact a seller?',
    a: 'Open any listing and tap "Contact Seller" — you can call them directly or start a WhatsApp chat with the listing already linked in the message. You can also message sellers inside Ashimarket from the listing page.',
  },
  {
    q: 'Is it free to post a listing?',
    a: 'Yes. Posting a listing on Ashimarket is free. Add photos, a title, description, price and location, and it goes live in under two minutes.',
  },
  {
    q: 'How do I pay for an item?',
    a: 'Payment is arranged directly between you and the seller — bank transfer, cash on collection, or whatever you both agree on. Ashimarket does not hold or process payments.',
  },
  {
    q: 'How do I make an offer on a listing?',
    a: 'On listings that accept offers, tap "Make an Offer", enter your amount and an optional note. The seller has 48 hours to accept, decline, or send a counter-offer.',
  },
  {
    q: 'How do I stay safe when buying or selling?',
    a: 'Meet in a public, well-lit place, inspect the item before paying, and never send money for something you have not seen. Look for the Verified Seller badge, and report any suspicious listing using the "Report" link on the listing page.',
  },
  {
    q: 'What if the item I received is not as described?',
    a: 'Open a dispute from your Order Details page within 30 days of delivery. Our team reviews the evidence from both sides and mediates a resolution.',
  },
  {
    q: 'Can I buy and sell with the same account?',
    a: 'Yes. Every account can buy, and you can activate selling at any time from your dashboard — no separate registration needed.',
  },
  {
    q: 'How do I edit or remove my listing?',
    a: 'Go to Seller Dashboard → My Listings, open the ⋯ menu on the listing, and choose Edit, Pause, or Delete.',
  },
];

export function HomepageFAQ() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4" aria-hidden="true">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Quick answers to the things buyers and sellers ask most.
            </p>
          </div>

          <Accordion.Root type="single" collapsible className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <Accordion.Item
                key={q}
                value={`faq-${i}`}
                className={cn(
                  'rounded-xl border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-surface-dark shadow-sm',
                  'data-[state=open]:border-primary/40 transition-colors'
                )}
              >
                <Accordion.Header asChild>
                  <h3>
                    <Accordion.Trigger
                      className={cn(
                        'group flex w-full items-center justify-between gap-4 px-5 py-4 text-left',
                        'text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100',
                        'rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                      )}
                    >
                      {q}
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    </Accordion.Trigger>
                  </h3>
                </Accordion.Header>
                <Accordion.Content
                  className={cn(
                    'overflow-hidden',
                    'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up'
                  )}
                >
                  <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {a}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          <div className="mt-8 text-center">
            <Link
              href={'/help' as Route}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Visit the Help Center
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
