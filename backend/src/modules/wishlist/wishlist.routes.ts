import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { requireAuth } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';
import { z } from 'zod';

const toggleWishlistSchema = z.object({
  listingId: z.string().uuid(),
  notifyOnPriceDrop: z.boolean().optional().default(false),
});

export async function wishlistRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const page = parseInt(q.page ?? '1', 10);
    const limit = parseInt(q.limit ?? '20', 10);
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              condition: true,
              dealScore: true,
              dealScoreLabel: true,
              images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } },
              seller: {
                select: {
                  username: true,
                  sellerProfile: { select: { shopName: true, averageRating: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.wishlistItem.count({ where: { userId: user.id } }),
    ]);

    void reply.status(200).send({
      success: true,
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
    });
  });

  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = toggleWishlistSchema.parse(req.body);

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_listingId: { userId: user.id, listingId: body.listingId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { userId_listingId: { userId: user.id, listingId: body.listingId } },
      });
      void reply.status(200).send({ success: true, added: false, message: 'Removed from wishlist' });
      return;
    }

    // Get current price
    const listing = await prisma.listing.findUnique({
      where: { id: body.listingId },
      select: { price: true },
    });

    await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        listingId: body.listingId,
        priceAtSave: listing?.price,
        notifyOnPriceDrop: body.notifyOnPriceDrop,
      },
    });

    // Increment favorite count
    await prisma.listing.update({
      where: { id: body.listingId },
      data: { favoriteCount: { increment: 1 } },
    });

    void reply.status(201).send({ success: true, added: true, message: 'Added to wishlist' });
  });

  fastify.delete('/:listingId', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { listingId } = req.params as { listingId: string };

    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, listingId },
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: { favoriteCount: { decrement: 1 } },
    });

    void reply.status(200).send({ success: true, message: 'Removed from wishlist' });
  });
}
