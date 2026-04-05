import type { FastifyRequest, FastifyReply } from 'fastify';
import { getRedisClient } from '../config/redis';
import { RateLimitError } from '../shared/errors';
import { RATE_LIMIT } from '../config/constants';

interface RateLimitOptions {
  max: number;
  windowMs: number;
  keyPrefix?: string;
  keyExtractor?: (request: FastifyRequest) => string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    max,
    windowMs,
    keyPrefix = 'rl',
    keyExtractor,
  } = options;

  return async function rateLimiter(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const redis = getRedisClient();
    const identifier = keyExtractor
      ? keyExtractor(request)
      : ((request as FastifyRequest & { user?: { id: string } }).user?.id ??
        request.ip);

    const key = `${keyPrefix}:${identifier}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);
    const results = await pipeline.exec();

    const currentCount = (results?.[0]?.[1] as number) ?? 0;
    const remaining = Math.max(0, max - currentCount);
    const resetTime = Math.ceil(Date.now() / 1000) + windowSeconds;

    reply.header('X-RateLimit-Limit', max.toString());
    reply.header('X-RateLimit-Remaining', remaining.toString());
    reply.header('X-RateLimit-Reset', resetTime.toString());

    if (currentCount > max) {
      reply.header('Retry-After', windowSeconds.toString());
      throw new RateLimitError();
    }
  };
}

// Pre-built rate limiters
export const authRateLimiter = createRateLimiter({
  max: RATE_LIMIT.AUTH_MAX,
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  keyPrefix: 'rl:auth',
  keyExtractor: (req) => req.ip,
});

export const apiRateLimiter = createRateLimiter({
  max: RATE_LIMIT.API_MAX,
  windowMs: RATE_LIMIT.API_WINDOW_MS,
  keyPrefix: 'rl:api',
});

export const searchRateLimiter = createRateLimiter({
  max: RATE_LIMIT.SEARCH_MAX,
  windowMs: RATE_LIMIT.SEARCH_WINDOW_MS,
  keyPrefix: 'rl:search',
});

export const uploadRateLimiter = createRateLimiter({
  max: RATE_LIMIT.UPLOAD_MAX,
  windowMs: RATE_LIMIT.UPLOAD_WINDOW_MS,
  keyPrefix: 'rl:upload',
});
