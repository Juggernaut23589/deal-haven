import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AuthenticationError, AuthorizationError } from '../shared/errors';
import { authConfig } from '../config/auth';
import type { JwtPayload, AuthenticatedUser } from '../shared/types';

export function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, authConfig.jwtSecret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid access token');
    }
    throw new AuthenticationError('Authentication failed');
  }
}

// Middleware: require authenticated user
export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const token = extractToken(request);

  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  const payload = verifyAccessToken(token);

  const user: AuthenticatedUser = {
    id: payload.sub,
    email: payload.email,
    username: payload.username,
    roles: payload.roles,
    isPremium: false, // Loaded from token; full data via separate call if needed
  };

  (request as FastifyRequest & { user: AuthenticatedUser }).user = user;
}

// Middleware: attach user if token present, but don't require it
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const token = extractToken(request);
  if (!token) return;

  try {
    const payload = verifyAccessToken(token);
    (request as FastifyRequest & { user: AuthenticatedUser }).user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
      isPremium: false,
    };
  } catch {
    // Ignore invalid tokens in optional auth
  }
}

// Factory: require specific role(s)
export function requireRole(...roles: UserRole[]) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    await requireAuth(request, _reply);

    const user = (request as FastifyRequest & { user: AuthenticatedUser }).user;
    const hasRole = roles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new AuthorizationError(
        `Requires one of these roles: ${roles.join(', ')}`,
      );
    }
  };
}

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireModerator = requireRole(UserRole.ADMIN, UserRole.MODERATOR);
export const requireSeller = requireRole(UserRole.SELLER, UserRole.ADMIN);
