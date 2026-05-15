import type { Metadata } from 'next';
import { DashboardShellWrapper } from './shell-wrapper';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * Dashboard layout — server component wrapper.
 * The actual shell (header, nav, WS) is a client component
 * rendered inside DashboardShellWrapper.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellWrapper>{children}</DashboardShellWrapper>;
}
