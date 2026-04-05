# Deal Haven — Requirements Analysis Document
**Phase 1, Step 1.1**
**Date:** 2026-03-22
**Version:** 1.0

---

## 1. USER ROLES & PERMISSIONS

### 1.1 Role Definitions

| Role | Description |
|------|-------------|
| **Guest** | Unauthenticated visitor — browse/search only |
| **Buyer** | Authenticated user who purchases goods/services |
| **Seller** | Authenticated user who lists and sells goods/services |
| **Moderator** | Platform staff who reviews reports and enforces policies |
| **Admin** | Full platform control — all permissions |

> Note: A single user can be both Buyer and Seller simultaneously. Roles are flags, not exclusive states.

### 1.2 Permission Matrix

| Action | Guest | Buyer | Seller | Moderator | Admin |
|--------|-------|-------|--------|-----------|-------|
| Browse listings | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search listings | ✓ | ✓ | ✓ | ✓ | ✓ |
| View listing detail | ✓ | ✓ | ✓ | ✓ | ✓ |
| View seller storefront | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register account | ✓ | — | — | — | — |
| Create listing | — | — | ✓ | — | ✓ |
| Edit own listing | — | — | ✓ | — | ✓ |
| Delete own listing | — | — | ✓ | — | ✓ |
| Purchase (Buy Now) | — | ✓ | ✓ | — | — |
| Make offer | — | ✓ | ✓ | — | — |
| Respond to offer | — | — | ✓ | — | ✓ |
| Bid on auction | — | ✓ | ✓ | — | — |
| Message any user | — | ✓ | ✓ | ✓ | ✓ |
| Leave review (buyer→seller) | — | ✓* | — | — | — |
| Leave review (seller→buyer) | — | — | ✓* | — | — |
| Add to wishlist | — | ✓ | ✓ | — | — |
| Save search | — | ✓ | ✓ | — | — |
| Report listing/user | — | ✓ | ✓ | — | — |
| Open dispute | — | ✓* | — | — | — |
| View own dashboard | — | ✓ | ✓ | — | — |
| View seller analytics | — | — | ✓ | — | ✓ |
| Moderate reports | — | — | — | ✓ | ✓ |
| Suspend users | — | — | — | ✓ | ✓ |
| Remove listings | — | — | — | ✓ | ✓ |
| Resolve disputes | — | — | — | ✓ | ✓ |
| Manage categories | — | — | — | — | ✓ |
| Configure fees | — | — | — | — | ✓ |
| View platform analytics | — | — | — | ✓ | ✓ |
| Manage all users | — | — | — | — | ✓ |
| Access admin dashboard | — | — | — | ✓ | ✓ |

*With restrictions (e.g., only after completed transaction, within time window)

---

## 2. USER STORIES

### 2.1 Guest Stories
- As a guest, I can browse listings by category so I can find items of interest
- As a guest, I can search for listings by keyword so I can find specific items
- As a guest, I can view a listing's full details (images, description, price, seller) so I can evaluate it
- As a guest, I can view a seller's public storefront so I can assess their reputation
- As a guest, I am prompted to register/login when attempting restricted actions so I understand what's needed
- As a guest, I can register as a buyer or seller so I can access the platform

### 2.2 Buyer Stories
- As a buyer, I can search with advanced filters (price range, condition, location, category-specific) so I find exactly what I want
- As a buyer, I can save searches and receive alerts when new matching listings appear so I don't miss deals
- As a buyer, I can add listings to my wishlist and receive price drop notifications so I can buy at the right time
- As a buyer, I can purchase a listing immediately at the listed price (Buy Now) so I can secure it instantly
- As a buyer, I can submit an offer below the listed price so I can negotiate
- As a buyer, I can counter a seller's counter-offer so negotiation continues
- As a buyer, I can bid on auction listings so I can win items competitively
- As a buyer, I can message a seller directly about a listing so I can ask questions
- As a buyer, I can quick-reply "Is this still available?" so I can save time
- As a buyer, I can track my order status in real-time so I know where my purchase is
- As a buyer, I can confirm receipt of an item so the seller receives payment
- As a buyer, I can open a dispute if there is a problem with my order so I am protected
- As a buyer, I can leave a review for a seller after a completed transaction so others benefit
- As a buyer, I can view the Deal Score for any listing so I know if it's a good value
- As a buyer, I can compare similar listings side-by-side so I make informed decisions
- As a buyer, I can schedule a meetup for local pickup at a safe location so I stay safe
- As a buyer, I can manage my addresses, payment methods, and account settings
- As a buyer, I can view my purchase history and receipts

### 2.3 Seller Stories
- As a seller, I can create a listing in under 60 seconds via a guided multi-step wizard
- As a seller, I can upload up to 20 images per listing and set a cover image
- As a seller, I can set a fixed price, enable "Make Offer", or create an auction listing
- As a seller, I can set auto-accept and auto-decline thresholds for offers so I save time
- As a seller, I can counter-offer a buyer's offer so I negotiate effectively
- As a seller, I can respond to incoming messages promptly to maintain my response rate
- As a seller, I can view and manage all my active, sold, and expired listings
- As a seller, I can renew expired listings with one click
- As a seller, I can fulfill orders by marking them as shipped and entering tracking info
- As a seller, I can customize my storefront (banner, bio, shop policies) so I brand myself
- As a seller, I can view analytics (views, conversion, revenue, ratings) so I optimize
- As a seller, I can manage my earnings and request payouts
- As a seller, I can promote listings for increased visibility
- As a seller, I can leave reviews for buyers after completed transactions
- As a seller, I can respond to reviews left by buyers (one response per review)
- As a seller, I can manage shipping options per listing

### 2.4 Moderator Stories
- As a moderator, I can view and action the reports queue so I keep the platform safe
- As a moderator, I can remove listings that violate policies
- As a moderator, I can suspend user accounts pending admin review
- As a moderator, I can view dispute cases and request additional evidence
- As a moderator, I can resolve disputes with defined resolution options
- As a moderator, I can view platform-wide activity and moderation metrics

### 2.5 Admin Stories
- As an admin, I have all moderator capabilities plus:
- As an admin, I can manage the full category taxonomy (add, edit, reorder)
- As an admin, I can configure platform fee rates per tier
- As an admin, I can permanently ban or delete user accounts
- As an admin, I can view comprehensive platform analytics (users, listings, revenue, GMV)
- As an admin, I can manage coupons and promotional codes
- As an admin, I can configure platform settings (maintenance mode, feature flags)
- As an admin, I can view a full audit trail of admin actions

---

## 3. ENTITY RELATIONSHIPS

### 3.1 Core Entity Relationship Diagram (ERD — Conceptual)

```
User (1) ──────── (0..1) UserProfile
User (1) ──────── (0..1) SellerProfile
User (1) ──────── (N) Address
User (1) ──────── (N) Listing [as seller]
User (1) ──────── (N) Order [as buyer]
User (1) ──────── (N) Offer [as buyer]
User (1) ──────── (N) Review [as reviewer]
User (1) ──────── (N) Message [as sender]
User (1) ──────── (N) Notification
User (1) ──────── (N) WishlistItem
User (1) ──────── (N) SavedSearch
User (1) ──────── (N) Report [as reporter]
User (N) ──────── (N) Conversation [participants]

Listing (1) ──────── (N) ListingImage
Listing (1) ──────── (N) ListingAttribute [EAV]
Listing (1) ──────── (N) ListingVariant
Listing (1) ──────── (0..1) Auction
Listing (1) ──────── (N) Offer
Listing (1) ──────── (N) OrderItem
Listing (1) ──────── (N) Review [about listing]
Listing (N) ──────── (1) Category
Listing (N) ──────── (0..1) Promotion

Category (1) ──────── (N) Category [self-referencing, subcategories]
Category (1) ──────── (N) CategoryAttribute

Order (1) ──────── (N) OrderItem
Order (1) ──────── (1) Payment
Order (1) ──────── (0..1) EscrowTransaction
Order (1) ──────── (0..1) Dispute
Order (N) ──────── (1) Address [shipping]

Conversation (1) ──────── (N) Message
Conversation (1) ──────── (0..1) Listing [context]

Auction (1) ──────── (N) Bid
```

---

## 4. BUSINESS RULES

### 4.1 Platform Fees
| Transaction Value | Fee Rate |
|-------------------|----------|
| Under $500 | 5% |
| $500 – $5,000 | 3% |
| Over $5,000 | 2% |

**Free Listing Quota:**
- Individual sellers: First 10 listings per month free, $0.25/listing thereafter
- Premium sellers: Unlimited free listings

### 4.2 Escrow Flow
```
Buyer pays
    │
    ▼
Funds held in escrow (platform account)
    │
    ├─► Seller ships → enters tracking number → notifies buyer
    │
    ▼
Buyer confirms receipt
    │                        ├─► Auto-release after 14 days if no action
    │
    ▼
Funds released to seller (minus platform fee)
    │
    └─► Seller can request payout to bank account
```

**Dispute Interrupts Escrow:** If dispute opened → funds frozen until resolved

### 4.3 Offer Rules
- Offers expire after **48 hours** if seller does not respond
- Seller actions: Accept | Decline | Counter-Offer
- Buyer has max **3 active offers** on the same listing simultaneously
- Counter-offers expire after **24 hours**
- Accepted offer creates a binding order — buyer must complete payment within **2 hours** or offer is voided
- Offers are private (only buyer and seller can see)

### 4.4 Auction Rules
- Minimum bid increment: **max(5% of current price, $1)**
- **Anti-sniping**: If bid placed within last 2 minutes → auction extends by 2 minutes
- Reserve price: Hidden from bidders, listing shows "Reserve not met" / "Reserve met"
- Buy It Now price disappears after the first bid
- Auction winner must complete payment within **24 hours** or wins are forfeited to next highest bidder
- Seller can cancel auction before first bid; after first bid, cannot cancel

### 4.5 Listing Rules
- Maximum **20 images** per listing
- Listings expire after **30 days** (renewable with one click)
- New seller posting limit: **5 listings** in first week
- Prohibited items: Weapons, counterfeit goods, illegal substances, adult content, personal data
- Duplicate detection: Flag listings with >80% title similarity from same seller within 24 hours
- Maximum title length: 80 characters
- Description: Markdown supported, max 5,000 characters

### 4.6 Review Rules
- Only buyers with **completed transactions** (order status = DELIVERED) can review sellers
- Only sellers with **completed transactions** can review buyers
- Review window: **60 days** from delivery date
- Sellers can respond **once** per review; response cannot be edited after **48 hours**
- Reviews cannot be edited after **48 hours** of posting
- Rating scale: 1–5 stars (required) + written review (optional, max 1,000 chars)

### 4.7 Dispute Rules
- Can be opened within **30 days** of delivery
- Grounds: Item not received | Item not as described | Counterfeit | Damaged
- Both parties submit evidence (photos, messages, tracking) within **72 hours**
- Admin/Moderator reviews and decides within **7 business days**
- Resolution options: Full refund | Partial refund | No refund | Return item for refund
- Return shipping costs: Platform decides based on fault determination

### 4.8 User Trust & Safety
- New accounts: **5 listing limit** in first week
- Verified users (ID verified): **50 listings/week**, verified badge displayed
- Business accounts (license verified): **Unlimited listings**, business badge
- Auto-suspension trigger: **5+ unresolved reports** within 30 days → account flagged for admin review
- Prohibited seller actions: Price manipulation, review manipulation, off-platform payment solicitation

---

## 5. STATE MACHINES

### 5.1 Listing Lifecycle

```
DRAFT
  │
  ▼
PENDING_REVIEW (if new seller or flagged content)
  │
  ├─► ACTIVE ──────────────────────────────► EXPIRED (after 30 days)
  │     │                                         │
  │     ├─► SOLD (Buy Now or auction won)          └─► [Seller renews] → ACTIVE
  │     │
  │     ├─► RESERVED (offer accepted, awaiting payment)
  │     │
  │     └─► [Seller action] → PAUSED
  │                           │
  │                           └─► [Seller action] → ACTIVE
  │
  └─► REJECTED (by moderator)
```

### 5.2 Order Lifecycle

```
PENDING (order created, awaiting payment)
  │
  ├─► PAYMENT_FAILED → (buyer retries or order cancelled)
  │
  ▼
PAID (payment received, funds in escrow)
  │
  ▼
PROCESSING (seller acknowledged, preparing to ship)
  │
  ▼
SHIPPED (tracking number entered)
  │
  ▼
IN_TRANSIT
  │
  ├─► DELIVERED (buyer confirms OR 14 days elapsed)
  │     │
  │     ├─► COMPLETED (funds released, review window opens)
  │     │
  │     └─► DISPUTED
  │           │
  │           ├─► DISPUTE_RESOLVED_REFUND → REFUNDED
  │           │
  │           └─► DISPUTE_RESOLVED_RELEASE → COMPLETED
  │
  └─► CANCELLED (before shipping, buyer or seller initiated)
        │
        └─► REFUNDED
```

### 5.3 Offer Lifecycle

```
PENDING (buyer submitted offer)
  │
  ├─► EXPIRED (48 hours elapsed, no response)
  │
  ├─► DECLINED (seller declined)
  │
  ├─► WITHDRAWN (buyer withdrew before response)
  │
  ├─► COUNTERED (seller made counter-offer)
  │     │
  │     ├─► COUNTER_EXPIRED (24 hours elapsed)
  │     ├─► COUNTER_DECLINED (buyer declined counter)
  │     └─► COUNTER_ACCEPTED → ORDER_CREATED
  │
  └─► ACCEPTED (seller accepted original offer) → ORDER_CREATED
        │
        └─► PAYMENT_TIMEOUT (buyer didn't pay in 2 hours) → VOIDED
```

### 5.4 Auction Lifecycle

```
SCHEDULED (start time in future)
  │
  ▼
ACTIVE (accepting bids)
  │
  ├─► [Anti-snipe extension applies] → ACTIVE (extended)
  │
  ▼
ENDED
  │
  ├─► RESERVE_NOT_MET (highest bid < reserve) → No sale
  │
  └─► WINNER_SELECTED
        │
        ├─► PAYMENT_RECEIVED → Order Created
        │
        └─► PAYMENT_TIMEOUT (24 hours) → Offer to 2nd highest bidder
```

### 5.5 Dispute Lifecycle

```
OPENED (buyer submits dispute)
  │
  ▼
EVIDENCE_COLLECTION (both parties submit evidence, 72hr window)
  │
  ▼
UNDER_REVIEW (moderator/admin reviewing)
  │
  ├─► RESOLVED_FULL_REFUND
  ├─► RESOLVED_PARTIAL_REFUND
  ├─► RESOLVED_NO_REFUND
  └─► RESOLVED_RETURN_FOR_REFUND
        │
        └─► RETURN_IN_TRANSIT
              │
              └─► RETURN_RECEIVED → REFUNDED
```

---

## 6. THIRD-PARTY INTEGRATIONS

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Stripe | Payments, payouts, escrow management | Critical |
| SendGrid / Nodemailer | Transactional emails | Critical |
| AWS S3 / Cloudflare R2 | Image/file storage | High |
| Google Maps / Mapbox | Location services, map view | High |
| Socket.io | Real-time messaging, notifications | Critical |
| BullMQ + Redis | Background job queue | Critical |
| Twilio (optional) | SMS notifications | Low |
| OAuth (Google, Apple) | Social login | Medium |

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance
- Homepage: < 2s LCP (Largest Contentful Paint)
- Search results: < 1s for queries without geospatial
- API response: < 200ms p95 for read endpoints
- API response: < 500ms p95 for write endpoints
- Support 10,000 concurrent users at launch

### 7.2 Scalability
- Database: Read replicas for search/browse queries
- CDN: Static assets and images served via CDN
- Caching: Redis cache for category trees, popular listings, user sessions
- Search: PostgreSQL FTS with upgrade path to Meilisearch documented

### 7.3 Security
- OWASP Top 10 compliance
- PCI-DSS compliance for payment handling (via Stripe — no card data stored)
- GDPR/CCPA compliance for data privacy
- Rate limiting on all endpoints
- Brute-force protection on auth endpoints

### 7.4 Availability
- Target: 99.9% uptime
- Graceful degradation when services are unavailable
- Database backups: daily full, hourly incremental

### 7.5 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader compatible
- Color contrast ratios ≥ 4.5:1
- Reduced motion support

---

## 8. TECHNICAL ARCHITECTURE SUMMARY

### Backend
- **Runtime**: Node.js 22 LTS
- **Framework**: Fastify (chosen for performance over Express)
- **ORM**: Prisma with PostgreSQL 16
- **Cache/Sessions**: Redis 7
- **Queue**: BullMQ
- **Auth**: JWT (15min access + 7day refresh) + bcrypt (cost=12)
- **Validation**: Zod
- **Real-time**: Socket.io
- **File Storage**: Local → S3 abstraction layer
- **Search**: PostgreSQL FTS with tsvector/tsquery + pg_trgm

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3 + custom design tokens
- **Components**: Custom on Radix UI primitives
- **State**: Zustand (client) + TanStack Query (server)
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io-client
- **Maps**: Leaflet
- **Charts**: Recharts

---

*Requirements Analysis complete. Proceeding to Phase 1, Step 1.2 — Database Schema Design.*
