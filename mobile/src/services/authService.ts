import {
  apiClient,
  persistAccessToken,
  clearAccessToken,
  setRefreshHandler,
} from './apiClient';
import { saveRefreshToken, getRefreshTokenWithBiometrics, clearRefreshToken } from './secureStorage';
import { AuthTokens, AuthUser } from '../types';

/** Step 1: request an OTP for the given phone number. */
export async function requestOtp(phone: string): Promise<void> {
  await apiClient.post('/auth/otp/request', { phone });
}

/** Step 2: verify the OTP; on success, persists tokens and returns the user. */
export async function verifyOtp(
  phone: string,
  code: string,
  fullName?: string
): Promise<{ user: AuthUser; isNewUser: boolean }> {
  const { data } = await apiClient.post('/auth/otp/verify', { phone, code, fullName });
  const tokens: AuthTokens = data.tokens;

  await persistAccessToken(tokens.accessToken);
  await saveRefreshToken(tokens.refreshToken); // gated by biometrics on next read

  return { user: data.user, isNewUser: data.isNewUser };
}

/** Returning-user path: unlock the refresh token with Face ID / Fingerprint, then exchange it. */
export async function loginWithBiometrics(): Promise<boolean> {
  const refreshToken = await getRefreshTokenWithBiometrics();
  if (!refreshToken) return false;

  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  const tokens: AuthTokens = data.tokens;

  await persistAccessToken(tokens.accessToken);
  await saveRefreshToken(tokens.refreshToken);
  return true;
}

export async function logout(): Promise<void> {
  await clearAccessToken();
  await clearRefreshToken();
}

/**
 * Wires apiClient's automatic-refresh-on-401 behaviour to this service.
 * Call once at app startup (see App.tsx).
 */
export function registerAutoRefresh(): void {
  setRefreshHandler(async () => {
    const refreshToken = await getRefreshTokenWithBiometrics();
    if (!refreshToken) return null;
    try {
      const { data } = await apiClient.post('/auth/refresh', { refreshToken });
      await saveRefreshToken(data.tokens.refreshToken);
      return data.tokens as AuthTokens;
    } catch {
      return null;
    }
  });
}
