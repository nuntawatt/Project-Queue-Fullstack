import type { Metadata } from 'next';
import { DashboardShellWrapper } from './shell-wrapper';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * Layout สำหรับหน้า Dashboard (Server Component)
 * โครงสร้างหลัก (header, nav, websocket) จะถูกครอบด้วย Client Component
 * ผ่าน DashboardShellWrapper เพื่อให้สามารถจัดการ state ฝั่ง client ได้
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellWrapper>{children}</DashboardShellWrapper>;
}
