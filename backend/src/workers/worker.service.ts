import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueEngine } from '../core/queue.engine';
import { CircuitBreakerEngine } from '../core/circuit-breaker.engine';
import { EventBusService } from '../gateways/event-bus.service';
import { DlqService } from '../dlq/dlq.service';
import { Job } from '../common/types/job.types';
import { emailHandler } from './handlers/email.handler';
import { imageHandler } from './handlers/image.handler';

const HANDLERS: Record<
  string,
  (payload: Record<string, unknown>) => Promise<void>
> = {
  send_email: emailHandler,
  process_image: imageHandler,
};

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobHistory } from '../jobs/entities/job-history.entity';

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);
  private readonly breaker: CircuitBreakerEngine;

  constructor(
    private readonly queue: QueueEngine,
    private readonly eventBus: EventBusService,
    private readonly dlq: DlqService,
    config: ConfigService,
    @InjectRepository(JobHistory)
    private readonly jobHistoryRepo: Repository<JobHistory>,
  ) {
    this.breaker = new CircuitBreakerEngine(
      config.get<number>('circuitBreaker.failureThreshold')!,
      config.get<number>('circuitBreaker.successThreshold')!,
      config.get<number>('circuitBreaker.timeoutMs')!,
    );
  }

  getCircuitStatus() {
    return this.breaker.getAll();
  }

  async process(job: Job, workerId: string): Promise<void> {
    if (!this.breaker.canExecute(job.type)) {
      job.status = 'pending';
      await this.queue.requeue(job);
      return;
    }

    job.status = 'running';
    job.startedAt = Date.now();
    await this.queue.save(job);
    await this.eventBus.publish({
      event: 'job.started',
      jobId: job.id,
      workerId,
      status: 'running',
      timestamp: Date.now(),
    });

    const result = await this.runWithBackoff(job);

    if (result.success) {
      job.status = 'completed';
      job.completedAt = Date.now();
      this.breaker.onSuccess(job.type);
      await this.queue.save(job);
      await this.eventBus.publish({
        event: 'job.completed',
        jobId: job.id,
        workerId,
        duration: job.completedAt - job.startedAt,
        status: 'completed',
        timestamp: Date.now(),
      });
    } else {
      this.breaker.onFailure(job.type);
      job.lastError = result.error;

      if (job.retries >= job.maxRetries) {
        job.status = 'dead';
        await this.queue.save(job);
        await this.dlq.add(job);
        await this.eventBus.publish({
          event: 'job.dead',
          jobId: job.id,
          error: result.error,
          status: 'dead',
          timestamp: Date.now(),
        });
      } else {
        job.status = 'failed';
        await this.queue.save(job);
        await this.eventBus.publish({
          event: 'job.failed',
          jobId: job.id,
          error: result.error,
          status: 'failed',
          timestamp: Date.now(),
        });
      }
    }

    // Save to PostgreSQL history after completion or death
    if (job.status === 'completed' || job.status === 'dead') {
      this.saveJobHistory(job).catch((err: unknown) =>
        this.logger.error(
          `Failed to save job history: ${err instanceof Error ? err.message : String(err)}`,
        ),
      );
    }
  }

  private async saveJobHistory(job: Job) {
    try {
      await this.jobHistoryRepo.save({
        id: job.id,
        type: job.type,
        priority: job.priority,
        status: job.status,
        payload: job.payload,
        error: job.lastError ?? null,
        startedAt: job.startedAt ? new Date(job.startedAt) : null,
        completedAt: job.completedAt ? new Date(job.completedAt) : null,
      });
    } catch {
      // Ignored if table doesn't exist yet
    }
  }

  private async runWithBackoff(
    job: Job,
  ): Promise<{ success: boolean; error?: string }> {
    const handler = HANDLERS[job.type];
    if (!handler)
      return { success: false, error: `No handler for type: "${job.type}"` };

    for (let attempt = 0; attempt <= job.maxRetries; attempt++) {
      try {
        await handler(job.payload);
        return { success: true };
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        job.retries = attempt + 1;
        job.errors.push(`Attempt ${attempt + 1}: ${error}`);
        await this.queue.save(job);

        if (attempt < job.maxRetries) {
          const delayMs = Math.pow(2, attempt) * 1000;
          this.logger.warn(
            `Job ${job.id} retry ${attempt + 1}/${job.maxRetries} in ${delayMs}ms`,
          );
          await this.eventBus.publish({
            event: 'job.retrying',
            jobId: job.id,
            error,
            status: 'running',
            timestamp: Date.now(),
          });
          await sleep(delayMs);
        } else {
          return { success: false, error };
        }
      }
    }
    return { success: false, error: 'Max retries exceeded' };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
