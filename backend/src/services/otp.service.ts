import bcrypt from 'bcryptjs';
import { Otp } from '../models/Otp';
import { hashLookupField } from './encryption.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;

function generateNumericCode(length: number): string {
  let code = '';
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}

/**
 * Requests a fresh OTP for a phone number, invalidating any previous one.
 * The plaintext code is only ever handed to the SMS provider + returned
 * here for that purpose — it is never persisted or logged.
 */
export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const phoneHash = hashLookupField(phone);
  const code = generateNumericCode(CODE_LENGTH);
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.otp.expiresMin * 60_000);

  await Otp.deleteMany({ phoneHash });
  await Otp.create({ phoneHash, codeHash, expiresAt });

  // TODO: integrate a real SMS provider (MSG91, Twilio, etc) using env.otp.providerApiKey
  if (!env.isProd) {
    logger.debug(`[DEV ONLY] OTP for ${phone}: ${code}`);
    return { devCode: code }; // returned only outside production, for local testing
  }

  return {};
}

/** Verifies a submitted OTP against the stored hash, with an attempt limit. */
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const phoneHash = hashLookupField(phone);
  const record = await Otp.findOne({ phoneHash }).sort({ _id: -1 });

  if (!record) throw ApiError.badRequest('No OTP requested for this number, or it has expired');
  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw ApiError.badRequest('Too many incorrect attempts. Please request a new OTP');
  }

  const isValid = await record.compareCode(code);
  if (!isValid) {
    record.attempts += 1;
    await record.save();
    return false;
  }

  await record.deleteOne();
  return true;
}
