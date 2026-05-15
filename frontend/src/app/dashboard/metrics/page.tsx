'use client';

import { useMetrics } from '@/features/metrics/hooks/use-metrics';
import { MetricsGrid } from '@/features/metrics/components/metrics-grid';

export default function MetricsPage() {
  const { data: metrics, isLoading } = useMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
          <p className="text-sm text-neutral-400">Loading metrics…</p>
        </div>
      </div>
    );
  }

  return <MetricsGrid metrics={metrics} />;
}
