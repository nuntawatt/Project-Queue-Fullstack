'use client';

import type { MetricsResponse } from '@/types/api.types';
import { MetricCard } from '@/components/shared/metric-card';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  running: 'bg-blue-500',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
  dead: 'bg-neutral-400',
};

const STATUS_TEXT: Record<string, string> = {
  pending: 'text-amber-600',
  running: 'text-blue-600',
  completed: 'text-emerald-600',
  failed: 'text-red-600',
  dead: 'text-neutral-500',
};

const CIRCUIT_STYLE: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  closed: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Healthy' },
  open: { color: 'text-red-600', bg: 'bg-red-50', label: 'Open' },
  half_open: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Testing' },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-500',
  high: 'text-amber-500',
  normal: 'text-neutral-500',
  low: 'text-neutral-400',
};

interface MetricsGridProps {
  metrics: MetricsResponse;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const { jobs, queue, dlq, workers, circuits } = metrics;

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Top metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total jobs" value={jobs.total} />
        <MetricCard
          label="Queue depth"
          value={queue.total}
          accent={queue.total > 0 ? 'warning' : 'default'}
          sub={`${queue.depth.critical ?? 0} critical`}
        />
        <MetricCard
          label="Dead letter"
          value={dlq.count}
          accent={dlq.count > 0 ? 'danger' : 'default'}
          sub={dlq.count > 0 ? 'needs attention' : 'all clear'}
        />
        <MetricCard
          label="Avg duration"
          value={`${(jobs.avgDurationMs / 1000).toFixed(2)}s`}
        />
        <MetricCard
          label="Workers busy"
          value={`${workers.busy}/${workers.total}`}
          accent="info"
          sub={`${workers.idle} idle`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Job status breakdown */}
        <Section title="Job breakdown">
          {Object.keys(STATUS_COLORS).map((status) => {
            const count = jobs.byStatus[status] ?? 0;
            const pct = jobs.total > 0 ? (count / jobs.total) * 100 : 0;
            return (
              <div key={status} className="mb-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] text-neutral-700">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-sm',
                        STATUS_COLORS[status],
                      )}
                    />
                    {status}
                  </span>
                  <span className="font-mono text-xs text-neutral-500">
                    {count}{' '}
                    <span className="text-neutral-400">
                      ({Math.round(pct)}%)
                    </span>
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      STATUS_COLORS[status],
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Section>

        {/* Queue depth */}
        <Section title="Queue depth by priority">
          {(['critical', 'high', 'normal', 'low'] as const).map((p) => {
            const count = queue.depth[p] ?? 0;
            return (
              <div
                key={p}
                className="flex items-center justify-between border-b border-neutral-50 py-2.5"
              >
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-[13px]',
                    PRIORITY_COLORS[p],
                  )}
                >
                  <span className="text-[8px]">●</span> {p}
                </span>
                <span
                  className={cn(
                    'font-mono text-[13px] font-medium',
                    count > 0 ? 'text-neutral-900' : 'text-neutral-400',
                  )}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </Section>

        {/* Circuit breakers */}
        <Section title="Circuit breakers">
          {Object.keys(circuits).length === 0 ? (
            <p className="text-[13px] text-neutral-400">
              No circuits active yet — they appear when workers process jobs
            </p>
          ) : (
            Object.entries(circuits).map(([service, info]) => {
              const s = CIRCUIT_STYLE[info.state] ?? CIRCUIT_STYLE.closed;
              return (
                <div
                  key={service}
                  className="mb-2 flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5"
                >
                  <span className="font-mono text-xs text-neutral-700">
                    {service}
                  </span>
                  <div className="flex items-center gap-2.5">
                    {info.failures > 0 && (
                      <span className="font-mono text-xs text-red-600">
                        {info.failures} fail{info.failures !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-xs font-medium',
                        s.color,
                        s.bg,
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </Section>

        {/* Worker pool */}
        <Section title="Worker pool">
          <div className="mb-4 flex gap-2">
            {[
              {
                label: 'Total',
                value: workers.total,
                color: 'text-neutral-700',
              },
              {
                label: 'Busy',
                value: workers.busy,
                color: 'text-blue-600',
              },
              {
                label: 'Idle',
                value: workers.idle,
                color: 'text-emerald-600',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2.5 text-center"
              >
                <div className={cn('text-xl font-semibold', s.color)}>
                  {s.value}
                </div>
                <div className="mt-0.5 text-[11px] text-neutral-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {workers.workers.map((w) => (
              <div
                key={w.id}
                title={`${w.id} — ${w.processedCount} processed`}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[10px]',
                  w.busy
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-400',
                )}
              >
                {w.id.split('-')[1]}
                {w.busy && (
                  <span className="absolute right-0.5 top-0.5 h-1 w-1 animate-pulse rounded-full bg-blue-500" />
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200/60 bg-white p-4">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </h3>
      {children}
    </div>
  );
}
