'use client';

import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';

/**
 * ดึงรายการ Job ทั้งหมดจาก API (รองรับการกรองสถานะ)
 * มีระบบดึงข้อมูลใหม่ทุกๆ 30 วินาทีเป็น Fallback (เผื่อ WebSocket หลุด)
 */
export function useJobs(statusFilter?: string) {
  return useQuery({
    queryKey: ['jobs', statusFilter ?? 'all'],
    queryFn: () => jobsService.list(statusFilter),
    refetchInterval: 30_000,
  });
}
