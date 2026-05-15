import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/job.types';

const statusConfig: Record<
  JobStatus,
  { label: string; dotClass: string; pillClass: string; animate?: boolean }
> = {
  pending: {
    label: 'Pending',
    dotClass: 'bg-amber-500',
    pillClass: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
  },
  running: {
    label: 'Running',
    dotClass: 'bg-blue-500',
    pillClass: 'bg-blue-500/10 text-blue-600 ring-blue-500/20',
    animate: true,
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-emerald-500',
    pillClass: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
  },
  failed: {
    label: 'Failed',
    dotClass: 'bg-red-500',
    pillClass: 'bg-red-500/10 text-red-600 ring-red-500/20',
  },
  dead: {
    label: 'Dead',
    dotClass: 'bg-neutral-400',
    pillClass: 'bg-neutral-400/10 text-neutral-500 ring-neutral-400/20',
  },
};

interface StatusPillProps {
  status: JobStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status] ?? statusConfig.dead;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.pillClass,
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          config.dotClass,
          config.animate && 'animate-pulse',
        )}
      />
      {config.label}
    </span>
  );
}
