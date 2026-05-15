'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dlqService } from '@/services/dlq.service';
import { toast } from 'sonner';
import type { Job } from '@/types/job.types';

export function useReplayDlq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dlqService.replay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Job replayed from DLQ');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRemoveDlq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dlqService.remove(id),
    onMutate: async (id) => {
      // Optimistic update — ทำการซ่อนข้อมูลจาก UI ทันทีโดยไม่ต้องรอให้ API ทำงานเสร็จ
      await queryClient.cancelQueries({ queryKey: ['dlq'] });
      const previous = queryClient.getQueryData<Job[]>(['dlq']);
      queryClient.setQueryData<Job[]>(['dlq'], (old) =>
        old?.filter((j) => j.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      // หากเกิด Error ให้คืนค่าข้อมูลเดิมกลับมา
      queryClient.setQueryData(['dlq'], context?.previous);
      toast.error('Failed to remove job');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}
