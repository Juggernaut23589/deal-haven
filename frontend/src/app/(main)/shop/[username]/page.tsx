'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, MapPin, Calendar, ShieldCheck, MessageSquare,
  Clock, Package, ArrowRight, Share2, BadgeCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { usersApi, messagesApi, listingsApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { PublicUser } from '@/types/user';
import type { ListingCard } from '@/types/listing';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&h=400&fit=crop';

function StatPill({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100/50 dark:border-slate-700/50">
      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

export default function ShopPage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  const { toast } = useToast();
  const username = params.username;

  const [seller, setSeller] = React.useState<PublicUser | null>(null);
  const [sellerLoading, setSellerLoading] = React.useState(true);
  const [listings, setListings] = React.useState<ListingCard[]>([]);
  const [listingsLoading, setListingsLoading] = React.useState(true);
  const [contactingLoading, setContactingLoading] = React.useState(false);

  React.useEffect(() => {
    setSellerLoading(true);
    usersApi.getPublicUser(username)
      .then((u) => {
        setSeller(u);
        return u;
      })
      .then(async (u) => {
        setListingsLoading(true);
        try {
          const res = await listingsApi.getSellerListings(u.id, 1, 24);
          setListings(res.data);
        } finally {
          setListingsLoading(false);
        }
      })
      .catch(() => { setSeller(null); setListingsLoading(false); })
      .finally(() => setSellerLoading(false));
  }, [username]);

  const handleContact = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (!seller) return;
    setContactingLoading(true);
    try {
      // Get or create a general conversation with this seller
      // We need any active listing from them — use first one if available
      const firstListing = listings[0];
      if (!firstListing) {
        toast.info('This seller has no active listings to message about');
        return;
      }
      await messagesApi.getOrCreateConversation(firstListing.id, seller.id);
      router.push(`/dashboard/messages?listing=${firstListing.id}&seller=${seller.id}` as Route);
    } catch {
      toast.error('Could not start conversation');
    } finally {
      setContactingLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const avatarUrl = seller?.profile.avatarUrl ?? `https://i.pravatar.cc/120?u=${username}`;
  const displayName = seller?.profile.displayName ?? username;
  const bio = seller?.profile.bio ?? 'Seller on Ashimarket.';
  const location = seller?.profile.location ?? '';
  const isVerified = seller?.sellerProfile?.isVerified ?? false;
  const isStarSeller = seller?.sellerProfile?.isStarSeller ?? false;
  const rating = seller?.sellerProfile?.rating ?? 0;
  const reviewCount = seller?.sellerProfile?.reviewCount ?? 0;
  const totalSales = seller?.sellerProfile?.totalSales ?? 0;
  const responseTime = seller?.sellerProfile?.responseTimeHours
    ? `Within ${seller.sellerProfile.responseTimeHours}h`
    : null;
  const memberSince = seller?.sellerProfile?.memberSince
    ? new Date(seller.sellerProfile.memberSince).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
    : seller?.memberSince
      ? new Date(seller.memberSince).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
      : null;

  return (
    <>
      <main className="min-h-screen">
        {/* Banner */}
        <section className="relative">
          <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
              src={DEFAULT_BANNER}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-5 sm:p-8 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-xl"
            >
              {sellerLoading ? (
                <div className="flex items-start gap-6">
                  <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              ) : !seller ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">Seller not found.</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/">Go Home</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg"
                    />
                    {isVerified && (
                      <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md" title="Verified Seller">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
                        {displayName}
                      </h1>
                      {isVerified && <Badge variant="success" size="sm">Verified</Badge>}
                      {isStarSeller && <Badge variant="accent" size="sm"><Star className="h-3 w-3 mr-1 fill-current" />Star Seller</Badge>}
                    </div>

                    <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl text-sm sm:text-base">{bio}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {rating > 0 && (
                        <StatPill icon={Star}>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{rating.toFixed(1)}</span>
                          <span className="text-slate-400">({reviewCount})</span>
                        </StatPill>
                      )}
                      {totalSales > 0 && (
                        <StatPill icon={Package}>{totalSales.toLocaleString('en-NG')} sales</StatPill>
                      )}
                      {location && <StatPill icon={MapPin}>{location}</StatPill>}
                      {memberSince && <StatPill icon={Calendar}>Since {memberSince}</StatPill>}
                      {responseTime && <StatPill icon={Clock}>{responseTime}</StatPill>}
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      {currentUser?.id !== seller.id && (
                        <Button
                          size="sm"
                          onClick={handleContact}
                          disabled={contactingLoading || listingsLoading}
                          leftIcon={<MessageSquare className="h-4 w-4" />}
                        >
                          {contactingLoading ? 'Opening…' : 'Contact Seller'}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleShare} leftIcon={<Share2 className="h-4 w-4" />}>
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Listings */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              Listings
              {!listingsLoading && listings.length > 0 && (
                <span className="ml-2 text-lg font-normal text-slate-400">({listings.length})</span>
              )}
            </h2>
          </div>

          {listingsLoading || sellerLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="space-y-2">
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
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No listings yet</p>
              <p className="text-slate-500 mb-6">This seller hasn&apos;t posted any listings yet.</p>
              <Button asChild variant="outline">
                <Link href="/">Browse Other Listings <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
