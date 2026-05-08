import type { FC } from 'react'
import type { JobStatus } from '@queuely/shared'

const CONFIG: Record<JobStatus, { label: string; color: string; bg: string; dot?: boolean }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
  running:   { label: 'Running',   color: '#2563EB', bg: '#DBEAFE', dot: true },
  completed: { label: 'Completed', color: '#059669', bg: '#D1FAE5' },
  failed:    { label: 'Failed',    color: '#DC2626', bg: '#FEE2E2' },
  dead:      { label: 'Dead',      color: '#6B7280', bg: '#F3F4F6' },
}

export const StatusPill: FC<{ status: JobStatus }> = ({ status }) => {
  const c = CONFIG[status] ?? CONFIG.dead
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      color: c.color, background: c.bg,
    }}>
      {c.dot && (
        <span className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      )}
      {c.label}
    </span>
  )
}
