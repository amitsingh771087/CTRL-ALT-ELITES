import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

/**
 * Requires a valid `Authorization: Bearer <accessToken>` header.
 * On success, attaches `req.userId` for downstream controllers.
 * This is the gate for every "logged-in only" route — e.g. profile,
 * eligibility results, notifications — matching the diagram's
 * "Login with OTP / Fingerprint" step before personalised results.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.userId = new Types.ObjectId(payload.sub);
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
}
