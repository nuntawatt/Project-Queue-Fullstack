import { type FC, useState } from 'react'
import { useStore } from '../store/useStore'

interface Props { onClose: () => void }

const TYPES = ['send_email', 'process_image']
const PRIORITIES = ['low', 'normal', 'high', 'critical'] as const
const PRIORITY_COLORS: Record<string, string> = { low: '#9CA3AF', normal: '#6B7280', high: '#D97706', critical: '#DC2626' }

const PAYLOADS: Record<string, string> = {
  send_email:    JSON.stringify({ to: 'user@example.com', subject: 'Hello' }, null, 2),
  process_image: JSON.stringify({ url: 'https://example.com/image.jpg', operation: 'resize' }, null, 2),
}

export const NewJobModal: FC<Props> = ({ onClose }) => {
  const { createJob } = useStore()
  const [type, setType] = useState('send_email')
  const [priority, setPriority] = useState<string>('normal')
  const [payload, setPayload] = useState(PAYLOADS.send_email)
  const [maxRetries, setMaxRetries] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTypeChange = (t: string) => {
    setType(t)
    setPayload(PAYLOADS[t] ?? '{}')
  }

  const submit = async () => {
    setError('')
    let parsed: object
    try { parsed = JSON.parse(payload) }
    catch { setError('Payload is not valid JSON'); return }

    try {
      setLoading(true)
      await createJob({ type, priority, payload: parsed })
      onClose()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err?.response?.data?.message ?? 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(2px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-up"
        style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Create new job</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Type */}
        <Label>Job type</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: `1.5px solid ${type === t ? '#111827' : '#E5E7EB'}`,
                background: type === t ? '#111827' : '#fff',
                color: type === t ? '#fff' : '#6B7280',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Priority */}
        <Label>Priority</Label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 7,
                border: `1.5px solid ${priority === p ? PRIORITY_COLORS[p] : '#E5E7EB'}`,
                background: priority === p ? `${PRIORITY_COLORS[p]}12` : '#fff',
                color: priority === p ? PRIORITY_COLORS[p] : '#9CA3AF',
                fontSize: 12, fontWeight: priority === p ? 600 : 400, cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Payload */}
        <Label>Payload</Label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={5}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: `1px solid ${error ? '#FCA5A5' : '#E5E7EB'}`,
            fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
            color: '#111827', background: '#F9FAFB', resize: 'none',
            outline: 'none', lineHeight: 1.6, marginBottom: error ? 6 : 16,
          }}
        />
        {error && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 14 }}>{error}</p>}

        {/* Max retries */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Label style={{ marginBottom: 0 }}>Max retries</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setMaxRetries((v) => Math.max(0, v - 1))} style={stepBtn}>−</button>
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{maxRetries}</span>
            <button onClick={() => setMaxRetries((v) => Math.min(10, v + 1))} style={stepBtn}>+</button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ ...actionBtn, flex: 1 }}>Cancel</button>
          <button
            onClick={submit}
            disabled={loading}
            style={{ ...actionBtn, flex: 2, background: '#111827', color: '#fff', borderColor: '#111827', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creating…' : 'Create job'}
          </button>
        </div>
      </div>
    </div>
  )
}

const Label: FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8, ...style }}>{children}</p>
)

const closeBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB',
  background: 'transparent', fontSize: 12, color: '#9CA3AF', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const stepBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB',
  background: '#F9FAFB', fontSize: 16, color: '#374151', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const actionBtn: React.CSSProperties = {
  padding: '9px 0', borderRadius: 8, border: '1px solid #E5E7EB',
  background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
}
