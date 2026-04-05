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

  // Buyer: get my offers
  fastify.get('/me/sent', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await offersService.getBuyerOffers(
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });

  // Seller: get received offers
  fastify.get('/me/received', { preHandler: [requireSeller] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await offersService.getSellerOffers(
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });
}
