'use client';

import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';

export function useJobs(statusFilter?: string) {
  return useQuery({
    queryKey: ['jobs', statusFilter ?? 'all'],
    queryFn: () => jobsService.list(statusFilter),
    refetchInterval: 30_000,
  });
}
