import type { FastifyInstance } from 'fastify';
import { ordersService } from './orders.service';
import { createOrderSchema, shipOrderSchema, cancelOrderSchema } from './orders.schema';
import { requireAuth, requireSeller } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';

export async function orderRoutes(fastify: FastifyInstance): Promise<void> {
  // Create order (Buy Now)
  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = createOrderSchema.parse(req.body);
    const order = await ordersService.createOrder(user.id, body);
    void reply.status(201).send({ success: true, data: order });
  });

  // Get single order
  fastify.get('/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const order = await ordersService.getOrder(id, user.id);
    void reply.status(200).send({ success: true, data: order });
  });

  // Seller: confirm they received private payment
  fastify.post('/:id/confirm-payment-received', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const order = await ordersService.sellerConfirmPayment(id, user.id);
    void reply.status(200).send({ success: true, data: order });
  });

  // Seller: mark as shipped
  fastify.post('/:id/ship', { preHandler: [requireSeller] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = shipOrderSchema.parse(req.body);
    const order = await ordersService.markAsShipped(id, user.id, body);
    void reply.status(200).send({ success: true, data: order });
  });

  // Buyer: confirm delivery
  fastify.post('/:id/confirm-delivery', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const order = await ordersService.confirmDelivery(id, user.id);
    void reply.status(200).send({ success: true, data: order });
  });

  // Cancel order
  fastify.post('/:id/cancel', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = cancelOrderSchema.parse(req.body);
    const order = await ordersService.cancelOrder(id, user.id, body.reason);
    void reply.status(200).send({ success: true, data: order });
  });

  // Unified: my orders (type = 'buying' | 'selling')
  fastify.get('/me', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { type?: string; page?: string; limit?: string };
    const page = parseInt(q.page ?? '1', 10);
    const limit = parseInt(q.limit ?? '20', 10);
    const result = q.type === 'selling'
      ? await ordersService.getSellerOrders(user.id, page, limit)
      : await ordersService.getBuyerOrders(user.id, page, limit);
    void reply.status(200).send({ success: true, data: result });
  });

  // Legacy routes kept for compatibility
  fastify.get('/me/purchases', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await ordersService.getBuyerOrders(
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, data: result });
  });

  fastify.get('/me/sales', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await ordersService.getSellerOrders(
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, data: result });
  });

  // Open dispute
  fastify.post('/:id/dispute', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const { reason, description } = req.body as { reason: string; description: string };
    const order = await ordersService.openDispute(id, user.id, reason, description);
    void reply.status(200).send({ success: true, data: order });
  });
}
