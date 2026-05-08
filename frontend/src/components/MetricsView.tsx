import type { FC } from 'react'
import type { Metrics } from '../store/useStore'
import { MetricCard } from './MetricCard'

interface Props { metrics: Metrics }

const CIRCUIT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  closed:    { color: '#059669', bg: '#D1FAE5', label: 'Healthy' },
  open:      { color: '#DC2626', bg: '#FEE2E2', label: 'Open' },
  half_open: { color: '#D97706', bg: '#FEF3C7', label: 'Testing' },
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706', running: '#2563EB', completed: '#059669',
  failed: '#DC2626', dead: '#6B7280',
}

export const MetricsView: FC<Props> = ({ metrics }) => {
  const { jobs, queue, dlq, workers, circuits } = metrics

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%' }}>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <MetricCard label="Total jobs" value={jobs.total} />
        <MetricCard label="Queue depth" value={queue.total} accent={queue.total > 0 ? '#D97706' : undefined} sub={`${queue.depth.critical ?? 0} critical`} />
        <MetricCard label="Dead letter" value={dlq.count} accent={dlq.count > 0 ? '#DC2626' : undefined} sub={dlq.count > 0 ? 'needs attention' : 'all clear'} />
        <MetricCard label="Avg duration" value={`${(jobs.avgDurationMs / 1000).toFixed(2)}s`} />
        <MetricCard label="Workers busy" value={`${workers.busy}/${workers.total}`} accent="#2563EB" sub={`${workers.idle} idle`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Job status breakdown */}
        <Section title="Job breakdown">
          {Object.keys(STATUS_COLORS).map((status) => {
            const count = jobs.byStatus[status] ?? 0
            const pct = jobs.total > 0 ? (count / jobs.total) * 100 : 0
            const color = STATUS_COLORS[status]
            return (
              <div key={status} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
                    {status}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B7280' }}>
                    {count} <span style={{ color: '#9CA3AF', fontSize: 11 }}>({Math.round(pct)}%)</span>
                  </span>
                </div>
                <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )
          })}
        </Section>

        {/* Queue depth */}
        <Section title="Queue depth by priority">
          {(['critical', 'high', 'normal', 'low'] as const).map((p) => {
            const count = queue.depth[p] ?? 0
            const colors = { critical: '#DC2626', high: '#D97706', normal: '#6B7280', low: '#9CA3AF' }
            return (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: colors[p], display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 8 }}>●</span> {p}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: count > 0 ? '#111827' : '#9CA3AF' }}>
                  {count}
                </span>
              </div>
            )
          })}
        </Section>

        {/* Circuit breakers */}
        <Section title="Circuit breakers">
          {Object.keys(circuits).length === 0 ? (
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>No circuits active yet — they appear when workers process jobs</p>
          ) : (
            Object.entries(circuits).map(([service, info]) => {
              const s = CIRCUIT_STYLE[info.state] ?? CIRCUIT_STYLE.closed
              return (
                <div key={service} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151' }}>{service}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {info.failures > 0 && (
                      <span style={{ fontSize: 12, color: '#DC2626', fontFamily: 'JetBrains Mono, monospace' }}>
                        {info.failures} fail{info.failures !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={{ padding: '3px 9px', borderRadius: 5, fontSize: 12, fontWeight: 500, color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </Section>

        {/* Worker pool */}
        <Section title="Worker pool">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Total', value: workers.total, color: '#374151' },
              { label: 'Busy',  value: workers.busy,  color: '#2563EB' },
              { label: 'Idle',  value: workers.idle,  color: '#059669' },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {workers.workers.map((w) => (
              <div
                key={w.id}
                title={`${w.id} — ${w.processedCount} processed`}
                style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: w.busy ? '#DBEAFE' : '#F9FAFB',
                  border: `1px solid ${w.busy ? '#BFDBFE' : '#E5E7EB'}`,
                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                  color: w.busy ? '#1D4ED8' : '#9CA3AF',
                  position: 'relative',
                }}
              >
                {w.id.split('-')[1]}
                {w.busy && <span className="pulse" style={{ position: 'absolute', top: 3, right: 3, width: 4, height: 4, borderRadius: '50%', background: '#2563EB' }} />}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 18px' }}>
    <h3 style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
      {title}
    </h3>
    {children}
  </div>
)
