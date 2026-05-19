import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';
import { AUTH } from '../../config/constants';
import {
  AuthenticationError,
  ConflictError,
  BusinessRuleError,
} from '../../shared/errors';
import { cache } from '../../config/redis';
import { logger } from '../../config/logger';
import type { JwtPayload, RefreshTokenPayload } from '../../shared/types';

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles?: UserRole[];
}

export interface LoginInput {
  email: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    roles: UserRole[];
    emailVerified: boolean;
    isPremium: boolean;
  };
  tokens: TokenPair;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password, username, firstName, lastName, roles = [UserRole.BUYER] } = input;

    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        throw new ConflictError('An account with this email already exists');
      }
      throw new ConflictError('This username is already taken');
    }

    const passwordHash = await bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        username: username.toLowerCase(),
        roles,
        profile: {
          create: {
            firstName,
            lastName,
            displayName: firstName ? `${firstName} ${lastName ?? ''}`.trim() : username,
          },
        },
      },
    });

    logger.info({ userId: user.id, email: user.email }, 'New user registered');

    // Queue email verification
    // await emailQueue.add('verify-email', { userId: user.id, email: user.email });

    return this.buildAuthResult(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password, deviceInfo, ipAddress } = input;

    // Brute force check
    const loginKey = cache.key.rateLimitLogin(email.toLowerCase());
    const attempts = await cache.get<number>(loginKey);
    if (attempts && attempts >= AUTH.MAX_LOGIN_ATTEMPTS) {
      throw new BusinessRuleError(
        'Too many failed login attempts. Please try again in 15 minutes.',
        'ACCOUNT_LOCKED',
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      await this.incrementLoginAttempts(loginKey);
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.status === UserStatus.BANNED) {
      throw new AuthenticationError('Your account has been banned. Contact support.');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthenticationError(
        'Your account has been suspended. Contact support.',
      );
    }

    if (user.deletedAt) {
      throw new AuthenticationError('This account has been deleted');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      await this.incrementLoginAttempts(loginKey);
      throw new AuthenticationError('Invalid email or password');
    }

    // Clear failed attempts on success
    await cache.del(loginKey);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create refresh token record
    const refreshTokenId = nanoid();
    const refreshToken = this.generateRefreshToken(user.id, refreshTokenId);
    const tokenHash = await bcrypt.hash(refreshToken, 8);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        deviceInfo,
        ipAddress,
        expiresAt: new Date(Date.now() + AUTH.REFRESH_TOKEN_EXPIRY_MS),
      },
    });

    logger.info({ userId: user.id }, 'User logged in');

    return this.buildAuthResult(user, refreshToken);
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        authConfig.jwtRefreshSecret,
      ) as RefreshTokenPayload;
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Find matching token records for this user
    const tokenRecords = await prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    // Find the matching token by comparing hash
    let validRecord = null;
    for (const record of tokenRecords) {
      const matches = await bcrypt.compare(refreshToken, record.tokenHash);
      if (matches) {
        validRecord = record;
        break;
      }
    }

    if (!validRecord) {
      throw new AuthenticationError('Refresh token not found or revoked');
    }

    const { user } = validRecord;

    if (user.status !== UserStatus.ACTIVE || user.deletedAt) {
      throw new AuthenticationError('Account is inactive');
    }

    // Rotate: revoke old, create new
    await prisma.refreshToken.update({
      where: { id: validRecord.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshTokenId = nanoid();
    const newRefreshToken = this.generateRefreshToken(user.id, newRefreshTokenId);
    const newTokenHash = await bcrypt.hash(newRefreshToken, 8);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        deviceInfo: validRecord.deviceInfo,
        ipAddress: validRecord.ipAddress,
        expiresAt: new Date(Date.now() + AUTH.REFRESH_TOKEN_EXPIRY_MS),
      },
    });

    const accessToken = this.generateAccessToken(user);
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenRecords = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
      },
    });

    for (const record of tokenRecords) {
      const matches = await bcrypt.compare(refreshToken, record.tokenHash);
      if (matches) {
        await prisma.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }

    logger.info({ userId }, 'User logged out');
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    logger.info({ userId }, 'User logged out from all devices');
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    const cacheKey = `email:verify:${userId}`;
    const storedToken = await cache.get<string>(cacheKey);

    if (!storedToken || storedToken !== token) {
      throw new BusinessRuleError('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
      },
    });

    await cache.del(cacheKey);
    logger.info({ userId }, 'Email verified');
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user || user.deletedAt) return;

    const token = nanoid(32);
    const cacheKey = `password:reset:${user.id}`;
    await cache.set(cacheKey, token, 60 * 60); // 1 hour

    // Queue password reset email
    // await emailQueue.add('password-reset', { userId: user.id, email: user.email, token });
    logger.info({ userId: user.id }, 'Password reset requested');
  }

  async resetPassword(
    userId: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const cacheKey = `password:reset:${userId}`;
    const storedToken = await cache.get<string>(cacheKey);

    if (!storedToken || storedToken !== token) {
      throw new BusinessRuleError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, AUTH.BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens
    await this.logoutAll(userId);
    await cache.del(cacheKey);

    logger.info({ userId }, 'Password reset successfully');
  }

  generateAccessToken(user: {
    id: string;
    email: string;
    username: string;
    roles: UserRole[];
  }): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
    };

    return jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.accessTokenExpiry,
    } as jwt.SignOptions);
  }

  generateRefreshToken(userId: string, tokenId: string): string {
    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      sub: userId,
      tokenId,
    };

    return jwt.sign(payload, authConfig.jwtRefreshSecret, {
      expiresIn: authConfig.refreshTokenExpiry,
    } as jwt.SignOptions);
  }

  private async buildAuthResult(
    user: {
      id: string;
      email: string;
      username: string;
      roles: UserRole[];
      emailVerified: boolean;
      isPremium: boolean;
    },
    refreshToken?: string,
  ): Promise<AuthResult> {
    const accessToken = this.generateAccessToken(user);
    const finalRefreshToken = refreshToken ?? this.generateRefreshToken(user.id, nanoid());

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        emailVerified: user.emailVerified,
        isPremium: user.isPremium,
      },
      tokens: {
        accessToken,
        refreshToken: finalRefreshToken,
        expiresIn: 15 * 60,
      },
    };
  }

  private async incrementLoginAttempts(key: string): Promise<void> {
    const redis = (await import('../../config/redis')).getRedisClient();
    const lockoutSeconds = Math.ceil(AUTH.LOCKOUT_DURATION_MS / 1000);
    await redis.multi().incr(key).expire(key, lockoutSeconds).exec();
  }
}

export const authService = new AuthService();
