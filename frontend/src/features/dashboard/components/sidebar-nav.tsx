'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDlq } from '@/features/dlq/hooks/use-dlq';

const navItems = [
  { href: '/dashboard', label: 'Jobs', exact: true },
  { href: '/dashboard/dlq', label: 'DLQ' },
  { href: '/dashboard/metrics', label: 'Metrics' },
] as const;

export function SidebarNav() {
  const pathname = usePathname();
  const { data: dlqJobs } = useDlq();
  const dlqCount = dlqJobs?.length ?? 0;

  return (
    <nav className="flex gap-0.5">
      {navItems.map(({ href, label, ...item }) => {
        const isActive = 'exact' in item && item.exact
          ? pathname === href
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm transition-all duration-150',
              isActive
                ? 'bg-neutral-100 font-medium text-neutral-900'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700',
            )}
          >
            {label}
            {label === 'DLQ' && dlqCount > 0 && (
              <span className="rounded-full bg-red-100 px-1.5 py-px font-mono text-[10px] font-semibold text-red-600">
                {dlqCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
