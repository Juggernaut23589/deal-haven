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
}
