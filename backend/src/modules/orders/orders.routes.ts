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

  // Confirm payment (called after Stripe payment succeeds)
  fastify.post('/:id/confirm-payment', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { stripePaymentIntentId } = req.body as { stripePaymentIntentId: string };
    const order = await ordersService.confirmPayment(id, stripePaymentIntentId);
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

  // Buyer: my orders
  fastify.get('/me/purchases', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await ordersService.getBuyerOrders(
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });

  // Seller: my orders
  fastify.get('/me/sales', { preHandler: [requireSeller] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await ordersService.getSellerOrders(
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });
}
