import type { FC } from 'react'

interface SidebarProps {
  view: string
  onChange: (v: string) => void
  dlqCount: number
}

const NAV = [
  { id: 'jobs',    label: 'Jobs',    icon: '⬡' },
  { id: 'dlq',     label: 'DLQ',     icon: '⚠' },
  { id: 'metrics', label: 'Metrics', icon: '◈' },
]

export const Sidebar: FC<SidebarProps> = ({ view, onChange, dlqCount }) => (
  <aside
    style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    className="w-14 flex flex-col items-center py-5 gap-1 shrink-0"
  >
    {/* wordmark */}
    <div
      style={{ color: 'var(--amber)', fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', marginBottom: 24 }}
    >
      QUEUELY
    </div>

    {NAV.map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        title={item.label}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: 'none',
          background: view === item.id ? 'var(--elevated)' : 'transparent',
          color: view === item.id ? 'var(--amber)' : 'var(--muted)',
          fontSize: 16,
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.12s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.icon}
        {item.id === 'dlq' && dlqCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--red)',
          }} className="pulse" />
        )}
      </button>
    ))}
  </aside>
)
