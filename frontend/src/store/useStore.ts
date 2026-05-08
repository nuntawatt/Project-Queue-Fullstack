import { create } from 'zustand'
import type { Job } from '@queuely/shared'
import { api } from '../lib/api'

export interface Metrics {
  jobs: { total: number; byStatus: Record<string, number>; avgDurationMs: number }
  queue: { depth: Record<string, number>; total: number }
  dlq: { count: number }
  workers: { total: number; busy: number; idle: number; workers: Array<{ id: string; busy: boolean; processedCount: number }> }
  circuits: Record<string, { state: 'closed' | 'open' | 'half_open'; failures: number }>
}

interface Store {
  jobs: Job[]
  dlqJobs: Job[]
  metrics: Metrics | null
  loading: boolean
  filter: string

  fetchJobs:     (status?: string) => Promise<void>
  fetchDlq:      () => Promise<void>
  fetchMetrics:  () => Promise<void>
  fetchAll:      () => Promise<void>
  upsertJob:     (job: Job) => void
  setFilter:     (f: string) => void
  createJob:     (data: { type: string; priority?: string; payload: object }) => Promise<Job>
  cancelJob:     (id: string) => Promise<void>
  retryJob:      (id: string) => Promise<void>
  replayDlq:     (id: string) => Promise<void>
  removeDlq:     (id: string) => Promise<void>
}

export const useStore = create<Store>((set, get) => ({
  jobs: [], dlqJobs: [], metrics: null, loading: false, filter: '',

  fetchJobs: async (status) => {
    set({ loading: true })
    const jobs = await api.jobs.list(status)
    set({ jobs, loading: false })
  },

  fetchDlq: async () => {
    const dlqJobs = await api.dlq.list()
    set({ dlqJobs })
  },

  fetchMetrics: async () => {
    const metrics = await api.metrics.get()
    set({ metrics })
  },

  fetchAll: async () => {
    await Promise.all([get().fetchJobs(), get().fetchDlq(), get().fetchMetrics()])
  },

  upsertJob: (updated) =>
    set((s) => ({
      jobs: s.jobs.find((j) => j.id === updated.id)
        ? s.jobs.map((j) => (j.id === updated.id ? { ...j, ...updated } : j))
        : [updated, ...s.jobs],
    })),

  setFilter: (f) => {
    set({ filter: f })
    get().fetchJobs(f || undefined)
  },

  createJob: async (data) => {
    const job = await api.jobs.create(data)
    get().upsertJob(job)
    get().fetchMetrics()
    return job
  },

  cancelJob: async (id) => {
    await api.jobs.cancel(id)
    await get().fetchJobs(get().filter || undefined)
    get().fetchMetrics()
  },

  retryJob: async (id) => {
    await api.jobs.retry(id)
    await get().fetchJobs(get().filter || undefined)
  },

  replayDlq: async (id) => {
    await api.dlq.replay(id)
    await Promise.all([get().fetchDlq(), get().fetchJobs(), get().fetchMetrics()])
  },

  removeDlq: async (id) => {
    await api.dlq.remove(id)
    set((s) => ({ dlqJobs: s.dlqJobs.filter((j) => j.id !== id) }))
    get().fetchMetrics()
  },
}))
