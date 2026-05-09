import { type FC, useState, useEffect } from 'react'
import type { Job, JobStatus } from '@/types/job.types'
import { useStore } from '../store/useStore'
import { StatusPill } from './StatusPill'
import { PriorityBadge } from './PriorityBadge'

const FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
  { key: 'dead', label: 'Dead' },
]

interface Props { jobs: Job[]; loading: boolean }

export const JobsView: FC<Props> = ({ jobs, loading }) => {
  const { cancelJob, retryJob, filter, setFilter } = useStore()
  const [actionLoading, setActionLoading] = useState<string>('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handle = async (fn: () => Promise<void>, id: string) => {
    setActionLoading(id)
    try { await fn() } finally { setActionLoading('') }
  }

  const countByStatus = (s: string) => jobs.filter((j) => j.status === s).length

  const formatDuration = (job: Job) => {
    if (!job.startedAt) return '—'
    const end = job.completedAt ?? now
    const ms = Math.max(0, end - job.startedAt)
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* filter tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 20px', borderBottom: '1px solid #E5E7EB', background: '#fff', alignItems: 'center' }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              border: '1px solid transparent',
              background: filter === key ? '#F3F4F6' : 'transparent',
              color: filter === key ? '#111827' : '#6B7280',
              fontWeight: filter === key ? 500 : 400,
              fontFamily: 'inherit',
            }}
          >
            {label}
            {key && countByStatus(key) > 0 && (
              <span style={{
                fontSize: 11, padding: '1px 5px', borderRadius: 10,
                background: filter === key ? '#E5E7EB' : '#F3F4F6',
                color: '#6B7280', fontFamily: 'JetBrains Mono, monospace',
              }}>
                {countByStatus(key)}
              </span>
            )}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace' }}>
          {jobs.length} jobs
        </span>
      </div>

      {/* table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={centered}>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading jobs…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ ...centered, gap: 8 }}>
            <p style={{ fontSize: 20 }}>📭</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>No jobs yet</p>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Create a job to see it appear here in real time</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                {['Job ID', 'Type', 'Priority', 'Status', 'Retries', 'Duration', 'Created', ''].map((h) => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9CA3AF' }}>
                    {job.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151' }}>
                    {job.type}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <PriorityBadge priority={job.priority} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusPill status={job.status as JobStatus} />
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: job.retries > 0 ? '#D97706' : '#9CA3AF' }}>
                    {job.retries}/{job.maxRetries}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B7280' }}>
                    {formatDuration(job)}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                    {new Date(job.createdAt).toLocaleTimeString('en-GB')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {job.status === 'pending' && (
                        <TableBtn
                          onClick={() => handle(() => cancelJob(job.id), job.id)}
                          loading={actionLoading === job.id}
                          color="#DC2626"
                        >
                          Cancel
                        </TableBtn>
                      )}
                      {job.status === 'failed' && (
                        <TableBtn
                          onClick={() => handle(() => retryJob(job.id), job.id)}
                          loading={actionLoading === job.id}
                          color="#2563EB"
                        >
                          Retry
                        </TableBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const TableBtn: FC<{ onClick: () => void; loading: boolean; color: string; children: React.ReactNode }> = ({ onClick, loading, color, children }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: loading ? 'default' : 'pointer',
      border: `1px solid ${color}33`, background: `${color}0D`,
      color, fontFamily: 'inherit', fontWeight: 500, opacity: loading ? 0.5 : 1,
      transition: 'opacity 0.15s',
    }}
  >
    {loading ? '…' : children}
  </button>
)

const centered: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center',
}
