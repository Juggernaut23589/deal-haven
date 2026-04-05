import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Car,
  Smartphone,
  Home,
  Shirt,
  Briefcase,
  Wrench,
  ArrowRight,
  Search,
  ShieldCheck,
  Lock,
  BadgeCheck,
  Headphones,
  Star,
  Package,
  CreditCard,
  TrendingUp,
  Info,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// ─── Static data for SSR sections ─────────────────────────────────────────────

const HERO_CATEGORIES: { label: string; href: Route; icon: React.ElementType }[] = [
  { label: 'Cars', href: '/category/automobiles' as Route, icon: Car },
  { label: 'Electronics', href: '/category/electronics' as Route, icon: Smartphone },
  { label: 'Real Estate', href: '/category/real-estate' as Route, icon: Home },
  { label: 'Fashion', href: '/category/clothing' as Route, icon: Shirt },
  { label: 'Services', href: '/category/services' as Route, icon: Wrench },
  { label: 'Jobs', href: '/category/jobs-gigs' as Route, icon: Briefcase },
];

const CATEGORIES_GRID: { label: string; href: Route; icon: string; count: string }[] = [
  { label: 'Automobiles', href: '/category/automobiles' as Route, icon: '🚗', count: '24.5K' },
  { label: 'Real Estate', href: '/category/real-estate' as Route, icon: '🏠', count: '8.2K' },
  { label: 'Electronics', href: '/category/electronics' as Route, icon: '📱', count: '31.8K' },
  { label: 'Clothing & Fashion', href: '/category/clothing' as Route, icon: '👗', count: '19.4K' },
  { label: 'Furniture & Home', href: '/category/furniture-home' as Route, icon: '🛋️', count: '12.1K' },
  { label: 'Services', href: '/category/services' as Route, icon: '🔧', count: '9.7K' },
  { label: 'Jobs & Gigs', href: '/category/jobs-gigs' as Route, icon: '💼', count: '5.3K' },
  { label: 'Sports & Outdoors', href: '/category/sports-outdoors' as Route, icon: '⚽', count: '7.6K' },
  { label: 'Books & Media', href: '/category/books-media' as Route, icon: '📚', count: '4.9K' },
  { label: 'Toys & Games', href: '/category/toys-games' as Route, icon: '🎮', count: '6.1K' },
  { label: 'Pet Supplies', href: '/category/pet-supplies' as Route, icon: '🐾', count: '3.4K' },
  { label: 'Collectibles & Art', href: '/category/collectibles-art' as Route, icon: '🎨', count: '2.8K' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Browse & Search',
    description:
      'Search millions of listings across every category. Use smart filters to find exactly what you need — locally or nationally.',
  },
  {
    step: '02',
    icon: TrendingUp,
    title: 'Make an Offer',
    description:
      'Like what you see? Make an offer, place a bid, or buy instantly. Our Deal Score shows you if the price is fair.',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Secure Payment',
    description:
      'Pay safely through our escrow system. Funds are held until you confirm receipt — your money is always protected.',
  },
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Buyer Protection',
    description: 'Full refund guarantee if your item doesn\'t arrive or isn\'t as described.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Funds held in escrow until delivery confirmed. Bank-level encryption.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Sellers',
    description: 'ID-verified sellers with performance ratings and badges you can trust.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dispute resolution team is here to help whenever you need us.',
  },
];

// ─── Mock top-rated sellers (would come from API in production) ───────────────

const TOP_SELLERS = [
  {
    id: '1',
    name: 'TechHub Store',
    username: 'techhub',
    avatar: 'https://i.pravatar.cc/80?img=11',
    rating: 4.9,
    sales: 1284,
    verified: true,
    specialty: 'Electronics',
  },
  {
    id: '2',
    name: 'AutoDeals Pro',
    username: 'autodeals',
    avatar: 'https://i.pravatar.cc/80?img=22',
    rating: 4.8,
    sales: 876,
    verified: true,
    specialty: 'Automobiles',
  },
  {
    id: '3',
    name: 'HomeStyle Boutique',
    username: 'homestyle',
    avatar: 'https://i.pravatar.cc/80?img=33',
    rating: 4.9,
    sales: 2104,
    verified: true,
    specialty: 'Furniture & Home',
  },
  {
    id: '4',
    name: 'FashionForward',
    username: 'fashionfwd',
    avatar: 'https://i.pravatar.cc/80?img=44',
    rating: 4.7,
    sales: 3450,
    verified: false,
    specialty: 'Clothing',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function HeroSearchBar() {
  return (
    <form
      action="/search"
      method="GET"
      className="relative flex w-full max-w-2xl"
      role="search"
      aria-label="Search all listings"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search for anything
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        id="hero-search"
        name="q"
        type="search"
        placeholder="Search for anything — cars, electronics, homes, services..."
        className={cn(
          'h-14 w-full rounded-l-xl border-0 pl-12 pr-4',
          'bg-white text-slate-900 placeholder:text-slate-400',
          'text-base shadow-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset'
        )}
      />
      <button
        type="submit"
        className={cn(
          'flex items-center gap-2 rounded-r-xl bg-accent px-6',
          'text-base font-semibold text-white whitespace-nowrap',
          'hover:bg-accent-dark active:bg-accent-dark',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset',
          'transition-colors duration-150 shadow-lg'
        )}
        aria-label="Search listings"
      >
        Search
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

function HeroStats() {
  const stats = [
    { value: '2M+', label: 'Listings' },
    { value: '500K+', label: 'Sellers' },
    { value: '$50M+', label: 'Saved' },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-6 sm:gap-10"
      role="list"
      aria-label="Platform statistics"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="text-center" role="listitem">
          <p className="text-2xl font-bold font-display text-white">{stat.value}</p>
          <p className="text-sm text-primary-200 mt-0.5" style={{ color: 'rgb(153 228 231)' }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function CategoryCard({
  icon,
  label,
  count,
  href,
}: {
  icon: string;
  label: string;
  count: string;
  href: Route;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-xl p-5',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card hover:shadow-card-hover',
        'hover:border-primary/30 dark:hover:border-primary/40',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
    >
      <span
        className="text-3xl group-hover:scale-110 transition-transform duration-200"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
          {label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{count} listings</p>
      </div>
    </Link>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel = 'View all',
  badge,
}: {
  title: string;
  subtitle?: string;
  href?: Route;
  hrefLabel?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            'flex items-center gap-1.5 shrink-0 text-sm font-medium text-primary',
            'hover:text-primary-dark dark:text-primary-light dark:hover:text-primary',
            'focus-visible:outline-none focus-visible:underline',
            'transition-colors duration-150'
          )}
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function DealScoreTooltip() {
  return (
    <span className="group relative inline-flex items-center">
      <Info
        className="h-4 w-4 text-slate-400 cursor-help"
        aria-label="What is Deal Score?"
        tabIndex={0}
      />
      <span
        role="tooltip"
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-tooltip',
          'w-56 rounded-lg bg-slate-900 dark:bg-slate-700 px-3 py-2',
          'text-xs text-white leading-relaxed',
          'opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100',
          'transition-opacity duration-150',
          'shadow-lg'
        )}
      >
        Deal Score is our AI analysis comparing each listing price against recent market data. A
        higher score = a better deal.
      </span>
    </span>
  );
}

function SellerCard({
  seller,
}: {
  seller: (typeof TOP_SELLERS)[number];
}) {
  return (
    <Link
      href={`/shop/${seller.username}` as Route}
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl p-6 text-center',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card hover:shadow-card-hover',
        'hover:border-primary/20',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
      aria-label={`View ${seller.name}'s shop`}
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={seller.avatar}
          alt={`${seller.name} avatar`}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
          loading="lazy"
        />
        {seller.verified && (
          <span
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs shadow-sm"
            aria-label="Verified seller"
            title="Verified Seller"
          >
            ✓
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{seller.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{seller.specialty}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          {seller.rating.toFixed(1)}
        </span>
        <span className="text-xs text-slate-400">
          · {seller.sales.toLocaleString()} sales
        </span>
      </div>
    </Link>
  );
}

// ─── Listing Sections (Client Islands) ────────────────────────────────────────
// These import client components for data-fetching portions.

import HomepageListingSections from './HomepageListingSections';

// Prevent static prerendering — the page includes client-only components (Navbar/stores).
export const dynamic = 'force-dynamic';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-[#0D7377] to-[#095456]"
          aria-label="Hero — search and discover deals"
        >
          {/* Decorative background pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex flex-col items-center text-center gap-8">
              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-[1.1]">
                  <span className="text-white">Find Amazing </span>
                  <span
                    className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent"
                    aria-label="Deals"
                  >
                    Deals.
                  </span>
                  <br />
                  <span className="text-white">Sell With Ease.</span>
                </h1>
                <p className="mx-auto max-w-xl text-lg text-primary-100" style={{ color: 'rgb(186 240 242)' }}>
                  Millions of listings, unbeatable prices. Join Deal Haven today.
                </p>
              </div>

              {/* Search bar */}
              <HeroSearchBar />

              {/* Quick category links */}
              <nav
                aria-label="Popular categories"
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {HERO_CATEGORIES.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-4 py-2',
                      'bg-white/15 hover:bg-white/25',
                      'text-sm font-medium text-white',
                      'border border-white/20',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </nav>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/search"
                  className={cn(
                    'flex items-center gap-2 rounded-xl bg-accent px-6 py-3',
                    'text-base font-semibold text-white shadow-lg',
                    'hover:bg-accent-dark transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                  )}
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/listing/create"
                  className={cn(
                    'flex items-center gap-2 rounded-xl border border-white/50 px-6 py-3',
                    'text-base font-semibold text-white',
                    'hover:bg-white/10 transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                  )}
                >
                  Sell an Item
                </Link>
              </div>

              {/* Stats */}
              <HeroStats />
            </div>
          </div>
        </section>

        {/* ── Categories Grid ────────────────────────────────────────────── */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16"
          aria-labelledby="categories-heading"
        >
          <SectionHeader
            title="Browse by Category"
            subtitle="Explore thousands of listings across every niche"
            href="/search"
            hrefLabel="View all categories"
          />
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            role="list"
            aria-label="Browse categories"
          >
            {CATEGORIES_GRID.map((cat) => (
              <div key={cat.href} role="listitem">
                <CategoryCard {...cat} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured Listings & Recently Added (Client island) ──────────── */}
        <HomepageListingSections />

        {/* ── How It Works ───────────────────────────────────────────────── */}
        <section
          className="bg-slate-50 dark:bg-slate-900/50 py-16"
          aria-labelledby="how-it-works-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                id="how-it-works-heading"
                className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100"
              >
                How Deal Haven Works
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Three simple steps from browsing to buying — safely and securely.
              </p>
            </div>

            <ol
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              aria-label="Steps to buy on Deal Haven"
            >
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
                <li
                  key={step}
                  className={cn(
                    'relative flex flex-col items-center text-center gap-4 rounded-2xl p-8',
                    'bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800',
                    'shadow-card'
                  )}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
                    aria-hidden="true"
                  >
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span
                    className="absolute top-4 right-4 text-5xl font-bold font-mono text-slate-100 dark:text-slate-800 select-none"
                    aria-hidden="true"
                  >
                    {step}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Top Rated Sellers ───────────────────────────────────────────── */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16"
          aria-labelledby="top-sellers-heading"
        >
          <SectionHeader
            title="Top Rated Sellers"
            subtitle="Shop with confidence from our most trusted and highly-rated sellers"
            href={"/search?verified=true" as Route}
            hrefLabel="Browse all sellers"
          />
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            role="list"
            aria-label="Top rated sellers"
          >
            {TOP_SELLERS.map((seller) => (
              <div key={seller.id} role="listitem">
                <SellerCard seller={seller} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust & Safety Banner ──────────────────────────────────────── */}
        <section
          className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-y border-primary/10"
          aria-labelledby="trust-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <h2
              id="trust-heading"
              className="sr-only"
            >
              Why shoppers trust Deal Haven
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-4"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category Spotlights (Client island) ──────────────────────── */}
        <HomepageCategorySpotlights />
      </main>

      <Footer />
    </>
  );
}

// ─── Category Spotlights placeholder (resolved by client island) ──────────────
import HomepageCategorySpotlights from './HomepageCategorySpotlights';
