import type { FastifyInstance } from 'fastify';
import { disputesService } from './disputes.service';
import { requireAuth, requireModerator } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';
import { z } from 'zod';

const openDisputeSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum([
    'ITEM_NOT_RECEIVED',
    'ITEM_NOT_AS_DESCRIBED',
    'COUNTERFEIT',
    'DAMAGED',
    'WRONG_ITEM',
    'OTHER',
  ]),
  description: z.string().min(20, 'Please provide a detailed description').max(2000),
});

const evidenceSchema = z.object({
  role: z.enum(['buyer', 'seller']),
  evidence: z.array(
    z.object({
      url: z.string().url(),
      description: z.string().max(500),
    }),
  ).min(1).max(10),
});

const resolveDisputeSchema = z.object({
  resolution: z.enum([
    'RESOLVED_FULL_REFUND',
    'RESOLVED_PARTIAL_REFUND',
    'RESOLVED_NO_REFUND',
    'RESOLVED_RETURN_FOR_REFUND',
  ]),
  refundAmount: z.number().positive().optional(),
  resolutionNote: z.string().min(10).max(2000),
});

export async function disputeRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = openDisputeSchema.parse(req.body);
    const dispute = await disputesService.openDispute(user.id, body);
    void reply.status(201).send({ success: true, data: dispute });
  });

  fastify.get('/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const dispute = await disputesService.getDispute(id, user.id);
    void reply.status(200).send({ success: true, data: dispute });
  });

  fastify.post('/:id/evidence', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = evidenceSchema.parse(req.body);
    const dispute = await disputesService.submitEvidence(id, user.id, body.role, body.evidence);
    void reply.status(200).send({ success: true, data: dispute });
  });

  // Admin/Moderator: resolve dispute
  fastify.post('/:id/resolve', { preHandler: [requireModerator] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params as { id: string };
    const body = resolveDisputeSchema.parse(req.body);
    const dispute = await disputesService.resolveDispute(id, user.id, body);
    void reply.status(200).send({ success: true, data: dispute });
  });
}
