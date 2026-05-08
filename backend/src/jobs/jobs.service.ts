import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { QueueEngine } from '../core/queue.engine';
import { RateLimiterEngine } from '../core/rate-limiter.engine';
import { EventBusService } from '../gateways/event-bus.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from '@queuely/shared';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly queue: QueueEngine,
    private readonly rateLimiter: RateLimiterEngine,
    private readonly eventBus: EventBusService,
  ) {}

  async create(dto: CreateJobDto, clientId: string): Promise<Job> {
    const { allowed, remaining, resetAt } =
      await this.rateLimiter.consume(clientId);
    if (!allowed) {
      throw new BadRequestException({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfterSeconds: Math.ceil((resetAt - Date.now()) / 1000),
        remaining,
      });
    }

    const job = await this.queue.enqueue({
      type: dto.type,
      priority: dto.priority,
      payload: dto.payload,
      maxRetries: dto.maxRetries,
    });

    await this.eventBus.publish({
      event: 'job.created',
      jobId: job.id,
      status: 'pending',
      timestamp: Date.now(),
    });
    this.logger.log(`Created job id=${job.id} type=${job.type}`);
    return job;
  }

  async findAll(status?: string): Promise<Job[]> {
    return this.queue.list(status);
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.queue.findById(id);
    if (!job) throw new NotFoundException(`Job not found: ${id}`);
    return job;
  }

  async cancel(id: string): Promise<{ success: boolean }> {
    const cancelled = await this.queue.cancel(id);
    if (!cancelled)
      throw new BadRequestException('Only pending jobs can be cancelled');
    return { success: true };
  }

  async retry(id: string): Promise<Job> {
    const job = await this.findOne(id);
    if (job.status !== 'failed')
      throw new BadRequestException('Only failed jobs can be retried');

    const retried = await this.queue.enqueue({
      type: job.type,
      priority: job.priority,
      payload: job.payload,
      maxRetries: job.maxRetries,
    });

    await this.eventBus.publish({
      event: 'job.retrying',
      jobId: retried.id,
      status: 'pending',
      timestamp: Date.now(),
    });
    return retried;
  }
}
