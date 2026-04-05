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

    void reply.status(200).send({
      success: true,
      ...result,
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

    const files = await request.saveRequestFiles();
    if (!files || files.length === 0) {
      throw new ValidationError('No files uploaded');
    }

    const processedImages = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.toBuffer();
        return processAndSaveImage(buffer, file.mimetype, 'images/listings');
      }),
    );

    await listingsService.addImages(id, user.id, processedImages);

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
