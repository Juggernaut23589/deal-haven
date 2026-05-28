'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import {
  Package, ChevronRight, Truck, CheckCircle2, Clock, XCircle,
  AlertCircle, MapPin, Star, ShieldCheck, ExternalLink, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Order } from '@/types/order';

const ORDER_STEPS = [
  { keys: ['paid', 'pending_payment', 'payment_confirmed'], label: 'Order Placed', icon: CheckCircle2 },
  { keys: ['processing'], label: 'Processing', icon: Clock },
  { keys: ['shipped', 'in_transit'], label: 'Shipped', icon: Truck },
  { keys: ['delivered'], label: 'Delivered', icon: Package },
  { keys: ['completed'], label: 'Completed', icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
  return ORDER_STEPS.findIndex((s) => s.keys.includes(status));
}

export default function BuyerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [disputeOpen, setDisputeOpen] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [disputeData, setDisputeData] = React.useState({ reason: '', description: '' });
  const [isOpeningDispute, setIsOpeningDispute] = React.useState(false);

  React.useEffect(() => {
    ordersApi.get(params.id)
      .then(setOrder)
      .catch(() => toast.error('Order not found'))
      .finally(() => setIsLoading(false));
  }, [params.id, toast]);

  const handleConfirmDelivery = async () => {
    setIsConfirming(true);
    try {
      const updated = await ordersApi.confirmDelivery(params.id);
      setOrder(updated);
      setConfirmOpen(false);
      toast.success('Delivery confirmed — funds released to seller');
    } catch {
      toast.error('Failed to confirm delivery');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpeningDispute(true);
    try {
      await ordersApi.openDispute(params.id, disputeData);
      setDisputeOpen(false);
      toast.success('Dispute opened — our team will review within 7 days');
      const updated = await ordersApi.get(params.id);
      setOrder(updated);
    } catch {
      toast.error('Failed to open dispute');
    } finally {
      setIsOpeningDispute(false);
    }
  };

  if (authLoading) return null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Order not found</h1>
          <Link href={'/dashboard/orders' as Route}><Button className="mt-4">Back to Orders</Button></Link>
        </main>
        <Footer />
      </>
    );
  }

  const currentStepIdx = getStepIndex(order.status);
  const item = order.items?.[0];
  const sellerName = order.seller?.profile?.displayName ?? order.seller?.username ?? 'Seller';
  const canConfirm = order.status === 'delivered';
  const canDispute = ['shipped', 'delivered', 'completed'].includes(order.status) && order.status !== 'disputed';
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <Link href="/dashboard/orders" className="text-slate-500 hover:text-primary transition-colors">Orders</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium font-mono text-xs text-slate-900 dark:text-slate-100">{order.orderNumber}</span>
        </nav>

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Order {order.orderNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">Placed {formatDate(order.createdAt)}</p>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border',
            isCancelled ? 'bg-slate-100 text-slate-500 border-slate-200'
            : order.status === 'completed' || order.status === 'delivered' ? 'bg-success/10 text-success border-success/20'
            : order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
            : order.status === 'disputed' ? 'bg-error/10 text-error border-error/20'
            : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
          )}>
            {formatOrderStatus(order.status).label}
          </span>
        </div>

        {/* Progress tracker */}
        {!isCancelled && order.status !== 'disputed' && (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 mb-6 shadow-card">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStepIdx / (ORDER_STEPS.length - 1)) * 100)}%` }}
              />
              {ORDER_STEPS.map((step, i) => {
                const done = i <= currentStepIdx;
                const Icon = step.icon;
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors',
                      done ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 text-slate-400')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={cn('text-[11px] font-medium text-center hidden sm:block', done ? 'text-primary' : 'text-slate-400')}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Escrow notice */}
        {order.status !== 'completed' && !isCancelled && (
          <div className="flex items-start gap-3 rounded-xl bg-success/5 border border-success/20 px-4 py-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-success">Buyer Protection Active</span> — Your payment is held in escrow.
              Funds are only released to the seller after you confirm receipt.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Item */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Item</h2>
              {item && (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {item.listingImageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.listingImageUrl} alt={item.listingTitle ?? ''} className="h-full w-full object-cover" />
                      : <Package className="h-8 w-8 m-auto mt-4 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listing/${item.listingId}` as Route} className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors truncate block">
                      {item.listingTitle ?? 'Item'}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking */}
            {order.tracking && (
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 p-5">
                <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Shipping & Tracking
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Carrier</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{order.tracking.carrier}</span>
                  <span className="text-slate-500">Tracking #</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">{order.tracking.trackingNumber}</span>
                  {order.tracking.estimatedDelivery && (
                    <>
                      <span className="text-slate-500">Est. Delivery</span>
                      <span className="text-slate-900 dark:text-slate-100">{formatDate(order.tracking.estimatedDelivery)}</span>
                    </>
                  )}
                </div>
                {order.tracking.trackingUrl && (
                  <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline">
                    Track package <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            {(canConfirm || canDispute) && (
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card space-y-3">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</h2>
                {canConfirm && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Received your order?</p>
                      <p className="text-xs text-slate-500 mt-0.5">Confirm receipt to release funds to the seller.</p>
                    </div>
                    <Button size="sm" onClick={() => setConfirmOpen(true)}>Confirm Receipt</Button>
                  </div>
                )}
                {canDispute && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Problem with your order?</p>
                      <p className="text-xs text-slate-500 mt-0.5">Open a dispute if the item didn&apos;t arrive or isn&apos;t as described.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setDisputeOpen(true)} className="text-error border-error/30 hover:bg-error/5">
                      Open Dispute
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Seller */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Seller</h2>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{sellerName}</p>
              <p className="text-xs text-slate-500 mt-0.5">@{order.seller?.username}</p>
              <Link href={`/dashboard/messages?listing=${item?.listingId}` as Route} className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<MessageSquare className="h-3.5 w-3.5" />}>
                  Message Seller
                </Button>
              </Link>
              <Link href={`/shop/${order.seller?.username}` as Route} className="mt-2 block text-center text-xs text-primary hover:underline">
                View shop →
              </Link>
            </div>

            {/* Delivery address */}
            {order.shippingAddress && (
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Deliver To
                </h2>
                <address className="text-sm text-slate-700 dark:text-slate-300 not-italic space-y-0.5">
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                </address>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Order Summary</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
                )}
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Confirm receipt modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Receipt">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-success/5 border border-success/20 p-4">
            <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              By confirming receipt, you release the escrowed funds to the seller. Only do this if you&apos;ve received your item and are satisfied.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button isLoading={isConfirming} loadingText="Confirming…" onClick={() => void handleConfirmDelivery()}>
              Yes, I received it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispute modal */}
      <Modal open={disputeOpen} onClose={() => setDisputeOpen(false)} title="Open a Dispute">
        <form onSubmit={(e) => void handleOpenDispute(e)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Reason *</label>
            <select value={disputeData.reason} onChange={(e) => setDisputeData((p) => ({ ...p, reason: e.target.value }))} required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="">Select a reason</option>
              <option value="item_not_received">Item not received</option>
              <option value="item_not_as_described">Item not as described</option>
              <option value="item_damaged">Item arrived damaged</option>
              <option value="wrong_item_received">Wrong item received</option>
              <option value="counterfeit_item">Counterfeit / fake item</option>
              <option value="seller_did_not_ship">Seller did not ship</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Description *</label>
            <textarea
              value={disputeData.description}
              onChange={(e) => setDisputeData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe the issue in detail. Include any evidence you have."
              rows={4}
              required
              minLength={20}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setDisputeOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isOpeningDispute} loadingText="Submitting…" className="bg-error hover:bg-error/90">
              Open Dispute
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
