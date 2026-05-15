'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Job, JobStatus } from '@/types/job.types';
import { StatusPill } from '@/components/shared/status-pill';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useCancelJob, useRetryJob } from '../hooks/use-job-actions';
import { cn } from '@/lib/utils';

interface JobsTableProps {
  jobs: Job[];
  isLoading: boolean;
}

const TABLE_HEADERS = [
  'Job ID',
  'Type',
  'Priority',
  'Status',
  'Retries',
  'Duration',
  'Created',
  '',
] as const;

export function JobsTable({ jobs, isLoading }: JobsTableProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
          <p className="text-sm text-neutral-400">Loading jobs…</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs yet"
        description="Create a job to see it appear here in real time"
        className="h-full"
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/50">
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-widest text-neutral-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} now={now} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobRow({ job, now }: { job: Job; now: number }) {
  const cancelJob = useCancelJob();
  const retryJob = useRetryJob();
  const isBusy = cancelJob.isPending || retryJob.isPending;

  const duration = useMemo(() => {
    if (!job.startedAt) return '—';
    const end = job.completedAt ?? now;
    const ms = Math.max(0, end - job.startedAt);
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }, [job.startedAt, job.completedAt, now]);

  return (
    <tr className="group border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
      <td className="px-4 py-3 font-mono text-xs text-neutral-400">
        {job.id.slice(0, 8)}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-neutral-700">
        {job.type}
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={job.priority} />
      </td>
      <td className="px-4 py-3">
        <StatusPill status={job.status as JobStatus} />
      </td>
      <td
        className={cn(
          'px-4 py-3 font-mono text-xs',
          job.retries > 0 ? 'text-amber-600' : 'text-neutral-400',
        )}
      >
        {job.retries}/{job.maxRetries}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-neutral-500">
        {duration}
      </td>
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-neutral-400">
        {new Date(job.createdAt).toLocaleTimeString('en-GB')}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          {job.status === 'pending' && (
            <ActionButton
              onClick={() => cancelJob.mutate(job.id)}
              loading={cancelJob.isPending}
              variant="danger"
            >
              Cancel
            </ActionButton>
          )}
          {job.status === 'failed' && (
            <ActionButton
              onClick={() => retryJob.mutate(job.id)}
              loading={retryJob.isPending}
              variant="info"
            >
              Retry
            </ActionButton>
          )}
        </div>
      </td>
    </tr>
  );
}

function ActionButton({
  onClick,
  loading,
  variant,
  children,
}: {
  onClick: () => void;
  loading: boolean;
  variant: 'danger' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    danger:
      'border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
    info: 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
        'disabled:cursor-default disabled:opacity-50',
        styles[variant],
      )}
    >
      {loading ? '…' : children}
    </button>
  );
}
