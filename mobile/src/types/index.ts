export type UserCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Other';
export type Gender = 'Male' | 'Female' | 'Other';
export type SchemeLevel = 'Local' | 'State' | 'Central';
export type SchemeSourceAuthority = 'MBMC' | 'BMC' | 'Maharashtra Govt' | 'India Govt';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  isProfileComplete: boolean;
}

export interface Profile {
  id: string;
  fullName: string;
  phone?: string;
  age?: number;
  annualIncomeInr?: number;
  address?: string;
  aadhar?: string; // masked, e.g. XXXX-XXXX-1234
  occupation?: string;
  category?: UserCategory;
  gender?: Gender;
  state?: string;
  district?: string;
  isDisabled?: boolean;
  isBPL?: boolean;
  isProfileComplete: boolean;
  notificationsEnabled: boolean;
}

export interface Scheme {
  _id: string;
  title: string;
  description: string;
  level: SchemeLevel;
  sourceAuthority: SchemeSourceAuthority;
  benefits: string;
  requiredDocuments?: string[];
  applySteps?: string[];
  sourceUrl?: string;
}

export interface EligibleSchemeSummary {
  id: string;
  title: string;
  level: SchemeLevel;
  sourceAuthority: SchemeSourceAuthority;
  benefits: string;
  matchScore: number;
}

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  scheme: { _id: string; title: string; level: SchemeLevel } | null;
}

/** Navigation param list — keeps navigation.navigate() calls type-safe. */
export type RootStackParamList = {
  Splash: undefined;
  BrowseSchemes: undefined;
  SchemeDetail: { schemeId: string };
  Login: undefined;
  OtpVerify: { phone: string };
  ProfileForm: undefined;
  Results: undefined;
  Notifications: undefined;
};
