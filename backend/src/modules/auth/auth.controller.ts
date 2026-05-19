import type { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';
import { authService } from './auth.service';
import { getGoogleAuthUrl, handleGoogleCallback } from './google.oauth';
import { authConfig } from '../../config/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema';
import type { AuthenticatedRequest } from '../../shared/types';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = registerSchema.parse(request.body);

    const roles: UserRole[] = [UserRole.BUYER];
    if (body.asSeller) roles.push(UserRole.SELLER);

    const result = await authService.register({
      email: body.email,
      password: body.password,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      roles,
    });

    void reply.status(201).send({
      success: true,
      data: result,
      message: 'Account created successfully. Please verify your email.',
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = loginSchema.parse(request.body);

    const result = await authService.login({
      email: body.email,
      password: body.password,
      deviceInfo: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    void reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = refreshTokenSchema.parse(request.body);
    const tokens = await authService.refreshTokens(body.refreshToken);

    void reply.status(200).send({
      success: true,
      data: tokens,
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = logoutSchema.parse(request.body);
    const user = (request as AuthenticatedRequest).user;

    await authService.logout(user.id, body.refreshToken);

    void reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async logoutAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    await authService.logoutAll(user.id);

    void reply.status(200).send({
      success: true,
      message: 'Logged out from all devices',
    });
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const query = verifyEmailSchema.parse(request.query);

    await authService.verifyEmail(user.id, query.token);

    void reply.status(200).send({
      success: true,
      message: 'Email verified successfully',
    });
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = forgotPasswordSchema.parse(request.body);
    await authService.requestPasswordReset(body.email);

    // Always return 200 to prevent email enumeration
    void reply.status(200).send({
      success: true,
      message: 'If an account with this email exists, a reset link has been sent.',
    });
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = resetPasswordSchema.parse(request.body);
    await authService.resetPassword(body.userId, body.token, body.password);

    void reply.status(200).send({
      success: true,
      message: 'Password reset successfully. Please log in.',
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;

    const fullUser = await (await import('../../config/database')).prisma.user.findUnique({
      where: { id: user.id },
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

    if (!fullUser || fullUser.deletedAt) {
      void reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    const { passwordHash: _ph, twoFactorSecret: _tfs, ...safeUser } = fullUser;

    void reply.status(200).send({
      success: true,
      data: safeUser,
    });
  }

  async googleRedirect(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!authConfig.googleClientId || !authConfig.googleClientSecret) {
      void reply.status(503).send({
        success: false,
        error: { code: 'OAUTH_UNAVAILABLE', message: 'Google sign-in is not configured' },
      });
      return;
    }
    const url = getGoogleAuthUrl();
    void reply.redirect(url);
  }

  async googleCallback(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { code, error } = request.query as { code?: string; error?: string };
    const frontendUrl = authConfig.frontendUrl;

    if (error || !code) {
      void reply.redirect(`${frontendUrl}/auth/login?error=google_cancelled`);
      return;
    }

    try {
      const result = await handleGoogleCallback(code);
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: String(result.expiresIn),
        newUser: String(result.isNewUser),
      });
      void reply.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'google_error';
      void reply.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent(message)}`);
    }
  }
}

export const authController = new AuthController();
