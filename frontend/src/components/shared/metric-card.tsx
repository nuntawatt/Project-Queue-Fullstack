'use client';

import { cn } from '@/lib/utils';
import { CountUp } from '@/components/motion/count-up';

interface MetricCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: 'default' | 'warning' | 'danger' | 'info';
  className?: string;
}

const accentStyles = {
  default: 'text-neutral-900',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
};

export function MetricCard({
  label,
  value,
  sub,
  accent = 'default',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200/60 bg-white px-4 py-3.5',
        'transition-shadow duration-200 hover:shadow-sm',
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold tracking-tight',
          accentStyles[accent],
        )}
      >
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
      {sub && (
        <p className="mt-1 font-mono text-xs text-neutral-400">{sub}</p>
      )}
    </div>
  );
}
