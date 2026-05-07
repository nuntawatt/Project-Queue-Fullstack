import axios from 'axios'
import type { Job } from '@queuely/shared'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'x-api-key': import.meta.env.VITE_API_KEY ?? 'queuely-dev-secret' },
})

export const api = {
  jobs: {
    create: (data: { type: string; priority?: string; payload: object; maxRetries?: number }) =>
      http.post<Job>('/jobs', data).then((r) => r.data),
    list: (status?: string) =>
      http.get<Job[]>('/jobs', { params: { status } }).then((r) => r.data),
    get: (id: string) => http.get<Job>(`/jobs/${id}`).then((r) => r.data),
    cancel: (id: string) => http.delete(`/jobs/${id}`).then((r) => r.data),
    retry: (id: string) => http.post<Job>(`/jobs/${id}/retry`).then((r) => r.data),
  },
  dlq: {
    list: () => http.get<Job[]>('/dlq').then((r) => r.data),
    replay: (id: string) => http.post<Job>(`/dlq/${id}/replay`).then((r) => r.data),
    remove: (id: string) => http.delete(`/dlq/${id}`).then((r) => r.data),
  },
  metrics: {
    get: () => http.get('/metrics').then((r) => r.data),
  },
}
