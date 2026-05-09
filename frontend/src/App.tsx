import { useCallback, useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { useWebSocket } from './hooks/useWebSocket'
import { JobsView } from './components/JobsView'
import { DLQView } from './components/DLQView'
import { MetricsView } from './components/MetricsView'
import { NewJobModal } from './components/NewJobModal'
import { MetricCard } from './components/MetricCard'
import type { JobEvent, Job } from '@/types/job.types'

type View = 'jobs' | 'dlq' | 'metrics'

export default function App() {
  const [view, setView] = useState<View>('jobs')
  const [wsConnected, setWsConnected] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const { jobs, loading, dlqJobs, metrics, upsertJob, fetchAll, fetchMetrics, fetchDlq } = useStore()

  useEffect(() => {
    fetchAll()
    const poll = setInterval(fetchMetrics, 10_000)
    return () => clearInterval(poll)
  }, [fetchAll, fetchMetrics])

  const handleEvent = useCallback((event: JobEvent) => {
    // update job inline if we have status info
    if (event.jobId && event.status) {
      upsertJob({ id: event.jobId, status: event.status } as Job)
    }
    if (event.event === 'job.dead') fetchDlq()
    fetchMetrics()
  }, [fetchDlq, fetchMetrics, upsertJob])

  useWebSocket(handleEvent, setWsConnected)

  const dlqCount = metrics?.dlq.count ?? dlqJobs.length

  const navItems: Array<{ id: View; label: string; badge?: number }> = [
    { id: 'jobs',    label: 'Jobs' },
    { id: 'dlq',     label: 'DLQ', badge: dlqCount || undefined },
    { id: 'metrics', label: 'Metrics' },
  ]

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827', letterSpacing: '-0.3px' }}>Queuely</span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {navItems.map(({ id, label, badge }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: view === id ? '#F3F4F6' : 'transparent',
                color: view === id ? '#111827' : '#6B7280',
                fontSize: 14, fontWeight: view === id ? 500 : 400,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s',
              }}
            >
              {label}
              {badge != null && badge > 0 && (
                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: '#FEE2E2', color: '#DC2626', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* WS status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, border: '1px solid #E5E7EB', marginRight: 12 }}>
          <span className={wsConnected ? 'pulse' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: wsConnected ? '#10B981' : '#D1D5DB', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#6B7280', fontFamily: 'JetBrains Mono, monospace' }}>
            {wsConnected ? 'live' : 'connecting'}
          </span>
        </div>

        {/* CTA */}
        {view === 'jobs' && (
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + New job
          </button>
        )}
      </header>

      {/* ── Metric strip (always visible) ───────────────────── */}
      {metrics && (
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '12px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <MetricCard label="Total jobs"   value={metrics.jobs.total} />
            <MetricCard label="Queue depth"  value={metrics.queue.total} accent={metrics.queue.total > 0 ? '#D97706' : undefined} sub={`${metrics.queue.depth?.critical ?? 0} critical`} />
            <MetricCard label="Dead letter"  value={metrics.dlq.count}  accent={metrics.dlq.count > 0 ? '#DC2626' : undefined} />
            <MetricCard label="Workers"      value={`${metrics.workers.busy}/${metrics.workers.total}`} accent="#2563EB" sub="busy" />
            <MetricCard label="Avg duration" value={`${(metrics.jobs.avgDurationMs / 1000).toFixed(2)}s`} />
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'hidden', background: '#fff' }}>
        {view === 'jobs'    && <JobsView jobs={jobs} loading={loading} />}
        {view === 'dlq'     && <DLQView jobs={dlqJobs} />}
        {view === 'metrics' && metrics && <MetricsView metrics={metrics} />}
        {view === 'metrics' && !metrics && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', fontSize: 14 }}>
            Loading metrics…
          </div>
        )}
      </main>

      {/* ── Modal ────────────────────────────────────────────── */}
      {showModal && <NewJobModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
