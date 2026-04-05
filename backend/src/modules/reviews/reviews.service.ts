import { prisma } from '../../config/database';
import {
  NotFoundError,
  AuthorizationError,
  BusinessRuleError,
} from '../../shared/errors';
import { REVIEW } from '../../config/constants';
import { isWithinWindow, addHours } from '../../shared/utils';
import { OrderStatus } from '@prisma/client';

export class ReviewsService {
  async createReview(
    reviewerId: string,
    input: {
      orderId: string;
      rating: number;
      title?: string;
      content?: string;
    },
  ) {
    const order = await prisma.order.findFirst({
      where: {
        id: input.orderId,
        buyerId: reviewerId,
        status: OrderStatus.COMPLETED,
      },
      select: {
        id: true,
        deliveredAt: true,
        items: { select: { sellerId: true, listingId: true } },
        review: { select: { id: true } },
      },
    });

    if (!order) {
      throw new NotFoundError('Completed order', input.orderId);
    }

    if (order.review) {
      throw new BusinessRuleError('You have already reviewed this order');
    }

    if (!order.deliveredAt || !isWithinWindow(order.deliveredAt, REVIEW.WINDOW_DAYS)) {
      throw new BusinessRuleError(
        `Reviews can only be submitted within ${REVIEW.WINDOW_DAYS} days of delivery`,
      );
    }

    if (!order.items[0]) {
      throw new BusinessRuleError('Order has no items');
    }

    const editLockedAt = addHours(new Date(), REVIEW.EDIT_LOCK_HOURS);

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          orderId: input.orderId,
          listingId: order.items[0].listingId,
          reviewerId,
          revieweeId: order.items[0].sellerId,
          rating: input.rating,
          title: input.title,
          content: input.content,
          editLockedAt,
        },
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
          reviewee: {
            select: { id: true, username: true },
          },
        },
      });

      // Update seller's average rating
      const { _avg, _count } = await tx.review.aggregate({
        where: { revieweeId: order.items[0].sellerId, isVisible: true },
        _avg: { rating: true },
        _count: { id: true },
      });

      await tx.sellerProfile.update({
        where: { userId: order.items[0].sellerId },
        data: {
          averageRating: _avg.rating ?? 0,
          totalReviews: _count.id,
        },
      });

      // Mark order as completed (review submitted)
      await tx.order.update({
        where: { id: input.orderId },
        data: { status: OrderStatus.COMPLETED },
      });

      return created;
    });

    return review;
  }

  async addSellerResponse(
    reviewId: string,
    sellerId: string,
    response: string,
  ) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        revieweeId: true,
        sellerResponse: true,
        createdAt: true,
      },
    });

    if (!review) throw new NotFoundError('Review', reviewId);
    if (review.revieweeId !== sellerId) throw new AuthorizationError();

    if (review.sellerResponse) {
      throw new BusinessRuleError('You have already responded to this review');
    }

    return prisma.review.update({
      where: { id: reviewId },
      data: {
        sellerResponse: response,
        sellerResponseAt: new Date(),
      },
    });
  }

  async getSellerReviews(sellerId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { revieweeId: sellerId, isVisible: true },
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          sellerResponse: true,
          sellerResponseAt: true,
          createdAt: true,
          reviewer: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
          listing: {
            select: { id: true, title: true, images: { where: { isCover: true }, take: 1 } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.review.count({ where: { revieweeId: sellerId, isVisible: true } }),
    ]);

    // Rating distribution
    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { revieweeId: sellerId, isVisible: true },
      _count: { rating: true },
    });

    const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
      rating: r,
      count: distribution.find((d) => d.rating === r)?._count.rating ?? 0,
    }));

    return {
      data,
      ratingDistribution: ratingDist,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}

export const reviewsService = new ReviewsService();
