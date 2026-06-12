import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/database';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { processAndSaveImage, resolveUploadUrl } from '../../middleware/upload';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { AuthenticatedRequest } from '../../shared/types';
import { authService } from '../auth/auth.service';

// ─── PATCH /users/me/profile ──────────────────────────────────────────────────

async function updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id: userId } = (request as AuthenticatedRequest).user;
  const body = request.body as Record<string, unknown>;

  const NIGERIAN_WHATSAPP_RE = /^\+234[789][01]\d{8}$/;
  if ('whatsappNumber' in body && body.whatsappNumber !== undefined && body.whatsappNumber !== '') {
    if (!NIGERIAN_WHATSAPP_RE.test(body.whatsappNumber as string)) {
      throw new ValidationError('Enter a valid Nigerian WhatsApp number (e.g. +2348012345678)');
    }
  }

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

  if ('whatsappNumber' in body) {
    userData.whatsappNumber = body.whatsappNumber || null;
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
  const avatarUrl = result.url ? resolveUploadUrl(result.url) : null;

  await prisma.userProfile.update({
    where: { userId },
    data: { avatarUrl: avatarUrl ?? undefined },
  });

  void reply.status(200).send({ success: true, data: { avatarUrl } });
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

  const emailOn = user.profile?.emailNotifications ?? true;
  const pushOn = user.profile?.pushNotifications ?? true;

  void reply.status(200).send({
    success: true,
    data: {
      ...safeUser,
      notificationPreferences: {
        emailOnMessage: emailOn,
        emailOnOffer: emailOn,
        emailOnOrderUpdate: emailOn,
        emailOnPriceAlert: emailOn,
        emailOnNewListing: emailOn,
        pushOnMessage: pushOn,
        pushOnOffer: pushOn,
        pushOnOrderUpdate: pushOn,
      },
    },
  });
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

    const shopName = user.profile?.firstName
      ? `${user.profile.firstName}'s Shop`
      : `${user.username}'s Shop`;
    const shopSlug = user.username.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (user.roles.includes('SELLER' as never)) {
      // Already a seller — ensure sellerProfile exists (safety net)
      await prisma.sellerProfile.upsert({
        where: { userId },
        create: { userId, shopName, shopSlug },
        update: {},
      });
    } else {
      // Add SELLER role and create sellerProfile atomically
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { roles: { push: 'SELLER' as never } },
        }),
        prisma.sellerProfile.upsert({
          where: { userId },
          create: { userId, shopName, shopSlug },
          update: {},
        }),
      ]);
    }

    // Re-fetch user with updated roles and issue a fresh access token.
    // requireSeller reads roles from the JWT payload — the old token still
    // contains BUYER-only roles, so the client must replace it immediately.
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, username: true, roles: true },
    });
    const newAccessToken = authService.generateAccessToken(updatedUser);

    void reply.status(200).send({
      success: true,
      message: 'Seller account activated. You can now post listings.',
      data: { accessToken: newAccessToken },
    });
  });

  // GET /users/me/notifications/preferences
  fastify.patch('/me/notification-preferences', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const body = req.body as Record<string, boolean>;

    // Accept either simple or granular fields; collapse to the two stored booleans
    const emailFields = ['emailOnMessage', 'emailOnOffer', 'emailOnOrderUpdate', 'emailOnPriceAlert', 'emailOnNewListing'];
    const pushFields = ['pushOnMessage', 'pushOnOffer', 'pushOnOrderUpdate'];

    const data: { emailNotifications?: boolean; pushNotifications?: boolean } = {};

    if ('emailNotifications' in body) data.emailNotifications = body.emailNotifications;
    if ('pushNotifications' in body) data.pushNotifications = body.pushNotifications;

    const granularEmail = emailFields.filter((f) => f in body).map((f) => body[f]);
    if (granularEmail.length > 0) {
      data.emailNotifications = granularEmail.some(Boolean);
    }
    const granularPush = pushFields.filter((f) => f in body).map((f) => body[f]);
    if (granularPush.length > 0) {
      data.pushNotifications = granularPush.some(Boolean);
    }

    const updated = await prisma.userProfile.update({
      where: { userId },
      data,
    });

    const emailOn = updated.emailNotifications;
    const pushOn = updated.pushNotifications;

    void reply.status(200).send({
      success: true,
      data: {
        notificationPreferences: {
          emailOnMessage: emailOn,
          emailOnOffer: emailOn,
          emailOnOrderUpdate: emailOn,
          emailOnPriceAlert: emailOn,
          emailOnNewListing: emailOn,
          pushOnMessage: pushOn,
          pushOnOffer: pushOn,
          pushOnOrderUpdate: pushOn,
        },
      },
    });
  });

  // GET /users/:username/public — public profile by username
  fastify.get('/:username/public', { preHandler: [optionalAuth] }, async (req, reply) => {
    const { username } = req.params as { username: string };
    const viewer = (req as Partial<AuthenticatedRequest>).user;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        createdAt: true,
        whatsappNumber: true,
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
    const { whatsappNumber, ...publicUser } = user;
    const data = viewer ? { ...publicUser, whatsappNumber } : publicUser;
    void reply.status(200).send({ success: true, data });
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

  // ── Addresses ──────────────────────────────────────────────────────────────

  // GET /users/me/addresses
  fastify.get('/me/addresses', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    const mapped = addresses.map((a) => ({
      id: a.id,
      label: a.label ?? '',
      type: deriveAddressType(a.label),
      recipientName: a.fullName,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      postalCode: a.zipCode,
      country: a.country,
      phone: a.phoneNumber,
      isDefault: a.isDefault,
      createdAt: a.createdAt,
    }));
    void reply.status(200).send({ success: true, data: mapped });
  });

  // POST /users/me/addresses
  fastify.post('/me/addresses', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const body = req.body as {
      label?: string; recipientName: string; line1: string; line2?: string;
      city: string; state: string; postalCode?: string; country?: string;
      phone?: string; isDefault?: boolean;
    };

    if (body.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: body.label ?? '',
        fullName: body.recipientName,
        line1: body.line1,
        line2: body.line2 ?? null,
        city: body.city,
        state: body.state,
        zipCode: body.postalCode ?? '',
        country: body.country ?? 'Nigeria',
        phoneNumber: body.phone ?? null,
        isDefault: body.isDefault ?? false,
      },
    });

    void reply.status(201).send({
      success: true,
      data: {
        id: address.id,
        label: address.label ?? '',
        type: deriveAddressType(address.label),
        recipientName: address.fullName,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        country: address.country,
        phone: address.phoneNumber,
        isDefault: address.isDefault,
        createdAt: address.createdAt,
      },
    });
  });

  // PATCH /users/me/addresses/:id
  fastify.patch('/me/addresses/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = req.body as {
      label?: string; recipientName?: string; line1?: string; line2?: string;
      city?: string; state?: string; postalCode?: string; country?: string;
      phone?: string; isDefault?: boolean;
    };

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError('Address', id);

    if (body.isDefault) {
      await prisma.address.updateMany({ where: { userId, NOT: { id } }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(body.label !== undefined && { label: body.label }),
        ...(body.recipientName !== undefined && { fullName: body.recipientName }),
        ...(body.line1 !== undefined && { line1: body.line1 }),
        ...(body.line2 !== undefined && { line2: body.line2 }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.postalCode !== undefined && { zipCode: body.postalCode }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.phone !== undefined && { phoneNumber: body.phone }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      },
    });

    void reply.status(200).send({
      success: true,
      data: {
        id: address.id,
        label: address.label ?? '',
        type: deriveAddressType(address.label),
        recipientName: address.fullName,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        country: address.country,
        phone: address.phoneNumber,
        isDefault: address.isDefault,
        createdAt: address.createdAt,
      },
    });
  });

  // DELETE /users/me/addresses/:id
  fastify.delete('/me/addresses/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError('Address', id);
    await prisma.address.delete({ where: { id } });
    void reply.status(200).send({ success: true });
  });

  // ── Bank Accounts ───────────────────────────────────────────────────────────

  // GET /users/me/bank-accounts
  fastify.get('/me/bank-accounts', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const accounts = await prisma.bankAccount.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    void reply.status(200).send({ success: true, data: accounts });
  });

  // POST /users/me/bank-accounts
  fastify.post('/me/bank-accounts', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const body = req.body as {
      bankName: string; accountName: string; accountNumber: string;
      bankCode?: string; isDefault?: boolean;
    };

    if (!body.bankName || !body.accountName || !body.accountNumber) {
      throw new ValidationError('bankName, accountName, and accountNumber are required');
    }
    if (!/^\d{10}$/.test(body.accountNumber)) {
      throw new ValidationError('Account number must be exactly 10 digits');
    }

    const count = await prisma.bankAccount.count({ where: { userId } });
    if (count >= 3) throw new ValidationError('Maximum of 3 bank accounts allowed');

    if (body.isDefault) {
      await prisma.bankAccount.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const account = await prisma.bankAccount.create({
      data: {
        userId,
        bankName: body.bankName,
        accountName: body.accountName,
        accountNumber: body.accountNumber,
        bankCode: body.bankCode ?? null,
        isDefault: body.isDefault ?? (count === 0),
      },
    });
    void reply.status(201).send({ success: true, data: account });
  });

  // PATCH /users/me/bank-accounts/:id
  fastify.patch('/me/bank-accounts/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = req.body as { isDefault?: boolean };

    const existing = await prisma.bankAccount.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError('BankAccount', id);

    if (body.isDefault) {
      await prisma.bankAccount.updateMany({ where: { userId, NOT: { id } }, data: { isDefault: false } });
    }

    const account = await prisma.bankAccount.update({
      where: { id },
      data: { ...(body.isDefault !== undefined && { isDefault: body.isDefault }) },
    });
    void reply.status(200).send({ success: true, data: account });
  });

  // DELETE /users/me/bank-accounts/:id
  fastify.delete('/me/bank-accounts/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id: userId } = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const existing = await prisma.bankAccount.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError('BankAccount', id);
    await prisma.bankAccount.delete({ where: { id } });
    void reply.status(200).send({ success: true });
  });
}

function deriveAddressType(label: string | null | undefined): 'home' | 'work' | 'other' {
  const l = (label ?? '').toLowerCase();
  if (l.includes('home') || l.includes('house')) return 'home';
  if (l.includes('work') || l.includes('office') || l.includes('business')) return 'work';
  return 'other';
}
