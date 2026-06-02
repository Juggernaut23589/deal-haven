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
import { userRoutes } from './modules/users/users.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { FILE_UPLOAD } from './config/constants';
import { nanoid } from 'nanoid';

export async function buildApp(options?: { https?: { key: Buffer; cert: Buffer } }) {
  const fastify = Fastify({
    logger: logger as never,
    genReqId: () => nanoid(),
    trustProxy: true,
    ...(options?.https ? { https: options.https } : {}),
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

  // CORS — build allowed origins list from env vars with safe defaults
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  // Add production frontend URL (set by Ansible as FRONTEND_URL)
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    // Also allow www. variant
    try {
      const u = new URL(process.env.FRONTEND_URL);
      allowedOrigins.push(`${u.protocol}//www.${u.host}`);
    } catch { /* invalid URL, skip */ }
  }

  // Add any additional comma-separated origins from ALLOWED_ORIGINS
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .forEach((o) => allowedOrigins.push(o));
  }

  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (server-to-server, curl, mobile apps)
      if (!origin) { cb(null, true); return; }
      if (allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin))) {
        cb(null, true);
      } else {
        cb(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
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
  // Use path.resolve so both relative ('uploads') and absolute paths work correctly
  const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');
  await fastify.register(staticFiles, {
    root: uploadRoot,
    prefix: '/uploads/',
  });

  // Correlation ID middleware
  fastify.addHook('onRequest', async (request) => {
    if (!request.headers['x-correlation-id']) {
      request.headers['x-correlation-id'] = nanoid();
    }
  });

  // Error handler MUST be registered before routes so child plugins inherit it
  fastify.setErrorHandler(errorHandler);

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
  await fastify.register(userRoutes, { prefix: '/api/v1/users' });
  await fastify.register(adminRoutes, { prefix: '/api/v1/admin' });

  // Health check
  fastify.get('/health', async (_request, reply) => {
    void reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ashimarket-api',
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

  return fastify;
}
