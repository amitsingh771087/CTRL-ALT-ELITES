import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, typed access to environment variables.
 * Fail fast at boot if something critical is missing —
 * this avoids silent misconfiguration in production.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',

  mongoUri: required('MONGO_URI'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },

  encryptionKey: required('ENCRYPTION_KEY'),

  otp: {
    expiresMin: Number(process.env.OTP_EXPIRES_MIN ?? 5),
    providerApiKey: process.env.OTP_PROVIDER_API_KEY ?? '',
  },

  schemeSyncCron: process.env.SCHEME_SYNC_CRON ?? '0 2 * * *',

  isProd: process.env.NODE_ENV === 'production',
};
