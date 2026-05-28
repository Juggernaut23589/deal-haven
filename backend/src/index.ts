import 'dotenv/config';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { buildApp } from './app';
import { initSocket } from './socket';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { logger } from './config/logger';
import { ensureUploadDirs } from './middleware/upload';
import { startBackgroundJobs, stopBackgroundJobs } from './jobs/notification.job';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

const CERTS_DIR = path.resolve(__dirname, '../../../certs');
const certPath = path.join(CERTS_DIR, 'localhost.pem');
const keyPath = path.join(CERTS_DIR, 'localhost-key.pem');
const useHttps =
  process.env.NODE_ENV !== 'production' &&
  fs.existsSync(certPath) &&
  fs.existsSync(keyPath);

async function start(): Promise<void> {
  try {
    await connectDatabase();
    await ensureUploadDirs();

    const httpsOptions = useHttps
      ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
      : undefined;

    const app = await buildApp(httpsOptions ? { https: httpsOptions } : undefined);

    await startBackgroundJobs();

    initSocket(app.server as unknown as http.Server);

    await app.listen({ port: PORT, host: HOST });
    const protocol = useHttps ? 'https' : 'http';
    logger.info({ port: PORT, host: HOST, protocol }, `Ashimarket API started (${protocol.toUpperCase()})`);

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
