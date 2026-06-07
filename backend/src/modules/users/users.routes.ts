import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/database';
import { requireAuth } from '../../middleware/auth';
import { processAndSaveImage } from '../../middleware/upload';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { AuthenticatedRequest } from '../../shared/types';

// ─── PATCH /users/me/profile ──────────────────────────────────────────────────

async function updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id: userId } = (request as AuthenticatedRequest).user;
  const body = request.body as Record<string, unknown>;

  const allowedFields = [
    'displayName', 'firstName', 'lastName', 'bio',
    'city', 'state', 'phoneNumber',
    'preferredCurrency', 'preferredLocale',
  ];

  const profileData: Record<string, unknown> = {};
  const userData: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (key in body && body[key] !== undefined) {
      if (key === 'phoneNumber') {
        userData[key] = body[key];
      } else {
        profileData[key] = body[key];
      }
    }
  }

  // Also handle username update (stored on User table)
  if ('username' in body && typeof body.username === 'string') {
    const username = body.username.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      throw new ValidationError(
        'Username must be 3–30 characters and contain only letters, numbers, or underscores.',
      );
    }
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: userId } },
    });
    if (existing) {
      throw new ValidationError('This username is already taken.');
    }
    userData.username = username;
  }

  // Also update sellerProfile.shopName if provided
  const shopName = typeof body.shopName === 'string' ? body.shopName.trim() : null;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...userData,
      profile: { update: profileData },
      ...(shopName
        ? {
            sellerProfile: {
              upsert: {
                create: {
                  shopName,
                  shopSlug: shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                },
                update: { shopName },
              },
            },
          }
        : {}),
    },
    include: {
      profile: true,
      sellerProfile: {
        select: {
          shopName: true,
          shopSlug: true,
          verificationStatus: true,
          isStarSeller: true,
          averageRating: true,
          totalReviews: true,
        },
      },
    },
  });

  const { passwordHash: _ph, twoFactorSecret: _tfs, ...safeUser } = updatedUser;

  void reply.status(200).send({ success: true, data: safeUser });
}

// ─── POST /users/me/avatar ────────────────────────────────────────────────────

async function uploadAvatar(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id: userId } = (request as AuthenticatedRequest).user;

  const data = await request.file();
  if (!data) throw new ValidationError('No file uploaded.');

  const buffer = await data.toBuffer();
  if (buffer.length > 5 * 1024 * 1024) throw new ValidationError('File too large. Max 5MB.');

  const result = await processAndSaveImage(buffer, data.mimetype, 'images/avatars');

  await prisma.userProfile.update({
    where: { userId },
    data: { avatarUrl: result.url },
  });

  void reply.status(200).send({ success: true, data: { avatarUrl: result.url } });
}

// ─── GET /users/me ────────────────────────────────────────────────────────────

async function getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id: userId } = (request as AuthenticatedRequest).user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      sellerProfile: {
        select: {
          shopName: true,
          shopSlug: true,
          verificationStatus: true,
          isStarSeller: true,
          averageRating: true,
          totalReviews: true,
        },
      },
    },
  });

  if (!user || user.deletedAt) throw new NotFoundError('User not found');

  const { passwordHash: _ph, twoFactorSecret: _tfs, ...safeUser } = user;
  void reply.status(200).send({ success: true, data: safeUser });
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/me', { preHandler: [requireAuth] }, getMe);
  fastify.patch('/me/profile', { preHandler: [requireAuth] }, updateProfile);
  fastify.post('/me/avatar', { preHandler: [requireAuth] }, uploadAvatar);

  // GET /users/me/seller-profile
  fastify.get('/me/seller-profile', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, username: true, email: true, profile: { select: { displayName: true, avatarUrl: true } } } },
      },
    });
    if (!profile) {
      // Auto-create seller profile on first access
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
      const created = await prisma.sellerProfile.create({
        data: {
          userId,
          shopName: user?.username ?? 'My Shop',
          shopSlug: (user?.username ?? userId).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      });
      void reply.status(200).send({ success: true, data: created });
      return;
    }
    void reply.status(200).send({ success: true, data: profile });
  });

  // POST /users/me/become-seller — upgrade a buyer account to seller (idempotent)
  fastify.post('/me/become-seller', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, roles: true, profile: { select: { firstName: true, lastName: true } } },
    });

    if (!user) {
      void reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    if (user.roles.includes('SELLER' as never)) {
      // Already a seller — ensure sellerProfile exists (safety net)
      await prisma.sellerProfile.upsert({
        where: { userId },
        create: {
          userId,
          shopName: user.profile?.firstName ? `${user.profile.firstName}'s Shop` : `${user.username}'s Shop`,
          shopSlug: user.username.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
        update: {},
      });
      void reply.status(200).send({ success: true, message: 'Already a seller' });
      return;
    }

    // Add SELLER role and create sellerProfile atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { roles: { push: 'SELLER' as never } },
      }),
      prisma.sellerProfile.create({
        data: {
          userId,
          shopName: user.profile?.firstName ? `${user.profile.firstName}'s Shop` : `${user.username}'s Shop`,
          shopSlug: user.username.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
      }),
    ]);

    void reply.status(200).send({ success: true, message: 'Seller account activated. You can now post listings.' });
  });

  // GET /users/me/notifications/preferences
  fastify.patch('/me/notification-preferences', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const body = req.body as { emailNotifications?: boolean; pushNotifications?: boolean };
    const updated = await prisma.userProfile.update({
      where: { userId },
      data: {
        ...(body.emailNotifications !== undefined && { emailNotifications: body.emailNotifications }),
        ...(body.pushNotifications !== undefined && { pushNotifications: body.pushNotifications }),
      },
    });
    void reply.status(200).send({ success: true, data: updated });
  });

  // GET /users/:username/public — public profile by username
  fastify.get('/:username/public', async (req, reply) => {
    const { username } = req.params as { username: string };
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        createdAt: true,
        profile: { select: { displayName: true, avatarUrl: true, bio: true, city: true, state: true } },
        sellerProfile: {
          select: {
            shopName: true, shopSlug: true, shopDescription: true, shopBannerUrl: true,
            averageRating: true, totalReviews: true, totalSales: true, isStarSeller: true, verificationStatus: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundError('User', username);
    void reply.status(200).send({ success: true, data: user });
  });

  // ── GET /users/me/seller-stats ─────────────────────────────────────────────
  fastify.get('/me/seller-stats', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: sellerId } = (req as AuthenticatedRequest).user;
    const rangeParam = (req.query as { range?: string }).range ?? '30d';
    const days = rangeParam === '7d' ? 7 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalListings,
      activeListings,
      totalOrders,
      recentOrders,
      sellerProfile,
      ordersInRange,
    ] = await Promise.all([
      prisma.listing.count({ where: { sellerId, deletedAt: null } }),
      prisma.listing.count({ where: { sellerId, status: 'ACTIVE', deletedAt: null } }),
      prisma.orderItem.count({ where: { sellerId } }),
      prisma.orderItem.count({ where: { sellerId, order: { status: { in: ['PENDING', 'PROCESSING'] } } } }),
      prisma.sellerProfile.findUnique({
        where: { userId: sellerId },
        select: { averageRating: true, totalReviews: true, totalSales: true, responseRate: true },
      }),
      prisma.orderItem.findMany({
        where: { sellerId, order: { createdAt: { gte: since } } },
        select: { totalPrice: true, order: { select: { createdAt: true } } },
        orderBy: { order: { createdAt: 'asc' } },
      }),
    ]);

    // Build daily revenue chart data
    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      revenueByDay[key] = 0;
    }
    for (const item of ordersInRange) {
      const key = item.order.createdAt.toISOString().slice(0, 10);
      if (key in revenueByDay) revenueByDay[key] += Number(item.totalPrice);
    }

    const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    void reply.status(200).send({
      success: true,
      data: {
        totalListings,
        activeListings,
        totalOrders,
        pendingOrders: recentOrders,
        averageRating: sellerProfile?.averageRating ?? 0,
        totalReviews: sellerProfile?.totalReviews ?? 0,
        totalSales: sellerProfile?.totalSales ?? 0,
        responseRate: sellerProfile?.responseRate ?? 100,
        chartData,
        range: rangeParam,
      },
    });
  });
}
