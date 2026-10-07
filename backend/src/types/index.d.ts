import { Types } from 'mongoose';

export type UserCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Other';
export type Gender = 'Male' | 'Female' | 'Other';
export type SchemeLevel = 'Local' | 'State' | 'Central';
export type SchemeSourceAuthority = 'MBMC' | 'BMC' | 'Maharashtra Govt' | 'India Govt';

/** Decrypted shape of a user's eligibility profile, as used in business logic. */
export interface EligibilityProfileInput {
  age: number;
  annualIncomeInr: number;
  occupation: string;
  category: UserCategory;
  gender: Gender;
  state: string;
  district: string;
  isDisabled?: boolean;
  isBPL?: boolean; // Below Poverty Line
}

export interface JwtPayload {
  sub: string; // user id
  phoneHash: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
    }
  }
}
