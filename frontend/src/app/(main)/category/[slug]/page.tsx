'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import {
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Search,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useListings } from '@/hooks/useListings';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Animation variants ─────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Category metadata ──────────────────────────────────────────────────────

interface SubcategoryMeta {
  label: string;
  slug: string;
  image?: string;
}

interface CategoryMeta {
  label: string;
  icon: string;
  description: string;
  heroImage: string;
  heroGradient: string;
  subcategories: SubcategoryMeta[];
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  automobiles: {
    label: 'Automobiles',
    icon: '\u{1F697}',
    description: 'Browse cars, trucks, motorcycles, parts, and commercial vehicles.',
    heroImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&h=500&fit=crop',
    heroGradient: 'from-slate-900/80 via-slate-900/50 to-slate-900/20',
    subcategories: [
      { label: 'Cars & Trucks', slug: 'cars-trucks', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=260&fit=crop' },
      { label: 'Motorcycles', slug: 'motorcycles', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=260&fit=crop' },
      { label: 'Parts & Accessories', slug: 'parts-accessories', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=260&fit=crop' },
      { label: 'Commercial Vehicles', slug: 'commercial-vehicles', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=260&fit=crop' },
    ],
  },
  'real-estate': {
    label: 'Real Estate',
    icon: '\u{1F3E0}',
    description: 'Houses, apartments, land, commercial property, and rentals.',
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=500&fit=crop',
    heroGradient: 'from-emerald-900/80 via-emerald-900/50 to-emerald-900/10',
    subcategories: [
      { label: 'Houses for Sale', slug: 'houses-for-sale', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=260&fit=crop' },
      { label: 'Apartments / Condos', slug: 'apartments-condos', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=260&fit=crop' },
      { label: 'Land', slug: 'land', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=260&fit=crop' },
      { label: 'Commercial Property', slug: 'commercial-property', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=260&fit=crop' },
      { label: 'Rentals', slug: 'rentals', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop' },
    ],
  },
  electronics: {
    label: 'Electronics',
    icon: '\u{1F4F1}',
    description: 'Phones, computers, TVs, gaming, audio, cameras, and wearables.',
    heroImage: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&h=500&fit=crop',
    heroGradient: 'from-blue-900/80 via-blue-900/50 to-blue-900/10',
    subcategories: [
      { label: 'Phones & Tablets', slug: 'phones-tablets', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=260&fit=crop' },
      { label: 'Computers & Laptops', slug: 'computers-laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=260&fit=crop' },
      { label: 'TVs & Monitors', slug: 'tvs-monitors', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=260&fit=crop' },
      { label: 'Gaming', slug: 'gaming', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=260&fit=crop' },
      { label: 'Audio', slug: 'audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=260&fit=crop' },
      { label: 'Cameras', slug: 'cameras', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=260&fit=crop' },
      { label: 'Wearables', slug: 'wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=260&fit=crop' },
    ],
  },
  clothing: {
    label: 'Clothing & Accessories',
    icon: '\u{1F457}',
    description: 'Shop fashion, shoes, bags, jewelry, and accessories.',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=500&fit=crop',
    heroGradient: 'from-rose-900/80 via-rose-900/50 to-rose-900/10',
    subcategories: [
      { label: "Men's Clothing", slug: 'mens-clothing', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=260&fit=crop' },
      { label: "Women's Clothing", slug: 'womens-clothing', image: 'https://images.unsplash.com/photo-1558171813-01eda332a7e2?w=400&h=260&fit=crop' },
      { label: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=260&fit=crop' },
      { label: 'Bags & Luggage', slug: 'bags-luggage', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=260&fit=crop' },
      { label: 'Jewelry & Watches', slug: 'jewelry-watches', image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=260&fit=crop' },
      { label: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=260&fit=crop' },
    ],
  },
  'furniture-home': {
    label: 'Furniture & Home',
    icon: '\u{1F6CB}\u{FE0F}',
    description: 'Living room, bedroom, kitchen, office, outdoor, decor, and appliances.',
    heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&h=500&fit=crop',
    heroGradient: 'from-amber-900/80 via-amber-900/50 to-amber-900/10',
    subcategories: [
      { label: 'Living Room', slug: 'living-room', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=260&fit=crop' },
      { label: 'Bedroom', slug: 'bedroom', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=260&fit=crop' },
      { label: 'Kitchen & Dining', slug: 'kitchen-dining', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=260&fit=crop' },
      { label: 'Office', slug: 'office', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=260&fit=crop' },
      { label: 'Outdoor / Patio', slug: 'outdoor-patio', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=260&fit=crop' },
      { label: 'Home Decor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=260&fit=crop' },
      { label: 'Appliances', slug: 'appliances', image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=260&fit=crop' },
    ],
  },
  services: {
    label: 'Services',
    icon: '\u{1F527}',
    description: 'Home services, professional services, tech services, and more.',
    heroImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&h=500&fit=crop',
    heroGradient: 'from-teal-900/80 via-teal-900/50 to-teal-900/10',
    subcategories: [
      { label: 'Home Services', slug: 'home-services', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=260&fit=crop' },
      { label: 'Professional Services', slug: 'professional-services', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=260&fit=crop' },
      { label: 'Tech Services', slug: 'tech-services', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=260&fit=crop' },
      { label: 'Personal Services', slug: 'personal-services', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=260&fit=crop' },
    ],
  },
  'jobs-gigs': {
    label: 'Jobs & Gigs',
    icon: '\u{1F4BC}',
    description: 'Full-time, part-time, freelance, internships, and temporary positions.',
    heroImage: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1400&h=500&fit=crop',
    heroGradient: 'from-indigo-900/80 via-indigo-900/50 to-indigo-900/10',
    subcategories: [
      { label: 'Full-time', slug: 'full-time', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=260&fit=crop' },
      { label: 'Part-time', slug: 'part-time', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=260&fit=crop' },
      { label: 'Freelance', slug: 'freelance', image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=260&fit=crop' },
      { label: 'Internships', slug: 'internships', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=260&fit=crop' },
      { label: 'Temporary', slug: 'temporary', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=260&fit=crop' },
    ],
  },
  'sports-outdoors': {
    label: 'Sports & Outdoors',
    icon: '\u{26BD}',
    description: 'Sporting goods, fitness equipment, camping, and outdoor gear.',
    heroImage: 'https://images.unsplash.com/photo-1461896836934-bd45ba8a0281?w=1400&h=500&fit=crop',
    heroGradient: 'from-green-900/80 via-green-900/50 to-green-900/10',
    subcategories: [
      { label: 'Fitness Equipment', slug: 'fitness-equipment', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=260&fit=crop' },
      { label: 'Camping & Hiking', slug: 'camping-hiking', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=260&fit=crop' },
      { label: 'Team Sports', slug: 'team-sports', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=260&fit=crop' },
      { label: 'Cycling', slug: 'cycling', image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=260&fit=crop' },
      { label: 'Water Sports', slug: 'water-sports', image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=260&fit=crop' },
    ],
  },
  'books-media': {
    label: 'Books & Media',
    icon: '\u{1F4DA}',
    description: 'Books, movies, music, vinyl records, and digital media.',
    heroImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&h=500&fit=crop',
    heroGradient: 'from-orange-900/80 via-orange-900/50 to-orange-900/10',
    subcategories: [
      { label: 'Books', slug: 'books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=260&fit=crop' },
      { label: 'Movies & TV', slug: 'movies-tv', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=260&fit=crop' },
      { label: 'Music & Vinyl', slug: 'music-vinyl', image: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&h=260&fit=crop' },
      { label: 'Textbooks', slug: 'textbooks', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=260&fit=crop' },
    ],
  },
  'toys-games': {
    label: 'Toys & Games',
    icon: '\u{1F3AE}',
    description: 'Video games, board games, puzzles, toys, and hobby items.',
    heroImage: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1400&h=500&fit=crop',
    heroGradient: 'from-purple-900/80 via-purple-900/50 to-purple-900/10',
    subcategories: [
      { label: 'Video Games', slug: 'video-games', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=260&fit=crop' },
      { label: 'Board Games & Puzzles', slug: 'board-games', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=260&fit=crop' },
      { label: 'Action Figures & Dolls', slug: 'action-figures', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=260&fit=crop' },
      { label: 'Building Toys', slug: 'building-toys', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&h=260&fit=crop' },
    ],
  },
  'pet-supplies': {
    label: 'Pet Supplies',
    icon: '\u{1F43E}',
    description: 'Pet food, toys, accessories, grooming, and health products.',
    heroImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&h=500&fit=crop',
    heroGradient: 'from-cyan-900/80 via-cyan-900/50 to-cyan-900/10',
    subcategories: [
      { label: 'Dogs', slug: 'dogs', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=260&fit=crop' },
      { label: 'Cats', slug: 'cats', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=260&fit=crop' },
      { label: 'Fish & Aquariums', slug: 'fish-aquariums', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=260&fit=crop' },
      { label: 'Birds', slug: 'birds', image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=260&fit=crop' },
      { label: 'Small Animals', slug: 'small-animals', image: 'https://images.unsplash.com/photo-1425082661507-6af9db4c6f30?w=400&h=260&fit=crop' },
    ],
  },
  'collectibles-art': {
    label: 'Collectibles & Art',
    icon: '\u{1F3A8}',
    description: 'Fine art, antiques, coins, stamps, trading cards, and memorabilia.',
    heroImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1400&h=500&fit=crop',
    heroGradient: 'from-fuchsia-900/80 via-fuchsia-900/50 to-fuchsia-900/10',
    subcategories: [
      { label: 'Fine Art', slug: 'fine-art', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=260&fit=crop' },
      { label: 'Antiques', slug: 'antiques', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=260&fit=crop' },
      { label: 'Coins & Currency', slug: 'coins-currency', image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=260&fit=crop' },
      { label: 'Trading Cards', slug: 'trading-cards', image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=260&fit=crop' },
      { label: 'Memorabilia', slug: 'memorabilia', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=260&fit=crop' },
    ],
  },
};

// ─── Subcategory Card ────────────────────────────────────────────────────────

function SubcategoryCard({
  sub,
  slug,
}: {
  sub: SubcategoryMeta;
  slug: string;
}) {
  return (
    <Link
      href={`/search?category=${slug}&subcategory=${sub.slug}` as Route}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded-xl',
        'aspect-[3/2]',
        'shadow-card hover:shadow-card-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'transition-all duration-300',
      )}
    >
      {sub.image ? (
        <Image
          src={sub.image}
          alt={sub.label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 p-3 sm:p-4">
        <p className="text-sm sm:text-base font-semibold text-white drop-shadow-md">
          {sub.label}
        </p>
      </div>
      {/* Hover arrow */}
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
          <ArrowRight className="h-3 w-3 text-white" />
        </span>
      </div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const category = CATEGORY_MAP[slug];

  const { data, isLoading } = useListings({
    categorySlug: slug,
    limit: 24,
  });

  const listings = data?.listings ?? [];

  const subcatRef = React.useRef(null);
  const subcatInView = useInView(subcatRef, { once: true, margin: '-40px' });

  const listingsRef = React.useRef(null);
  const listingsInView = useInView(listingsRef, { once: true, margin: '-40px' });

  if (!category) {
    return (
      <>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-6xl mb-4" aria-hidden="true">
            {'\u{1F50D}'}
          </p>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">
            Category Not Found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            We couldn&apos;t find the category you&apos;re looking for.
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>

      <main className="min-h-screen">
        {/* ── Hero banner with full-bleed photo ──────────────────────────── */}
        <section className="relative h-56 sm:h-72 lg:h-80 overflow-hidden">
          <Image
            src={category.heroImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className={cn('absolute inset-0 bg-gradient-to-r', category.heroGradient)} />
          {/* Dark bottom fade for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end">
            {/* Breadcrumb */}
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-3">
                <Link
                  href="/"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
                <span className="font-medium text-white">
                  {category.label}
                </span>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white drop-shadow-lg">
                  {category.label}
                </h1>
                <p className="mt-2 text-base sm:text-lg text-white/80 max-w-2xl drop-shadow-sm">
                  {category.description}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Search bar for this category ────────────────────────────────── */}
        <div className="bg-white dark:bg-surface-dark border-b border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <form
              action="/search"
              method="GET"
              className="flex gap-2"
              role="search"
              aria-label={`Search ${category.label}`}
            >
              <input type="hidden" name="category" value={slug} />
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  name="q"
                  type="search"
                  placeholder={`Search in ${category.label}...`}
                  className={cn(
                    'h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700',
                    'bg-slate-50 dark:bg-slate-800 pl-10 pr-4 text-sm',
                    'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
                    'transition-colors'
                  )}
                />
              </div>
              <Button type="submit" size="default">
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* ── Subcategories as image cards ────────────────────────────────── */}
        <section
          ref={subcatRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
          aria-labelledby="subcategories-heading"
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              id="subcategories-heading"
              className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100"
            >
              Browse Subcategories
            </h2>
            <Link
              href={`/search?category=${slug}` as Route}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={subcatInView ? 'show' : 'hidden'}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          >
            {category.subcategories.map((sub) => (
              <motion.div key={sub.slug} variants={fadeUp}>
                <SubcategoryCard sub={sub} slug={slug} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Listings grid ──────────────────────────────────────────────── */}
        <section
          ref={listingsRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20"
          aria-labelledby="category-listings-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={listingsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2
                  id="category-listings-heading"
                  className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100"
                >
                  Latest in {category.label}
                </h2>
                {!isLoading && listings.length > 0 && (
                  <Badge variant="muted" size="sm">
                    {listings.length} listings
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/search?category=${slug}` as Route)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" aria-hidden="true" />
                All Filters
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <ListingGrid listings={listings} />
            ) : (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <div className="h-28 w-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                    <span className="text-5xl" aria-hidden="true">{category.icon}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No listings yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  Be the first to list something in {category.label}! Your listing could be the one everyone&apos;s looking for.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button asChild>
                    <Link href="/listing/create">
                      Create a Listing
                      <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/search">
                      Browse Other Categories
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
