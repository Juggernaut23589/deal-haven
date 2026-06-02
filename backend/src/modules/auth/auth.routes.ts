import type { FastifyInstance } from 'fastify';
import { authController } from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimiter';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Public routes with rate limiting
  fastify.post(
    '/register',
    { preHandler: [authRateLimiter] },
    (req, reply) => authController.register(req, reply),
  );

  fastify.post(
    '/login',
    { preHandler: [authRateLimiter] },
    (req, reply) => authController.login(req, reply),
  );

  fastify.post(
    '/refresh',
    { preHandler: [authRateLimiter] },
    (req, reply) => authController.refresh(req, reply),
  );

  fastify.post(
    '/forgot-password',
    { preHandler: [authRateLimiter] },
    (req, reply) => authController.forgotPassword(req, reply),
  );

  fastify.post(
    '/reset-password',
    { preHandler: [authRateLimiter] },
    (req, reply) => authController.resetPassword(req, reply),
  );

  // Authenticated routes
  fastify.post(
    '/logout',
    { preHandler: [requireAuth] },
    (req, reply) => authController.logout(req, reply),
  );

  fastify.post(
    '/logout-all',
    { preHandler: [requireAuth] },
    (req, reply) => authController.logoutAll(req, reply),
  );

  // Accept both GET (legacy link-click) and POST (frontend form/api call)
  fastify.post(
    '/verify-email',
    (req, reply) => authController.verifyEmail(req, reply),
  );
  fastify.get(
    '/verify-email',
    (req, reply) => authController.verifyEmail(req, reply),
  );

  fastify.get(
    '/me',
    { preHandler: [requireAuth] },
    (req, reply) => authController.me(req, reply),
  );

  // Google OAuth
  fastify.get('/google', (req, reply) => authController.googleRedirect(req, reply));
  fastify.get('/google/callback', (req, reply) => authController.googleCallback(req, reply));
}
