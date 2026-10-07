import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async Express handler so rejected promises are forwarded
 * to next(err) instead of crashing the process / hanging the request.
 */
export const catchAsync =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
