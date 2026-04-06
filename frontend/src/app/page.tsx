import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Flame,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// ─── Static data ─────────────────────────────────────────────────────────────

const HERO_CATEGORIES: { label: string; href: Route; icon: React.ElementType }[] = [
  { label: 'Cars', href: '/category/automobiles' as Route, icon: Car },
  { label: 'Electronics', href: '/category/electronics' as Route, icon: Smartphone },
  { label: 'Real Estate', href: '/category/real-estate' as Route, icon: Home },
  { label: 'Fashion', href: '/category/clothing' as Route, icon: Shirt },
  { label: 'Services', href: '/category/services' as Route, icon: Wrench },
  { label: 'Jobs', href: '/category/jobs-gigs' as Route, icon: Briefcase },
];

/** Category cards with real Unsplash photos for visual richness */
const CATEGORIES_GRID: {
  label: string;
  href: Route;
  count: string;
  image: string;
  gradient: string;
}[] = [
  {
    label: 'Automobiles',
    href: '/category/automobiles' as Route,
    count: '24.5K',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop',
    gradient: 'from-slate-900/70 to-slate-900/30',
  },
  {
    label: 'Real Estate',
    href: '/category/real-estate' as Route,
    count: '8.2K',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    gradient: 'from-emerald-900/70 to-emerald-900/20',
  },
  {
    label: 'Electronics',
    href: '/category/electronics' as Route,
    count: '31.8K',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop',
    gradient: 'from-blue-900/70 to-blue-900/20',
  },
  {
    label: 'Clothing & Fashion',
    href: '/category/clothing' as Route,
    count: '19.4K',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    gradient: 'from-rose-900/70 to-rose-900/20',
  },
  {
    label: 'Furniture & Home',
    href: '/category/furniture-home' as Route,
    count: '12.1K',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    gradient: 'from-amber-900/70 to-amber-900/20',
  },
  {
    label: 'Services',
    href: '/category/services' as Route,
    count: '9.7K',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
    gradient: 'from-teal-900/70 to-teal-900/20',
  },
  {
    label: 'Jobs & Gigs',
    href: '/category/jobs-gigs' as Route,
    count: '5.3K',
    image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop',
    gradient: 'from-indigo-900/70 to-indigo-900/20',
  },
  {
    label: 'Sports & Outdoors',
    href: '/category/sports-outdoors' as Route,
    count: '7.6K',
    image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8a0281?w=400&h=300&fit=crop',
    gradient: 'from-green-900/70 to-green-900/20',
  },
  {
    label: 'Books & Media',
    href: '/category/books-media' as Route,
    count: '4.9K',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop',
    gradient: 'from-orange-900/70 to-orange-900/20',
  },
  {
    label: 'Toys & Games',
    href: '/category/toys-games' as Route,
    count: '6.1K',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop',
    gradient: 'from-purple-900/70 to-purple-900/20',
  },
  {
    label: 'Pet Supplies',
    href: '/category/pet-supplies' as Route,
    count: '3.4K',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    gradient: 'from-cyan-900/70 to-cyan-900/20',
  },
  {
    label: 'Collectibles & Art',
    href: '/category/collectibles-art' as Route,
    count: '2.8K',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
    gradient: 'from-fuchsia-900/70 to-fuchsia-900/20',
  },
];

/** Hero floating product images that give an instant "marketplace" feel */
const HERO_PRODUCTS = [
  { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', alt: 'Watch', rotate: '-6deg', top: '12%', left: '2%' },
  { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', alt: 'Headphones', rotate: '4deg', top: '55%', left: '5%' },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop', alt: 'Sneaker', rotate: '-3deg', top: '18%', right: '2%' },
  { src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop', alt: 'Camera', rotate: '5deg', top: '60%', right: '4%' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Browse & Search',
    description:
      'Search millions of listings across every category. Use smart filters to find exactly what you need — locally or nationally.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=260&fit=crop',
  },
  {
    step: '02',
    icon: TrendingUp,
    title: 'Make an Offer',
    description:
      'Like what you see? Make an offer, place a bid, or buy instantly. Our Deal Score shows you if the price is fair.',
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=260&fit=crop',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Secure Payment',
    description:
      'Pay safely through our escrow system. Funds are held until you confirm receipt — your money is always protected.',
    image: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400&h=260&fit=crop',
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
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=120&fit=crop',
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
    banner: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=120&fit=crop',
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
    banner: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=120&fit=crop',
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
    banner: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=120&fit=crop',
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
  label,
  count,
  href,
  image,
  gradient,
  index,
}: {
  label: string;
  count: string;
  href: Route;
  image: string;
  gradient: string;
  index: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded-xl',
        'aspect-[4/3] sm:aspect-[3/2]',
        'shadow-card hover:shadow-card-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'transition-all duration-300',
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Background image */}
      <Image
        src={image}
        alt={label}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
      />
      {/* Gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-t', gradient)} />
      {/* Content */}
      <div className="relative z-10 p-3 sm:p-4">
        <p className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md">
          {label}
        </p>
        <p className="text-xs text-white/70 mt-0.5">{count} listings</p>
      </div>
      {/* Hover arrow */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
          <ArrowRight className="h-3.5 w-3.5 text-white" />
        </span>
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
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
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

function SellerCard({
  seller,
}: {
  seller: (typeof TOP_SELLERS)[number];
}) {
  return (
    <Link
      href={`/shop/${seller.username}` as Route}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl',
        'bg-white dark:bg-surface-dark',
        'border border-slate-100 dark:border-slate-800',
        'shadow-card hover:shadow-card-hover',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
      aria-label={`View ${seller.name}'s shop`}
    >
      {/* Banner */}
      <div className="relative h-20 overflow-hidden">
        <Image
          src={seller.banner}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="300px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      {/* Avatar + info */}
      <div className="flex flex-col items-center -mt-7 pb-5 px-4">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={seller.avatar}
            alt={`${seller.name} avatar`}
            className="h-14 w-14 rounded-full object-cover ring-3 ring-white dark:ring-slate-900 shadow-md"
            loading="lazy"
          />
          {seller.verified && (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-2xs shadow-sm"
              aria-label="Verified seller"
              title="Verified Seller"
            >
              &#10003;
            </span>
          )}
        </div>
        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-2">{seller.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{seller.specialty}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            {seller.rating.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">
            &middot; {seller.sales.toLocaleString()} sales
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Trending product showcase — visual banner with real product images */
function TrendingBanner() {
  const products = [
    { src: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop', label: 'Nike Air Max', price: '$129', badge: 'Hot' },
    { src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop', label: 'MacBook Pro', price: '$1,899', badge: 'Deal' },
    { src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop', label: 'Gold Watch', price: '$349', badge: null },
    { src: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&h=300&fit=crop', label: 'Designer Bag', price: '$275', badge: 'New' },
    { src: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=300&h=300&fit=crop', label: 'Mountain Bike', price: '$899', badge: 'Hot' },
    { src: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop', label: 'Laptop Stand', price: '$49', badge: 'Deal' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-10">
      {/* Animated background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
            <Flame className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-xl font-bold font-display text-white">Trending Now</h2>
          <Badge variant="solid-accent" size="sm">
            <Zap className="h-3 w-3 mr-0.5" />
            Live
          </Badge>
        </div>

        {/* Scrolling product strip */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {products.map((p, i) => (
            <div
              key={i}
              className="group relative flex-shrink-0 w-40 sm:w-48"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-700">
                <Image
                  src={p.src}
                  alt={p.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {p.badge && (
                  <span className={cn(
                    'absolute top-2 left-2 px-2 py-0.5 rounded-full text-2xs font-bold text-white',
                    p.badge === 'Hot' ? 'bg-error/90' : p.badge === 'Deal' ? 'bg-accent/90' : 'bg-primary/90'
                  )}>
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3">
                <p className="text-sm font-medium text-white truncate drop-shadow-md">{p.label}</p>
                <p className="text-sm font-bold font-mono text-accent drop-shadow-md">{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Client Islands ──────────────────────────────��───────────────────────────
import HomepageListingSections from './HomepageListingSections';
import HomepageCategorySpotlights from './HomepageCategorySpotlights';
import { AnimatedHomeSections } from './AnimatedHomeSections';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* ── Hero ─────────────────────────���────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-[#0D7377] via-[#0a6163] to-[#062e30]"
          aria-label="Hero — search and discover deals"
        >
          {/* Decorative pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Floating product images — hidden on mobile for performance */}
          <div className="hidden lg:block pointer-events-none" aria-hidden="true">
            {HERO_PRODUCTS.map((p, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  top: p.top,
                  left: p.left,
                  right: p.right,
                  transform: `rotate(${p.rotate})`,
                  animationDelay: `${i * 1.2}s`,
                  animationDuration: `${6 + i * 0.8}s`,
                }}
              >
                <div className="h-24 w-24 xl:h-28 xl:w-28 overflow-hidden rounded-2xl shadow-2xl opacity-20 hover:opacity-40 transition-opacity duration-700">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={112}
                    height={112}
                    className="object-cover h-full w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
            <div className="flex flex-col items-center text-center gap-8">
              {/* Spark badge */}
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-white/90">Over 2 million listings &mdash; new deals every minute</span>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-display tracking-tight leading-[1.08]">
                  <span className="text-white">Find Amazing </span>
                  <span
                    className="bg-gradient-to-r from-accent to-[#fbbf24] bg-clip-text text-transparent"
                    aria-label="Deals"
                  >
                    Deals.
                  </span>
                  <br />
                  <span className="text-white">Sell With Ease.</span>
                </h1>
                <p className="mx-auto max-w-xl text-lg text-primary-100" style={{ color: 'rgb(186 240 242)' }}>
                  The marketplace where buyers save big and sellers thrive.
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
                      'transition-all duration-200 hover:scale-105',
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
                    'flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5',
                    'text-base font-semibold text-white shadow-lg shadow-accent/25',
                    'hover:bg-accent-dark hover:shadow-accent/40 hover:-translate-y-0.5',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                  )}
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/listing/create"
                  className={cn(
                    'flex items-center gap-2 rounded-xl border border-white/50 px-7 py-3.5',
                    'text-base font-semibold text-white',
                    'hover:bg-white/10 hover:-translate-y-0.5',
                    'transition-all duration-200',
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

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden" aria-hidden="true">
            <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full">
              <path d="M0 50L48 45C96 40 192 30 288 28C384 26 480 32 576 40C672 48 768 58 864 55C960 52 1056 36 1152 30C1248 24 1344 28 1392 30L1440 32V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" className="fill-background" />
            </svg>
          </div>
        </section>

        {/* ── Trending Now strip ─────────────────────────────────────────── */}
        <TrendingBanner />

        {/* ── Categories Grid ────────────────────────────────────────────── */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
          aria-labelledby="categories-heading"
        >
          <SectionHeader
            title="Browse by Category"
            subtitle="Explore thousands of listings across every niche"
            href="/search"
            hrefLabel="View all categories"
          />
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
            role="list"
            aria-label="Browse categories"
          >
            {CATEGORIES_GRID.map((cat, i) => (
              <div key={cat.href} role="listitem">
                <CategoryCard {...cat} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured Listings & Recently Added (Client island) ──────────── */}
        <HomepageListingSections />

        {/* ── How It Works ───────────────────────────────────────────────── */}
        <section
          className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20"
          aria-labelledby="how-it-works-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                id="how-it-works-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 dark:text-slate-100"
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
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, description, image }) => (
                <li
                  key={step}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-2xl',
                    'bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800',
                    'shadow-card hover:shadow-card-hover',
                    'transition-all duration-300',
                  )}
                >
                  {/* Step image */}
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-dark to-transparent" />
                    <span
                      className="absolute top-3 right-3 text-4xl font-bold font-mono text-white/30 select-none"
                      aria-hidden="true"
                    >
                      {step}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex flex-col items-center text-center gap-3 px-6 pb-8 -mt-6 relative z-10">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-sm"
                      aria-hidden="true"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Top Rated Sellers ────────────────────────────────��──────────── */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
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

        {/* ── Trust & Safety Banner ──────────────────────��───────────────── */}
        <section
          className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/5 dark:to-primary/10 border-y border-primary/10"
          aria-labelledby="trust-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <h2 id="trust-heading" className="sr-only">
              Why shoppers trust Deal Haven
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
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

        {/* ── Category Spotlights (Client island) ───────────────────────��� */}
        <HomepageCategorySpotlights />

        {/* ── Animated client sections (scroll reveals, counters, etc) ──── */}
        <AnimatedHomeSections />
      </main>

      <Footer />
    </>
  );
}
