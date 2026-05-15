'use client';

import { useMetrics } from '@/features/metrics/hooks/use-metrics';
import { MetricCard } from '@/components/shared/metric-card';

export function MetricStrip() {
  // ดึงข้อมูลภาพรวม (Metrics) จาก API อัตโนมัติ
  const { data: metrics } = useMetrics();

  if (!metrics) return null;

  return (
    <div className="border-b border-neutral-100 bg-white px-6 py-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total jobs" value={metrics.jobs.total} />
        <MetricCard
          label="Queue depth"
          value={metrics.queue.total}
          accent={metrics.queue.total > 0 ? 'warning' : 'default'}
          sub={`${metrics.queue.depth?.critical ?? 0} critical`}
        />
        <MetricCard
          label="Dead letter"
          value={metrics.dlq.count}
          accent={metrics.dlq.count > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          label="Workers"
          value={`${metrics.workers.busy}/${metrics.workers.total}`}
          accent="info"
          sub="busy"
        />
        <MetricCard
          label="Avg duration"
          value={`${(metrics.jobs.avgDurationMs / 1000).toFixed(2)}s`}
        />
      </div>
    </div>
  );
}
