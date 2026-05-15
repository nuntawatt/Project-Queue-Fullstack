'use client';

import { useDlq } from '@/features/dlq/hooks/use-dlq';
import { DlqTable } from '@/features/dlq/components/dlq-table';

export default function DlqPage() {
  const { data: dlqJobs, isLoading } = useDlq();

  return <DlqTable jobs={dlqJobs ?? []} isLoading={isLoading} />;
}
