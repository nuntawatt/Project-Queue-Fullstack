'use client';

import { cn } from '@/lib/utils';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
  { key: 'dead', label: 'Dead' },
] as const;

interface JobFiltersProps {
  active: string;
  onChange: (filter: string) => void;
  counts?: Record<string, number>;
  total?: number;
}

export function JobFilters({
  active,
  onChange,
  counts,
  total,
}: JobFiltersProps) {
  return (
    <div className="flex items-center border-b border-neutral-100 bg-white px-5 py-2.5">
      <div className="flex gap-1">
        {FILTERS.map(({ key, label }) => {
          const count = key ? counts?.[key] ?? 0 : 0;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] transition-all duration-150',
                active === key
                  ? 'bg-neutral-100 font-medium text-neutral-900'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700',
              )}
            >
              {label}
              {key && count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px font-mono text-[10px]',
                    active === key
                      ? 'bg-neutral-200 text-neutral-600'
                      : 'bg-neutral-100 text-neutral-400',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <span className="ml-auto font-mono text-xs text-neutral-400">
        {total ?? 0} jobs
      </span>
    </div>
  );
}
