Markdown

# CLAUDE.md — Deal Haven Marketplace

## ROLE & IDENTITY

You are a **Senior Full-Stack Software Engineer** with 25+ years of professional experience across frontend and backend disciplines. You have architected, built, and scaled production marketplace platforms serving millions of users. You have deep expertise in:

- Database architecture & optimization (PostgreSQL, Redis)
- RESTful & GraphQL API design
- Modern frontend frameworks (React/Next.js)
- Real-time systems (WebSockets, Server-Sent Events)
- Payment integration (Stripe, escrow systems)
- Search infrastructure (full-text search, filtering, geo-search)
- Authentication & authorization (JWT, OAuth2, RBAC)
- Cloud deployment & DevOps
- UI/UX design principles for high-conversion e-commerce

You approach every task methodically: **architecture first → schema design → backend logic → API layer → frontend → testing → polish**.

---

## PROJECT OVERVIEW

**Deal Haven** is a modern, full-featured multi-vendor online marketplace w where:

- **Sellers** can register, create storefronts, list goods and services across multiple categories, manage inventory, and process orders
- **Buyers** can browse, search, filter, compare, make offers, negotiate, purchase goods/services, and leave reviews
- The platform supports **both products and services** across diverse categories

This is NOT a simple classified ads board — it is a **transactional marketplace** with payments, escrow, messaging, reviews, dispute resolution, and intelligent recommendations — modeled after the best features of the world's top markece platforms.

---

## COMPETITIVE RESEARCH — FEATURES SOURCED FROM TOP MARKETPLACES

Integrate the following concepts and features drawn from the world's biggest and most successful marketplace platforms:

### From **Amazon**
- [ ] Buy Box / Featured Offer system (when multiple sellers list same product)
- [ ] Product detail pages with image galleries, specifications, and Q&A sections
- [ ] "Customers who bought this also bought" recommendation engine
- [ ] Seller performance metrics & ratings dashboard
- [ ] Order tracking with status updates
- [ ] Wishlist / Save for Later functionality
- [ ] Recently viewed items
- [ ] Prime-like membership tier f premium buyers (Deal Haven Premium)
- [ ] Category-based browsing with breadcrumb navigation
- [ ] Search autocomplete with suggestions

### From **eBay**
- [ ] **Make an Offer** system — buyers can submit offers below listed price
- [ ] **Auction-style listings** — timed bidding with countdown
- [ ] **Buy It Now** — instant purchase option alongside aucti[ ] Best Offer with auto-accept/auto-decline thresholds set by seller
- [ ] Seller can counter-offer
- [ ] Buyer/Seller reputation scores with detailed feedback history
- [ ] Watched items with price drop notifications
- [ ] Saved searches with email/push alerts for new matching listings
- [ ] Listing conditions (New, Like New, Good, Fair, For Parts)
- [ ] Promoted/Sponsored listings (sellers pay for visibility boost)

### From **Facebook Marketplace**
- [ ] Location-based listings with distance radius filter
- [ ] Integrated real-time messaging between buyer and seller
- [ ] Quick category browsing (Vehicles, Property, Electronics, etc.)
- [ ] "Is this still available?" quick-action button
- [ ] Social proof — show mutual connections or verified profiles
- [ ] Mobile-first responsive design
- [ ] Map view for local listings
- [ ] Free listings for individuals, fees for commercial sellers

### From **Etsy**
- [ ] Seller storefronts with stomizable branding (banner, logo, about section)
- [ ] Favoriting shops and items
- [ ] Collections / curated lists by users
- [ ] Star seller badge program
- [ ] Shop policies page (returns, shipping, custom orders)
- [ ] Custom/made-to-order request system
- [ ] Digital goods / downloadable products support
- [ ] Gift wrapping option
- [ ] Seasonal/trending categories on homepage

### From **Mercari / OfferUp / Poshmark**
- [ ] Simple listing flow — photo → title → description → price → publish (under 60 seconds)
- [ ] In-app shipping label generation
- [ ] Escrow-based payments — funds held until buyer confirms receipt
- [ ] Bundle discounts — buy multiple items from same seller for discount
- [ ] Share listings to social media
- [ ] Seller earnings dashboard with payout management
- [ ] Buyer protection guarantee
- [ ] Authentication/verification for luxury items
- [ ] Quick filters: price range, condition, dista
### From **Craigslist** (simplicity concepts)
- [ ] Free-to-post for basic listings
- [ ] Minimal friction to list and browse
- [ ] Category + subcategory + location taxonomy
- [ ] Flag/report suspicious listings

### From **Alibaba / AliExpress**
- [ ] Bulk/wholesale pricing tiers
- [ ] Trade assurance / escrow for large transactions
- [ ] RFQ (Request for Quotation) system for services and bulk orders
- [ ] Supplier verification badges
- [ ] Minimum order quantities for wholesale

### From **Zillow / Autotrader** (vertical-specific)
- [ ] **Real Estate**: Property details (sqft, beds, baths, year built, HOA), mortgage calculator, virtual tours, open house scheduling
- [ ] **Automobiles**: VIN lookup, mileage, accident history, vehicle specs, Carfax-style reports, financing calculator
- [ ] Category-specific filters that dynamically change per vertical

### Original Deal Haven Features
- [ ] **Universal Search** — single search bar that searches across ALL categories with smart categorization
- [ ] **Deal Score** — AI-powered price analysis showing if a listing is a good deal compared to market average
- [ ] **Verified Seller Program** — ID verification, business license upload, verified badge
- [ ] **Dispute Resolution Center** — structured for buyer/seller conflicts
- [ ] **Price History Charts** — show price trends for common products
- [ ] **Comparison Tool** — side-by-side comparison of similar listings
- [ ] **Scheduled Meetups** — for local pickup, integrated with maps for safe meeting points (police station meetup spots)
- [ ] **Multi-currency & localization support**
- [ ] **Accessibility compliance** (WCAG 2.1 AA)
- [ ] **Dark mode / Light mode toggle**
- [ ] **PWA support** — installable on mobile devices

---

## CATEGORIES & TAXONOMY

Implement the following top-level categories, each with subcategories and category-specific attributes/filters:
├── Automobiles
│ ├── Cars & Trucks
│ ├── Motorcycles
 ├── Parts & Accessories
│ └── Commercial Vehicles
│ [Filters: Make, Model, Year, Mileage, Fuel Type, Transmission, Color, Body Type, Price]
│
├── Real Estate
│ ├── Houses for Sale
│ ├── Apartments / Condos
│ ├── Land
│ ├── Commercial Property
│ └── Rentals
│ [Filters: Price, Beds, Baths, SqFt, Lot Size, Year Built, Property Type, HOA]
│
├── Electronics
│ ├── Phones & Tablets
│ ├── Computers & Laptops
│ ├── TVs & Monitors
│ ├── Gaming
│ ├── Audio
│ ├── Cameras
│ └── Wearables
│ [Filters: Brand, Condition, Storage, Screen Size, Price]
│
├── Clothing & Accessories
lters: Size, Brand, Condition, Color, Material, Gender, Price]
│
├── Furniture & Home
│ ├── Living Room
│ ├── Bedroom
│ ├── Kitchen & Dining
│ ├── Office
│ ├── Outdoor / Patio
│ ├── Home Decor
│ └── Appliances
│ [Filters: Condition, Material, Style, Dimensions, Color, Price]
│
├── Services
│ ├── Home Services (Plumbing, Electrical, Cleaning)
│ ├── Professional Services (Legal, Accounting, Consulting)
│ ├── Tech Services (Web Dev, IT Support, Design)
│ ├── Personal Services (Tutoring, Fitness, Beauge, Location, Rating, Availability]
│
├── Jobs & Gigs
│ ├── Full-time
│ ├── Part-time
│ ├── Freelance
│ ├── Internships
│ └── Temporary
│
└── Other
├── Sports & Outdoors
├── Books & Media
├── Toys & Games
├── Pet Supplies
├── Musical Instruments
├── Collectibles & Art
├── Baby & Kids
├── Health & Beauty
└── Free Stuff

text


---

## DEVELOPMENT SEQUENCE — STRICT ORDER OF OPERATIONS

### PHASE 1: APPLICATION LOGIC & DATABASE SCHEMA

**Step 1.1 — Requirements Analysis Document**
Before writing any code, produce a structured requirements document covering:
- All user roles and their permissions (Guest, Buyer, Scing, fees, escrow flow, dispute flow)
- All state machines (listing lifecycle, order lifecycle, offer lifecycle, dispute lifecycle)

**Step 1.2 — Database Schema Design**
Design a comprehensive, normalized PostgreSQL database schema covering ALL entities:

Core entities (minimum):
- `users` — all users (with role flags: buyer, seller, admin, moderator)
- `user_profiles` — extended profile info, avatar, bio, location
- `seller_profiles` — storefront info, policies, verification status, performance metrics
- `addresses` — polymorphic addresses for users, listings, orders
- `categories` — hiategory tree (self-referencing with parent_id)
- `category_attributes` — dynamic attributes per category (e.g., "Make" for Automobiles)
- `listings` — the core listing entity
- `listing_images` — multiple images per listing with ordering
- `listing_attributes` — EAV (Entity-Attribute-Value) for category-specific fields
- `listing_variants` — size/color/option variants with separate pricing and stock
- `offers` —s on listings with status tracking
- `orders` — completed transactions
- `order_items` — line items within orders
- `payments` — payment records linked to orders
- `escrow_transactions` — escrow hold/release/refund tracking
- `reviews` — buyer reviews of sellers AND seller reviews of buyers
- `messages` / `conversations` — real-time messaging system
- `notifications` — in-app notification system
- `wishlists` — saved/favorited listings
- `saved_searches` — persisted search queries with alert preferences
- `reports` — flagged/reported listings and users
- `disputes` — dispute cases between buyers and sellers
- `prponsored listing records
- `shipping_options` — shipping methods and rates
- `auctions` — auction-specific data (start price, reserve, bid increments)
- `bids` — individual bids on auction listings
- `coupons` — discount codes
- `platform_fees` — fee structure records
- `admin_logs` — audit trail for admin actions
- `search_history` — user search history for recommendations
- `page_views` — analytics tracking

Include:
- Proper indexing strategy (B-tree, GIN for full-text search, GiST for geospatial)
- Foreign key constraints with appropriate ON DELETE behavior
- Check constraints for business rules
- Enums for status fields
- Timestamps (created_at, updated_at, deleted_at for soft deletes)
- UUID primary keysPI Architecture**
Design RESTful API endpoints organized by resource:
- Authentication endpoints (register, login, logout, refresh, password reset, OAuth)
- User management endpoints
- Listing CRUD with advanced filtering, sorting, pagination
- Offer management endpoints
- Order processing endpoints
- Payment endpoints
- Messaging endpoints
- Review endpoints
- Search endpoints (with autocomplete)
- Admin endpoints
- Notification endpoints
- File upload endpoints (images, documents)

Document each endpoint with: method, path, request body, response shape, auth requirements, rate limits.

**Step 1.4 — Backend Implentation**
Tech stack:
- **Runtime**: Node.js (latest LTS)
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL 16+ with Prisma ORM or Drizzle ORM
- **Cache**: Redis for sessions, caching, real-time features
- **Search**: PostgreSQL full-text search (upgrade path to Elasticsearch/Meilisearch noted)
- **File Storage**: Local filesystem with abstraction layer for S3 migration
- **Authentication**: JWT (access + refresh tokens) with bcrypt password hashing
- **Validation**: Zod for runtime validation
- **Real-time**: Socket.io for messaging and notifications
- **Email**: Nodemailer with template engine
- **Task Queue**: BullMQ for background jobs (email sending, image processing, notifications)
- **Testing**: Jest + Supertest for API testing

Implement with:
- Clean architecture (controllers → services → repositories → database)
- Middleware for auth, validation, error handling, rate limiting, logging
- Proper error handling with custom error classes
- Request/response logging
- CORS configuration
- Helmet for security headers
- Rate limiting per endpoint
- Input sanitization
- SQL injection prevention (parameterized queries via ORM)
- File upload with size limits and type validation
- Image processing (thumbnails, WebP conversion)

**Step 1.5 — Testing the Backend**
- Unit tests for all service layer functions
- Integration tests for andpoints
- Test database seeding with realistic data
- Test all business logic flows:
  - User registration → email verification → profile setup
  - Seller onboarding → listing creation → publishing
  - Buyer search → view listing → make offer → seller responds
  - Buy It Now → payment → escrow → shipping → delivery confirmation → funds release
  - Auction → bidding → auction end → winner payment
  - Dispute flow → resolution
  - Review submission and aggregation
- Load test critical endpoints
- Verify all database constraints work correctly
- Test edge cases (expired auctions, simultaneous offers, race conditions)LEMENTATION

**Step 2.1 — Frontend Tech Stack**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3+ with custom design tokens
- **Component Library**: Custom components built on Radix UI primitives (for accessibility)
- **State Management**: Zustand for client state, TanStack Query for server state
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Maps**: Leaflet or Mapbox GL
- **Charts**: Recharts (for dashboards, price history)
- **Image Handling**: Next.js Image component with blur placeholders
- **Animation**: Framer Motion for micro-interactions
- **Real-time**: Socket.io-client

**Step 2.2 — De System & Brand Identity**

Use the provided logo file as the anchor for the brand identity. Derive a cohesive design system:

**Color Palette:**
- Primary: Deep Teal (#0D7377) — trust, sophistication
- Primary Light: (#14A3A8)
- Primary Dark: (#095456)
- Secondary/Accent: Warm Amber (#F59E0B) — deals, urgency, energy
- Success: Emerald (#10B981)
- Warning: Orange (#F97316)
- Error: Rose (#EF4444)
- Neutrals: Slate scale (50-950)
- Background Light: (#F8FAFC)
- Background Dark: (#0F172A) — for dark mode
- Surface: White / (#1E293B dark mode)

**Typography:**
- Headings: Inter or Plus Jakarta Sand, modern, clean)
- Body: Inter (excellent readability)
- Monospace: JetBrains Mono (for prices, codes)
- Font scale: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72

**Spacing:** 4px base unit (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)

**Border Radius:** Slightly rounded (6px default, 8px cards, 12px modals, full for avatars/badges)

**Shadows:** Subtle, layered shadows for depth hierarchy

**Step 2.3 — Page Architecture & Routes**
/ .................................................. Homepage (hero, categories, trending, featured)
/search?q=&category=&filters= .................... Search results with filters
/category/[slug] ..................................ategory landing page
/category/[slug]/[subcategory] .................... Subcategory page
/listing/[id] ..................................... Listing detail page
/listing/[id]/make-offer .......................... Make offer flow
/listing/create ................................... Create new listing (multi-step form)
/listing/[id]/edit ................................ Edit listing

/auth/login ....................................... Login page
/auth/register .................................... Registration (buyer/seller selection)
/auth/forgot-password ............................. Password reset
/auth/verify-email ................................ Email verification

/dashboard ........................................ Buyer dashboard (orders, offers, wishlist)
/dashboard/orders ................................. Order history
/dashboard/orders/[id] ............................ Order detail
/dashboard/offers ................................. My offers (sent)
/dashboard/wishlist ............................... Saved items
/dashboard/messages ............................... Messaging inbox
/dashboard/messages/[conversationId] .............. Conversation thread
/dashboard/notifications .......................... Notification center
/dashboard/settings ............................... Account settings
/dashboard/settings/profile ....................... Edit profile
/dashboard/settings/addresses ..................... Manage addresses
/dashboard/settings/payments ...................... Payment methods
/dashboard/settings/security ...................... Password, 2FA

/seller ........................................... Seller dashboard home (stats overview)
/seller/listings .................................. My listings management
/seller/listings/create ........................... Create listing (redirect)
/seller/orders .................................... Incoming orders
/seller/orders/[id] ............................... Seller order detail (fulfill, ship)
/seller/offers .................................... Incoming offers on my listings
/seller/analytics ................................. Sales analytics & reports
/seller/earnings .................................. Earnings & payouts
/seller/storefront ................................ Edit storefront/shop page
/seller/reviews ................................... Reviews received
/seller/promotions ................................ Manage promoted listings

/shop/[sellerUsername] ............................ Public seller storefront
/shop/[sellerUsername]/reviews .................... Seller reviews page

/admin ............................................ Admin dashboard
/admin/users ...................................... User management
/admin/listings ................................... Listing moderation
/admin/reports .................................... Reported content
/admin/disputes ................................... Dispute management
/admin/analytics .................................. Platform analytics
/admin/categories ................................. Category management
/admin/fees ....................................... Fee configuration
/admin/settings ................................... Platform settings

/about ............................................ About Deal Haven
/how-it-works ..................................... How it works guide
/safety ........................................... Safety tips
/help ............................................. Help center / FAQ
/terms ............................................ Terms of Service
/privacy .......................................... Privacy Policy
/contact .......................................... Contact us

text


**Step 2.4 — Key Page Designs**

**Homepage:**
- Top navigation bar with: Logo (left), Search bar (ceer, prominent), Location selector, Categories dropdown, Messages icon with badge, Notifications bell with badge, User avatar dropdown (or Login/Register buttons)
- Hero section: Bold headline "Find Amazing Deals. Sell With Ease." with search bar and popular category quick links
- Trending categories row (icon cards with hover effects)
- Featured/promoted listings grid (responsive: 2 cols mobile, 3 tablet, 4-5 desktop)
- "Deals Near You" section with location-aware listings
- "Recently Added" section
- "Top Rated Sellers" carousel
- Category showcase sections (Automobiles spotlight, Electronics spotlight, etc.)
- App download / PWA install banner
- Footer: Links, social media, newsletter signup

**Search Results Page:**
- Left sidebar with dynamic filters (changes based on category selected):
  - Category tree (collapsible)
  - Price range (dual slider + manual input)
  - Condition checkboxes
  - Location / distance radius
  - Seller rating minimum
  - Category-specific filters loaded dynamically
  - "Clear all filters" button
- Main content area:
  - Result count + sort dropdown (Relevance, Price Low-High, Price High-Low, Newest, Distance, Best Deal Score)
  - View toggle (Grid view / List view)
  - Active filter chips (removable)
  - Listing cards in grid/list
  - Infinite scroll or pagination
  - "Save this search" button with alert toggle
- Map toggle (split view: list + map for local results)

**Listing Card Component:**
- Image thumbnail with image count badge
- Condition badge overlay (New, Used, etc.)
- Title (truncated to 2 lines)
- Price (prominent, formatted)
- Deal Score badge (Great Deal / Good Deal / Fair Price)
- Location + distance
- Seller name + rating stars
- Time since posted
- Heart/favorite icon (top right)
- "Make Offer" quick action
- Promoted/Sponsored subtle label if applicable

**Listing Detail Page:**
- Image gallery (large main image + thumbnails, lightbox zoom, swipe on mobile)
- Sticky price/action sidebar (desktop) or bottom action bar (mobile):
  - Price (large)
  - Deal Score with explanation tooltip
  - "Buy Now" button (primary, prominent)
  - "Make an Offer" button (secondary)
  - "Add to Wishlist" button
  - "Share" button (copy link, social media)
  - Seller card (avatar, name, rating, member since, response time, "View Shop" link)
  - "Message Seller" button
  - "Is this still available?" quick button
  - Shipping info / Local pickup options
- Listing details section:
  - Title, description (formatted with markdown support)
  - Condition
  - Category-specific attributes displayed in organized grid
  - Posted date, views count, watchers count
- For Automobiles: Vehicle specs table, mileage, VIN (partial), accident history link
- For Real Estate: Property details grid, mortgage calculator widget, map with location
- "Seller's Other Listings" carousel
- "Similar Listings" / "Compare With" section
- Q&A section (buyers ask, seller answers publicly)
- Report listing link

**Create Listing Page (Multi-Step Wizard):**
- Step 1: Choose Category & Subcategory (visual selection with icons)
- Step 2: Photos (drag & drop, reorder, crop, up to 20 images, first = cover)
- Step 3: Details (title, description with rich text, condition, category-specific fields auto-loaded)
- Step 4: Pricing (fixed price and/or auction, Make Offer toggle with auto-accept/decline thresholds, quantity)
- Step 5: Shipping & Location (shipping options, local pickup, location selector)
- Step 6: Review & Publish (preview of listing, edit any section, publish button)
- Auto-save draft at each step
- Progress indicator bar

**Messaging/Inbox:**
- Left panel: Conversation list (avatar, name, last message preview, timestamp, unread badge)
- Right panel: Message thread (chat bubble style, timestamps, read receipts)
- Listing context card at top of conversation (what listing this is about)
- Quick replies ("Is this still available?", "What's your best price?", "When can I pick up?")
- Image/file sharing in chat
- Make Offer inline in chat
- Block/Report user option
- Mobile: Full-screen conversation list → tap to open thread

**Seller Dashboard:**
- Overview cards: Total Sales, Active Listings, Pending Orders, Unread Messages, Average Rating, This Month Revenue
- Sales chart (line/bar chart, selectable time range)
- Recent orders table
- Listings needing attention (low stock, expiring, price suggestions)
- Performance metrics (response time, ship time, cancel rate)
- Quick action buttons: Create Listing, View Storefront, Manage Payouts

**Buyer Dashboard:**
- Active orders with status tracking (visuaprogress bar)
- Recent activity feed
- Wishlist preview
- Saved searches with new matches count
- Recommended listings
- Recent offers and their statuses

**Admin Dashboard:**
- Platform KPIs: Total Users, Active Listings, Transactions Today, Revenue, Disputes Open
- Charts: User growth, listing growth, transaction volume, category distribution
- Moderation queue: Reported listings/users needing review
- Recent activity log
- Quick actions: Approve/reject listings, ban users, resolve disputes

**Step 2.5 — UI/UX Principles**
- **Mobile-first responsive design** — breakpoints: 640, 768, 1024, 1280, 1536px
- **Fast perceived performance** — skeleton loaders, optimistites, image lazy loading
- **Progressive disclosure** — don't overwhelm; show advanced options on demand
- **Clear visual hierarchy** — most important actions are most prominent
- **Consistent patterns** — same interaction patterns throughout
- **Accessible** — proper focus management, ARIA labels, keyboard navigation, screen reader support, color contrast ratios ≥ 4.5:1
- **Micro-interactions** — subtle animations on buttons, transitions between states, toast notifications
- **Empty states** — helpful illustrations and CTAs when lists are empty
- **Error states** — friendly error messry actions
- **Loading states** — skeleton screens matching content layout, never blank screens
- **Toast notifications** — for success/error feedback on actions
- **Confirmation dialogs** — for destructive actions (delete listing, cancel order)

**Step 2.6 — Frontend Testing**
- Component unit tests with React Testing Library
- Integration tests for key user flows
- Accessibility audit with axe-core
- Performance audit with Lighthouse (target: 90+ all categories)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Responsive design testing at all breakpoints

---

### PHASE 3: INTEGRATION & POLISH

**Step 3.1 — Connect Frontend to Backend**
- Set up API client with Axios or fetch wrapper
- Implement auon flow with token refresh
- Connect all pages to real API endpoints
- Set up real-time WebSocket connections for messaging and notifications
- Implement optimistic updates for better UX
- Handle all error states from API

**Step 3.2 — End-to-End Testing**
- Cypress or Playwright E2E tests for critical user journeys:
  - New user registration → browse → purchase
  - Seller registration → create listing → receive order → fulfill
  - Offer → counter-offer → accept → payment → delivery
  - Dispute creation → resolution
  - Search with filters → save search → receive alert

**Step 3.3 — Performance Optimization**
- Database query optimization (analyze slow queries, add misscaching strategy (Redis)
- Frontend bundle optimization (code splitting, tree shaking, dynamic imports)
- Image optimization pipeline (WebP, responsive sizes, CDN-ready)
- Implement ISR/SSG for category pages and popular listings

**Step 3.4 — Security Hardening**
- CSRF protection
- XSS prevention (sanitize all user input, CSP headers)
- Rate limiting on all endpoints
- Brute force protection on auth endpoints
- File upload validation (type, size, malware scanning pathway)
- SQL injection prevention verification
- Sensitive data encryption at rest
- HTTPS enforcement
- Security headers (Helmet.js)

**Step 3.5 — Deployment Configuration**
- Docker containerization (Dockerfile + doccompose for local dev)
- Environment variable management (.env.example with all required vars)
- Database migration scripts
- Seed data scripts (realistic demo data for all categories)
- CI/CD pipeline configuration
- Health check endpoints
- Logging and monitoring setup

---

## TECHNICAL CONSTRAINTS & STANDARDS

1. **All code must be production-quality** — no placeholder logic, no TODO comments left unresolved, no hardcoded values
2. **TypeScript everywhere** — strict mode, no `any` types except where absolutely necessary (and document why)
3. **Every database migration must be reversible**
4. **Every API endpoint must have input validation, proper error responses, and authentication/authorization cs**
5. **Every page must be responsive and accessible**
6. **Follow conventional commits** for all commit messages
7. **Comment complex business logic** but don't over-comment obvious code
8. **Use environment variables** for all configuration (API URLs, secrets, feature flags)
9. **Implement proper logging** (structured JSON logs with correlation IDs)
10. **Handle all edge cases** — empty states, error states, loading states, unauthorized access, not found, rate limited

---

## FILE STRUCTURE
deal-haven/
├── claude.md
├── README.md
├── docker-compose.yml
├── .env.example
│
├── backend/
│ ├── package.json
│ ├── tsconfig.json
s/
│ │ └── seed.ts
│ ├── src/
│ │ ├── index.ts # Entry point
│ │ ├── app.ts # Express app setup
│ │ ├── config/ # Configuration files
│ │ │ ├── database.ts
│ │ │ ├── redis.ts
│ │ │ ├── auth.ts
│ │ │ └── constants.ts
│ │ ├── middleware/ # Express middleware
│ │ │ ├── auth.ts
│ │ │ ├── validation.ts
│ │ │ ├── errorHandler.ts
│ │ │ ├── rateLimiter.ts
│ │ │ ├── upload.ts
│ │ │ └── logger.ts
│ │ ├── modules/ # Feature modules
│ │ │ ├── auth/
│ │ │ │ ├── auth.controller.ts── payments/
│ │ │ ├── messages/
│ │ │ ├── reviews/
│ │ │ ├── search/
│ │ │ ├── notifications/
│ │ │ ├── wishlist/
│ │ │ ├── disputes/
│ │ │ ├── admin/
│ │ │ └── analytics/
│ │ ├── shared/ # Shared utilities
│ │ │ ├── errors.ts
│ │ │ ├── types.ts
│ │ │ ├── utils.ts
│ │ │ └── pagination.ts
│ │ └── jobs/ # Background job processors
│ │ ├── email.job.ts
│ │ ├── image.job.ts
│ │ └── notification.job.ts
│ └── tests/
│ ├── setup.ts
│ ├── helpers.ts
│ └── integges/
│ │ ├── categories/ # Category icons/images
│ │ ├── placeholders/ # Placeholder images
│ │ └── illustrations/ # Empty state illustrations
│ ├── src/
│ │ ├── app/ # Next.js App Router
│ │ │ ├── layout.tsx # Root layout
│ │ │ ├── page.tsx # Homepage
│ │ │ ├── globals.css
│ │ │ ├── (auth)/ # Auth route group
│ │ │ │ ├── login/
│ │ │ │ ├── register/
│ │ │ │ └── forgot-password/
│ │ │ ├── (main)/ # Main app route group
│ │ │ │ ├── search/
│ │ │ │ ├── category/[slug]/
│ │ │ │ ├── listing/[id]/
│ │ │ │ └── shop/[username]/
│ │ │ ├── dashboard/ # Buyer dashboard
│ │ │ ├── seller/ # Seller dashboard
│ │ │ └── admin/ # Admin dashboard
│ │ ├── components/
 Toast.tsx
│ │ │ │ ├── Tabs.tsx
│ │ │ │ ├── Tooltip.tsx
│ │ │ │ ├── Slider.tsx
│ │ │ │ ├── Checkbox.tsx
│ │ │ │ ├── RadioGroup.tsx
│ │ │ │ ├── Switch.tsx
│ │ │ │ ├── Textarea.tsx
│ │ │ │ ├── Breadcrumb.tsx
│ │ │ │ ├── Pagination.tsx
│ │ │ │ └── ProgressBar.tsx
│ │ │ ├── layout/
│ │ │ │ ├── Navbar.tsx
│ │ │ │ ├── Footer.tsx
│ │ │ │ ├── Sidebar.tsx
│ │ │ │ ├── MobileNav.tsx
│ │ │ │ └── DashboardLayout.tsx
│ │ │ ├── listings/
│ │ │ │ ├── ListingCard.tsx
│ │ │ │ ├── ListingGrid.tsx
│ │ │ │ ├── ListingDetail.tsx
│ │ │ │ ├── ListingerChips.tsx
│ │ │ │ ├── SortDropdown.tsx
│ │ │ │ └── MapView.tsx
│ │ │ ├── offers/
│ │ │ │ ├── MakeOfferModal.tsx
│ │ │ │ ├── OfferCard.tsx
│ │ │ │ └── OfferHistory.tsx
│ │ │ ├── messaging/
│ │ │ │ ├── ConversationList.tsx
│ │ │ │ ├── MessageThread.tsx
│ │ │ │ ├── MessageBubble.tsx
│ │ │ │ └── QuickReplies.tsx
│ │ │ ├── reviews/
│ │ │ │ ├── ReviewCard.tsx
│ │ │ │ ├── ReviewForm.tsx
│ │ │ │ ├── RatingStars.tsx
│ │ │ │ └── ReviewSummary.tsx
│ │ │ ├── seller/
│ │ │ │ ├── SellerCard.tsx
│ │ │ │ ├── StorefrontHeader.tsx
│ │ │ │ ├── SeleScroll.tsx
│ │ │ ├── ImageUpload.tsx
│ │ │ ├── LocationPicker.tsx
│ │ │ ├── PriceInput.tsx
│ │ │ ├── DatePicker.tsx
│ │ │ ├── ShareButton.tsx
│ │ │ └── ConfirmDialog.tsx
│ │ ├── hooks/ # Custom React hooks
│ │ │ ├── useAuth.ts
│ │ │ ├── useListings.ts
│ │ │ ├── useSearch.ts
│ │ │ ├── useMessages.ts
│ │ │ ├── useNotifications.ts
│ │ │ ├── useGeolocation.ts
│ │ │ ├── useDebounce.ts
│ │ │ ├── useInfiniteScroll.ts
│ │ │ ├── useMediaQuery.ts
│ │ │ └── useLocalStorage.ts
│ │ ├── lib/ # Utility libraries
│ │ │ ├── api.ts # API client
│ │ │ ├── auth.ts # Auth utilities
│ │ │ ├── socket.ts # WebSocket client
│ │ │ ├── utils.ts # Generalpes/ # TypeScript type definitions
│ │ ├── listing.ts
│ │ ├── user.ts
│ │ ├── order.ts
│ │ ├── offer.ts
│ │ ├── message.ts
│ │ └── api.ts
│ └── tests/
│ ├── components/
│ └── e2e/
│
└── docs/
├── api-documentation.md
├── database-schema.md
├── deployment-guide.md
└── user-stories.md

text


---

## LOGO & BRANDING ASSETS

The logo file is provided in the project root or `frontend/public/` directory. Use this logo:
- In the Navbar (left-aligned, appropriate size ~32-40px height)
- On the login/register pages
- As favicon (generate from logo)
- In the Footer
- In email templates
- As Open Graph image (with background)
- Generate logo variations as needed (icon-only version, dark background version, monochrome version)

If no logo file is found,e brand primary color (#0D7377)
- A modern sans-serif font
- A minimal, memorable mark that works at small sizes

---

## SEED DATA REQUIREMENTS

Create realistic seed data including:
- 20+ demo users (mix of buyers, sellers, admins) with realistic names, avatars, locations
- 5+ seller storefronts with complete profiles
- 100+ listings across ALL categories with:
  - Real-looking titles and descriptions
  - Realistic prices for each category
  - Multiple images (use placeholder image URLs from picsum.photos or similar)
  - Proper category-specific attributes filled in
  - Mix of listing types (fixed price, auction, make offer enabled)
  - Various conditions (new, used, etc.)
  - Different locations
- 50+ reviews with realistic ratings and comments
- 20+ conversations with message history
- 10+ orders in various states (pending, shipped, delivered, completed, disputed)
- 10+ offers in various states (pending, accepted, declined, countered, expired)
- Saved searches and wishlists for demo users

---

## CRITICAL BUSINESS RULES

1. **Escrow Flow**: Buyer pays → Funds held in escrow → Seller ships → Buyer confirms receipt OR auto-release after 14 days → Funds released to seller minus platform fee
2. **Platform Fee**: 5% on transactions under $500, 3% on transactions $500-$5000, 2% on transactions over $5000. First 10 listings free per month for individurs, unlimited for Premium sellers.
3. **Offer Rules**: Offers expire after 48 hours if no response. Seller can accept, decline, or counter. Buyer can have max 3 active offers at a time on the same listing. Counter-offers expire after 24 hours.
4. **Auction Rules**: Minimum bid increment is 5% of current price or $1, whichever is greater. Auctions extend by 2 minutes if a bid is placed in the last 2 minutes (anti-sniping). Reserve price is hidden. Seller can set Buy It Now price that disappears after first bid.
5. **Listing Rules**: Max 20 images per listing. Listings expire after 30 days (can be renewed). Prohibited items list enforced. Duplicate listing detection.
6. **Review Rules**: Only buyers who completed a transaction can leave a review. Reviews can be left within 60 days of delivery. Sellers can respond to reviews (one response per review). Reviews cannot be edited after 48 hours.
7. **Dispute Rules**: Can be opened within 30 days of delivery. Both parties submit evidence. Admin reviews and makes decision within 7 business days. Resolution options: full refund, partial refund, no refund, return item for refund.
8. **User Trust**: New accounts have posting limits (5 listings first week). Verified accounts get a badge and higher limits. Accounts with too many reports get auto-suspended for admin review.

---

## EXECUTION INSTRUCTIONS

Begin immediately with **Phase 1, Step 1.1** (Requirements Analysis). Work through each phase and step in strict order. After completing each step, summarize what was built and verify it against the requirements before moving to the next step.

**DO NOT skip steps. DO NOT leave features as TODO. DO NOT use placeholder implementations.**

Build this as if it will be deployed to production tomorrow for real users with real money. Every feature must be fully functional, secure, and polished.

When implementing the frontend, think like a designer — every pixel matters. The UI should feel premium, trustworthy, and modern. Users should trust this platform with their money from the moment they see it.


