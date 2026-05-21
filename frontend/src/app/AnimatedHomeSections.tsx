'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Download, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  React.useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Stagger container ───────────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── CTA / Download banner ───────────────────────────────────────────────────

function CTABanner() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-gradient-to-br from-[#0D7377] via-[#0a6163] to-[#062e30]',
          'px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20',
        )}
      >
        {/* Decorative image montage */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        {/* Radial glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text side */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white leading-tight">
              Ready to find your next great deal?
            </h2>
            <p className="mt-3 text-lg text-white/75 max-w-lg mx-auto lg:mx-0">
              Join millions of buyers and sellers on Ashimarket. Start shopping or list your first item in under 60 seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href="/auth/register"
                className={cn(
                  'flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5',
                  'text-base font-semibold text-white shadow-lg shadow-accent/25',
                  'hover:bg-accent-dark hover:-translate-y-0.5',
                  'transition-all duration-200'
                )}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search"
                className={cn(
                  'flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3.5',
                  'text-base font-semibold text-white',
                  'hover:bg-white/10 hover:-translate-y-0.5',
                  'transition-all duration-200'
                )}
              >
                Browse Deals
              </Link>
            </div>
          </div>

          {/* Stats side */}
          <div className="grid grid-cols-3 gap-6 lg:gap-8">
            {[
              { value: 2000000, suffix: '+', label: 'Active Listings' },
              { value: 500000, suffix: '+', label: 'Happy Buyers' },
              { value: 98, suffix: '%', label: 'Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold font-display text-white">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Testimonials / social proof strip ───────────────────────────────────────

function SocialProofStrip() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const testimonials = [
    {
      avatar: 'https://i.pravatar.cc/48?img=1',
      name: 'Jessica M.',
      text: 'Sold my car in 3 days! The escrow system made me feel totally safe.',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/48?img=3',
      name: 'Marcus T.',
      text: 'Found a MacBook Pro for ₦620,000 less than retail. Deal Score is a game changer.',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/48?img=5',
      name: 'Priya K.',
      text: 'The Make an Offer feature helped me negotiate the perfect price.',
      rating: 5,
    },
    {
      avatar: 'https://i.pravatar.cc/48?img=7',
      name: 'David L.',
      text: 'Best marketplace for finding local furniture deals. Love the map view!',
      rating: 5,
    },
  ];

  return (
    <section ref={ref} className="bg-slate-50 dark:bg-slate-900/30 py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Trusted by Thousands
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100 mt-2">
            What Our Community Says
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={cn(
                'relative flex flex-col gap-4 rounded-xl p-5',
                'bg-white dark:bg-surface-dark',
                'border border-slate-100 dark:border-slate-800',
                'shadow-card',
              )}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} className="h-4 w-4 fill-accent text-accent" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-9 w-9 rounded-full object-cover"
                  loading="lazy"
                />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export function AnimatedHomeSections() {
  return (
    <>
      <SocialProofStrip />
      <CTABanner />
    </>
  );
}
