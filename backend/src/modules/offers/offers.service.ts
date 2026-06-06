import { OfferStatus, ListingStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  NotFoundError,
  AuthorizationError,
  BusinessRuleError,
} from '../../shared/errors';
import { OFFER } from '../../config/constants';
import { addHours } from '../../shared/utils';
import type { CreateOfferInput, RespondToOfferInput } from './offers.schema';

const offerSelect = {
  id: true,
  listingId: true,
  buyerId: true,
  amount: true,
  message: true,
  status: true,
  isCounter: true,
  expiresAt: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true,
  listing: {
    select: {
      id: true,
      title: true,
      price: true,
      sellerId: true,
      images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } },
    },
  },
  buyer: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  counterOffer: {
    select: {
      id: true,
      amount: true,
      message: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
  },
};

export class OffersService {
  async createOffer(buyerId: string, input: CreateOfferInput) {
    const listing = await prisma.listing.findFirst({
      where: { id: input.listingId, status: ListingStatus.ACTIVE, deletedAt: null },
      select: {
        id: true,
        sellerId: true,
        price: true,
        offersEnabled: true,
        autoAcceptPrice: true,
        autoDeclinePrice: true,
        title: true,
      },
    });

    if (!listing) throw new NotFoundError('Listing', input.listingId);

    if (!listing.offersEnabled) {
      throw new BusinessRuleError('This listing does not accept offers');
    }

    if (listing.sellerId === buyerId) {
      throw new BusinessRuleError('You cannot make an offer on your own listing');
    }

    // Check max 3 active offers per listing per buyer
    const activeOfferCount = await prisma.offer.count({
      where: {
        listingId: input.listingId,
        buyerId,
        status: OfferStatus.PENDING,
        isCounter: false,
      },
    });

    if (activeOfferCount >= OFFER.MAX_ACTIVE_PER_LISTING) {
      throw new BusinessRuleError(
        `You already have ${OFFER.MAX_ACTIVE_PER_LISTING} active offers on this listing`,
        'MAX_OFFERS_REACHED',
      );
    }

    const expiresAt = addHours(new Date(), OFFER.EXPIRY_HOURS);

    // Check auto-accept/auto-decline thresholds
    let autoAccepted = false;
    let autoDeclined = false;
    let finalStatus: OfferStatus = OfferStatus.PENDING;

    if (listing.autoAcceptPrice && input.amount >= Number(listing.autoAcceptPrice)) {
      autoAccepted = true;
      finalStatus = OfferStatus.ACCEPTED;
    } else if (
      listing.autoDeclinePrice &&
      input.amount < Number(listing.autoDeclinePrice)
    ) {
      autoDeclined = true;
      finalStatus = OfferStatus.DECLINED;
    }

    const offer = await prisma.offer.create({
      data: {
        listingId: input.listingId,
        buyerId,
        amount: input.amount,
        message: input.message,
        status: finalStatus,
        isCounter: false,
        autoAccepted,
        autoDeclined,
        expiresAt,
        respondedAt: autoAccepted || autoDeclined ? new Date() : undefined,
      },
      select: offerSelect,
    });

    // If auto-accepted, create order
    if (autoAccepted) {
      await this.convertOfferToOrder(offer.id, buyerId);
    }

    // TODO: Queue notification to seller (if not auto-decided)
    // if (!autoAccepted && !autoDeclined) {
    //   await notificationQueue.add('offer-received', { offerId: offer.id, sellerId: listing.sellerId });
    // }

    return offer;
  }

  async respondToOffer(
    offerId: string,
    sellerId: string,
    input: RespondToOfferInput,
  ) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        listing: { select: { sellerId: true, id: true, title: true } },
      },
    });

    if (!offer) throw new NotFoundError('Offer', offerId);
    if (offer.listing.sellerId !== sellerId) throw new AuthorizationError();
    if (offer.status !== OfferStatus.PENDING) {
      throw new BusinessRuleError(`Offer is no longer pending (status: ${offer.status})`);
    }
    if (offer.expiresAt < new Date()) {
      throw new BusinessRuleError('This offer has expired');
    }

    if (input.action === 'ACCEPT') {
      const updated = await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: OfferStatus.ACCEPTED,
          respondedAt: new Date(),
        },
        select: offerSelect,
      });

      await this.convertOfferToOrder(offerId, offer.buyerId);
      return updated;
    }

    if (input.action === 'DECLINE') {
      return prisma.offer.update({
        where: { id: offerId },
        data: {
          status: OfferStatus.DECLINED,
          respondedAt: new Date(),
        },
        select: offerSelect,
      });
    }

    if (input.action === 'COUNTER') {
      if (!input.counterAmount) {
        throw new BusinessRuleError('Counter amount is required for counter-offers');
      }

      // Mark original offer as countered
      await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: OfferStatus.COUNTERED,
          respondedAt: new Date(),
        },
      });

      // Create counter-offer (seller → buyer)
      const counterExpiresAt = addHours(new Date(), OFFER.COUNTER_EXPIRY_HOURS);

      const counterOffer = await prisma.offer.create({
        data: {
          listingId: offer.listingId,
          buyerId: offer.buyerId,
          originalOfferId: offerId,
          amount: input.counterAmount,
          message: input.counterMessage,
          status: OfferStatus.PENDING,
          isCounter: true,
          expiresAt: counterExpiresAt,
        },
        select: offerSelect,
      });

      return counterOffer;
    }

    throw new BusinessRuleError('Invalid action');
  }

  async respondToCounterOffer(
    offerId: string,
    buyerId: string,
    action: 'ACCEPT' | 'DECLINE',
  ) {
    // The buyer may pass either the counter-offer's own ID (isCounter=true)
    // or the original offer's ID (isCounter=false, status=COUNTERED).
    // Handle both cases so the frontend only needs to track one ID.
    let offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: { select: { id: true, sellerId: true } } },
    });

    if (!offer) throw new NotFoundError('Offer', offerId);

    if (!offer.isCounter) {
      // Buyer passed the original offer ID — find its counter-offer
      const counterOffer = await prisma.offer.findFirst({
        where: { originalOfferId: offerId, isCounter: true, buyerId },
        include: { listing: { select: { id: true, sellerId: true } } },
        orderBy: { createdAt: 'desc' },
      });
      if (!counterOffer) throw new BusinessRuleError('No pending counter-offer found for this offer');
      offer = counterOffer;
    }
    if (offer.buyerId !== buyerId) throw new AuthorizationError();
    if (offer.status !== OfferStatus.PENDING) {
      throw new BusinessRuleError(`Counter-offer is no longer pending`);
    }
    if (offer.expiresAt < new Date()) {
      throw new BusinessRuleError('This counter-offer has expired');
    }

    const newStatus =
      action === 'ACCEPT' ? OfferStatus.ACCEPTED : OfferStatus.DECLINED;

    const updated = await prisma.offer.update({
      where: { id: offer.id },
      data: { status: newStatus, respondedAt: new Date() },
      select: offerSelect,
    });

    if (action === 'ACCEPT') {
      await this.convertOfferToOrder(offer.id, buyerId);
    }

    return updated;
  }

  async withdrawOffer(offerId: string, buyerId: string) {
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });

    if (!offer) throw new NotFoundError('Offer', offerId);
    if (offer.buyerId !== buyerId) throw new AuthorizationError();
    if (offer.status !== OfferStatus.PENDING) {
      throw new BusinessRuleError('Only pending offers can be withdrawn');
    }

    return prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.WITHDRAWN },
      select: offerSelect,
    });
  }

  async getBuyerOffers(buyerId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.offer.findMany({
        where: { buyerId, isCounter: false },
        select: offerSelect,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.offer.count({ where: { buyerId, isCounter: false } }),
    ]);

    return {
      data: {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      },
    };
  }

  async getSellerOffers(sellerId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.offer.findMany({
        where: {
          listing: { sellerId },
          isCounter: false,
        },
        select: offerSelect,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.offer.count({
        where: { listing: { sellerId }, isCounter: false },
      }),
    ]);

    return {
      data: {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      },
    };
  }

  private async convertOfferToOrder(
    offerId: string,
    _buyerId: string,
  ): Promise<void> {
    // Mark listing as reserved and update offer status
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.CONVERTED_TO_ORDER },
    });

    // Actual order creation happens in orders service when buyer completes payment
    // Here we just update the listing to RESERVED status
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      select: { listingId: true },
    });

    if (offer) {
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: ListingStatus.RESERVED },
      });
    }
  }
  async getListingOffers(listingId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.offer.findMany({
        where: { listingId, status: { notIn: ['WITHDRAWN', 'EXPIRED'] as never[] } },
        select: offerSelect,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.offer.count({ where: { listingId } }),
    ]);
    return { data: { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page < Math.ceil(total / limit), hasPreviousPage: page > 1 } } };
  }
}

export const offersService = new OffersService();
