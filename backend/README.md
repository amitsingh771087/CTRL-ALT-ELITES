# GovSync — Backend API

TypeScript + Express + MongoDB (Mongoose) API for the GovSync government
scheme eligibility system, matching the architecture in the diagrams:

```
Client (Mobile/Web) → Backend API → Eligibility Engine → Scheme DB
                              ↓
                        Auth Service (OTP + refresh) → User DB (encrypted)
                              ↑
              Scheduled Scheme Sync Service ← MBMC / BMC / Maharashtra / India Govt portals
```

## Stack

- **Express + TypeScript** — strict mode, path aliases, ESLint-ready
- **MongoDB via Mongoose** — schemas in `src/models`
- **Field-level encryption (AES-256-GCM)** for PII — see `src/services/encryption.service.ts`
- **OTP + JWT auth** (access + refresh tokens) — biometric unlock happens on-device; the backend only ever sees the resulting refresh token
- **Zod** request validation
- **node-cron** scheduled scheme sync job

## Getting started

```bash
cp .env.example .env
# generate an encryption key and paste it into .env:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

docker compose up -d      # local MongoDB
npm install
npm run dev                # http://localhost:5000/api/v1/health
```

## Project layout

```
src/
  config/       env + MongoDB connection
  models/       Mongoose schemas (User, Scheme, Otp, Notification)
  services/     business logic (encryption, auth, otp, eligibility, scheme sync, notifications)
  controllers/  request handlers + Zod validation schemas
  routes/       Express routers
  middleware/   auth guard, validation, error handling
  jobs/         node-cron job registration
  utils/        logger, ApiError, JWT helpers, catchAsync
```

## API overview

| Method | Route                      | Auth | Description |
|--------|-----------------------------|------|--------------|
| GET    | `/api/v1/schemes`           | No   | Browse all active schemes |
| GET    | `/api/v1/schemes/:id`       | No   | Scheme detail |
| GET    | `/api/v1/schemes/eligible`  | Yes  | Personalised, ranked matches |
| POST   | `/api/v1/auth/otp/request`  | No   | Send OTP to a phone number |
| POST   | `/api/v1/auth/otp/verify`   | No   | Verify OTP, create/log in user, issue tokens |
| POST   | `/api/v1/auth/refresh`      | No   | Exchange refresh token for new access token |
| GET    | `/api/v1/profile`           | Yes  | Get own (decrypted) profile |
| PATCH  | `/api/v1/profile`           | Yes  | Update eligibility profile (encrypted at rest) |
| GET    | `/api/v1/notifications`     | Yes  | New-scheme-match notifications |

## Security notes

- PII (age, income, address, Aadhaar) is encrypted with AES-256-GCM before
  it touches MongoDB, and only decrypted in memory for the owning user's
  own requests.
- Phone numbers are stored as an HMAC lookup hash (for login) plus a
  separately encrypted copy (for display) — the hash is never reversible.
- OTP codes are bcrypt-hashed and expire via a MongoDB TTL index; codes
  are never logged in production.
- Rotate `ENCRYPTION_KEY` and JWT secrets via your secrets manager, never commit them.
