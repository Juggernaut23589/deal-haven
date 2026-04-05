import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { requireAuth } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string; unread?: string };
    const page = parseInt(q.page ?? '1', 10);
    const limit = parseInt(q.limit ?? '20', 10);
    const offset = (page - 1) * limit;

    const where = {
      userId: user.id,
      ...(q.unread === 'true' && { isRead: false }),
    };

    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    void reply.status(200).send({
      success: true,
      data,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  });

  fastify.patch('/:id/read', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };

    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true, readAt: new Date() },
    });

    void reply.status(200).send({ success: true });
  });

  fastify.patch('/read-all', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    void reply.status(200).send({ success: true, message: 'All notifications marked as read' });
  });
}
