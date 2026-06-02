'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  ChevronRight, Package, Truck, CheckCircle2, Clock, XCircle,
  AlertCircle, MapPin, User, CreditCard, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '@/lib/formatters';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/store/uiStore';
import type { Order } from '@/types/order';

const ORDER_STEPS = [
  { keys: ['PENDING','pending','PAID','paid','payment_confirmed'], label: 'Order Received', icon: CheckCircle2 },
  { keys: ['PROCESSING','processing'], label: 'Processing', icon: Clock },
  { keys: ['SHIPPED','shipped','IN_TRANSIT','in_transit'], label: 'Shipped', icon: Truck },
  { keys: ['DELIVERED','delivered'], label: 'Delivered', icon: Package },
  { keys: ['COMPLETED','completed'], label: 'Completed', icon: CheckCircle2 },
];

const STATUS_ORDER = ['PENDING','pending','PAID','paid','PROCESSING','processing','SHIPPED','shipped','IN_TRANSIT','in_transit','DELIVERED','delivered','COMPLETED','completed'];

export default function SellerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showShipForm, setShowShipForm] = React.useState(false);
  const [shipData, setShipData] = React.useState({ carrier: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' });
  const [isShipping, setIsShipping] = React.useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = React.useState(false);

  React.useEffect(() => {
    ordersApi.get(params.id)
      .then(setOrder)
      .catch(() => toast.error('Order not found'))
      .finally(() => setIsLoading(false));
  }, [params.id, toast]);

  const handleConfirmPayment = async () => {
    setIsConfirmingPayment(true);
    try {
      const updated = await ordersApi.sellerConfirmPayment(params.id);
      setOrder(updated);
      toast.success('Payment confirmed — now ship the item');
    } catch {
      toast.error('Failed to confirm payment');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleShip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipData.carrier || !shipData.trackingNumber) return;
    setIsShipping(true);
    try {
      const updated = await ordersApi.ship(params.id, shipData);
      setOrder(updated);
      setShowShipForm(false);
      toast.success('Order marked as shipped');
    } catch {
      toast.error('Failed to update shipping');
    } finally {
      setIsShipping(false);
    }
  };

  if (authLoading) return null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
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
          <Link href={'/seller/orders' as Route}><Button className="mt-4">Back to Orders</Button></Link>
        </main>
        <Footer />
      </>
    );
  }

  const currentStepIdx = Math.max(0, ORDER_STEPS.findIndex((s) => s.keys.includes(order.status)));
  const item = order.items?.[0];
  const buyerName = order.buyer?.profile?.displayName ?? order.buyer?.username ?? 'Buyer';
  const canConfirmPayment = ['PENDING','pending'].includes(order.status);
  const canShip = ['PROCESSING','processing','PAID','payment_confirmed'].includes(order.status);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
          <Link href="/seller" className="text-slate-500 hover:text-primary transition-colors">Seller</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <Link href={"/seller/orders" as import("next").Route} className="text-slate-500 hover:text-primary transition-colors">Orders</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900 dark:text-slate-100 font-mono text-xs">{order.orderNumber}</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Order {order.orderNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">Placed {formatDate(order.createdAt)}</p>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border',
            order.status === 'completed' || order.status === 'delivered' ? 'bg-success/10 text-success border-success/20'
            : order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
            : order.status === 'disputed' ? 'bg-error/10 text-error border-error/20'
            : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
          )}>
            {formatOrderStatus(order.status).label}
          </span>
        </div>

        {/* Progress */}
        {!['cancelled', 'refunded', 'disputed'].includes(order.status) && (
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
                  <div key={step.keys[0]} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors', done ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 text-slate-400')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={cn('text-[11px] font-medium text-center hidden sm:block', done ? 'text-primary' : 'text-slate-400')}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Order Item</h2>
              {item && (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {item.listingImageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.listingImageUrl} alt={item.listingTitle ?? ''} className="h-full w-full object-cover" />
                      : <Package className="h-8 w-8 m-auto text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{item.listingTitle ?? 'Item'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm payment received */}
            {canConfirmPayment && (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
                  Confirm Payment Received
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Once the buyer has paid you privately, confirm it here to proceed to shipping.
                </p>
                <Button
                  size="sm"
                  onClick={() => void handleConfirmPayment()}
                  disabled={isConfirmingPayment}
                >
                  {isConfirmingPayment ? 'Confirming…' : 'I Have Received Payment'}
                </Button>
              </div>
            )}

            {/* Ship action */}
            {canShip && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      Mark as Shipped
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Enter tracking info once you&apos;ve dispatched this order.</p>
                  </div>
                  {!showShipForm && (
                    <Button size="sm" onClick={() => setShowShipForm(true)} leftIcon={<Truck className="h-3.5 w-3.5" />}>
                      Ship Now
                    </Button>
                  )}
                </div>

                {showShipForm && (
                  <form onSubmit={(e) => void handleShip(e)} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Carrier *</label>
                      <select value={shipData.carrier} onChange={(e) => setShipData((p) => ({ ...p, carrier: e.target.value }))} required
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <option value="">Select carrier</option>
                        <option value="GIG_LOGISTICS">GIG Logistics</option>
                        <option value="DHL">DHL</option>
                        <option value="REDSTAR_EXPRESS">Red Star Express</option>
                        <option value="NIPOST">NIPOST</option>
                        <option value="FEDEX">FedEx</option>
                        <option value="LOCAL_DELIVERY">Local Delivery / Hand Delivery</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Tracking Number *</label>
                      <input value={shipData.trackingNumber} onChange={(e) => setShipData((p) => ({ ...p, trackingNumber: e.target.value }))} required placeholder="e.g. GIG-1234567890"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Tracking URL</label>
                      <input value={shipData.trackingUrl} onChange={(e) => setShipData((p) => ({ ...p, trackingUrl: e.target.value }))} placeholder="https://…"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Est. Delivery Date</label>
                      <input type="date" value={shipData.estimatedDelivery} onChange={(e) => setShipData((p) => ({ ...p, estimatedDelivery: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                    </div>
                    <div className="sm:col-span-2 flex gap-2 justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowShipForm(false)}>Cancel</Button>
                      <Button type="submit" size="sm" isLoading={isShipping} loadingText="Saving…">Confirm Shipment</Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Tracking info if already shipped */}
            {order.tracking && (
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Shipping Info
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
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Buyer */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Buyer
              </h2>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{buyerName}</p>
              <p className="text-xs text-slate-500 mt-0.5">@{order.buyer?.username}</p>
              <Link href={`/dashboard/messages?user=${order.buyer?.id}` as Route} className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<MessageSquare className="h-3.5 w-3.5" />}>
                  Message Buyer
                </Button>
              </Link>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Ship To
                </h2>
                <address className="text-sm text-slate-700 dark:text-slate-300 not-italic space-y-0.5">
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                </address>
              </div>
            )}

            {/* Payment */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-5 shadow-card">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment
              </h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Platform fee</span><span className="text-error">-{formatPrice(order.platformFee)}</span></div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Your payout</span>
                  <span className="text-success">{formatPrice(order.total - order.platformFee)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
