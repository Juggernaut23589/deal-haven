// Ashimarket — Custom Error Classes

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with id '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMITED');
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 402, 'PAYMENT_ERROR');
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code);
  }
}

export class GoneError extends AppError {
  constructor(resource: string) {
    super(`${resource} is no longer available`, 410, 'GONE');
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
