import { useState, type FC } from 'react'
import { useStore } from '../store/useStore'

const JOB_TYPES = ['send_email', 'process_image']
const PRIORITIES = ['low', 'normal', 'high', 'critical']

interface TopBarProps {
  view: string
  wsConnected: boolean
}

export const TopBar: FC<TopBarProps> = ({ view, wsConnected }) => {
  const { createJob, fetchJobs, fetchDlq, fetchMetrics } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'send_email', priority: 'normal', payload: '{"to":"user@example.com"}' })
  const [submitting, setSubmitting] = useState(false)

  const refresh = () => {
    fetchJobs()
    fetchDlq()
    fetchMetrics()
  }

  const submit = async () => {
    try {
      setSubmitting(true)
      const payload = JSON.parse(form.payload)
      await createJob({ type: form.type, priority: form.priority, payload })
      setOpen(false)
    } catch {
      alert('Invalid payload JSON')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header style={{
        height: 48,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        flexShrink: 0,
      }}>
        {/* title */}
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', color: 'var(--text)', flex: 1 }}>
          {view === 'jobs' ? 'Job Queue' : view === 'dlq' ? 'Dead Letter Queue' : 'Metrics'}
        </span>

        {/* ws status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: wsConnected ? 'var(--green)' : 'var(--muted)',
            display: 'inline-block',
          }} className={wsConnected ? 'pulse' : ''} />
          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
            {wsConnected ? 'live' : 'offline'}
          </span>
        </div>

        {/* actions */}
        <button onClick={refresh} style={{ ...btnStyle, color: 'var(--muted)' }} title="Refresh">
          ↻
        </button>

        {view === 'jobs' && (
          <button onClick={() => setOpen(true)} style={{ ...btnStyle, background: 'var(--amber)', color: '#000', fontWeight: 600 }}>
            + New Job
          </button>
        )}
      </header>

      {/* modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: 'var(--elevated)', border: '1px solid var(--border-hi)',
            borderRadius: 12, padding: 24, width: 400,
          }} onClick={(e) => e.stopPropagation()} className="fade-in">
            <h2 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>New Job</h2>

            <Field label="Type">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={selectStyle}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Priority">
              <div style={{ display: 'flex', gap: 6 }}>
                {PRIORITIES.map((p) => (
                  <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{
                    ...chipStyle,
                    background: form.priority === p ? 'var(--amber)' : 'var(--surface)',
                    color: form.priority === p ? '#000' : 'var(--muted)',
                    fontWeight: form.priority === p ? 600 : 400,
                  }}>
                    {p}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Payload (JSON)">
              <textarea
                value={form.payload}
                onChange={(e) => setForm({ ...form, payload: e.target.value })}
                rows={4}
                style={{ ...selectStyle, resize: 'none', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}
              />
            </Field>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} style={{ ...btnStyle, flex: 1, justifyContent: 'center', background: 'var(--surface)' }}>
                Cancel
              </button>
              <button onClick={submit} disabled={submitting} style={{ ...btnStyle, flex: 1, justifyContent: 'center', background: 'var(--amber)', color: '#000', fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Creating…' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const Field: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
    {children}
  </div>
)

const btnStyle: React.CSSProperties = {
  height: 30,
  padding: '0 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text)',
  fontSize: 12,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
}

const chipStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 5,
  border: '1px solid var(--border)',
  fontSize: 12,
  cursor: 'pointer',
}
