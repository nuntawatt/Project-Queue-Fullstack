'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';
import { CreateJobDialog } from '@/features/jobs/components/create-job-dialog';

/**
 * Client Wrapper ควบคุมโครงสร้างหน้า Dashboard และปุ่ม + Dialog "สร้าง Job ใหม่"
 * แยกส่วนนี้ออกมาเพื่อให้ตัว layout หลักยังเป็น Server Component ได้
 */
export function DashboardShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const pathname = usePathname();
  const isJobsPage = pathname === '/dashboard';

  return (
    <>
      <DashboardShell
        actions={
          isJobsPage ? (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800"
            >
              + New job
            </button>
          ) : undefined
        }
      >
        {children}
      </DashboardShell>

      <CreateJobDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </>
  );
}
