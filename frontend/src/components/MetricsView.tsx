import type { FC } from 'react'

interface Props {
  metrics: {
    jobs: { total: number; byStatus: Record<string, number>; avgDurationMs: number }
    queue: { depth: Record<string, number>; total: number }
    dlq: { count: number }
    workers: { total: number; busy: number; idle: number; workers: any[] }
    circuits: Record<string, { state: string; failures: number }>
  }
}

const CIRCUIT_STYLE: Record<string, { color: string; label: string }> = {
  closed:    { color: '#10B981', label: 'closed' },
  open:      { color: '#EF4444', label: 'open' },
  half_open: { color: '#F59E0B', label: 'half-open' },
}

export const MetricsView: FC<Props> = ({ metrics }) => {
  const { jobs, queue, dlq, workers, circuits } = metrics

  const statCards = [
    { label: 'Total Jobs',   value: jobs.total,       unit: '' },
    { label: 'Queue Depth',  value: queue.total,      unit: '' },
    { label: 'DLQ',          value: dlq.count,        unit: '', danger: dlq.count > 0 },
    { label: 'Avg Duration', value: (jobs.avgDurationMs / 1000).toFixed(2), unit: 's' },
    { label: 'Workers',      value: `${workers.busy}/${workers.total}`, unit: 'busy' },
  ]

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statCards.map((c) => (
          <div key={c.label} style={{
            background: 'var(--elevated)', border: `1px solid ${c.danger ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
            borderRadius: 10, padding: '16px 18px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{c.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: c.danger ? 'var(--danger)' : 'var(--text)' }}>{c.value}</span>
              {c.unit && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Section title="Job Status">
          {Object.entries(jobs.byStatus).map(([status, count]) => {
            const pct = jobs.total > 0 ? (count / jobs.total) * 100 : 0
            const colors: Record<string, string> = { pending: '#F59E0B', running: '#3B82F6', completed: '#10B981', failed: '#EF4444', dead: '#5A6078' }
            const color = colors[status] ?? '#5A6078'
            return (
              <div key={status} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{status}</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--muted)' }}>{count} <span style={{ color: 'var(--muted)', fontSize: 10 }}>({pct.toFixed(0)}%)</span></span>
                </div>
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )
          })}
        </Section>

        <Section title="Circuit Breakers">
          {Object.keys(circuits).length === 0 && <p style={{ color: 'var(--muted)', fontSize: 12 }}>No circuits recorded yet</p>}
          {Object.entries(circuits).map(([service, info]) => {
            const s = CIRCUIT_STYLE[info.state] ?? CIRCUIT_STYLE.closed
            return (
              <div key={service} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 8 }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{service}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {info.failures > 0 && <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'IBM Plex Mono, monospace' }}>{info.failures}✗</span>}
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, color: s.color, background: `${s.color}18` }}>{s.label}</span>
                </div>
              </div>
            )
          })}
        </Section>

        <Section title="Queue Depth by Priority">
          {(['critical', 'high', 'normal', 'low'] as const).map((p) => {
            const count = queue.depth[p] ?? 0
            const colors = { critical: '#EF4444', high: '#F59E0B', normal: '#DDE1F0', low: '#5A6078' }
            return (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: colors[p] }}>{p}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text)' }}>{count}</span>
              </div>
            )
          })}
        </Section>

        <Section title="Worker Pool">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Pill label="Total" value={workers.total} color="#DDE1F0" />
            <Pill label="Busy" value={workers.busy} color="#3B82F6" />
            <Pill label="Idle" value={workers.idle} color="#10B981" />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(workers.workers as any[]).map((w) => (
              <div key={w.id} title={w.id} style={{
                width: 28, height: 28, borderRadius: 6,
                background: w.busy ? 'rgba(59,130,246,0.2)' : 'var(--surface)',
                border: `1px solid ${w.busy ? '#3B82F6' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: w.busy ? '#3B82F6' : 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace',
              }}>
                {w.id.split('-')[1]}
                {w.busy && <span className="pulse" style={{ width: 4, height: 4, borderRadius: '50%', background: '#3B82F6', marginLeft: 2 }} />}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>{title}</h3>
    {children}
  </div>
)

const Pill: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ flex: 1, padding: '8px 10px', borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
    <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{label}</div>
  </div>
)
