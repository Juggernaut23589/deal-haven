import { Prisma, ListingStatus, ListingType, ListingCondition } from '@prisma/client';
import { prisma } from '../../config/database';
import { cache, CACHE_TTL } from '../../config/redis';
import {
  NotFoundError,
  AuthorizationError,
  BusinessRuleError,
} from '../../shared/errors';
import { LISTING } from '../../config/constants';
import {
  createUniqueSlug,
  addDays,
  buildPaginatedResponse,
  paginate,
} from '../../shared/utils';
import type { SearchFilters, PaginatedResponse } from '../../shared/types';
import type { CreateListingInput, UpdateListingInput } from './listings.schema';

// Select shape for listing cards (list view)
const listingCardSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  currency: true,
  condition: true,
  listingType: true,
  status: true,
  offersEnabled: true,
  city: true,
  state: true,
  country: true,
  latitude: true,
  longitude: true,
  viewCount: true,
  favoriteCount: true,
  watcherCount: true,
  dealScore: true,
  dealScoreLabel: true,
  publishedAt: true,
  createdAt: true,
  images: {
    where: { isCover: true },
    select: { url: true, thumbnailUrl: true, altText: true },
    take: 1,
  },
  seller: {
    select: {
      id: true,
      username: true,
      sellerProfile: {
        select: {
          shopName: true,
          shopSlug: true,
          averageRating: true,
          totalReviews: true,
          isStarSeller: true,
          verificationStatus: true,
        },
      },
    },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  auction: {
    select: {
      currentBid: true,
      bidCount: true,
      endsAt: true,
      status: true,
      buyItNowPrice: true,
      buyItNowActive: true,
    },
  },
} satisfies Prisma.ListingSelect;

// Full detail select
const listingDetailSelect = {
  ...listingCardSelect,
  description: true,
  quantity: true,
  soldCount: true,
  originalPrice: true,
  autoAcceptPrice: true,
  autoDeclinePrice: true,
  shipsNationally: true,
  shipsInternationally: true,
  localPickup: true,
  marketAvgPrice: true,
  expiresAt: true,
  updatedAt: true,
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      id: true,
      url: true,
      thumbnailUrl: true,
      webpUrl: true,
      altText: true,
      sortOrder: true,
      isCover: true,
      width: true,
      height: true,
    },
  },
  attributes: {
    include: {
      categoryAttribute: {
        select: { name: true, slug: true, attributeType: true, unit: true },
      },
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  shippingOptions: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
} satisfies Prisma.ListingSelect;

// ─── Transform raw DB listing to frontend ListingCard shape ───────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatListingCard(raw: any) {
  const coverImg = raw.images?.[0] ?? null;
  const sp = raw.seller?.sellerProfile ?? null;
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    price: Number(raw.price),
    compareAtPrice: raw.originalPrice ? Number(raw.originalPrice) : null,
    currency: raw.currency ?? 'NGN',
    condition: raw.condition,
    type: raw.listingType,          // frontend uses 'type', DB uses 'listingType'
    status: raw.status,
    offersEnabled: raw.offersEnabled,
    coverImage: coverImg
      ? { url: coverImg.url ?? coverImg.thumbnailUrl, thumbnailUrl: coverImg.thumbnailUrl, alt: coverImg.altText ?? raw.title }
      : null,
    imageCount: raw.images?.length ?? 0,
    location: [raw.city, raw.state].filter(Boolean).join(', ') || null,
    city: raw.city,
    state: raw.state,
    country: raw.country,
    dealScore: raw.dealScore,
    dealScoreLabel: raw.dealScoreLabel,
    isPromoted: raw.isPromoted ?? false,
    isSaved: raw.isSaved ?? false,
    viewCount: raw.viewCount,
    favoriteCount: raw.favoriteCount,
    createdAt: raw.createdAt,
    publishedAt: raw.publishedAt,
    seller: raw.seller ? {
      id: raw.seller.id,
      username: raw.seller.username,
      displayName: sp?.shopName ?? raw.seller.username,
      avatarUrl: raw.seller.profile?.avatarUrl ?? null,
      rating: sp?.averageRating ? Number(sp.averageRating) : 0,
      reviewCount: sp?.totalReviews ?? 0,
      isVerified: sp?.verificationStatus === 'VERIFIED',
      isStarSeller: sp?.isStarSeller ?? false,
    } : null,
    category: raw.category ? {
      id: raw.category.id,
      name: raw.category.name,
      slug: raw.category.slug,
    } : null,
    auction: raw.auction ? {
      currentPrice: Number(raw.auction.currentBid ?? raw.auction.startPrice ?? 0),
      bidCount: raw.auction.bidCount ?? 0,
      endsAt: raw.auction.endsAt,
      status: raw.auction.status,
      buyItNowAvailable: raw.auction.buyItNowActive ?? false,
      buyItNowPrice: raw.auction.buyItNowPrice ? Number(raw.auction.buyItNowPrice) : null,
    } : null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatListingDetail(raw: any) {
  const card = formatListingCard(raw);
  return {
    ...card,
    description: raw.description,
    images: (raw.images ?? []).map((img: any) => ({
      id: img.id,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      alt: img.altText ?? raw.title,
      isCover: img.isCover ?? false,
      sortOrder: img.sortOrder ?? 0,
    })),
    shippingOptions: raw.shippingOptions ?? [],
    seller: raw.seller ? {
      ...card.seller,
      id: raw.seller.id,
      username: raw.seller.username,
      bio: raw.seller.profile?.bio ?? null,
      memberSince: raw.seller.createdAt ?? null,
      responseTime: raw.seller.sellerProfile?.responseTimeHours
        ? `${raw.seller.sellerProfile.responseTimeHours}h`
        : null,
      totalSales: raw.seller.sellerProfile?.totalSales ?? 0,
      reviewCount: raw.seller.sellerProfile?.totalReviews ?? 0,
    } : null,
    quantity: raw.quantity ?? 1,
    soldCount: raw.soldCount ?? 0,
    originalPrice: raw.originalPrice ? Number(raw.originalPrice) : null,
    marketAvgPrice: raw.marketAvgPrice ? Number(raw.marketAvgPrice) : null,
    expiresAt: raw.expiresAt,
  };
}

export class ListingsService {
  async createListing(
    sellerId: string,
    input: CreateListingInput,
  ) {
    // Enforce listing limits for new sellers
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { listingsThisWeek: true, isPremium: true, createdAt: true },
    });

    if (!seller) throw new NotFoundError('User', sellerId);

    const accountAgeMs = Date.now() - seller.createdAt.getTime();
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
    const isNewSeller = accountAgeDays <= 7;

    if (isNewSeller && seller.listingsThisWeek >= LISTING.NEW_SELLER_WEEKLY_LIMIT) {
      throw new BusinessRuleError(
        `New sellers can create up to ${LISTING.NEW_SELLER_WEEKLY_LIMIT} listings in their first week.`,
        'LISTING_LIMIT_REACHED',
      );
    }

    // Accept either a UUID (id) or a slug — frontend sends slugs like 'automobiles'
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.categoryId);
    const category = isUuid
      ? await prisma.category.findUnique({ where: { id: input.categoryId } })
      : await prisma.category.findFirst({ where: { slug: input.categoryId } });
    if (!category) {
      // Fall back to 'other' category rather than failing hard
      const fallback = await prisma.category.findFirst({ where: { slug: 'other' } })
        ?? await prisma.category.findFirst();
      if (!fallback) throw new NotFoundError('Category', input.categoryId);
      (input as { categoryId: string }).categoryId = fallback.id;
    } else {
      (input as { categoryId: string }).categoryId = category.id;
    }

    // Auto-create sellerProfile if missing (happens for users who registered as sellers)
    await prisma.sellerProfile.upsert({
      where: { userId: sellerId },
      create: {
        userId: sellerId,
        shopName: `Shop ${sellerId.slice(0, 8)}`,
        shopSlug: `shop-${sellerId.slice(0, 8)}`,
      },
      update: {},
    });

    const slug = createUniqueSlug(input.title);
    const expiresAt = addDays(new Date(), LISTING.EXPIRY_DAYS);

    const listing = await prisma.$transaction(async (tx) => {
      const created = await tx.listing.create({
        data: {
          sellerId,
          categoryId: input.categoryId,
          title: input.title,
          slug,
          description: input.description,
          condition: input.condition as ListingCondition,
          listingType: input.listingType as ListingType,
          status: ListingStatus.DRAFT,
          price: input.price,
          originalPrice: input.originalPrice,
          currency: input.currency ?? 'NGN',
          quantity: input.quantity ?? 1,
          offersEnabled: input.offersEnabled ?? false,
          autoAcceptPrice: input.autoAcceptPrice,
          autoDeclinePrice: input.autoDeclinePrice,
          city: input.city,
          state: input.state,
          country: input.country ?? 'NG',
          zipCode: input.zipCode,
          latitude: input.latitude,
          longitude: input.longitude,
          localPickup: input.localPickup ?? false,
          shipsNationally: input.shipsNationally ?? true,
          shipsInternationally: input.shipsInternationally ?? false,
          expiresAt,
          // Attributes
          attributes: input.attributes
            ? {
                create: input.attributes.map((attr) => ({
                  categoryAttributeId: attr.categoryAttributeId,
                  value: attr.value,
                })),
              }
            : undefined,
          // Shipping options — normalize frontend field names
          shippingOptions: input.shippingOptions?.length
            ? {
                create: input.shippingOptions.map((opt, idx) => {
                  const rawCarrier = ((opt as { name?: string; serviceName?: string; carrier?: string | null }).carrier ?? '').toUpperCase();
                  const carrierMap: Record<string, string> = {
                    GIG_LOGISTICS: 'GIG_LOGISTICS', GIG: 'GIG_LOGISTICS',
                    DHL: 'DHL', NIPOST: 'NIPOST', REDSTAR: 'REDSTAR_EXPRESS',
                    REDSTAR_EXPRESS: 'REDSTAR_EXPRESS', FEDEX: 'FEDEX',
                    UPS: 'UPS', LOCAL_DELIVERY: 'LOCAL_DELIVERY', LOCAL: 'LOCAL_DELIVERY',
                    LOCAL_PICKUP: 'LOCAL_DELIVERY',
                  };
                  const carrier = (carrierMap[rawCarrier] ?? 'OTHER') as import('@prisma/client').ShippingCarrier;
                  return {
                    serviceName: (opt as { name?: string; serviceName?: string }).name ?? opt.serviceName ?? 'Standard Shipping',
                    carrier,
                    price: opt.price ?? 0,
                    isFree: opt.isFree ?? false,
                    estimatedDaysMin: opt.estimatedDaysMin ?? null,
                    estimatedDaysMax: opt.estimatedDaysMax ?? null,
                    isDefault: idx === 0,
                  };
                }),
              }
            : undefined,
          // Auction
          auction:
            input.listingType === 'AUCTION' && input.auction
              ? {
                  create: {
                    startPrice: input.auction.startPrice ?? input.price,
                    reservePrice: input.auction.reservePrice,
                    buyItNowPrice: input.auction.buyItNowPrice,
                    minBidIncrement: Math.max(
                      (input.auction.startPrice ?? input.price) * 0.05,
                      1,
                    ),
                    startsAt: input.auction.startsAt ?? new Date(),
                    endsAt: input.auction.endsAt ?? addDays(new Date(), (input.auction as { durationDays?: number }).durationDays ?? 7),
                    originalEndsAt: input.auction.endsAt ?? addDays(new Date(), (input.auction as { durationDays?: number }).durationDays ?? 7),
                  },
                }
              : undefined,
        },
        select: listingDetailSelect,
      });

      // Increment seller's listing count
      await tx.user.update({
        where: { id: sellerId },
        data: {
          listingsThisWeek: { increment: 1 },
          listingsThisMonth: { increment: 1 },
        },
      });

      return created;
    });

    return formatListingDetail(listing);
  }

  async publishListing(listingId: string, sellerId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        sellerId: true,
        status: true,
        title: true,
        images: { where: { isCover: true }, take: 1 },
      },
    });

    if (!listing) throw new NotFoundError('Listing', listingId);
    if (listing.sellerId !== sellerId) throw new AuthorizationError();

    if (listing.status !== ListingStatus.DRAFT) {
      throw new BusinessRuleError('Only draft listings can be published');
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
      },
      select: listingCardSelect,
    });

    await cache.del(cache.key.listing(listingId));
    return formatListingCard(updated);
  }

  async getListing(id: string, viewerUserId?: string) {
    const cacheKey = cache.key.listing(id);
    const cached = await cache.get(cacheKey);
    if (cached) {
      // Async increment view count (don't await)
      this.incrementViewCount(id, viewerUserId).catch(() => null);
      return cached;
    }

    const listing = await prisma.listing.findFirst({
      where: {
        id,
        deletedAt: null,
        status: {
          in: [ListingStatus.ACTIVE, ListingStatus.RESERVED, ListingStatus.SOLD],
        },
      },
      select: listingDetailSelect,
    });

    if (!listing) throw new NotFoundError('Listing', id);

    const formatted = formatListingDetail(listing);
    await cache.set(cacheKey, formatted, CACHE_TTL.POPULAR_LISTINGS);

    // Async increment view count
    this.incrementViewCount(id, viewerUserId).catch(() => null);

    return formatted;
  }

  async getListingForSeller(id: string, sellerId: string) {
    const listing = await prisma.listing.findFirst({
      where: { id, sellerId, deletedAt: null },
      select: listingDetailSelect,
    });

    if (!listing) throw new NotFoundError('Listing', id);
    return formatListingDetail(listing);
  }

  async updateListing(
    id: string,
    sellerId: string,
    input: UpdateListingInput,
  ) {
    const existing = await prisma.listing.findFirst({
      where: { id, sellerId, deletedAt: null },
    });

    if (!existing) throw new NotFoundError('Listing', id);

    if (
      existing.status === ListingStatus.SOLD ||
      existing.status === ListingStatus.DELETED
    ) {
      throw new BusinessRuleError('Cannot edit a sold or deleted listing');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update attributes if provided
      if (input.attributes) {
        await tx.listingAttribute.deleteMany({ where: { listingId: id } });
        await tx.listingAttribute.createMany({
          data: input.attributes.map((attr) => ({
            listingId: id,
            categoryAttributeId: attr.categoryAttributeId,
            value: attr.value,
          })),
        });
      }

      return tx.listing.update({
        where: { id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description && { description: input.description }),
          ...(input.condition && { condition: input.condition as ListingCondition }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.originalPrice !== undefined && { originalPrice: input.originalPrice }),
          ...(input.quantity !== undefined && { quantity: input.quantity }),
          ...(input.offersEnabled !== undefined && { offersEnabled: input.offersEnabled }),
          ...(input.autoAcceptPrice !== undefined && { autoAcceptPrice: input.autoAcceptPrice }),
          ...(input.autoDeclinePrice !== undefined && { autoDeclinePrice: input.autoDeclinePrice }),
          ...(input.localPickup !== undefined && { localPickup: input.localPickup }),
          ...(input.shipsNationally !== undefined && { shipsNationally: input.shipsNationally }),
          ...(input.city && { city: input.city }),
          ...(input.state && { state: input.state }),
          ...(input.zipCode && { zipCode: input.zipCode }),
        },
        select: listingDetailSelect,
      });
    });

    await cache.del(cache.key.listing(id));
    return updated;
  }

  async deleteListing(id: string, sellerId: string) {
    const listing = await prisma.listing.findFirst({
      where: { id, sellerId, deletedAt: null },
    });

    if (!listing) throw new NotFoundError('Listing', id);

    if (listing.status === ListingStatus.SOLD) {
      throw new BusinessRuleError('Cannot delete a sold listing');
    }

    await prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.DELETED,
        deletedAt: new Date(),
      },
    });

    await cache.del(cache.key.listing(id));
  }

  async renewListing(id: string, sellerId: string) {
    const listing = await prisma.listing.findFirst({
      where: { id, sellerId, deletedAt: null },
    });

    if (!listing) throw new NotFoundError('Listing', id);

    if (listing.status !== ListingStatus.EXPIRED) {
      throw new BusinessRuleError('Only expired listings can be renewed');
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.ACTIVE,
        expiresAt: addDays(new Date(), LISTING.EXPIRY_DAYS),
      },
      select: listingCardSelect,
    });

    await cache.del(cache.key.listing(id));
    return updated;
  }

  async searchListings(
    filters: SearchFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<unknown>> {
    const { offset, limit: normalizedLimit, page: normalizedPage } = paginate(page, limit);

    // Build where clause
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
      deletedAt: null,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    } else if (filters.categorySlug) {
      where.category = { slug: filters.categorySlug };
    }

    if (filters.condition?.length) {
      where.condition = {
        in: filters.condition as ListingCondition[],
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.listingType?.length) {
      where.listingType = { in: filters.listingType as ListingType[] };
    }

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.state) where.state = { equals: filters.state, mode: 'insensitive' };

    // Full-text search via PostgreSQL tsvector
    // For complex full-text we use raw query via prisma.$queryRaw in production
    // Here we implement a simplified version that's functionally correct
    if (filters.query) {
      const searchTerm = filters.query.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.ListingOrderByWithRelationInput[] = [];
    switch (filters.sortBy) {
      case 'price_asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'deal_score':
        orderBy = [{ dealScore: 'desc' }];
        break;
      case 'popularity':
        orderBy = [{ viewCount: 'desc' }, { favoriteCount: 'desc' }];
        break;
      case 'newest':
      default:
        orderBy = [{ createdAt: 'desc' }];
    }

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: listingCardSelect,
        orderBy,
        skip: offset,
        take: normalizedLimit,
      }),
      prisma.listing.count({ where }),
    ]);

    return buildPaginatedResponse(data.map(formatListingCard), total, normalizedPage, normalizedLimit);
  }

  async getSellerListings(
    sellerId: string,
    status?: ListingStatus,
    page = 1,
    limit = 20,
  ) {
    const { offset, limit: normalizedLimit, page: normalizedPage } = paginate(page, limit);

    const where: Prisma.ListingWhereInput = {
      sellerId,
      deletedAt: null,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: listingCardSelect,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: normalizedLimit,
      }),
      prisma.listing.count({ where }),
    ]);

    return buildPaginatedResponse(data.map(formatListingCard), total, normalizedPage, normalizedLimit);
  }

  async addImages(
    listingId: string,
    sellerId: string,
    images: Array<{
      url: string;
      thumbnailUrl?: string;
      webpUrl?: string;
      altText?: string;
      width?: number;
      height?: number;
    }>,
  ) {
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, sellerId, deletedAt: null },
      select: { _count: { select: { images: true } } },
    });

    if (!listing) throw new NotFoundError('Listing', listingId);

    const currentCount = listing._count.images;
    if (currentCount + images.length > LISTING.MAX_IMAGES) {
      throw new BusinessRuleError(
        `Maximum ${LISTING.MAX_IMAGES} images allowed per listing. Currently has ${currentCount}.`,
      );
    }

    // Get current max sort order
    const maxOrder = await prisma.listingImage.aggregate({
      where: { listingId },
      _max: { sortOrder: true },
    });
    const startOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.listingImage.createMany({
      data: images.map((img, idx) => ({
        listingId,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        webpUrl: img.webpUrl,
        altText: img.altText,
        width: img.width,
        height: img.height,
        sortOrder: startOrder + idx,
        isCover: currentCount === 0 && idx === 0,
      })),
    });

    await cache.del(cache.key.listing(listingId));
    return created;
  }

  async setCoverImage(listingId: string, imageId: string, sellerId: string) {
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, sellerId, deletedAt: null },
    });
    if (!listing) throw new NotFoundError('Listing', listingId);

    await prisma.$transaction([
      prisma.listingImage.updateMany({
        where: { listingId },
        data: { isCover: false },
      }),
      prisma.listingImage.update({
        where: { id: imageId },
        data: { isCover: true },
      }),
    ]);

    await cache.del(cache.key.listing(listingId));
  }

  async deleteImage(listingId: string, imageId: string, sellerId: string) {
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, sellerId, deletedAt: null },
    });
    if (!listing) throw new NotFoundError('Listing', listingId);

    const image = await prisma.listingImage.findFirst({
      where: { id: imageId, listingId },
    });
    if (!image) throw new NotFoundError('Image', imageId);

    await prisma.listingImage.delete({ where: { id: imageId } });

    // If deleted image was cover, set new cover
    if (image.isCover) {
      await prisma.listingImage.updateMany({
        where: { listingId },
        data: { isCover: false },
      });
      const firstImage = await prisma.listingImage.findFirst({
        where: { listingId },
        orderBy: { sortOrder: 'asc' },
      });
      if (firstImage) {
        await prisma.listingImage.update({
          where: { id: firstImage.id },
          data: { isCover: true },
        });
      }
    }

    await cache.del(cache.key.listing(listingId));
  }

  private async incrementViewCount(
    listingId: string,
    viewerUserId?: string,
  ): Promise<void> {
    await prisma.listing.update({
      where: { id: listingId },
      data: { viewCount: { increment: 1 } },
    });

    if (viewerUserId) {
      await prisma.pageView.create({
        data: { userId: viewerUserId, listingId, path: `/listing/${listingId}` },
      });
    }
  }
}

export const listingsService = new ListingsService();
