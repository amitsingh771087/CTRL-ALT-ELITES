import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as authService from '../services/auth.service';

/**
 * POST /auth/otp/request
 * Step 1 of "Login with OTP (first time) / Fingerprint (returning)".
 */
export const requestOtp = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;
  const result = await authService.startLogin(phone);

  res.status(200).json({
    success: true,
    message: 'OTP sent',
    // devCode is only ever populated outside production — see otp.service.ts
    ...(result.devCode ? { devCode: result.devCode } : {}),
  });
});

/**
 * POST /auth/otp/verify
 * Step 2: verifies the OTP, creates the user on first login, issues tokens.
 */
export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { phone, code, fullName } = req.body;
  const { tokens, user, isNewUser } = await authService.completeLogin(phone, code, fullName);

  res.status(200).json({
    success: true,
    isNewUser,
    tokens,
    user: {
      id: user._id,
      fullName: user.fullName,
      isProfileComplete: user.isProfileComplete,
    },
  });
});

/**
 * POST /auth/refresh
 * Returning-user path: the mobile app unlocks the stored refresh token
 * with biometrics, then exchanges it here for a fresh access token.
 */
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshSession(refreshToken);
  res.status(200).json({ success: true, tokens });
});
