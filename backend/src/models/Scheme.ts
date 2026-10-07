import { Schema, model, Document, Types } from 'mongoose';
import { SchemeLevel, SchemeSourceAuthority, UserCategory, Gender } from '../types';

/**
 * Eligibility rule set for a scheme. All bounds are inclusive and optional —
 * an omitted bound means "no restriction on this axis".
 * This is the shape the Eligibility Engine (services/eligibility.service.ts)
 * evaluates a user's profile against.
 */
export interface ISchemeRules {
  minAge?: number;
  maxAge?: number;
  maxAnnualIncomeInr?: number;
  allowedCategories?: UserCategory[];
  allowedGenders?: Gender[];
  allowedOccupations?: string[]; // empty/undefined = any occupation
  states?: string[]; // empty/undefined = nationwide
  districts?: string[];
  requiresBPL?: boolean;
  requiresDisability?: boolean;
}

export interface IScheme extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  level: SchemeLevel;
  sourceAuthority: SchemeSourceAuthority;
  sourceUrl?: string;
  benefits: string;
  requiredDocuments: string[];
  applySteps: string[];
  rules: ISchemeRules;
  isActive: boolean;
  externalId?: string; // id from the source portal, used for upsert on sync
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rulesSchema = new Schema<ISchemeRules>(
  {
    minAge: Number,
    maxAge: Number,
    maxAnnualIncomeInr: Number,
    allowedCategories: [{ type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] }],
    allowedGenders: [{ type: String, enum: ['Male', 'Female', 'Other'] }],
    allowedOccupations: [String],
    states: [String],
    districts: [String],
    requiresBPL: Boolean,
    requiresDisability: Boolean,
  },
  { _id: false }
);

const schemeSchema = new Schema<IScheme>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    level: { type: String, enum: ['Local', 'State', 'Central'], required: true, index: true },
    sourceAuthority: {
      type: String,
      enum: ['MBMC', 'BMC', 'Maharashtra Govt', 'India Govt'],
      required: true,
    },
    sourceUrl: String,
    benefits: { type: String, required: true },
    requiredDocuments: [{ type: String }],
    applySteps: [{ type: String }],
    rules: { type: rulesSchema, required: true, default: {} },
    isActive: { type: Boolean, default: true, index: true },
    externalId: { type: String, index: true },
    lastSyncedAt: Date,
  },
  { timestamps: true }
);

schemeSchema.index({ sourceAuthority: 1, externalId: 1 }, { unique: true, sparse: true });

export const Scheme = model<IScheme>('Scheme', schemeSchema);
