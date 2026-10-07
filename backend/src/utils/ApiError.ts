/**
 * Standardised operational error thrown anywhere in the app.
 * The global error middleware converts this into a consistent JSON response.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request'): ApiError {
    return new ApiError(400, message);
  }
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }
  static notFound(message = 'Not found'): ApiError {
    return new ApiError(404, message);
  }
  static conflict(message = 'Conflict'): ApiError {
    return new ApiError(409, message);
  }
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}
