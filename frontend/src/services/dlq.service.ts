import { http } from './api-client';
import type { Job } from '@/types/job.types';

export const dlqService = {
  list: () => http.get<Job[]>('/dlq').then((r) => r.data),

  replay: (id: string) =>
    http.post<Job>(`/dlq/${id}/replay`).then((r) => r.data),

  remove: (id: string) => http.delete(`/dlq/${id}`).then((r) => r.data),
};
