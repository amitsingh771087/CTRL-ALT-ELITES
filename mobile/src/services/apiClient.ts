import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens } from '../types';

// Point this at your deployed backend. Use a build-time env (e.g. react-native-config)
// in a real app instead of hard-coding it.
export const API_BASE_URL = 'https://api.govsync.example.com/api/v1';

const ACCESS_TOKEN_KEY = 'govsync.accessToken';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * On a 401, attempt exactly one refresh-and-retry using the refresh token
 * (unlocked via biometrics upstream) before giving up and forcing re-login.
 * The actual refresh call is injected to avoid a circular import with
 * authService.
 */
let refreshHandler: (() => Promise<AuthTokens | null>) | null = null;
export function setRefreshHandler(handler: () => Promise<AuthTokens | null>): void {
  refreshHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retried && refreshHandler) {
      original._retried = true;
      const tokens = await refreshHandler();
      if (tokens) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  }
);

export async function persistAccessToken(accessToken: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}
