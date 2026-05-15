import { http } from './api-client';
import type { Job, CreateJobInput } from '@/types/job.types';

export const jobsService = {
  list: (status?: string) =>
    http
      .get<Job[]>('/jobs', { params: status ? { status } : {} })
      .then((r) => r.data),

  create: (data: CreateJobInput) =>
    http.post<Job>('/jobs', data).then((r) => r.data),

  cancel: (id: string) => http.delete(`/jobs/${id}`).then((r) => r.data),

  retry: (id: string) =>
    http.post<Job>(`/jobs/${id}/retry`).then((r) => r.data),
};
