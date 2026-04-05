import { Redis } from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB ?? '0', 10),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 5) {
          logger.error('Redis connection failed after 5 retries');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis error');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}

// Cache helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const redis = getRedisClient();
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  async del(key: string | string[]): Promise<void> {
    const redis = getRedisClient();
    if (Array.isArray(key)) {
      if (key.length > 0) await redis.del(...key);
    } else {
      await redis.del(key);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  key: {
    categories: () => 'categories:tree',
    listing: (id: string) => `listing:${id}`,
    sellerProfile: (slug: string) => `seller:${slug}`,
    searchResults: (hash: string) => `search:${hash}`,
    userSession: (userId: string) => `session:${userId}`,
    rateLimitLogin: (identifier: string) => `rl:login:${identifier}`,
  },
};
