import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ashimarket.com';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://ashimarket.com/api/v1';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  { url: `${BASE}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE}/safety`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
];

const CATEGORIES = [
  'automobiles', 'real-estate', 'electronics', 'clothing-accessories',
  'furniture-home', 'services', 'jobs-gigs', 'sports-outdoors',
  'books-media', 'toys-games', 'health-beauty', 'other',
];

async function fetchListings(): Promise<Array<{ id: string; updatedAt: string }>> {
  try {
    const res = await fetch(`${API}/listings?limit=500&status=active&fields=id,updatedAt`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? json.listings ?? []) as Array<{ id: string; updatedAt: string }>;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await fetchListings();

  const listingUrls: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE}/listing/${l.id}`,
    lastModified: new Date(l.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((slug) => ({
    url: `${BASE}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.85,
  }));

  return [...STATIC_PAGES, ...categoryUrls, ...listingUrls];
}
