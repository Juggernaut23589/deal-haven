import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Props = { params: { slug: string }; children: ReactNode };

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  automobiles: { label: 'Automobiles', description: 'Buy and sell cars, trucks, motorcycles, and auto parts in Nigeria on Ashimarket.' },
  'real-estate': { label: 'Real Estate', description: 'Find houses, apartments, land, and commercial property for sale or rent in Nigeria.' },
  electronics: { label: 'Electronics', description: 'Shop phones, laptops, TVs, gaming consoles, and electronics at the best prices.' },
  'clothing-accessories': { label: 'Clothing & Accessories', description: 'Buy and sell fashion, clothing, shoes, and accessories for men, women, and kids.' },
  'furniture-home': { label: 'Furniture & Home', description: 'Discover furniture, home decor, appliances, and office equipment at great prices.' },
  services: { label: 'Services', description: 'Find local professionals for home services, tech support, tutoring, and more.' },
  'jobs-gigs': { label: 'Jobs & Gigs', description: 'Browse full-time, part-time, freelance, and contract opportunities across Nigeria.' },
  'sports-outdoors': { label: 'Sports & Outdoors', description: 'Shop sports equipment, gym gear, and outdoor adventure items on Ashimarket.' },
  'books-media': { label: 'Books & Media', description: 'Find books, music, movies, and educational materials at affordable prices.' },
  'toys-games': { label: 'Toys & Games', description: "Buy kids' toys, board games, and educational games for all ages." },
  'health-beauty': { label: 'Health & Beauty', description: 'Shop skincare, wellness products, and beauty items from trusted sellers.' },
  other: { label: 'Other', description: 'Browse all other categories on Ashimarket — something for everyone.' },
};

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const meta = CATEGORY_META[params.slug];
  const label = meta?.label ?? params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const description = meta?.description ?? `Browse ${label} listings on Ashimarket — Nigeria's modern marketplace.`;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ashimarket.com';
  const url = `${base}/category/${params.slug}`;

  return {
    title: `${label} for Sale in Nigeria | Ashimarket`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${label} for Sale in Nigeria | Ashimarket`,
      description,
      siteName: 'Ashimarket',
    },
    twitter: { card: 'summary_large_image', title: `${label} | Ashimarket`, description },
  };
}

export default function CategoryLayout({ children }: Props) {
  return <>{children}</>;
}
