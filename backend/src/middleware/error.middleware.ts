import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/** 404 handler — must be registered after all routes. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler. Converts any thrown error (ApiError or otherwise)
 * into a consistent JSON shape and logs unexpected (non-operational) errors
 * at error level for alerting.
 */
export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const isOperational = isApiError ? err.isOperational : false;

  if (!isOperational) {
    logger.error(err.stack ?? err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}
