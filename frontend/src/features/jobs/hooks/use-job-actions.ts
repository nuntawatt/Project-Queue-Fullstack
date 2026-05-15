'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { toast } from 'sonner';
import type { CreateJobInput } from '@/types/job.types';

/**
 * Hook สำหรับสร้าง Job ใหม่
 * เมื่อสร้างเสร็จจะล้างแคชเพื่อให้ตารางแสดงข้อมูลล่าสุดทันที
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobInput) => jobsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Job created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook สำหรับยกเลิก Job ที่กำลังรอทำงาน
 */
export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Job cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook สำหรับสั่งรัน Job ที่ Failed ใหม่อีกครั้ง
 */
export function useRetryJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsService.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Job retried');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
