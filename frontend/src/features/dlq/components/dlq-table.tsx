'use client';

import type { Job } from '@/types/job.types';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useReplayDlq, useRemoveDlq } from '../hooks/use-dlq-actions';
import { cn } from '@/lib/utils';

interface DlqTableProps {
  jobs: Job[];
  isLoading: boolean;
}

export function DlqTable({ jobs, isLoading }: DlqTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
          <p className="text-sm text-neutral-400">Loading DLQ…</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon="✓"
        title="DLQ is empty"
        description="Failed jobs that exhaust retries will appear here"
        className="h-full"
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Warning banner */}
      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3">
        <span className="text-sm">⚠️</span>
        <p className="text-[13px] font-medium text-amber-800">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} failed permanently
          — replay them or delete to clear
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50">
              {['Job ID', 'Type', 'Priority', 'Last error', 'Retries', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-widest text-neutral-400"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <DlqRow key={job.id} job={job} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DlqRow({ job }: { job: Job }) {
  // Hook สำหรับสั่งนำ Job กลับไปรันใหม่ หรือลบทิ้ง
  const replayDlq = useReplayDlq();
  const removeDlq = useRemoveDlq();

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
      <td className="max-w-[260px] truncate px-4 py-3 text-xs text-red-600">
        {job.lastError ?? '—'}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-red-600">
        {job.retries}/{job.maxRetries}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => replayDlq.mutate(job.id)}
            disabled={replayDlq.isPending}
            className={cn(
              'rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors',
              'hover:bg-blue-100 disabled:opacity-50',
            )}
          >
            {replayDlq.isPending ? '…' : '↩ Replay'}
          </button>
          <button
            onClick={() => removeDlq.mutate(job.id)}
            disabled={removeDlq.isPending}
            className={cn(
              'rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors',
              'hover:bg-red-100 disabled:opacity-50',
            )}
          >
            {removeDlq.isPending ? '…' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
}
