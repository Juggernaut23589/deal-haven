import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, isAppError } from '../shared/errors';
import { logger } from '../config/logger';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const correlationId = request.headers['x-correlation-id'] as string | undefined;

  // Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    logger.warn(
      { correlationId, path: request.url, details },
      'Validation error',
    );

    void reply.status(422).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details,
      },
    });
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = (error.meta?.target as string[]) ?? [];
      void reply.status(409).send({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `A record with this ${fields.join(', ')} already exists`,
        },
      });
      return;
    }

    if (error.code === 'P2025') {
      void reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      });
      return;
    }

    logger.error(
      { correlationId, path: request.url, prismaCode: error.code, error },
      'Prisma error',
    );

    void reply.status(500).send({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'A database error occurred',
      },
    });
    return;
  }

  // App errors (operational)
  if (isAppError(error)) {
    if (error.statusCode >= 500) {
      logger.error({ correlationId, path: request.url, error }, 'Operational error');
    } else {
      logger.warn(
        { correlationId, path: request.url, code: error.code, message: error.message },
        'Client error',
      );
    }

    const response: Record<string, unknown> = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    // Include validation details if present
    if ('details' in error && error.details) {
      (response.error as Record<string, unknown>).details = error.details;
    }

    void reply.status(error.statusCode).send(response);
    return;
  }

  // Fastify validation errors (ajv)
  const fastifyError = error as FastifyError;
  if (fastifyError.statusCode === 400 && fastifyError.validation) {
    void reply.status(400).send({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message,
        details: fastifyError.validation,
      },
    });
    return;
  }

  // Unexpected errors
  logger.error(
    { correlationId, path: request.url, error },
    'Unexpected error',
  );

  void reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
}
