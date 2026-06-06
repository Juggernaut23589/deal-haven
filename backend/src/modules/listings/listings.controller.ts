import type { FastifyRequest, FastifyReply } from 'fastify';
import { listingsService } from './listings.service';
import {
  createListingSchema,
  updateListingSchema,
  searchListingsSchema,
} from './listings.schema';
import { processAndSaveImage } from '../../middleware/upload';
import type { AuthenticatedRequest } from '../../shared/types';
import { ValidationError } from '../../shared/errors';

export class ListingsController {
  async createListing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const body = createListingSchema.parse(request.body);

    const listing = await listingsService.createListing(user.id, body);

    void reply.status(201).send({
      success: true,
      data: listing,
      message: 'Listing created as draft. Add images and publish when ready.',
    });
  }

  async publishListing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id } = request.params as { id: string };

    const listing = await listingsService.publishListing(id, user.id);

    void reply.status(200).send({
      success: true,
      data: listing,
      message: 'Listing published successfully',
    });
  }

  async getListing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as Partial<AuthenticatedRequest>).user;
    const { id } = request.params as { id: string };

    const listing = await listingsService.getListing(id, user?.id);

    void reply.status(200).send({
      success: true,
      data: listing,
    });
  }

  async updateListing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id } = request.params as { id: string };
    const body = updateListingSchema.parse(request.body);

    const listing = await listingsService.updateListing(id, user.id, body);

    void reply.status(200).send({
      success: true,
      data: listing,
    });
  }

  async deleteListing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id } = request.params as { id: string };

    await listingsService.deleteListing(id, user.id);

    void reply.status(200).send({
      success: true,
      message: 'Listing deleted',
    });
  }

  async renewListing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id } = request.params as { id: string };

    const listing = await listingsService.renewListing(id, user.id);

    void reply.status(200).send({
      success: true,
      data: listing,
      message: 'Listing renewed for 30 days',
    });
  }

  async placeBid(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id } = request.params as { id: string };
    const { amount } = request.body as { amount: number };

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new ValidationError('A valid bid amount is required');
    }

    const result = await listingsService.placeBid(id, user.id, amount);

    void reply.status(201).send({
      success: true,
      data: result,
      message: 'Bid placed successfully',
    });
  }

  async getBids(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await listingsService.getBids(id);

    void reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async pauseListing(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id } = request.params as { id: string };

    const listing = await listingsService.pauseListing(id, user.id);

    void reply.status(200).send({
      success: true,
      data: listing,
      message: 'Listing paused',
    });
  }

  async searchListings(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = searchListingsSchema.parse(request.query);

    const filters = {
      query: query.q,
      categorySlug: query.category,
      condition: query.condition?.split(','),
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      listingType: query.type?.split(','),
      sellerId: query.sellerId,
      city: query.city,
      state: query.state,
      latitude: query.lat,
      longitude: query.lng,
      radiusKm: query.radius,
      sortBy: query.sort,
    };

    const result = await listingsService.searchListings(
      filters,
      query.page,
      query.limit,
    );

    // Shape into SearchResults: { listings, meta, facets }
    // result.data = { data: [...], meta: {...} } after buildPaginatedResponse change
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inner = (result as any).data as { data: unknown[]; meta: unknown };
    void reply.status(200).send({
      success: true,
      data: {
        listings: inner.data,
        meta: {
          ...(inner.meta as object),
          query: query.q ?? null,
          appliedFilters: filters,
        },
        facets: {},
      },
    });
  }

  async getMyListings(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const query = request.query as { status?: string; page?: string; limit?: string };

    const result = await listingsService.getSellerListings(
      user.id,
      query.status as never,
      parseInt(query.page ?? '1', 10),
      parseInt(query.limit ?? '20', 10),
    );

    void reply.status(200).send({
      success: true,
      ...result,
    });
  }

  async uploadImages(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id } = request.params as { id: string };

    // Use request.parts() to read buffers directly from the multipart stream.
    // saveRequestFiles() + toBuffer() in @fastify/multipart v8 can return empty
    // buffers because the temp file has already been moved before toBuffer() reads it.
    const processedImages: Awaited<ReturnType<typeof processAndSaveImage>>[] = [];

    for await (const part of request.parts()) {
      if (part.type !== 'file') continue;
      const buffer = await part.toBuffer();
      if (!buffer || buffer.length === 0) continue;
      const result = await processAndSaveImage(buffer, part.mimetype, 'images/listings');
      processedImages.push(result);
    }

    if (processedImages.length === 0) {
      throw new ValidationError('No files uploaded or all files were empty');
    }

    await listingsService.addImages(id, user.id, processedImages as any);

    void reply.status(200).send({
      success: true,
      data: processedImages,
      message: `${processedImages.length} image(s) uploaded successfully`,
    });
  }

  async setCoverImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id, imageId } = request.params as { id: string; imageId: string };

    await listingsService.setCoverImage(id, imageId, user.id);

    void reply.status(200).send({
      success: true,
      message: 'Cover image updated',
    });
  }

  async deleteImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;
    const { id, imageId } = request.params as { id: string; imageId: string };

    await listingsService.deleteImage(id, imageId, user.id);

    void reply.status(200).send({
      success: true,
      message: 'Image deleted',
    });
  }
}

export const listingsController = new ListingsController();
