/**
 * Base class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when request validation fails
 */
export class BadRequestError extends ApiError {
  constructor(message: string, errorCode?: string) {
    super(message, 400, errorCode);
  }
}

/**
 * Error thrown when authentication fails
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string, errorCode?: string) {
    super(message, 401, errorCode);
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends ApiError {
  constructor(message: string, errorCode?: string) {
    super(message, 404, errorCode);
  }
}

/**
 * Error thrown when there's a server error
 */
export class InternalServerError extends ApiError {
  constructor(message: string, errorCode?: string) {
    super(message, 500, errorCode);
  }
}
