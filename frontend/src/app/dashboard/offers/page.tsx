'use client';

import { DashboardMobileNav } from '@/components/layout/DashboardNav';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Tag, Clock, ChevronRight, CheckCircle2, XCircle,
  RotateCcw, ArrowUpRight, Package, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatPostedAgo } from '@/lib/formatters';
import { offersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Offer, OfferStatus } from '@/types/order';

const STATUS_CONFIG: Record<OfferStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'destructive' | 'accent' }> = {
  pending:   { label: 'Pending',      variant: 'warning' },
  accepted:  { label: 'Accepted',     variant: 'success' },
  declined:  { label: 'Declined',     variant: 'destructive' },
  countered: { label: 'Counter Offer',variant: 'accent' },
  expired:   { label: 'Expired',      variant: 'default' },
  withdrawn: { label: 'Withdrawn',    variant: 'default' },
  completed: { label: 'Completed',    variant: 'success' },
};

const TABS: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'countered', label: 'Countered' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
  { key: 'expired', label: 'Expired' },
];

export default function BuyerOffersPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchOffers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await offersApi.getMyOffers('sent', activeTab as OfferStatus || undefined);
      setOffers(res.data);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, toast]);

  React.useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleWithdraw = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      await offersApi.withdraw(offerId);
      toast.success('Offer withdrawn');
      fetchOffers();
    } catch {
      toast.error('Failed to withdraw offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptCounter = async (offerId: string, counterAmount: number) => {
    setActionLoading(offerId);
    try {
      await offersApi.respondToCounter(offerId, 'accept');
      toast.success(`Counter offer of ${formatPrice(counterAmount)} accepted`);
      fetchOffers();
    } catch {
      toast.error('Failed to accept counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineCounter = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      await offersApi.respondToCounter(offerId, 'decline');
      toast.success('Counter offer declined');
      fetchOffers();
    } catch {
      toast.error('Failed to decline counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) return null;

  const coverImage = (offer: Offer): string => {
    const img = offer.listing?.coverImage;
    if (!img) return `https://picsum.photos/seed/${offer.listingId}/80/80`;
    if (typeof img === 'string') return img;
    return (img as { url?: string }).url ?? `https://picsum.photos/seed/${offer.listingId}/80/80`;
  };

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <DashboardMobileNav />
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">My Offers</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">My Offers</h1>
          <Button variant="outline" size="sm" onClick={fetchOffers} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Offers list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="h-14 w-14 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No offers found</p>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Browse listings and make an offer on something you like.
            </p>
            <Button asChild>
              <Link href="/search">Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => {
              const { label, variant } = STATUS_CONFIG[offer.status] ?? { label: offer.status, variant: 'default' as const };
              const isActive = actionLoading === offer.id;
              return (
                <div
                  key={offer.id}
                  className={cn(
                    'rounded-xl p-4 bg-white dark:bg-surface-dark',
                    'border border-slate-100 dark:border-slate-800 shadow-card',
                    'flex flex-col sm:flex-row gap-4'
                  )}
                >
                  {/* Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage(offer)}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover shrink-0 self-start"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <Link
                        href={`/listing/${offer.listingId}` as Route}
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors line-clamp-1"
                      >
                        {offer.listing?.title ?? 'Listing'}
                        <ArrowUpRight className="inline h-3.5 w-3.5 ml-0.5" />
                      </Link>
                      <Badge variant={variant}>{label}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                      <span className="text-slate-500">
                        Listed: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{formatPrice(offer.listing?.price ?? 0)}</span>
                      </span>
                      <span className="text-slate-500">
                        Your offer: <span className="font-mono font-semibold text-primary">{formatPrice(offer.amount)}</span>
                      </span>
                      {offer.counterAmount && (
                        <span className="text-slate-500">
                          Counter: <span className="font-mono font-semibold text-accent-dark">{formatPrice(offer.counterAmount)}</span>
                        </span>
                      )}
                    </div>

                    {offer.message && (
                      <p className="mt-1.5 text-sm text-slate-500 italic line-clamp-1">&ldquo;{offer.message}&rdquo;</p>
                    )}
                    {offer.counterMessage && (
                      <p className="mt-1 text-sm text-slate-500 italic line-clamp-1">Seller: &ldquo;{offer.counterMessage}&rdquo;</p>
                    )}

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {offer.status === 'pending' || offer.status === 'countered'
                          ? `Expires ${formatPostedAgo(offer.expiresAt)}`
                          : formatPostedAgo(offer.createdAt)}
                      </div>

                      <div className="flex gap-2">
                        {offer.status === 'countered' && offer.counterAmount && (
                          <>
                            <Button
                              size="sm"
                              disabled={isActive}
                              onClick={() => handleAcceptCounter(offer.id, offer.counterAmount!)}
                              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            >
                              Accept {formatPrice(offer.counterAmount)}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isActive}
                              onClick={() => handleDeclineCounter(offer.id)}
                              leftIcon={<XCircle className="h-3.5 w-3.5" />}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {offer.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isActive}
                            onClick={() => handleWithdraw(offer.id)}
                            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                          >
                            Withdraw
                          </Button>
                        )}
                        {offer.status === 'accepted' && !offer.orderId && (
                          <Link
                            href={`/listing/${offer.listingId}` as Route}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                          >
                            <Package className="h-3.5 w-3.5" />
                            View Listing
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
