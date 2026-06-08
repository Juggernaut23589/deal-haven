'use client';

import { SellerMobileNav } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Tag, ChevronRight, CheckCircle2, XCircle, MessageSquare,
  Clock, ArrowRight, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { formatPrice, formatPostedAgo } from '@/lib/formatters';
import { offersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Offer } from '@/types/order';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' },
  accepted:  { label: 'Accepted',  color: 'bg-success/10 text-success border-success/20' },
  declined:  { label: 'Declined',  color: 'bg-error/10 text-error border-error/20' },
  countered: { label: 'Countered', color: 'bg-primary/10 text-primary border-primary/20' },
  expired:   { label: 'Expired',   color: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
  withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
  completed: { label: 'Completed', color: 'bg-success/10 text-success border-success/20' },
};

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'countered', label: 'Countered' },
  { key: 'declined', label: 'Declined' },
  { key: 'expired', label: 'Expired' },
];

export default function SellerOffersPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('');
  const [actionOffer, setActionOffer] = React.useState<Offer | null>(null);
  const [counterAmount, setCounterAmount] = React.useState('');
  const [counterMessage, setCounterMessage] = React.useState('');
  const [isActing, setIsActing] = React.useState(false);

  const load = React.useCallback(() => {
    setIsLoading(true);
    offersApi.getMyOffers('received', activeTab as never || undefined, 1)
      .then((res) => setOffers(res.data ?? []))
      .catch(() => toast.error('Failed to load offers'))
      .finally(() => setIsLoading(false));
  }, [activeTab, toast]);

  React.useEffect(() => { load(); }, [load]);

  const respond = async (offerId: string, action: 'accept' | 'decline' | 'counter') => {
    setIsActing(true);
    try {
      await offersApi.respond(
        offerId, action,
        action === 'counter' ? parseFloat(counterAmount) : undefined,
        action === 'counter' ? counterMessage : undefined,
      );
      toast.success(`Offer ${action}ed successfully`);
      setActionOffer(null);
      setCounterAmount('');
      setCounterMessage('');
      load();
    } catch {
      toast.error('Action failed — try again');
    } finally {
      setIsActing(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <SellerMobileNav />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/seller" className="text-slate-500 hover:text-primary transition-colors">Seller Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Offers</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-6">Incoming Offers</h1>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.key ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden shadow-card">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Tag className="h-10 w-10" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No offers found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {offers.map((offer) => {
                const cfg = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
                const buyerName = offer.buyer?.profile?.displayName ?? offer.buyer?.username ?? 'Buyer';
                const isPending = offer.status === 'pending';
                const discount = offer.listing?.price
                  ? Math.round(((offer.listing.price - offer.amount) / offer.listing.price) * 100)
                  : 0;

                return (
                  <div key={offer.id} className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Listing image */}
                      <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {offer.listing?.coverImage
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={typeof offer.listing.coverImage === 'string' ? offer.listing.coverImage : (offer.listing.coverImage as { url: string })?.url ?? ''} alt={offer.listing.title} className="h-full w-full object-cover" />
                          : <Tag className="h-6 w-6 m-auto text-slate-300 mt-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <Link href={`/listing/${offer.listingId}` as Route} className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors truncate max-w-xs">
                            {offer.listing?.title ?? 'Listing'}
                          </Link>
                          <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.color)}>
                            {cfg.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 flex-wrap text-sm">
                          <span className="font-bold text-primary tabular-nums">{formatPrice(offer.amount)}</span>
                          {offer.listing?.price && (
                            <span className="text-slate-400 line-through tabular-nums">{formatPrice(offer.listing.price)}</span>
                          )}
                          {discount > 0 && (
                            <span className="text-xs text-error font-medium">-{discount}%</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Avatar src={offer.buyer?.profile?.avatarUrl} name={buyerName} size="xs" />
                            <span className="text-xs text-slate-500">{buyerName}</span>
                          </div>
                          <span className="text-xs text-slate-400">{formatPostedAgo(offer.createdAt)}</span>
                          {offer.expiresAt && isPending && (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <Clock className="h-3 w-3" />
                              Expires {formatPostedAgo(offer.expiresAt)}
                            </span>
                          )}
                        </div>

                        {offer.message && (
                          <p className="mt-2 text-xs text-slate-500 italic border-l-2 border-slate-200 dark:border-slate-700 pl-2">
                            &ldquo;{offer.message}&rdquo;
                          </p>
                        )}

                        {offer.counterAmount && (
                          <p className="mt-2 text-xs text-primary">
                            Your counter: {formatPrice(offer.counterAmount)}
                            {offer.counterMessage && <> &mdash; &ldquo;{offer.counterMessage}&rdquo;</>}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex gap-2 mt-3 pl-[4.5rem]">
                        <Button size="sm" onClick={() => void respond(offer.id, 'accept')} isLoading={isActing}
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setActionOffer(offer); setCounterAmount(String(Math.round(offer.amount * 1.1))); }}
                          leftIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                          Counter
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void respond(offer.id, 'decline')} isLoading={isActing}
                          leftIcon={<XCircle className="h-3.5 w-3.5" />} className="text-error hover:text-error">
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Counter offer modal */}
      <Modal
        open={!!actionOffer}
        onClose={() => { setActionOffer(null); setCounterAmount(''); setCounterMessage(''); }}
        title="Send Counter Offer"
      >
        {actionOffer && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm">
              <p className="text-slate-500">Buyer offered</p>
              <p className="text-lg font-bold text-primary tabular-nums">{formatPrice(actionOffer.amount)}</p>
              {actionOffer.listing?.price && (
                <p className="text-xs text-slate-400 mt-0.5">Listed at {formatPrice(actionOffer.listing.price)}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Your counter price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">₦</span>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="0"
                  min={1}
                  step={0.01}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Message (optional)</label>
              <textarea
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Add a note to your counter offer…"
                rows={3}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setActionOffer(null)}>Cancel</Button>
              <Button
                isLoading={isActing}
                loadingText="Sending…"
                disabled={!counterAmount || parseFloat(counterAmount) <= 0}
                onClick={() => void respond(actionOffer.id, 'counter')}
              >
                Send Counter
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
