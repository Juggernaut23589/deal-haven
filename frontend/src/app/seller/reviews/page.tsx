'use client';

import { SellerSidebar } from '@/components/seller/SellerSidebar';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Star, ChevronRight, MessageSquare, RefreshCw,
  LayoutDashboard, ListChecks, Tag, ShoppingBag,
  BarChart3, DollarSign, Store, Zap, Settings, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';
import { reviewsApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Review } from '@/types/order';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn('h-4 w-4', s <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700')}
        />
      ))}
    </div>
  );
}

export default function SellerReviewsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [responseText, setResponseText] = React.useState<Record<string, string>>({});
  const [respondingTo, setRespondingTo] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState<string | null>(null);

  const fetchReviews = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await reviewsApi.getForSeller(user.id);
      setReviews(res.data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleRespond = async (reviewId: string) => {
    const text = responseText[reviewId]?.trim();
    if (!text) return;
    setSubmitting(reviewId);
    try {
      await reviewsApi.respond(reviewId, text);
      toast.success('Response posted');
      setRespondingTo(null);
      setResponseText((prev) => { const n = { ...prev }; delete n[reviewId]; return n; });
      fetchReviews();
    } catch {
      toast.error('Failed to post response');
    } finally {
      setSubmitting(null);
    }
  };

  if (authLoading) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <SellerSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Reviews</h1>
              <Button variant="outline" size="sm" onClick={fetchReviews} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Refresh
              </Button>
            </div>

            {/* Summary */}
            {!isLoading && reviews.length > 0 && (
              <div className="flex items-center gap-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-5">
                <div className="text-5xl font-bold font-mono text-slate-900 dark:text-slate-100">{avgRating}</div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={cn('h-5 w-5', s <= Math.round(parseFloat(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {/* Reviews list */}
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <Star className="h-14 w-14 text-slate-200 dark:text-slate-700 mb-4" />
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No reviews yet</p>
                <p className="text-sm text-slate-500 mt-1">Reviews appear here after buyers complete an order with you.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={review.reviewer.profile.avatarUrl ?? `https://picsum.photos/seed/${review.reviewerId}/40/40`}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {review.reviewer.profile.displayName}
                          </p>
                          <StarRating value={review.rating} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                        {review.isVerifiedPurchase && (
                          <Badge variant="success" size="sm">Verified Purchase</Badge>
                        )}
                      </div>
                    </div>

                    {review.title && (
                      <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">{review.title}</p>
                    )}
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.body}</p>

                    <p className="mt-2 text-xs text-slate-400">
                      For: <span className="text-slate-500">{review.listingTitle}</span>
                    </p>

                    {/* Seller response */}
                    {review.response ? (
                      <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border-l-4 border-primary">
                        <p className="text-xs font-semibold text-primary mb-1">Your response</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{review.response}</p>
                      </div>
                    ) : (
                      respondingTo === review.id ? (
                        <div className="mt-4 space-y-2">
                          <textarea
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                            placeholder="Write a public response..."
                            value={responseText[review.id] ?? ''}
                            onChange={(e) => setResponseText((p) => ({ ...p, [review.id]: e.target.value }))}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={submitting === review.id || !responseText[review.id]?.trim()}
                              onClick={() => handleRespond(review.id)}
                            >
                              Post Response
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setRespondingTo(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(review.id)}
                          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Respond to this review
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
