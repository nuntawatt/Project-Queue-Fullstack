import { useEffect, useRef} from 'react'
import type { JobEvent } from '@queuely/shared'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000'

export function useWebSocket(onEvent: (event: JobEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let active = true
    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/ws`)
      wsRef.current = ws

      ws.onopen    = () => console.info('[WS] connected')
      ws.onclose   = () => {
        if (!active) return
        console.warn('[WS] disconnected — reconnecting in 3s')
        reconnectTimer.current = setTimeout(connect, 3000)
      }
      ws.onerror   = (e) => console.error('[WS] error', e)
      ws.onmessage = (msg) => {
        try { onEvent(JSON.parse(msg.data) as JobEvent) } catch (err) { console.error('Failed to parse WS message', err) }
      }
    }
    connect()

    return () => {
      active = false
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [onEvent])
}
