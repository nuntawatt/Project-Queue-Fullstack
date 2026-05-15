'use client';

import { useWebSocket } from '@/hooks/use-websocket';
import { SidebarNav } from './sidebar-nav';
import { WsIndicator } from './ws-indicator';
import { MetricStrip } from './metric-strip';

interface DashboardShellProps {
  children: React.ReactNode;
  /** Optional right-side header actions */
  actions?: React.ReactNode;
}

/**
 * โครงสร้างหลักของ Dashboard — จัดการแถบด้านบน (Top bar), ระบบนำทาง (Nav),
 * แถบแสดงสถานะข้อมูล (Metric strip), และการเชื่อมต่อ WebSocket
 */
export function DashboardShell({ children, actions }: DashboardShellProps) {
  // Establish WebSocket connection at dashboard level
  useWebSocket();

  return (
    <div className="flex h-screen flex-col bg-neutral-50 font-sans">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center border-b border-neutral-200 bg-white px-6">
        {/* Logo */}
        <div className="mr-8 flex items-center gap-2">
          <div className="h-2 w-2 rounded-sm bg-emerald-500" />
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
            Queuely
          </span>
        </div>

        {/* Navigation */}
        <SidebarNav />

        <div className="flex-1" />

        {/* Status + Actions */}
        <div className="flex items-center gap-3">
          <WsIndicator />
          {actions}
        </div>
      </header>

      {/* Metric strip */}
      <MetricStrip />

      {/* Main content */}
      <main className="flex-1 overflow-hidden bg-white">{children}</main>
    </div>
  );
}
