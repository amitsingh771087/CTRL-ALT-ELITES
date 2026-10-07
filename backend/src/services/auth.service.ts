import { User, IUser } from '../models/User';
import { hashLookupField } from './encryption.service';
import { requestOtp, verifyOtp } from './otp.service';
import { issueTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AuthTokens } from '../types';
import { ApiError } from '../utils/ApiError';

/**
 * Auth flow implements the diagram: "Login with OTP (first time) or
 * Fingerprint (returning)". Biometric ("fingerprint") auth is verified
 * on-device by the mobile app (via the OS keystore); this backend's role
 * for a *returning* user is simply to exchange a valid long-lived refresh
 * token — unlocked locally by the fingerprint — for a fresh access token.
 * The backend never receives biometric data.
 */

export async function startLogin(phone: string): Promise<{ devCode?: string }> {
  return requestOtp(phone);
}

export async function completeLogin(
  phone: string,
  code: string,
  fullName?: string
): Promise<{ tokens: AuthTokens; user: IUser; isNewUser: boolean }> {
  const isValid = await verifyOtp(phone, code);
  if (!isValid) throw ApiError.unauthorized('Incorrect or expired OTP');

  const phoneHash = hashLookupField(phone);
  let user = await User.findOne({ phoneHash });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = new User({ fullName: fullName?.trim() || 'Citizen' });
    user.setPhone(phone);
    await user.save();
  }

  const tokens = issueTokenPair({ sub: user._id.toString(), phoneHash });
  return { tokens, user, isNewUser };
}

/** Exchanges a refresh token (unlocked via biometric on-device) for a new access token. */
export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  return issueTokenPair({ sub: user._id.toString(), phoneHash: user.phoneHash });
}
