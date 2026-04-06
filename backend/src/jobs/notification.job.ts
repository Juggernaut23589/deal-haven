import { Queue, Worker, type Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { QUEUE_NAMES } from '../config/constants';
import type { NotificationType } from '@prisma/client';

let workers: Worker[] = [];
const queues: Queue[] = [];

interface NotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

interface OfferExpiryJobData {
  offerId: string;
}

interface ListingExpiryJobData {
  listingId: string;
}

interface EscrowReleaseJobData {
  orderId: string;
}

export async function notificationQueue(): Promise<Queue> {
  const queue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
    connection: getRedisClient(),
    defaultJobOptions: {
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    },
  });
  return queue;
}

export async function createNotification(data: NotificationJobData): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: (data.data as any) ?? undefined,
      actionUrl: data.actionUrl,
    },
  });
}

export async function startBackgroundJobs(): Promise<void> {
  const connection = getRedisClient();

  // Notification worker
  const notificationWorker = new Worker<NotificationJobData>(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job: Job<NotificationJobData>) => {
      await createNotification(job.data);
    },
    { connection },
  );

  // Offer expiry worker
  const offerExpiryWorker = new Worker<OfferExpiryJobData>(
    QUEUE_NAMES.OFFER_EXPIRY,
    async (job: Job<OfferExpiryJobData>) => {
      await prisma.offer.updateMany({
        where: {
          id: job.data.offerId,
          status: 'PENDING',
          expiresAt: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      });
      logger.debug({ offerId: job.data.offerId }, 'Offer expired');
    },
    { connection },
  );

  // Listing expiry worker
  const listingExpiryWorker = new Worker<ListingExpiryJobData>(
    QUEUE_NAMES.LISTING_EXPIRY,
    async (job: Job<ListingExpiryJobData>) => {
      await prisma.listing.updateMany({
        where: {
          id: job.data.listingId,
          status: 'ACTIVE',
          expiresAt: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      });
      logger.debug({ listingId: job.data.listingId }, 'Listing expired');
    },
    { connection },
  );

  // Escrow auto-release worker
  const escrowReleaseWorker = new Worker<EscrowReleaseJobData>(
    QUEUE_NAMES.ESCROW_RELEASE,
    async (job: Job<EscrowReleaseJobData>) => {
      const order = await prisma.order.findFirst({
        where: {
          id: job.data.orderId,
          status: { in: ['DELIVERED', 'IN_TRANSIT', 'SHIPPED'] },
          autoReleaseAt: { lt: new Date() },
        },
        include: { escrow: true },
      });

      if (!order || !order.escrow) return;

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED', deliveredAt: new Date() },
        }),
        prisma.escrowTransaction.update({
          where: { orderId: order.id },
          data: { status: 'RELEASED', releasedAt: new Date() },
        }),
      ]);

      logger.info({ orderId: order.id }, 'Escrow auto-released');
    },
    { connection },
  );

  // Handle worker errors
  for (const worker of [notificationWorker, offerExpiryWorker, listingExpiryWorker, escrowReleaseWorker]) {
    worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, queue: worker.name, err }, 'Job failed');
    });
  }

  workers = [notificationWorker, offerExpiryWorker, listingExpiryWorker, escrowReleaseWorker];
  logger.info('Background jobs started');
}

export async function stopBackgroundJobs(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  await Promise.all(queues.map((q) => q.close()));
  logger.info('Background jobs stopped');
}
