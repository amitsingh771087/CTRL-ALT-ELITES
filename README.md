# GovSync

A government scheme eligibility platform: citizens browse and search all
government schemes (local/state/central) for free, then optionally log in
to get a personalised, ranked list of schemes they actually qualify for —
based on an encrypted profile (age, income, occupation, category, location).

This repo matches the two architecture diagrams supplied:
1. **System architecture** — Client Access → Application Services (Backend
   API, Eligibility Engine, Auth Service, Scheme Sync) → Secure Data Layer
   (Scheme DB, encrypted User DB) → Government scheme sources.
2. **Citizen flow** — open app → browse (no login) → check eligibility →
   OTP/biometric login → fill/encrypt profile → eligibility engine →
   personalised results → scheme detail → update profile → notifications.

## Repository layout

```
GovSync/
  backend/   TypeScript + Express + MongoDB API (see backend/README.md)
  mobile/    React Native + TypeScript app     (see mobile/README.md)
```

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env   # fill in ENCRYPTION_KEY, JWT secrets, MONGO_URI
docker compose up -d   # local MongoDB
npm install
npm run dev             # http://localhost:5000/api/v1/health

# 2. Mobile app (in a second terminal)
cd mobile
npm install
npm run ios      # or: npm run android
```

## What's implemented

- **Field-level AES-256-GCM encryption** for PII (age, income, address,
  Aadhaar), with a separate HMAC lookup hash for phone-number login —
  see `backend/src/services/encryption.service.ts`.
- **OTP + JWT auth**, with the returning-user "Fingerprint" step handled
  entirely on-device (Keychain/Keystore + biometric gate) — the backend
  never sees biometric data, only the resulting refresh token.
- **Rules-based Eligibility Engine** (`backend/src/services/eligibility.service.ts`)
  matching a citizen's profile against scheme rules (age range, income
  ceiling, category, gender, occupation, state/district, BPL, disability),
  ranked by specificity.
- **Scheduled Scheme Sync job** (node-cron) with per-source adapter stubs
  for MBMC, BMC, Maharashtra Govt, and India Govt portals — wire in the
  real integrations where marked `TODO`.
- **Notification fan-out** when a newly-synced scheme matches an existing
  user's profile.
- A **professional, component-based React Native app** with one screen per
  flowchart step, shared UI components, a typed navigation graph, and an
  API client with automatic token refresh.

## Next steps to take this to production

- Replace the scheme-sync stubs with real MBMC/BMC/Maharashtra/India Govt
  integrations.
- Plug in a real SMS/OTP provider (MSG91, Twilio, etc).
- Add automated tests (Jest + Supertest for the API; Jest + RN Testing
  Library for the app).
- Add CI (lint, typecheck, test) and a deployment pipeline.
- Put secrets (encryption key, JWT secrets, DB URI) in a real secrets
  manager rather than `.env` files.
