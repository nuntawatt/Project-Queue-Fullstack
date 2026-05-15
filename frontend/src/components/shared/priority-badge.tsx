import { cn } from '@/lib/utils';
import type { JobPriority } from '@/types/job.types';

const priorityConfig: Record<JobPriority, { color: string }> = {
  critical: { color: 'text-red-500' },
  high: { color: 'text-amber-500' },
  normal: { color: 'text-neutral-500' },
  low: { color: 'text-neutral-400' },
};

interface PriorityBadgeProps {
  priority: JobPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        config.color,
        priority === 'critical' && 'font-semibold',
        className,
      )}
    >
      <span className="text-[8px]">●</span>
      {priority}
    </span>
  );
}
