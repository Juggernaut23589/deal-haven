import type { FastifyInstance } from 'fastify';
import { listingsController } from './listings.controller';
import { optionalAuth, requireSeller } from '../../middleware/auth';
import { searchRateLimiter, uploadRateLimiter } from '../../middleware/rateLimiter';

export async function listingRoutes(fastify: FastifyInstance): Promise<void> {
  // Public: search
  fastify.get(
    '/',
    { preHandler: [searchRateLimiter, optionalAuth] },
    (req, reply) => listingsController.searchListings(req, reply),
  );

  // Public: get listing detail
  fastify.get(
    '/:id',
    { preHandler: [optionalAuth] },
    (req, reply) => listingsController.getListing(req, reply),
  );

  // Authenticated seller routes
  fastify.post(
    '/',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.createListing(req, reply),
  );

  fastify.patch(
    '/:id',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.updateListing(req, reply),
  );

  fastify.delete(
    '/:id',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.deleteListing(req, reply),
  );

  fastify.post(
    '/:id/publish',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.publishListing(req, reply),
  );

  fastify.post(
    '/:id/renew',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.renewListing(req, reply),
  );

  // Image management
  fastify.post(
    '/:id/images',
    { preHandler: [requireSeller, uploadRateLimiter] },
    (req, reply) => listingsController.uploadImages(req, reply),
  );

  fastify.put(
    '/:id/images/:imageId/cover',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.setCoverImage(req, reply),
  );

  fastify.delete(
    '/:id/images/:imageId',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.deleteImage(req, reply),
  );

  // Seller: my listings
  fastify.get(
    '/me',
    { preHandler: [requireSeller] },
    (req, reply) => listingsController.getMyListings(req, reply),
  );
}
