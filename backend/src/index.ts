import 'dotenv/config';
import { buildApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { logger } from './config/logger';
import { ensureUploadDirs } from './middleware/upload';
import { startBackgroundJobs, stopBackgroundJobs } from './jobs/notification.job';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

async function start(): Promise<void> {
  try {
    // Connect to databases
    await connectDatabase();
    await ensureUploadDirs();

    // Build Fastify app
    const app = await buildApp();

    // Start background jobs
    await startBackgroundJobs();

    // Start server
    await app.listen({ port: PORT, host: HOST });
    logger.info({ port: PORT, host: HOST }, 'Ashimarket API started');

    // Handle graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info({ signal }, 'Shutting down gracefully...');
        await app.close();
        await stopBackgroundJobs();
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('Shutdown complete');
        process.exit(0);
      });
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

void start();
