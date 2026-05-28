import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ListingDetailClient from './ListingDetailClient';

type Props = { params: { id: string } };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://ashimarket.com/api/v1';
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ashimarket.com';

async function fetchListing(id: string) {
  try {
    const res = await fetch(`${API}/listings/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await fetchListing(params.id);
  if (!listing) return { title: 'Listing Not Found' };

  const title = `${listing.title} — ₦${Number(listing.price).toLocaleString()} | Ashimarket`;
  const description = listing.description
    ? listing.description.slice(0, 160).replace(/\s+/g, ' ').trim()
    : `Buy ${listing.title} on Ashimarket for ₦${Number(listing.price).toLocaleString()}. ${listing.condition ?? ''} condition.`;

  const coverImage = listing.images?.[0]?.url ?? `${BASE}/og-image.png`;
  const url = `${BASE}/listing/${params.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [{ url: coverImage, width: 1200, height: 630, alt: listing.title }],
      siteName: 'Ashimarket',
    },
    twitter: { card: 'summary_large_image', title, description, images: [coverImage] },
  };
}

export default async function ListingPage({ params }: Props) {
  const listing = await fetchListing(params.id);
  if (!listing) notFound();

  const conditionMap: Record<string, string> = {
    NEW: 'NewCondition',
    LIKE_NEW: 'LikeNewCondition',
    GOOD: 'UsedCondition',
    FAIR: 'UsedCondition',
    FOR_PARTS: 'DamagedCondition',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description ?? listing.title,
    image: (listing.images ?? []).map((img: { url: string }) => img.url),
    url: `${BASE}/listing/${params.id}`,
    sku: params.id,
    ...(listing.condition && {
      itemCondition: `https://schema.org/${conditionMap[listing.condition] ?? 'UsedCondition'}`,
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: listing.currency ?? 'NGN',
      price: listing.price,
      availability:
        listing.status === 'ACTIVE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${BASE}/listing/${params.id}`,
      seller: {
        '@type': 'Person',
        name: listing.seller?.displayName ?? listing.seller?.username ?? 'Seller',
      },
    },
    ...(listing.seller?.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: listing.seller.rating,
        reviewCount: listing.seller.reviewCount ?? 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingDetailClient id={params.id} />
    </>
  );
}
