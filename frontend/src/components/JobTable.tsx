import type { FC } from 'react'
import type { Job } from '@queuely/shared'
import { useStore } from '../store/useStore'

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot?: string }> = {
  pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  dot: 'var(--amber)' },
  running:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', dot: '#3B82F6' },
  completed: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', dot: '#10B981' },
  failed:    { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  dot: '#EF4444' },
  dead:      { color: '#5A6078', bg: 'rgba(90,96,120,0.1)',  dot: '#5A6078' },
}

const PRIORITY_COLOR: Record<string, string> = {
  low: '#5A6078', normal: '#DDE1F0', high: '#F59E0B', critical: '#EF4444',
}

const FILTERS = ['', 'pending', 'running', 'completed', 'failed', 'dead']

interface Props { jobs: Job[]; loading: boolean }

export const JobTable: FC<Props> = ({ jobs, loading }) => {
  const { cancelJob, retryJob, activeFilter, setFilter } = useStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f || 'all'} onClick={() => setFilter(f)} style={{
            padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)',
            background: activeFilter === f ? 'var(--elevated)' : 'transparent',
            color: activeFilter === f ? 'var(--text)' : 'var(--muted)',
            fontSize: 12, cursor: 'pointer', transition: 'all 0.1s',
          }}>
            {f || 'All'}
            {f && <span style={{ marginLeft: 5, color: 'var(--muted)', fontSize: 10 }}>{jobs.filter((j) => j.status === f).length}</span>}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', alignSelf: 'center', fontFamily: 'IBM Plex Mono, monospace' }}>{jobs.length} jobs</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['ID', 'Type', 'Priority', 'Status', 'Retries', 'Duration', 'Created', ''].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontWeight: 500, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</td></tr>}
            {!loading && jobs.length === 0 && <tr><td colSpan={8} style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No jobs yet — create one to get started</td></tr>}
            {jobs.map((job) => {
              const s = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.failed
              const duration = job.startedAt && job.completedAt ? `${((job.completedAt - job.startedAt) / 1000).toFixed(2)}s` : job.status === 'running' ? 'running…' : '—'
              return (
                <tr key={job.id} className="row-enter" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '11px 16px' }}><span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>{job.id.slice(0, 8)}</span></td>
                  <td style={{ padding: '11px 16px' }}><span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text)' }}>{job.type}</span></td>
                  <td style={{ padding: '11px 16px' }}><span style={{ fontSize: 12, color: PRIORITY_COLOR[job.priority], fontWeight: job.priority === 'critical' ? 600 : 400 }}>{job.priority}</span></td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 500, color: s.color, background: s.bg }}>
                      {job.status === 'running' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} className="pulse" />}
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: job.retries > 0 ? 'var(--amber)' : 'var(--muted)' }}>{job.retries}/{job.maxRetries}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--muted)' }}>{duration}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{new Date(job.createdAt).toLocaleTimeString('en-GB')}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {job.status === 'pending' && <ActionBtn onClick={() => cancelJob(job.id)} color="var(--red)">Cancel</ActionBtn>}
                      {job.status === 'failed' && <ActionBtn onClick={() => retryJob(job.id)} color="var(--blue)">Retry</ActionBtn>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ActionBtn: FC<{ onClick: () => void; color: string; children: React.ReactNode }> = ({ onClick, color, children }) => (
  <button onClick={onClick} style={{
    padding: '3px 10px', borderRadius: 4, border: `1px solid ${color}22`,
    background: `${color}11`, color, fontSize: 11, cursor: 'pointer',
    fontFamily: 'IBM Plex Mono, monospace', transition: 'all 0.1s',
  }}
    onMouseEnter={(e) => { e.currentTarget.style.background = `${color}22` }}
    onMouseLeave={(e) => { e.currentTarget.style.background = `${color}11` }}>
    {children}
  </button>
)
