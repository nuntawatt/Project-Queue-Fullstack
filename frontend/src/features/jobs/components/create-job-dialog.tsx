'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createJobSchema,
  type CreateJobFormValues,
} from '../schemas/create-job.schema';
import { useCreateJob } from '../hooks/use-job-actions';
import { JOB_TYPES, DEFAULT_PAYLOADS, type JobType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CreateJobDialogProps {
  open: boolean;
  onClose: () => void;
}

const PRIORITIES = ['low', 'normal', 'high', 'critical'] as const;

const PRIORITY_STYLES: Record<string, string> = {
  low: 'text-neutral-400 border-neutral-200',
  normal: 'text-neutral-600 border-neutral-300',
  high: 'text-amber-600 border-amber-300',
  critical: 'text-red-600 border-red-300',
};

export function CreateJobDialog({ open, onClose }: CreateJobDialogProps) {
  const createJob = useCreateJob();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      type: 'send_email',
      priority: 'normal',
      payload: DEFAULT_PAYLOADS.send_email,
      maxRetries: 3,
    },
  });

  const selectedType = watch('type');
  const selectedPriority = watch('priority');
  const maxRetries = watch('maxRetries');

  const handleTypeChange = (type: string) => {
    setValue('type', type);
    setValue('payload', DEFAULT_PAYLOADS[type as JobType] ?? '{}');
  };

  const onSubmit = async (data: CreateJobFormValues) => {
    await createJob.mutateAsync({
      type: data.type,
      priority: data.priority,
      payload: JSON.parse(data.payload),
      maxRetries: data.maxRetries,
    });
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">
                Create new job
              </h2>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-xs text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Job type */}
              <div>
                <FieldLabel>Job type</FieldLabel>
                <div className="flex gap-1.5">
                  {JOB_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={cn(
                        'flex-1 rounded-lg border py-2 font-mono text-xs transition-all duration-150',
                        selectedType === t
                          ? 'border-neutral-900 bg-neutral-900 font-medium text-white'
                          : 'border-neutral-200 text-neutral-500 hover:border-neutral-300',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <FieldLabel>Priority</FieldLabel>
                <div className="flex gap-1.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue('priority', p)}
                      className={cn(
                        'flex-1 rounded-lg border py-1.5 text-xs transition-all duration-150',
                        selectedPriority === p
                          ? cn(
                              'font-semibold',
                              PRIORITY_STYLES[p],
                              'bg-current/5',
                            )
                          : 'border-neutral-200 text-neutral-400 hover:border-neutral-300',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payload */}
              <div>
                <FieldLabel>Payload</FieldLabel>
                <textarea
                  {...register('payload')}
                  rows={5}
                  className={cn(
                    'w-full resize-none rounded-lg border bg-neutral-50 px-3 py-2.5 font-mono text-xs leading-relaxed text-neutral-800 outline-none transition-colors',
                    'focus:border-neutral-400 focus:bg-white',
                    errors.payload
                      ? 'border-red-300'
                      : 'border-neutral-200',
                  )}
                />
                {errors.payload && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.payload.message}
                  </p>
                )}
              </div>

              {/* Max retries */}
              <div className="flex items-center justify-between">
                <FieldLabel className="mb-0">Max retries</FieldLabel>
                <div className="flex items-center gap-2">
                  <StepButton
                    onClick={() =>
                      setValue('maxRetries', Math.max(0, maxRetries - 1))
                    }
                  >
                    −
                  </StepButton>
                  <span className="min-w-[16px] text-center text-sm font-semibold">
                    {maxRetries}
                  </span>
                  <StepButton
                    onClick={() =>
                      setValue('maxRetries', Math.min(10, maxRetries + 1))
                    }
                  >
                    +
                  </StepButton>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createJob.isPending}
                  className={cn(
                    'flex-[2] rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-opacity',
                    'hover:bg-neutral-800',
                    createJob.isPending && 'opacity-60',
                  )}
                >
                  {createJob.isPending ? 'Creating…' : 'Create job'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FieldLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'mb-2 text-xs font-medium text-neutral-600',
        className,
      )}
    >
      {children}
    </p>
  );
}

function StepButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-base text-neutral-600 transition-colors hover:bg-neutral-100"
    >
      {children}
    </button>
  );
}
