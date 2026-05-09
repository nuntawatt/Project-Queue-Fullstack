import type { FC } from 'react'
import type { JobPriority } from '@/types/job.types'

const COLORS: Record<JobPriority, string> = {
  critical: '#DC2626',
  high:     '#D97706',
  normal:   '#6B7280',
  low:      '#9CA3AF',
}

export const PriorityBadge: FC<{ priority: JobPriority }> = ({ priority }) => (
  <span style={{ fontSize: 12, color: COLORS[priority], fontWeight: priority === 'critical' ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
    <span style={{ fontSize: 8 }}>●</span>
    {priority}
  </span>
)
