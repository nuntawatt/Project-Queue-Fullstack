'use client';

import { useQuery } from '@tanstack/react-query';
import { metricsService } from '@/services/metrics.service';
import { APP_CONFIG } from '@/lib/constants';

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => metricsService.get(),
    refetchInterval: APP_CONFIG.polling.metricsInterval,
  });
}
