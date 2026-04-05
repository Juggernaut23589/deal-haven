# Deal Haven — Multi-Vendor Marketplace

A production-grade online marketplace platform with auctions, offers, escrow payments, real-time messaging, and intelligent deal scoring.

## Quick Start (Local Development)

### Prerequisites
- Node.js 22 LTS
- PostgreSQL 16+
- Redis 7+
- npm or Docker

### Option A: Docker (Recommended)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env and set JWT_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET

# Start all services
docker compose up -d postgres redis

# In a new terminal — run migrations and seed
cd backend
npm install
cp ../.env.example .env  # edit with local values
npx prisma migrate dev
npm run db:seed

# Start backend
npm run dev

# In another terminal — start frontend
cd ../frontend
npm install
npm run dev
```

### Option B: Manual

```bash
# 1. Start PostgreSQL and Redis locally

# 2. Backend
cd backend
npm install
cp ../.env.example .env
# Edit .env (DATABASE_URL, REDIS_HOST, JWT_SECRET, etc.)
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev        # starts on port 4000

# 3. Frontend
cd ../frontend
npm install
npm run dev        # starts on port 3000
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:4000
- API Health: http://localhost:4000/health

## Demo Accounts (password: `Password123!`)

| Role | Email |
|------|-------|
| Admin | admin@dealhaven.com |
| Seller (Tech) | techseller@example.com |
| Seller (Cars) | carseller@example.com |
| Seller (Fashion) | fashionseller@example.com |
| Buyer | buyer1@example.com |

## Tech Stack

### Backend
- **Runtime**: Node.js 22 LTS
- **Framework**: Fastify 4
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis 7 + ioredis
- **Auth**: JWT (access + refresh tokens) + bcryptjs
- **Validation**: Zod
- **Queue**: BullMQ
- **Real-time**: Socket.io
- **File Processing**: Sharp (WebP conversion, thumbnails)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 3 + CVA
- **Components**: Radix UI primitives
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animation**: Framer Motion

## Project Structure

```
deal-haven/
├── backend/              # Node.js API
│   ├── prisma/
│   │   ├── schema.prisma # Database schema (30+ models)
│   │   └── seed.ts       # Demo data seeder
│   └── src/
│       ├── config/       # DB, Redis, auth, constants
│       ├── middleware/   # Auth, error handler, rate limiter, upload
│       ├── modules/      # Feature modules (auth, listings, offers, ...)
│       ├── jobs/         # BullMQ background workers
│       └── shared/       # Types, utils, errors
├── frontend/             # Next.js app
│   └── src/
│       ├── app/          # Pages (App Router)
│       ├── components/   # UI + feature components
│       ├── hooks/        # TanStack Query hooks
│       ├── lib/          # API client, formatters, utils
│       ├── store/        # Zustand stores
│       └── types/        # TypeScript types
└── docs/
    └── requirements-analysis.md
```

## Key Features

- **Universal Search** with autocomplete, category filters, price range, condition, location radius
- **Make an Offer** system with auto-accept/decline thresholds, counter-offers (48hr expiry)
- **Auction Listings** with anti-sniping (2-min extension), reserve price, Buy It Now
- **Escrow Payments** — funds held until buyer confirms receipt or 14-day auto-release
- **Deal Score** — AI-powered price analysis vs market average
- **Real-time Messaging** (Socket.io) with listing context
- **Dispute Resolution Center** with evidence submission and admin resolution
- **Multi-role System** — Buyer, Seller, Moderator, Admin
- **Seller Storefronts** with analytics, earnings, and verification badges
- **Dark Mode** and accessibility (WCAG 2.1 AA target)

## API Endpoints

Base URL: `http://localhost:4000/api/v1`

| Module | Prefix |
|--------|--------|
| Authentication | `/auth` |
| Listings | `/listings` |
| Offers | `/offers` |
| Orders | `/orders` |
| Messages | `/messages` |
| Reviews | `/reviews` |
| Disputes | `/disputes` |
| Notifications | `/notifications` |
| Wishlist | `/wishlist` |
| Search | `/search` |

## Business Rules

- **Platform Fee**: 5% (<$500), 3% ($500–$5K), 2% (>$5K)
- **Escrow**: Auto-releases to seller after 14 days if buyer doesn't confirm
- **Offers**: Expire 48hrs, counter-offers expire 24hrs, max 3 active per listing
- **Auctions**: Anti-snipe extends by 2min on last-minute bids
- **Reviews**: 60-day window after delivery, locked for edits after 48hrs
- **Disputes**: 30-day window, 72hr evidence submission, 7 business days to resolve
