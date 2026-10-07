# GovSync — Mobile App (Expo + React Native + TypeScript)

Citizen-facing app implementing the flow from the diagrams: browse schemes
without logging in, verify with OTP (or unlock a saved session with
Face ID / Fingerprint), fill an encrypted eligibility profile, and see
ranked, personalised scheme matches.

## Stack

- **Expo (managed workflow) + React Native + TypeScript**, strict mode
- **React Navigation** (native-stack) — screen graph mirrors the flowchart
- **Axios** API client with automatic access-token refresh on 401
- **expo-secure-store + expo-local-authentication** — the refresh token is
  encrypted at rest in the OS Keychain/Keystore, and reads are gated by a
  Face ID / Fingerprint prompt (device passcode as fallback)
- **Context API** for auth state (`src/context/AuthContext.tsx`)

## Getting started

```bash
npm install
npx expo start
```

Then either:
- press `i` for the iOS simulator, `a` for the Android emulator, or `w` for web, or
- scan the QR code with the **Expo Go** app on a physical phone (same Wi-Fi network).

No `pod install` or native build step needed — that's the point of the
managed workflow. If you later add a native module Expo Go doesn't
support, run `npx expo prebuild` to generate the native projects and
switch to `npx expo run:ios` / `run:android` (a "dev client" build).

Point `API_BASE_URL` in `src/services/apiClient.ts` at your running backend.
If you're testing on a physical device via Expo Go, `localhost` refers to
the phone itself — use your machine's LAN IP (e.g. `http://192.168.1.20:5000`)
or a tunnel (`npx expo start --tunnel`) instead.

## Project layout

```
src/
  screens/       one file per flowchart step (BrowseSchemes, Login, OtpVerify,
                  ProfileForm, Results, SchemeDetail, Notifications, Splash)
  components/     shared UI: Button, Input, SchemeCard, LoadingSpinner
  services/       apiClient, authService, schemeService, secureStorage
  context/        AuthContext (who's logged in, logout())
  navigation/     AppNavigator (the screen graph)
  theme/          colors, spacing, radius, typography tokens
  types/          shared TS interfaces + RootStackParamList
assets/           app icon / splash / favicon (placeholders — swap these out)
app.json          Expo config (name, bundle IDs, plugins)
```

## Flow → screen mapping

| Diagram step                                   | Screen |
|--------------------------------------------------|--------|
| Citizen opens app                                 | `SplashScreen` |
| Browse all government schemes (no login)          | `BrowseSchemesScreen` |
| View details, required documents & apply steps    | `SchemeDetailScreen` |
| Login with OTP (first time)                       | `LoginScreen` → `OtpVerifyScreen` |
| Fingerprint (returning user)                       | handled silently in `SplashScreen` via `authService.loginWithBiometrics()` |
| Fill eligibility profile / Encrypt & save          | `ProfileFormScreen` |
| Personalized eligible schemes                      | `ResultsScreen` |
| New matching scheme notification                   | `NotificationsScreen` |

## Security notes

- The refresh token is stored via `expo-secure-store` (iOS Keychain /
  Android Keystore, encrypted at rest), and every read is preceded by a
  Face ID / Fingerprint / device-passcode prompt via
  `expo-local-authentication` — see `src/services/secureStorage.ts`.
- Only the short-lived access token sits in AsyncStorage, and only for the
  session's lifetime.
- All PII entered in `ProfileFormScreen` is encrypted server-side before
  storage — the app never persists it unencrypted on-device.

## Building a real app (EAS)

When you're ready for a standalone build (App Store / Play Store), use
[EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios      # or android, or all
```
