import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { cache, CACHE_TTL } from '../../config/redis';
import { optionalAuth } from '../../middleware/auth';
import { searchRateLimiter } from '../../middleware/rateLimiter';
import type { AuthenticatedRequest } from '../../shared/types';
import { z } from 'zod';

const autocompleteSchema = z.object({
  q: z.string().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(10).optional().default(8),
});

export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  // Autocomplete suggestions
  fastify.get(
    '/autocomplete',
    { preHandler: [searchRateLimiter, optionalAuth] },
    async (req, reply) => {
      const user = (req as Partial<AuthenticatedRequest>).user;
      const query = autocompleteSchema.parse(req.query);
      const term = query.q.toLowerCase();

      // Check cache
      const cacheKey = `autocomplete:${term}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        void reply.status(200).send({ success: true, data: cached });
        return;
      }

      // Get matching listings and categories
      const [listings, categories] = await Promise.all([
        prisma.listing.findMany({
          where: {
            status: 'ACTIVE',
            deletedAt: null,
            title: { contains: term, mode: 'insensitive' },
          },
          select: { id: true, title: true, price: true, images: { where: { isCover: true }, take: 1 } },
          take: query.limit,
          orderBy: { viewCount: 'desc' },
        }),
        prisma.category.findMany({
          where: {
            isActive: true,
            name: { contains: term, mode: 'insensitive' },
          },
          select: { id: true, name: true, slug: true, iconUrl: true },
          take: 3,
        }),
      ]);

      const suggestions = {
        listings,
        categories,
        query: query.q,
      };

      await cache.set(cacheKey, suggestions, 60);

      // Save to search history (async)
      if (user?.id) {
        prisma.searchHistory
          .create({ data: { userId: user.id, query: query.q } })
          .catch(() => null);
      }

      void reply.status(200).send({ success: true, data: suggestions });
    },
  );

  // Get categories tree
  fastify.get('/categories', async (_req, reply) => {
    const cacheKey = cache.key.categories();
    const cached = await cache.get(cacheKey);
    if (cached) {
      void reply.status(200).send({ success: true, data: cached });
      return;
    }

    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            sortOrder: true,
            _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    await cache.set(cacheKey, categories, CACHE_TTL.CATEGORIES);
    void reply.status(200).send({ success: true, data: categories });
  });

  // Get category with its attributes (for filter building)
  fastify.get('/categories/:slug/attributes', async (req, reply) => {
    const { slug } = req.params as { slug: string };

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        attributes: {
          where: { isFilterable: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      void reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
      return;
    }

    void reply.status(200).send({ success: true, data: category });
  });

  // Save search
  fastify.post('/save', { preHandler: [optionalAuth] }, async (req, reply) => {
    const user = (req as Partial<AuthenticatedRequest>).user;
    if (!user) {
      void reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Login to save searches' },
      });
      return;
    }

    const body = req.body as {
      name?: string;
      query?: string;
      categoryId?: string;
      filters?: Record<string, unknown>;
      alertEnabled?: boolean;
      alertFrequency?: string;
    };

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: body.name,
        query: body.query,
        categoryId: body.categoryId,
        filters: body.filters as any,
        alertEnabled: body.alertEnabled ?? true,
        alertFrequency: body.alertFrequency ?? 'INSTANT',
      },
    });

    void reply.status(201).send({ success: true, data: savedSearch });
  });

  // Get saved searches
  fastify.get('/saved', { preHandler: [optionalAuth] }, async (req, reply) => {
    const user = (req as Partial<AuthenticatedRequest>).user;
    if (!user) {
      void reply.status(200).send({ success: true, data: [] });
      return;
    }

    const searches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    void reply.status(200).send({ success: true, data: searches });
  });
}
