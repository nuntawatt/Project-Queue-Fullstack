import { create } from 'zustand'
import type { Job } from '@queuely/shared'
import { api } from '../lib/api'

// ─── Types ────────────────────────────────────────────────────

interface Metrics {
  jobs: { total: number; byStatus: Record<string, number>; avgDurationMs: number }
  queue: { depth: Record<string, number>; total: number }
  dlq: { count: number }
  workers: { total: number; busy: number; idle: number; workers: unknown[] }
  circuits: Record<string, { state: string; failures: number }>
}

interface Store {
  // jobs
  jobs: Job[]
  loading: boolean
  activeFilter: string
  fetchJobs:  (status?: string) => Promise<void>
  upsertJob:  (job: Job) => void
  createJob:  (data: { type: string; priority?: string; payload: object }) => Promise<Job>
  cancelJob:  (id: string) => Promise<void>
  retryJob:   (id: string) => Promise<void>
  setFilter:  (f: string) => void

  // dlq
  dlqJobs: Job[]
  fetchDlq:   () => Promise<void>
  replayJob:  (id: string) => Promise<void>
  removeFromDlq: (id: string) => Promise<void>

  // metrics
  metrics: Metrics | null
  fetchMetrics: () => Promise<void>
}

// ─── Store ────────────────────────────────────────────────────

export const useStore = create<Store>((set, get) => ({
  // ── Jobs ──
  jobs: [],
  loading: false,
  activeFilter: '',

  fetchJobs: async (status) => {
    set({ loading: true })
    const jobs = await api.jobs.list(status)
    set({ jobs, loading: false })
  },

  upsertJob: (updated) =>
    set((s) => {
      const exists = s.jobs.find((j) => j.id === updated.id)
      return {
        jobs: exists
          ? s.jobs.map((j) => (j.id === updated.id ? { ...j, ...updated } : j))
          : [updated, ...s.jobs],
      }
    }),

  createJob: async (data) => {
    const job = await api.jobs.create(data)
    get().upsertJob(job)
    get().fetchMetrics()
    return job
  },

  cancelJob: async (id) => {
    await api.jobs.cancel(id)
    await get().fetchJobs(get().activeFilter || undefined)
  },

  retryJob: async (id) => {
    await api.jobs.retry(id)
    await get().fetchJobs(get().activeFilter || undefined)
  },

  setFilter: (f) => {
    set({ activeFilter: f })
    get().fetchJobs(f || undefined)
  },

  // ── DLQ ──
  dlqJobs: [],

  fetchDlq: async () => {
    const dlqJobs = await api.dlq.list()
    set({ dlqJobs })
  },

  replayJob: async (id) => {
    await api.dlq.replay(id)
    await Promise.all([get().fetchDlq(), get().fetchJobs(), get().fetchMetrics()])
  },

  removeFromDlq: async (id) => {
    await api.dlq.remove(id)
    set((s) => ({ dlqJobs: s.dlqJobs.filter((j) => j.id !== id) }))
    get().fetchMetrics()
  },

  // ── Metrics ──
  metrics: null,

  fetchMetrics: async () => {
    const metrics = await api.metrics.get()
    set({ metrics })
  },
}))
