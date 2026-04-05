import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import path from 'path';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { listingRoutes } from './modules/listings/listings.routes';
import { offerRoutes } from './modules/offers/offers.routes';
import { orderRoutes } from './modules/orders/orders.routes';
import { messageRoutes } from './modules/messages/messages.routes';
import { reviewRoutes } from './modules/reviews/reviews.routes';
import { disputeRoutes } from './modules/disputes/disputes.routes';
import { notificationRoutes } from './modules/notifications/notifications.routes';
import { wishlistRoutes } from './modules/wishlist/wishlist.routes';
import { searchRoutes } from './modules/search/search.routes';
import { FILE_UPLOAD } from './config/constants';
import { nanoid } from 'nanoid';

export async function buildApp() {
  const fastify = Fastify({
    logger: logger as never,
    genReqId: () => nanoid(),
    trustProxy: true,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // CORS
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Requested-With',
    ],
  });

  // Multipart (file uploads)
  await fastify.register(multipart, {
    limits: {
      fileSize: FILE_UPLOAD.MAX_IMAGE_SIZE_BYTES,
      files: FILE_UPLOAD.MAX_IMAGE_SIZE_BYTES,
    },
  });

  // Static file serving for uploads
  await fastify.register(staticFiles, {
    root: path.join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
    prefix: '/uploads/',
  });

  // Correlation ID middleware
  fastify.addHook('onRequest', async (request) => {
    if (!request.headers['x-correlation-id']) {
      request.headers['x-correlation-id'] = nanoid();
    }
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(listingRoutes, { prefix: '/api/v1/listings' });
  await fastify.register(offerRoutes, { prefix: '/api/v1/offers' });
  await fastify.register(orderRoutes, { prefix: '/api/v1/orders' });
  await fastify.register(messageRoutes, { prefix: '/api/v1/messages' });
  await fastify.register(reviewRoutes, { prefix: '/api/v1/reviews' });
  await fastify.register(disputeRoutes, { prefix: '/api/v1/disputes' });
  await fastify.register(notificationRoutes, { prefix: '/api/v1/notifications' });
  await fastify.register(wishlistRoutes, { prefix: '/api/v1/wishlist' });
  await fastify.register(searchRoutes, { prefix: '/api/v1/search' });

  // Health check
  fastify.get('/health', async (_request, reply) => {
    void reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'deal-haven-api',
      version: '1.0.0',
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((_request, reply) => {
    void reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested endpoint does not exist',
      },
    });
  });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  return fastify;
}
