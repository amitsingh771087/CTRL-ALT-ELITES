import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Field-level encryption for sensitive PII (income, Aadhaar/ID numbers,
 * address, uploaded document references, etc).
 *
 * Algorithm: AES-256-GCM
 *  - 256-bit key, derived from ENCRYPTION_KEY (base64, 32 bytes)
 *  - random 12-byte IV per value (never reused)
 *  - GCM auth tag stored alongside ciphertext to detect tampering
 *
 * Stored format (string): "<ivHex>:<authTagHex>:<cipherTextHex>"
 * This lets us keep the encrypted value in a single MongoDB string field.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const key = Buffer.from(env.encryptionKey, 'base64');
  if (key.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY must decode to exactly 32 bytes. Generate one with: ' +
        'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
    );
  }
  return key;
}

export function encryptField(plainText: string | undefined | null): string | undefined {
  if (plainText === undefined || plainText === null || plainText === '') return undefined;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptField(payload: string | undefined | null): string | undefined {
  if (!payload) return undefined;

  const [ivHex, authTagHex, cipherHex] = payload.split(':');
  if (!ivHex || !authTagHex || !cipherHex) {
    throw new Error('Malformed encrypted payload');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * One-way hash used for fields we need to *look up* (e.g. phone number)
 * but never need to decrypt. SHA-256 with a static pepper from the same
 * key material — deterministic, so it's indexable, but never reveals
 * the original value.
 */
export function hashLookupField(value: string): string {
  return crypto.createHmac('sha256', getKey()).update(value.trim().toLowerCase()).digest('hex');
}
