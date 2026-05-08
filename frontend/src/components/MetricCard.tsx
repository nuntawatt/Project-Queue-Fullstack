import type { FC, ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  sub?: string
  accent?: string
}

export const MetricCard: FC<Props> = ({ label, value, sub, accent }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    padding: '14px 16px',
  }}>
    <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </p>
    <p style={{ fontSize: 26, fontWeight: 600, color: accent ?? '#111827', letterSpacing: '-0.5px', lineHeight: 1 }}>
      {value}
    </p>
    {sub && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 5, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</p>}
  </div>
)
