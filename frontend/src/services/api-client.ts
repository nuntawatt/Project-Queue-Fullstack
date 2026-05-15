import axios, { type AxiosError } from 'axios';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Centralized HTTP client.
 * All API calls go through this instance so we get:
 * - Consistent base URL and auth header
 * - Centralized error interceptor
 * - Easy swap to different backends later
 */
export const http = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  headers: {
    'x-api-key': APP_CONFIG.api.key,
  },
  timeout: 15_000,
});

// Response interceptor — normalize errors
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';

    // Re-throw with a clean message for UI consumption
    return Promise.reject(new Error(message));
  },
);
