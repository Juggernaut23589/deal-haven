import type { FastifyInstance } from 'fastify';
import { reviewsService } from './reviews.service';
import { requireAuth, requireSeller } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';
import { z } from 'zod';
import { REVIEW } from '../../config/constants';
import { prisma } from '../../config/database';

const createReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().max(REVIEW.MAX_CONTENT_LENGTH).optional(),
});

const sellerResponseSchema = z.object({
  response: z.string().min(1).max(REVIEW.SELLER_RESPONSE_MAX_LENGTH),
});

export async function reviewRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /reviews/me — buyer's reviews they have written
  fastify.get('/me', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const page = parseInt(q.page ?? '1', 10);
    const limit = parseInt(q.limit ?? '20', 10);
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { reviewerId: user.id },
        include: {
          reviewee: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } } },
          listing: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.review.count({ where: { reviewerId: user.id } }),
    ]);
    void reply.status(200).send({
      success: true,
      data: { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  });

  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = createReviewSchema.parse(req.body);
    const review = await reviewsService.createReview(user.id, body);
    void reply.status(201).send({ success: true, data: review });
  });

  // Support both POST and PATCH for seller response
  fastify.post('/:id/response', { preHandler: [requireSeller] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = sellerResponseSchema.parse(req.body);
    const review = await reviewsService.addSellerResponse(id, user.id, body.response);
    void reply.status(200).send({ success: true, data: review });
  });

  fastify.patch('/:id/respond', { preHandler: [requireSeller] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = sellerResponseSchema.parse(req.body);
    const review = await reviewsService.addSellerResponse(id, user.id, body.response);
    void reply.status(200).send({ success: true, data: review });
  });

  fastify.get('/seller/:sellerId', async (req, reply) => {
    const { sellerId } = req.params as { sellerId: string };
    const q = req.query as { page?: string; limit?: string };
    const result = await reviewsService.getSellerReviews(
      sellerId,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, data: result.data });
  });

  fastify.get('/listing/:listingId', async (req, reply) => {
    const { listingId } = req.params as { listingId: string };
    const q = req.query as { page?: string; limit?: string };
    const page = parseInt(q.page ?? '1', 10);
    const limit = parseInt(q.limit ?? '10', 10);
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        include: {
          reviewer: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.review.count({ where: { listingId } }),
    ]);

    void reply.status(200).send({
      success: true,
      data: {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page < Math.ceil(total / limit), hasPreviousPage: page > 1 },
      },
    });
  });
}
