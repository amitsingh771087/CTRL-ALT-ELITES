import { Schema, model, Document, Types } from 'mongoose';
import { encryptField, decryptField, hashLookupField } from '../services/encryption.service';
import { UserCategory, Gender } from '../types';

/**
 * User document.
 *
 * Sensitive PII (income, Aadhaar-style ID, address, documents) is stored
 * AES-256-GCM encrypted at the field level (see encryption.service.ts).
 * The phone number is stored twice:
 *   - phoneHash: deterministic HMAC, used for login lookup (never reversible)
 *   - phoneEncrypted: AES-256-GCM, decrypted only when displaying to the owner
 *
 * Mongoose `select: false` keeps encrypted blobs out of default queries;
 * they must be explicitly requested with `.select('+phoneEncrypted')`.
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  phoneHash: string;
  phoneEncrypted: string;
  fullName: string;

  // Eligibility profile (encrypted where sensitive)
  ageEncrypted?: string;
  annualIncomeEncrypted?: string;
  occupation?: string;
  category?: UserCategory;
  gender?: Gender;
  state?: string;
  district?: string;
  isDisabled?: boolean;
  isBPL?: boolean;
  addressEncrypted?: string;
  aadharEncrypted?: string;

  isProfileComplete: boolean;
  notificationsEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Virtual helpers to get/set encrypted values with plain data
  setPhone(phone: string): void;
  getPhone(): string | undefined;
  setSensitiveProfile(fields: { age?: number; annualIncomeInr?: number; address?: string; aadhar?: string }): void;
  getSensitiveProfile(): { age?: number; annualIncomeInr?: number; address?: string; aadhar?: string };
}

const userSchema = new Schema<IUser>(
  {
    phoneHash: { type: String, required: true, unique: true, index: true },
    phoneEncrypted: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },

    ageEncrypted: { type: String, select: false },
    annualIncomeEncrypted: { type: String, select: false },
    occupation: { type: String, trim: true },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    state: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },
    isDisabled: { type: Boolean, default: false },
    isBPL: { type: Boolean, default: false },
    addressEncrypted: { type: String, select: false },
    aadharEncrypted: { type: String, select: false },

    isProfileComplete: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.setPhone = function (phone: string): void {
  this.phoneHash = hashLookupField(phone);
  this.phoneEncrypted = encryptField(phone);
};

userSchema.methods.getPhone = function (): string | undefined {
  return decryptField(this.phoneEncrypted);
};

userSchema.methods.setSensitiveProfile = function (fields: {
  age?: number;
  annualIncomeInr?: number;
  address?: string;
  aadhar?: string;
}): void {
  if (fields.age !== undefined) this.ageEncrypted = encryptField(String(fields.age));
  if (fields.annualIncomeInr !== undefined)
    this.annualIncomeEncrypted = encryptField(String(fields.annualIncomeInr));
  if (fields.address !== undefined) this.addressEncrypted = encryptField(fields.address);
  if (fields.aadhar !== undefined) this.aadharEncrypted = encryptField(fields.aadhar);
};

userSchema.methods.getSensitiveProfile = function () {
  return {
    age: this.ageEncrypted ? Number(decryptField(this.ageEncrypted)) : undefined,
    annualIncomeInr: this.annualIncomeEncrypted
      ? Number(decryptField(this.annualIncomeEncrypted))
      : undefined,
    address: this.addressEncrypted ? decryptField(this.addressEncrypted) : undefined,
    aadhar: this.aadharEncrypted ? decryptField(this.aadharEncrypted) : undefined,
  };
};

export const User = model<IUser>('User', userSchema);
