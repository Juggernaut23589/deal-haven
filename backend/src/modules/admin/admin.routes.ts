import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/database';
import { requireAuth, requireRole } from '../../middleware/auth';
import { UserRole, UserStatus, ListingStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../shared/errors';

const adminGuard = [requireAuth, requireRole(UserRole.ADMIN)];

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {

  // ── GET /admin/stats ────────────────────────────────────────────────────────
  fastify.get('/stats', { preHandler: adminGuard }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const [users, listings, orders, disputes, openDisputes] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.listing.count({ where: { status: ListingStatus.ACTIVE, deletedAt: null } }),
      prisma.order.count(),
      prisma.dispute.count(),
      prisma.dispute.count({ where: { status: { in: ['OPENED', 'EVIDENCE_COLLECTION', 'UNDER_REVIEW'] } } }),
    ]);
    void reply.send({ success: true, data: { users, listings, orders, disputes, openDisputes } });
  });

  // ── GET /admin/users ────────────────────────────────────────────────────────
  fastify.get('/users', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, limit = 30, search, status, role } = req.query as {
      page?: number; limit?: number; search?: string; status?: string; role?: string;
    };
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status: status as UserStatus }),
      ...(role && { roles: { has: role as UserRole } }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, username: true, status: true, roles: true,
          emailVerified: true, createdAt: true, lastLoginAt: true,
          profile: { select: { displayName: true, avatarUrl: true } },
          _count: { select: { listings: true, buyerOrders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    void reply.send({
      success: true,
      data,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  });

  // ── PATCH /admin/users/:id/status ───────────────────────────────────────────
  fastify.patch('/users/:id/status', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { status, reason } = req.body as { status: UserStatus; reason?: string };

    if (!Object.values(UserStatus).includes(status)) {
      throw new ValidationError('Invalid status value');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) throw new NotFoundError('User not found');

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, username: true, status: true },
    });

    void reply.send({ success: true, data: updated, message: `User ${status.toLowerCase()}. ${reason ?? ''}`.trim() });
  });

  // ── GET /admin/listings ─────────────────────────────────────────────────────
  fastify.get('/listings', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, limit = 30, search, status } = req.query as {
      page?: number; limit?: number; search?: string; status?: string;
    };
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      deletedAt: null,
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
      ...(status && { status: status as ListingStatus }),
    };

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, price: true, status: true, createdAt: true,
          seller: { select: { id: true, username: true, email: true } },
          category: { select: { name: true } },
          images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } },
          _count: { select: { reports: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    void reply.send({
      success: true,
      data,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  });

  // ── PATCH /admin/listings/:id/status ───────────────────────────────────────
  fastify.patch('/listings/:id/status', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: ListingStatus };

    if (!Object.values(ListingStatus).includes(status)) {
      throw new ValidationError('Invalid status value');
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.deletedAt) throw new NotFoundError('Listing not found');

    const updated = await prisma.listing.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, status: true },
    });

    void reply.send({ success: true, data: updated });
  });

  // ── GET /admin/disputes ─────────────────────────────────────────────────────
  fastify.get('/disputes', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, limit = 20, status } = req.query as {
      page?: number; limit?: number; status?: string;
    };
    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      prisma.dispute.findMany({
        where: status ? { status: status as never } : undefined,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true, orderNumber: true, total: true,
              buyer: { select: { id: true, username: true, email: true } },
              items: {
                take: 1,
                select: { sellerId: true, sellerUsername: true },
              },
            },
          },
        },
      }),
      prisma.dispute.count(status ? { where: { status: status as never } } : undefined),
    ]);

    void reply.send({
      success: true,
      data,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  });

  // ── PATCH /admin/disputes/:id/resolve ──────────────────────────────────────
  fastify.patch('/disputes/:id/resolve', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { resolution, adminNotes } = req.body as { resolution: string; adminNotes: string };

    const statusMap: Record<string, string> = {
      full_refund: 'RESOLVED_FULL_REFUND',
      partial_refund: 'RESOLVED_PARTIAL_REFUND',
      no_refund: 'RESOLVED_NO_REFUND',
      return_for_refund: 'RESOLVED_RETURN_FOR_REFUND',
    };

    const newStatus = statusMap[resolution];
    if (!newStatus) throw new ValidationError('Invalid resolution type');

    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundError('Dispute not found');

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        status: newStatus as never,
        resolution: adminNotes,
        resolvedAt: new Date(),
      },
    });

    void reply.send({ success: true, data: updated });
  });

  // ── GET /admin/reports ─────────────────────────────────────────────────────
  fastify.get('/reports', { preHandler: adminGuard }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, limit = 30, status } = req.query as {
      page?: number; limit?: number; status?: string;
    };
    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      prisma.report.findMany({
        where: status ? { status: { equals: status as never } } : {},
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, username: true, email: true } },
          listing: { select: { id: true, title: true } },
        },
      }),
      prisma.report.count({ where: status ? { status: { equals: status as never } } : undefined }),
    ]);

    void reply.send({
      success: true,
      data,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  });
}
