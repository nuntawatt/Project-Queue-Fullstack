'use client';

import { useState, useMemo } from 'react';
import { useJobs } from '@/features/jobs/hooks/use-jobs';
import { JobsTable } from '@/features/jobs/components/jobs-table';
import { JobFilters } from '@/features/jobs/components/job-filters';

export default function DashboardJobsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: jobs, isLoading } = useJobs(statusFilter || undefined);

  const statusCounts = useMemo(() => {
    if (!jobs) return {};
    const counts: Record<string, number> = {};
    for (const job of jobs) {
      counts[job.status] = (counts[job.status] ?? 0) + 1;
    }
    return counts;
  }, [jobs]);

  return (
    <div className="flex h-full flex-col">
      <JobFilters
        active={statusFilter}
        onChange={setStatusFilter}
        counts={statusCounts}
        total={jobs?.length}
      />
      <div className="flex-1 overflow-hidden">
        <JobsTable jobs={jobs ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
