import { useEffect, useRef, useCallback } from 'react'
import type { JobEvent } from '@queuely/shared'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000'

export function useWebSocket(onEvent: (event: JobEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_URL}/ws`)
    wsRef.current = ws

    ws.onopen    = () => console.info('[WS] connected')
    ws.onclose   = () => {
      console.warn('[WS] disconnected — reconnecting in 3s')
      reconnectTimer.current = setTimeout(connect, 3000)
    }
    ws.onerror   = (e) => console.error('[WS] error', e)
    ws.onmessage = (msg) => {
      try { onEvent(JSON.parse(msg.data) as JobEvent) } catch {}
    }
  }, [onEvent])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])
}
