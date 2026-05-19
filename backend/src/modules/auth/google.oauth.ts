import { google } from 'googleapis';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';
import { authService } from './auth.service';
import { AUTH } from '../../config/constants';
import { logger } from '../../config/logger';

function getOAuthClient() {
  return new google.auth.OAuth2(
    authConfig.googleClientId,
    authConfig.googleClientSecret,
    `${process.env.API_URL ?? 'http://localhost:4000'}/api/v1/auth/google/callback`,
  );
}

export function getGoogleAuthUrl(state?: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
    ...(state ? { state } : {}),
  });
}

export async function handleGoogleCallback(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser: boolean;
}> {
  const client = getOAuthClient();

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data: profile } = await oauth2.userinfo.get();

  if (!profile.email) {
    throw new Error('Google account has no email address');
  }

  // Find existing user by Google ID or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { oauthProviderId: profile.id ?? undefined },
        { email: profile.email.toLowerCase() },
      ],
    },
  });

  let isNewUser = false;

  if (!user) {
    // Create new user from Google profile
    isNewUser = true;
    const baseUsername = (profile.email.split('@')[0] ?? 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
    const username = `${baseUsername}_${nanoid(4)}`;

    user = await prisma.user.create({
      data: {
        email: profile.email.toLowerCase(),
        username,
        oauthProvider: 'google',
        oauthProviderId: profile.id ?? null,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
        roles: [UserRole.BUYER],
        profile: {
          create: {
            firstName: profile.given_name ?? null,
            lastName: profile.family_name ?? null,
            displayName: profile.name ?? username,
            avatarUrl: profile.picture ?? null,
          },
        },
      },
    });

    logger.info({ userId: user.id, email: user.email }, 'New user via Google OAuth');
  } else {
    // Link Google ID if not already set
    if (!user.oauthProviderId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: 'google',
          oauthProviderId: profile.id ?? null,
          emailVerified: true,
        },
      });
    }

    if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED || user.deletedAt) {
      throw new Error('Account is inactive or banned');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info({ userId: user.id }, 'Existing user signed in via Google OAuth');
  }

  // Issue refresh token record
  const newRefreshTokenId = nanoid();
  const refreshToken = authService.generateRefreshToken(user.id, newRefreshTokenId);
  const tokenHash = await bcrypt.hash(refreshToken, 8);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      deviceInfo: 'Google OAuth',
      expiresAt: new Date(Date.now() + AUTH.REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  const accessToken = authService.generateAccessToken(user);

  return { accessToken, refreshToken, expiresIn: 15 * 60, isNewUser };
}
