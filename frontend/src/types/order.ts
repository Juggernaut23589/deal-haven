import type { ListingCard, ListingCondition } from './listing';
import type { PublicUser } from './user';

// ─── Order Enums ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed';

export type PaymentMethod =
  | 'card'
  | 'bank_transfer'
  | 'ashimarket_wallet'
  | 'paypal'
  | 'crypto';

export type EscrowStatus =
  | 'held'
  | 'released'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed';

// ─── Offer Enums ──────────────────────────────────────────────────────────────

export type OfferStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'countered'
  | 'expired'
  | 'withdrawn'
  | 'completed';

// ─── Dispute Enums ────────────────────────────────────────────────────────────

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'awaiting_buyer'
  | 'awaiting_seller'
  | 'resolved'
  | 'escalated'
  | 'closed';

export type DisputeReason =
  | 'item_not_received'
  | 'item_not_as_described'
  | 'item_damaged'
  | 'unauthorized_transaction'
  | 'seller_did_not_ship'
  | 'wrong_item_received'
  | 'counterfeit_item'
  | 'other';

export type DisputeResolution =
  | 'full_refund'
  | 'partial_refund'
  | 'no_refund'
  | 'return_for_refund'
  | 'replacement_sent';

// ─── Review & Notification Enums ─────────────────────────────────────────────

export type NotificationType =
  | 'new_message'
  | 'new_offer'
  | 'offer_accepted'
  | 'offer_declined'
  | 'offer_countered'
  | 'offer_expired'
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_completed'
  | 'order_cancelled'
  | 'payment_received'
  | 'funds_released'
  | 'new_review'
  | 'review_response'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'listing_expiring'
  | 'price_drop'
  | 'new_bid'
  | 'auction_won'
  | 'auction_outbid'
  | 'saved_search_match'
  | 'account_verified'
  | 'system';

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  currency: string;
  platformFee: number;
  sellerPayout: number;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  receiptUrl: string | null;
  failureReason: string | null;
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Escrow ───────────────────────────────────────────────────────────────────

export interface EscrowTransaction {
  id: string;
  orderId: string;
  paymentId: string;
  heldAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  status: EscrowStatus;
  heldAt: string;
  autoReleaseAt: string;
  releasedAt: string | null;
  refundedAt: string | null;
  releaseReason: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Order Item ───────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  orderId: string;
  listingId: string;
  listingTitle: string;
  listingImageUrl: string | null;
  listingSlug: string;
  variantId: string | null;
  variantTitle: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  condition: ListingCondition;
  sellerId: string;
}

// ─── Shipping Tracking ────────────────────────────────────────────────────────

export interface ShippingTracking {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string | null;
  shippedAt: string;
  estimatedDelivery: string | null;
  events: Array<{
    timestamp: string;
    location: string;
    description: string;
  }>;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyer: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  sellerId: string;
  seller: Pick<PublicUser, 'id' | 'username' | 'profile' | 'sellerProfile'>;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddressId: string | null;
  shippingAddress: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  shippingOptionId: string | null;
  shippingOptionName: string | null;
  tracking: ShippingTracking | null;
  payment: Payment | null;
  escrow: EscrowTransaction | null;
  notes: string | null;
  buyerConfirmedAt: string | null;
  sellerConfirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Offer ────────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  listingId: string;
  listing: Pick<ListingCard, 'id' | 'title' | 'coverImage' | 'price' | 'condition' | 'slug'>;
  buyerId: string;
  buyer: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  sellerId: string;
  seller: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  amount: number;
  message: string | null;
  status: OfferStatus;
  counterAmount: number | null;
  counterMessage: string | null;
  parentOfferId: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  withdrawnAt: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Dispute ─────────────────────────────────────────────────────────────────

export interface DisputeEvidence {
  id: string;
  submittedBy: 'buyer' | 'seller' | 'admin';
  type: 'text' | 'image' | 'document';
  content: string;
  fileUrl: string | null;
  submittedAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  order: Pick<Order, 'id' | 'orderNumber' | 'total' | 'items'>;
  buyerId: string;
  buyer: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  sellerId: string;
  seller: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  resolutionNote: string | null;
  refundAmount: number | null;
  assignedAdminId: string | null;
  evidence: DisputeEvidence[];
  buyerLastResponseAt: string | null;
  sellerLastResponseAt: string | null;
  resolvedAt: string | null;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  orderId: string;
  listingId: string;
  listingTitle: string;
  reviewerId: string;
  reviewer: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  revieweeId: string;
  reviewee: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  type: 'buyer_to_seller' | 'seller_to_buyer';
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  response: string | null;
  respondedAt: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl: string | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  userId: string;
  listingId: string;
  listing: ListingCard;
  addedAt: string;
  notifyOnPriceDrop: boolean;
  targetPrice: number | null;
}

// ─── Saved Search ─────────────────────────────────────────────────────────────

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  filters: Record<string, unknown>;
  alertEnabled: boolean;
  alertFrequency: 'instant' | 'daily' | 'weekly';
  lastAlertSentAt: string | null;
  newMatchCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Message / Conversation ───────────────────────────────────────────────────

export interface MessageAttachment {
  id: string;
  messageId: string;
  type: 'image' | 'file';
  url: string;
  filename: string;
  fileSize: number;
  mimeType: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  body: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt: string | null;
  offerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listing: Pick<ListingCard, 'id' | 'title' | 'coverImage' | 'price' | 'status' | 'slug'>;
  buyerId: string;
  buyer: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  sellerId: string;
  seller: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  lastMessage: Pick<Message, 'id' | 'body' | 'createdAt' | 'senderId'> | null;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
