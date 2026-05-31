import type { FastifyInstance } from 'fastify';
import { offersService } from './offers.service';
import {
  createOfferSchema,
  respondToOfferSchema,
  respondToCounterSchema,
} from './offers.schema';
import { requireAuth, requireSeller } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';

export async function offerRoutes(fastify: FastifyInstance): Promise<void> {
  // Buyer: create offer
  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = createOfferSchema.parse(req.body);
    const offer = await offersService.createOffer(user.id, body);
    void reply.status(201).send({ success: true, data: offer });
  });

  // Seller: respond to offer
  fastify.patch('/:id/respond', { preHandler: [requireSeller] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = respondToOfferSchema.parse(req.body);
    const offer = await offersService.respondToOffer(id, user.id, body);
    void reply.status(200).send({ success: true, data: offer });
  });

  // Buyer: respond to counter-offer
  fastify.patch('/:id/respond-counter', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = respondToCounterSchema.parse(req.body);
    const offer = await offersService.respondToCounterOffer(id, user.id, body.action);
    void reply.status(200).send({ success: true, data: offer });
  });

  // Buyer: withdraw offer
  fastify.patch('/:id/withdraw', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const offer = await offersService.withdrawOffer(id, user.id);
    void reply.status(200).send({ success: true, data: offer });
  });

  // Unified: GET /offers/me?type=sent|received
  fastify.get('/me', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { type?: string; status?: string; page?: string; limit?: string };
    const page = parseInt(q.page ?? '1', 10);
    const limit = parseInt(q.limit ?? '20', 10);
    const result = q.type === 'received'
      ? await offersService.getSellerOffers(user.id, page, limit)
      : await offersService.getBuyerOffers(user.id, page, limit);
    void reply.status(200).send({ success: true, ...result });
  });

  // Legacy named routes kept for compatibility
  fastify.get('/me/sent', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await offersService.getBuyerOffers(
      user.id, parseInt(q.page ?? '1', 10), parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });

  fastify.get('/me/received', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await offersService.getSellerOffers(
      user.id, parseInt(q.page ?? '1', 10), parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });

  // Get offers for a specific listing
  fastify.get('/listing/:listingId', { preHandler: [requireAuth] }, async (req, reply) => {
    const { listingId } = req.params as { listingId: string };
    const q = req.query as { page?: string };
    const result = await offersService.getListingOffers(listingId, parseInt(q.page ?? '1', 10));
    void reply.status(200).send({ success: true, ...result });
  });
}
