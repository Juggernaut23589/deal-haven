import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../shared/types';
import { ReportReason, ReportTargetType } from '@prisma/client';

const createReportSchema = z.object({
  targetType: z.nativeEnum(ReportTargetType),
  targetId: z.string().uuid(),
  reason: z.nativeEnum(ReportReason),
  description: z.string().max(1000).optional(),
});

export async function reportRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = createReportSchema.parse(req.body);

    // Build optional foreign keys
    const listingId = body.targetType === ReportTargetType.LISTING ? body.targetId : undefined;
    const reportedUserId = body.targetType === ReportTargetType.USER ? body.targetId : undefined;

    // Prevent duplicate pending reports from same user on same target
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        targetType: body.targetType,
        targetId: body.targetId,
        status: 'PENDING',
      },
      select: { id: true },
    });

    if (existing) {
      void reply.status(409).send({
        success: false,
        error: { code: 'ALREADY_REPORTED', message: 'You have already reported this item.' },
      });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType: body.targetType,
        targetId: body.targetId,
        reason: body.reason,
        description: body.description,
        listingId,
        reportedUserId,
      },
      select: { id: true, status: true, createdAt: true },
    });

    void reply.status(201).send({
      success: true,
      data: report,
      message: 'Report submitted. Our team will review it within 24 hours.',
    });
  });
}
