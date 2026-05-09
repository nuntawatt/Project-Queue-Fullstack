import { type FC, useState } from 'react'
import type { Job } from '@/types/job.types'
import { useStore } from '../store/useStore'
import { PriorityBadge } from './PriorityBadge'

interface Props { jobs: Job[] }

export const DLQView: FC<Props> = ({ jobs }) => {
  const { replayDlq, removeDlq } = useStore()
  const [busy, setBusy] = useState('')

  const handle = async (fn: () => Promise<void>, id: string) => {
    setBusy(id)
    try { await fn() } finally { setBusy('') }
  }

  if (jobs.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: '#9CA3AF' }}>
        <span style={{ fontSize: 32 }}>✓</span>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>DLQ is empty</p>
        <p style={{ fontSize: 13 }}>Failed jobs that exhaust retries will appear here</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* warning banner */}
      <div style={{ padding: '12px 20px', background: '#FEF3C7', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>⚠️</span>
        <p style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} failed permanently — replay them or delete to clear
        </p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
            {['Job ID', 'Type', 'Priority', 'Last error', 'Retries', 'Actions'].map((h) => (
              <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              style={{ borderBottom: '1px solid #F3F4F6' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9CA3AF' }}>{job.id.slice(0, 8)}</td>
              <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151' }}>{job.type}</td>
              <td style={{ padding: '12px 16px' }}><PriorityBadge priority={job.priority} /></td>
              <td style={{ padding: '12px 16px', fontSize: 12, color: '#DC2626', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {job.lastError ?? '—'}
              </td>
              <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#DC2626' }}>
                {job.retries}/{job.maxRetries}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <DLQBtn onClick={() => handle(() => replayDlq(job.id), `r-${job.id}`)} loading={busy === `r-${job.id}`} color="#2563EB">
                    ↩ Replay
                  </DLQBtn>
                  <DLQBtn onClick={() => handle(() => removeDlq(job.id), `d-${job.id}`)} loading={busy === `d-${job.id}`} color="#DC2626">
                    Delete
                  </DLQBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const DLQBtn: FC<{ onClick: () => void; loading: boolean; color: string; children: React.ReactNode }> = ({ onClick, loading, color, children }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      padding: '5px 11px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      border: `1px solid ${color}33`, background: `${color}0D`, color,
      cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
    }}
  >
    {loading ? '…' : children}
  </button>
)
