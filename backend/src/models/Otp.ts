import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Short-lived OTP records for phone verification / login.
 * The code itself is bcrypt-hashed — never stored or logged in plain text.
 * TTL index auto-deletes expired documents from MongoDB.
 */
export interface IOtp extends Document {
  phoneHash: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  compareCode(code: string): Promise<boolean>;
}

const otpSchema = new Schema<IOtp>({
  phoneHash: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});

// TTL index: MongoDB removes the document automatically once expiresAt passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.compareCode = async function (code: string): Promise<boolean> {
  return bcrypt.compare(code, this.codeHash);
};

export const Otp = model<IOtp>('Otp', otpSchema);
