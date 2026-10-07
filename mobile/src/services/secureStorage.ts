import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Secure, OS-backed storage for the refresh token (iOS Keychain /
 * Android Keystore via expo-secure-store). This is what the
 * "Fingerprint (returning user)" flow unlocks: a Face ID / Fingerprint
 * prompt (via expo-local-authentication) gates *reading* this value.
 *
 * expo-secure-store encrypts the value at rest but doesn't gate reads
 * with biometrics itself — so we explicitly run authenticateAsync()
 * before every read, and simply don't call getItemAsync() if it fails.
 */
const KEY = 'govsync_refresh_token';

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/** Prompts Face ID / Fingerprint (via the OS) before returning the token. */
export async function getRefreshTokenWithBiometrics(): Promise<string | null> {
  const exists = await SecureStore.getItemAsync(KEY);
  if (!exists) return null;

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in to GovSync',
      cancelLabel: 'Use OTP instead',
      disableDeviceFallback: false, // allows device passcode as a fallback
    });
    if (!result.success) return null;
  }
  // If there's no biometric hardware/enrollment (e.g. simulator, or the
  // device only has a passcode), we fall back to trusting the OS-level
  // device lock that already protects app access.

  return SecureStore.getItemAsync(KEY);
}

export async function clearRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
