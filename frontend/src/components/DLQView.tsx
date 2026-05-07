import type { FC } from 'react'
import type { Job } from '@queuely/shared'
import { useStore } from '../store/useStore'

interface Props { jobs: Job[] }

export const DLQView: FC<Props> = ({ jobs }) => {
  const { replayJob, removeFromDlq } = useStore()

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {jobs.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
          <span style={{ fontSize: 32 }}>✓</span>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Dead Letter Queue is empty</p>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {jobs.length > 0 && (
          <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['ID', 'Type', 'Priority', 'Last Error', 'Retries', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--elevated)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>{job.id.slice(0, 8)}</td>
              <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{job.type}</td>
              <td style={{ padding: '12px 16px', fontSize: 12, color: '#F59E0B' }}>{job.priority}</td>
              <td style={{ padding: '12px 16px', fontSize: 12, color: '#EF4444', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.lastError ?? '—'}</td>
              <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#EF4444' }}>{job.retries}/{job.maxRetries}</td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn onClick={() => replayJob(job.id)} color="var(--blue)">↩ Replay</Btn>
                  <Btn onClick={() => removeFromDlq(job.id)} color="var(--red)">✕ Delete</Btn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Btn: FC<{ onClick: () => void; color: string; children: React.ReactNode }> = ({ onClick, color, children }) => (
  <button onClick={onClick} style={{
    padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
    fontFamily: 'IBM Plex Mono, monospace',
    border: `1px solid ${color}22`, background: `${color}11`, color,
  }}>
    {children}
  </button>
)
