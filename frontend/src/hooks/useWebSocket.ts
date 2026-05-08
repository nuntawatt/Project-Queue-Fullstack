import { useEffect } from 'react'
import type { JobEvent } from '@queuely/shared'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000'

export function useWebSocket(onEvent: (e: JobEvent) => void, onStatus?: (connected: boolean) => void) {
  useEffect(() => {
    let active = true
    let ws: WebSocket | null = null
    let timer: ReturnType<typeof setTimeout>

    const connect = () => {
      ws = new WebSocket(`${WS_URL}/ws`)

      ws.onopen    = () => onStatus?.(true)
      ws.onclose   = () => {
        onStatus?.(false)
        if (active) timer = setTimeout(connect, 3000)
      }
      ws.onerror   = () => onStatus?.(false)
      ws.onmessage = ({ data }) => {
        try {
          onEvent(JSON.parse(data))
        } catch {
          console.error('Failed to parse WS msg')
        }
      }
    }

    connect()

    return () => {
      active = false
      clearTimeout(timer)
      ws?.close()
    }
  }, [onEvent, onStatus])
}
