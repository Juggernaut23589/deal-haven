import { DisputeStatus, EscrowStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  NotFoundError,
  AuthorizationError,
  BusinessRuleError,
} from '../../shared/errors';
import { DISPUTE, ORDER } from '../../config/constants';
import { isWithinWindow, addHours } from '../../shared/utils';

export class DisputesService {
  async openDispute(
    buyerId: string,
    input: {
      orderId: string;
      reason: string;
      description: string;
    },
  ) {
    const order = await prisma.order.findFirst({
      where: { id: input.orderId, buyerId },
      select: {
        id: true,
        status: true,
        deliveredAt: true,
        dispute: { select: { id: true } },
        escrow: { select: { id: true, status: true } },
      },
    });

    if (!order) throw new NotFoundError('Order', input.orderId);

    if (order.dispute) {
      throw new BusinessRuleError('A dispute already exists for this order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BusinessRuleError('Cannot open dispute on cancelled order');
    }

    if (order.deliveredAt && !isWithinWindow(order.deliveredAt, ORDER.DISPUTE_WINDOW_DAYS)) {
      throw new BusinessRuleError(
        `Disputes must be opened within ${ORDER.DISPUTE_WINDOW_DAYS} days of delivery`,
      );
    }

    const evidenceDeadline = addHours(new Date(), DISPUTE.EVIDENCE_WINDOW_HOURS);

    const dispute = await prisma.$transaction(async (tx) => {
      const created = await tx.dispute.create({
        data: {
          orderId: input.orderId,
          buyerId,
          reason: input.reason as never,
          description: input.description,
          status: DisputeStatus.OPENED,
          evidenceDeadline,
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: input.orderId },
        data: { status: OrderStatus.DISPUTED },
      });

      // Freeze escrow
      if (order.escrow) {
        await tx.escrowTransaction.update({
          where: { orderId: input.orderId },
          data: { status: EscrowStatus.FROZEN },
        });
      }

      return created;
    });

    return dispute;
  }

  async submitEvidence(
    disputeId: string,
    userId: string,
    role: 'buyer' | 'seller',
    evidence: Array<{ url: string; description: string }>,
  ) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            buyerId: true,
            items: { select: { sellerId: true } },
          },
        },
      },
    });

    if (!dispute) throw new NotFoundError('Dispute', disputeId);

    const isBuyer = dispute.buyerId === userId;
    const isSeller = dispute.order.items.some((i) => i.sellerId === userId);

    if (!isBuyer && !isSeller) throw new AuthorizationError();

    if (
      dispute.status !== DisputeStatus.OPENED &&
      dispute.status !== DisputeStatus.EVIDENCE_COLLECTION
    ) {
      throw new BusinessRuleError('Evidence can only be submitted during the evidence collection phase');
    }

    const updateData =
      role === 'buyer'
        ? { buyerEvidence: evidence, status: DisputeStatus.EVIDENCE_COLLECTION }
        : { sellerEvidence: evidence, status: DisputeStatus.EVIDENCE_COLLECTION };

    return prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
    });
  }

  async resolveDispute(
    disputeId: string,
    adminId: string,
    input: {
      resolution:
        | 'RESOLVED_FULL_REFUND'
        | 'RESOLVED_PARTIAL_REFUND'
        | 'RESOLVED_NO_REFUND'
        | 'RESOLVED_RETURN_FOR_REFUND';
      refundAmount?: number;
      resolutionNote: string;
    },
  ) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: { escrow: true, payment: true, items: true },
        },
      },
    });

    if (!dispute) throw new NotFoundError('Dispute', disputeId);

    if (
      dispute.status === DisputeStatus.CLOSED ||
      dispute.status.startsWith('RESOLVED_')
    ) {
      throw new BusinessRuleError('Dispute is already resolved');
    }

    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: input.resolution as DisputeStatus,
          resolution: input.resolutionNote,
          refundAmount: input.refundAmount,
          resolvedById: adminId,
          resolvedAt: new Date(),
        },
      });

      // Handle escrow based on resolution
      if (
        input.resolution === 'RESOLVED_FULL_REFUND' ||
        input.resolution === 'RESOLVED_RETURN_FOR_REFUND'
      ) {
        await tx.escrowTransaction.update({
          where: { orderId: dispute.orderId },
          data: {
            status: EscrowStatus.REFUNDED,
            refundedAt: new Date(),
            refundAmount: dispute.order.escrow?.heldAmount,
          },
        });

        await tx.payment.update({
          where: { orderId: dispute.orderId },
          data: { status: PaymentStatus.REFUNDED },
        });

        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: OrderStatus.REFUNDED },
        });
      } else if (input.resolution === 'RESOLVED_PARTIAL_REFUND' && input.refundAmount) {
        await tx.escrowTransaction.update({
          where: { orderId: dispute.orderId },
          data: {
            status: EscrowStatus.PARTIALLY_REFUNDED,
            refundAmount: input.refundAmount,
          },
        });

        await tx.payment.update({
          where: { orderId: dispute.orderId },
          data: {
            status: PaymentStatus.PARTIALLY_REFUNDED,
            refundAmount: input.refundAmount,
          },
        });

        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: OrderStatus.COMPLETED },
        });
      } else if (input.resolution === 'RESOLVED_NO_REFUND') {
        // Release funds to seller
        await tx.escrowTransaction.update({
          where: { orderId: dispute.orderId },
          data: { status: EscrowStatus.RELEASED, releasedAt: new Date() },
        });

        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: OrderStatus.COMPLETED },
        });
      }
    });

    return prisma.dispute.findUnique({ where: { id: disputeId } });
  }

  async getDispute(disputeId: string, userId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            buyerId: true,
            items: { select: { sellerId: true } },
            orderNumber: true,
          },
        },
      },
    });

    if (!dispute) throw new NotFoundError('Dispute', disputeId);

    const isBuyer = dispute.buyerId === userId;
    const isSeller = dispute.order.items.some((i) => i.sellerId === userId);

    if (!isBuyer && !isSeller) throw new AuthorizationError();

    return dispute;
  }
}

export const disputesService = new DisputesService();
