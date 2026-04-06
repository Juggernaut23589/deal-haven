import { OrderStatus, EscrowStatus, PaymentStatus, ListingStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  NotFoundError,
  AuthorizationError,
  BusinessRuleError,
} from '../../shared/errors';
import { ORDER } from '../../config/constants';
import { generateOrderNumber, calculatePlatformFee, addDays } from '../../shared/utils';
import type { CreateOrderInput } from './orders.schema';

const orderDetailSelect = {
  id: true,
  orderNumber: true,
  buyerId: true,
  status: true,
  subtotal: true,
  shippingCost: true,
  taxAmount: true,
  platformFee: true,
  couponDiscount: true,
  total: true,
  currency: true,
  trackingNumber: true,
  trackingCarrier: true,
  trackingUrl: true,
  shippedAt: true,
  deliveredAt: true,
  autoReleaseAt: true,
  buyerNote: true,
  sellerNote: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      listingId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      listingTitle: true,
      listingImageUrl: true,
      sellerUsername: true,
      sellerId: true,
    },
  },
  payment: {
    select: {
      id: true,
      amount: true,
      status: true,
      method: true,
      stripePaymentIntentId: true,
      processedAt: true,
    },
  },
  escrow: {
    select: {
      id: true,
      heldAmount: true,
      platformFee: true,
      sellerPayout: true,
      status: true,
      heldAt: true,
      releasedAt: true,
    },
  },
  dispute: {
    select: {
      id: true,
      status: true,
      reason: true,
      createdAt: true,
    },
  },
  shippingAddress: true,
};

export class OrdersService {
  async createOrder(buyerId: string, input: CreateOrderInput) {
    const listing = await prisma.listing.findFirst({
      where: {
        id: input.listingId,
        deletedAt: null,
        status: { in: [ListingStatus.ACTIVE, ListingStatus.RESERVED] },
      },
      select: {
        id: true,
        sellerId: true,
        title: true,
        price: true,
        currency: true,
        quantity: true,
        soldCount: true,
        shipsNationally: true,
        localPickup: true,
        images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } },
        seller: { select: { username: true } },
        shippingOptions: input.shippingOptionId
          ? { where: { id: input.shippingOptionId } }
          : { where: { isDefault: true }, take: 1 },
      },
    });

    if (!listing) throw new NotFoundError('Listing', input.listingId);
    if (listing.sellerId === buyerId) {
      throw new BusinessRuleError('You cannot purchase your own listing');
    }

    const unitPrice = Number(listing.price);
    const quantity = input.quantity ?? 1;

    if (quantity > listing.quantity - listing.soldCount) {
      throw new BusinessRuleError('Insufficient stock');
    }

    const shippingOption = listing.shippingOptions[0];
    const shippingCost = shippingOption && !shippingOption.isFree
      ? Number(shippingOption.price)
      : 0;
    const subtotal = unitPrice * quantity;
    const feeCalc = calculatePlatformFee(subtotal);
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          shippingAddressId: input.shippingAddressId,
          status: OrderStatus.PENDING,
          subtotal,
          shippingCost,
          taxAmount: 0,
          platformFee: feeCalc.platformFee,
          couponDiscount: 0,
          total,
          currency: listing.currency,
          buyerNote: input.buyerNote,
          autoReleaseAt: addDays(new Date(), ORDER.ESCROW_AUTO_RELEASE_DAYS),
          items: {
            create: {
              listingId: listing.id,
              quantity,
              unitPrice,
              totalPrice: subtotal,
              listingTitle: listing.title,
              listingImageUrl: listing.images[0]?.thumbnailUrl ?? null,
              sellerUsername: listing.seller.username,
              sellerId: listing.sellerId,
            },
          },
        },
        select: orderDetailSelect,
      });

      // Payment intent created externally (Stripe) — we just create the record
      await tx.payment.create({
        data: {
          orderId: created.id,
          amount: total,
          currency: listing.currency,
          status: PaymentStatus.PENDING,
        },
      });

      return created;
    });

    return order;
  }

  async confirmPayment(orderId: string, stripePaymentIntentId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        total: true,
        platformFee: true,
        items: { select: { listingId: true, sellerId: true, quantity: true } },
      },
    });

    if (!order) throw new NotFoundError('Order', orderId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BusinessRuleError('Order is not in pending state');
    }

    const feeCalc = calculatePlatformFee(Number(order.total));

    await prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId,
          processedAt: new Date(),
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });

      // Create escrow transaction
      await tx.escrowTransaction.create({
        data: {
          orderId,
          heldAmount: Number(order.total),
          platformFee: feeCalc.platformFee,
          sellerPayout: feeCalc.sellerPayout,
          status: EscrowStatus.HELD,
        },
      });

      // Update listing sold count
      for (const item of order.items) {
        await tx.listing.update({
          where: { id: item.listingId },
          data: { soldCount: { increment: item.quantity } },
        });
      }
    });

    return prisma.order.findUnique({ where: { id: orderId }, select: orderDetailSelect });
  }

  async markAsShipped(
    orderId: string,
    sellerId: string,
    trackingInfo: {
      trackingNumber: string;
      carrier: string;
      trackingUrl?: string;
      sellerNote?: string;
    },
  ) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: { some: { sellerId } },
        status: OrderStatus.PAID,
      },
    });

    if (!order) throw new NotFoundError('Order', orderId);

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
        trackingNumber: trackingInfo.trackingNumber,
        trackingCarrier: trackingInfo.carrier as never,
        trackingUrl: trackingInfo.trackingUrl,
        sellerNote: trackingInfo.sellerNote,
        shippedAt: new Date(),
      },
      select: orderDetailSelect,
    });
  }

  async confirmDelivery(orderId: string, buyerId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId,
        status: { in: [OrderStatus.SHIPPED, OrderStatus.IN_TRANSIT] },
      },
      include: { escrow: true },
    });

    if (!order) throw new NotFoundError('Order', orderId);
    if (!order.escrow) throw new BusinessRuleError('No escrow record found for order');

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      await tx.escrowTransaction.update({
        where: { orderId },
        data: {
          status: EscrowStatus.RELEASED,
          releasedAt: new Date(),
        },
      });

      // Mark listing as sold
      const orderItems = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of orderItems) {
        await tx.listing.update({
          where: { id: item.listingId },
          data: { status: ListingStatus.SOLD },
        });
      }
    });

    return prisma.order.findUnique({ where: { id: orderId }, select: orderDetailSelect });
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        status: true,
        items: { select: { sellerId: true, listingId: true } },
      },
    });

    if (!order) throw new NotFoundError('Order', orderId);

    const isBuyer = order.buyerId === userId;
    const isSeller = order.items.some((i) => i.sellerId === userId);

    if (!isBuyer && !isSeller) throw new AuthorizationError();

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BusinessRuleError(
        `Cannot cancel order in ${order.status} status`,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: reason,
        },
      });

      // Restore listing availability
      for (const item of order.items) {
        await tx.listing.update({
          where: { id: item.listingId },
          data: { status: ListingStatus.ACTIVE },
        });
      }

      // Refund escrow if already paid
      if (order.status !== OrderStatus.PENDING) {
        await tx.escrowTransaction.updateMany({
          where: { orderId },
          data: { status: EscrowStatus.REFUNDED, refundedAt: new Date() },
        });

        await tx.payment.update({
          where: { orderId },
          data: { status: PaymentStatus.REFUNDED },
        });
      }
    });

    return prisma.order.findUnique({ where: { id: orderId }, select: orderDetailSelect });
  }

  async getBuyerOrders(buyerId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId },
        select: orderDetailSelect,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where: { buyerId } }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where: { items: { some: { sellerId } } },
        select: orderDetailSelect,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where: { items: { some: { sellerId } } } }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        ...orderDetailSelect,
        buyerId: true,
        items: {
          select: {
            id: true,
            listingId: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            listingTitle: true,
            listingImageUrl: true,
            sellerUsername: true,
            sellerId: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundError('Order', orderId);

    const isBuyer = order.buyerId === userId;
    const isSeller = order.items.some((i) => i.sellerId === userId);

    if (!isBuyer && !isSeller) throw new AuthorizationError();

    return order;
  }
}

export const ordersService = new OrdersService();
