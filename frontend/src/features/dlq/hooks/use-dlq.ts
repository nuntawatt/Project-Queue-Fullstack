'use client';

import { useQuery } from '@tanstack/react-query';
import { dlqService } from '@/services/dlq.service';

export function useDlq() {
  return useQuery({
    queryKey: ['dlq'],
    queryFn: () => dlqService.list(),
    refetchInterval: 30_000,
  });
}
