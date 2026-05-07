import { useCallback, useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { useWebSocket } from './hooks/useWebSocket'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { JobTable } from './components/JobTable'
import { MetricsView } from './components/MetricsView'
import { DLQView } from './components/DLQView'
import type { JobEvent } from '@queuely/shared'

export default function App() {
  const [view, setView] = useState<'jobs' | 'dlq' | 'metrics'>('jobs')
  const [wsConnected, setWsConnected] = useState(false)
  const { jobs, loading, dlqJobs, metrics, upsertJob, fetchJobs, fetchDlq, fetchMetrics } = useStore()

  // initial load
  useEffect(() => {
    fetchJobs()
    fetchDlq()
    fetchMetrics()

    // poll metrics every 5s
    const timer = setInterval(fetchMetrics, 5000)
    return () => clearInterval(timer)
  }, [])

  // handle real-time events
  const handleEvent = useCallback((event: JobEvent) => {
    setWsConnected(true)

    // update job state from event
    if (event.jobId && event.status) {
      fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/jobs/${event.jobId}`, {
        headers: { 'x-api-key': import.meta.env.VITE_API_KEY ?? 'queuely-dev-secret' },
      })
        .then((r) => r.json())
        .then((job) => upsertJob(job))
        .catch(() => {})
    }

    // refresh DLQ and metrics on relevant events
    if (event.event === 'job.dead') fetchDlq()
    fetchMetrics()
  }, [])

  useWebSocket(handleEvent)

  const dlqCount = metrics?.dlq.count ?? dlqJobs.length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar view={view} onChange={(v) => setView(v as any)} dlqCount={dlqCount} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar view={view} wsConnected={wsConnected} />

        <main style={{ flex: 1, overflow: 'hidden', background: 'var(--surface)' }} className="fade-in">
          {view === 'jobs'    && <JobTable jobs={jobs} loading={loading} />}
          {view === 'dlq'     && <DLQView jobs={dlqJobs} />}
          {view === 'metrics' && metrics && <MetricsView metrics={metrics} />}
          {view === 'metrics' && !metrics && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
              Loading metrics…
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
