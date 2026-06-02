import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { isAppError } from '../shared/errors';
import { logger } from '../config/logger';

// Duck-type ZodError so instanceof works across compiled module boundaries
function isZodError(err: unknown): err is ZodError {
  return (
    err instanceof ZodError ||
    (
      err !== null &&
      typeof err === 'object' &&
      'errors' in err &&
      Array.isArray((err as ZodError).errors) &&
      (err as ZodError).errors.every((e) => typeof e === 'object' && 'code' in e && 'message' in e)
    )
  );
}

// Duck-type Prisma known request error
function isPrismaKnownError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    (err !== null && typeof err === 'object' && 'code' in err && 'clientVersion' in err && typeof (err as { code: unknown }).code === 'string')
  );
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const correlationId = request.headers['x-correlation-id'] as string | undefined;

  // ── Zod validation errors ─────────────────────────────────────────────────
  if (isZodError(error)) {
    const details = (error as ZodError).errors.map((e) => ({
      field: e.path.join('.') || undefined,
      message: e.message,
      code: e.code,
    }));

    // Build a readable summary from field-level messages
    const readable = details
      .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
      .join(', ');

    logger.warn({ correlationId, path: request.url, details }, 'Validation error');

    void reply.status(422).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: readable || 'Request validation failed',
        details,
      },
    });
    return;
  }

  // ── Prisma errors ─────────────────────────────────────────────────────────
  if (isPrismaKnownError(error)) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;

    if (prismaError.code === 'P2002') {
      const fields = (prismaError.meta?.target as string[]) ?? [];
      const fieldLabel = fields.length ? fields.join(' and ') : 'value';
      void reply.status(409).send({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `This ${fieldLabel} is already in use. Please choose a different one.`,
        },
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      void reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      });
      return;
    }

    logger.error({ correlationId, path: request.url, prismaCode: prismaError.code, error }, 'Prisma error');
    void reply.status(500).send({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'A database error occurred' },
    });
    return;
  }

  // ── App errors (operational) ──────────────────────────────────────────────
  if (isAppError(error)) {
    if (error.statusCode >= 500) {
      logger.error({ correlationId, path: request.url, error }, 'Operational error');
    } else {
      logger.warn({ correlationId, path: request.url, code: error.code, message: error.message }, 'Client error');
    }

    const response: Record<string, unknown> = {
      success: false,
      error: { code: error.code, message: error.message },
    };
    if ('details' in error && error.details) {
      (response.error as Record<string, unknown>).details = error.details;
    }

    void reply.status(error.statusCode).send(response);
    return;
  }

  // ── Fastify/AJV validation errors ─────────────────────────────────────────
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

  // ── Catch Fastify's own serialised error format ───────────────────────────
  // When Fastify's native handler fires before ours, it uses { statusCode, message }
  // Attempt to re-wrap it cleanly rather than swallowing it.
  if ('statusCode' in error && typeof (error as FastifyError).statusCode === 'number') {
    const statusCode = (error as FastifyError).statusCode ?? 500;
    // Try to parse a JSON-stringified ZodError from .message
    const rawMsg = error.message ?? '';
    let cleanMessage = rawMsg;
    try {
      const parsed = JSON.parse(rawMsg);
      if (Array.isArray(parsed) && parsed.length > 0 && 'message' in parsed[0]) {
        cleanMessage = parsed.map((e: { path?: string[]; message: string }) =>
          e.path?.length ? `${e.path.join('.')}: ${e.message}` : e.message
        ).join(', ');
      }
    } catch {
      // Not JSON — use rawMsg as-is
    }

    void reply.status(statusCode < 400 ? 500 : statusCode).send({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: cleanMessage },
    });
    return;
  }

  // ── Unexpected errors ─────────────────────────────────────────────────────
  logger.error({ correlationId, path: request.url, error }, 'Unexpected error');
  void reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
}
