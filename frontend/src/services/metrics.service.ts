import { http } from './api-client';
import type { MetricsResponse } from '@/types/api.types';

export const metricsService = {
  get: () => http.get<MetricsResponse>('/metrics').then((r) => r.data),
};
