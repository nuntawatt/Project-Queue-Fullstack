'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConnectionStore } from '@/store/connection-store';
import { APP_CONFIG } from '@/lib/constants';
import type { JobEvent } from '@/types/job.types';

/**
 * WebSocket Hook ส่วนกลาง — เชื่อมต่อครั้งเดียวที่ระดับ Dashboard
 * เมื่อมี event เข้ามา จะทำการล้างแคช (invalidate) ของ TanStack Query ที่เกี่ยวข้อง
 * เพื่อให้ UI ดึงข้อมูลใหม่อัตโนมัติโดยไม่ต้องจัดการ state เอง
 */
export function useWebSocket() {
  const queryClient = useQueryClient();
  const setConnected = useConnectionStore((s) => s.setWsConnected);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeRef = useRef(true);

  const handleEvent = useCallback(
    (event: JobEvent) => {
      // ล้างแคชที่เกี่ยวข้องตามประเภทของ event ที่ได้รับ
      queryClient.invalidateQueries({ queryKey: ['metrics'] });

      if (event.event.startsWith('job.')) {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
      }
      if (event.event === 'job.dead') {
        queryClient.invalidateQueries({ queryKey: ['dlq'] });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    activeRef.current = true;

    const connect = () => {
      if (!activeRef.current) return;

      const ws = new WebSocket(`${APP_CONFIG.api.wsUrl}/ws`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (activeRef.current) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };
      ws.onerror = () => setConnected(false);
      ws.onmessage = ({ data }) => {
        try {
          handleEvent(JSON.parse(data) as JobEvent);
        } catch {
          console.error('[ws] Failed to parse message');
        }
      };
    };

    connect();

    return () => {
      activeRef.current = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [handleEvent, setConnected]);
}
