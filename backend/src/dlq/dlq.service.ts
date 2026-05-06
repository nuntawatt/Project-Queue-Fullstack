import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { QueueEngine } from '../core/queue.engine';
import { Job } from '@queuely/shared';

const DLQ_KEY = 'queuely:dlq';

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly queue: QueueEngine,
  ) {}

  async add(job: Job): Promise<void> {
    await this.redis
      .getClient()
      .hset(DLQ_KEY, job.id, JSON.stringify({ ...job, deadAt: Date.now() }));
    this.logger.warn(`Job moved to DLQ id=${job.id} reason="${job.lastError}"`);
  }

  async findAll(): Promise<Job[]> {
    const all = await this.redis.getClient().hgetall(DLQ_KEY);
    return all ? Object.values(all).map((v) => JSON.parse(v) as Job) : [];
  }

  async findOne(id: string): Promise<Job> {
    const raw = await this.redis.getClient().hget(DLQ_KEY, id);
    if (!raw) throw new NotFoundException(`Job not found in DLQ: ${id}`);
    return JSON.parse(raw) as Job;
  }

  async replay(id: string): Promise<Job> {
    const dead = await this.findOne(id);
    const replayed = await this.queue.enqueue({
      type: dead.type,
      priority: dead.priority,
      payload: dead.payload,
      maxRetries: dead.maxRetries,
    });
    await this.remove(id);
    this.logger.log(`Replayed DLQ job ${id} → new job ${replayed.id}`);
    return replayed;
  }

  async remove(id: string): Promise<void> {
    await this.redis.getClient().hdel(DLQ_KEY, id);
  }

  async count(): Promise<number> {
    return this.redis.getClient().hlen(DLQ_KEY);
  }
}
