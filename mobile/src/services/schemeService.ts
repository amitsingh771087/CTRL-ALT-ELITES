import { apiClient } from './apiClient';
import { AppNotification, EligibleSchemeSummary, Profile, Scheme, SchemeLevel } from '../types';

/** "Browse all government schemes — no login required". */
export async function browseSchemes(params?: {
  level?: SchemeLevel;
  state?: string;
  page?: number;
}): Promise<{ schemes: Scheme[]; total: number }> {
  const { data } = await apiClient.get('/schemes', { params });
  return { schemes: data.schemes, total: data.total };
}

export async function getSchemeById(id: string): Promise<Scheme> {
  const { data } = await apiClient.get(`/schemes/${id}`);
  return data.scheme;
}

/** "Personalized eligible schemes — Local / State / Central". */
export async function getMyEligibleSchemes(): Promise<EligibleSchemeSummary[]> {
  const { data } = await apiClient.get('/schemes/eligible');
  return data.schemes;
}

export async function getMyProfile(): Promise<Profile> {
  const { data } = await apiClient.get('/profile');
  return data.profile;
}

export async function updateMyProfile(
  updates: Partial<Profile> & { annualIncomeInr?: number; age?: number; aadhar?: string; address?: string }
): Promise<{ isProfileComplete: boolean }> {
  const { data } = await apiClient.patch('/profile', updates);
  return { isProfileComplete: data.isProfileComplete };
}

export async function listNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get('/notifications');
  return data.notifications;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}
