export type JobPriority = 'low' | 'normal' | 'high' | 'critical';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'dead';

export const PRIORITY_SCORE: Record<JobPriority, number> = {
  low: 10,
  normal: 20,
  high: 30,
  critical: 40,
};

export interface Job {
  id: string;
  type: string;
  priority: JobPriority;
  status: JobStatus;
  payload: Record<string, unknown>;
  maxRetries: number;
  retries: number;
  errors: string[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  lastError?: string;
}

export interface CreateJobInput {
  type: string;
  priority?: JobPriority;
  payload: Record<string, unknown>;
  maxRetries?: number;
}

export type JobEventType =
  | 'job.created'
  | 'job.started'
  | 'job.completed'
  | 'job.failed'
  | 'job.retrying'
  | 'job.dead'
  | 'circuit.open'
  | 'circuit.closed'
  | 'circuit.half_open';

export interface JobEvent {
  event: JobEventType;
  jobId: string;
  status?: JobStatus;
  workerId?: string;
  duration?: number;
  error?: string;
  timestamp: number;
}
