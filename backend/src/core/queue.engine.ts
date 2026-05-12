import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import {
  Job,
  CreateJobInput,
  PRIORITY_SCORE,
  JobPriority,
} from '../common/types/job.types';
import { randomUUID as uuid } from 'crypto';

const KEYS = {
  queue: 'queuely:queue',
  job: (id: string) => `queuely:job:${id}`,
};

@Injectable()
export class QueueEngine {
  private readonly logger = new Logger(QueueEngine.name);

  constructor(private readonly redis: RedisService) {}

  // เพิ่ม job ใหม่ลงในคิวตามระดับความสำคัญ
  async enqueue(input: CreateJobInput): Promise<Job> {
    const job: Job = {
      id: uuid(),
      type: input.type,
      priority: input.priority ?? 'normal',
      status: 'pending',
      payload: input.payload,
      maxRetries: input.maxRetries ?? 3,
      retries: 0,
      errors: [],
      createdAt: Date.now(),
    };

    const pipeline = this.redis.getClient().pipeline();
    pipeline.set(KEYS.job(job.id), JSON.stringify(job));
    pipeline.zadd(KEYS.queue, PRIORITY_SCORE[job.priority], job.id);
    await pipeline.exec();

    this.logger.log(
      `Enqueued [${job.type}] priority=${job.priority} id=${job.id}`,
    );
    return job;
  }

  // ดึง job ที่มีความสำคัญสูงสุดออกจากคิวเพื่อนำไปประมวลผล
  async dequeue(): Promise<Job | null> {
    const result = await this.redis.getClient().zpopmax(KEYS.queue);
    if (!result?.length) return null;
    return this.findById(result[0]);
  }

  // ค้นหาข้อมูล job จาก Redis ตาม ID
  async findById(id: string): Promise<Job | null> {
    const raw = await this.redis.getClient().get(KEYS.job(id));
    return raw ? (JSON.parse(raw) as Job) : null;
  }

  // บันทึกหรืออัปเดตข้อมูล job ใน Redis
  async save(job: Job): Promise<void> {
    await this.redis.getClient().set(KEYS.job(job.id), JSON.stringify(job));
  }

  // นำ job กลับเข้าคิวเพื่อรอประมวลผลใหม่ (requeue)
  async requeue(job: Job): Promise<void> {
    const pipeline = this.redis.getClient().pipeline();
    pipeline.set(KEYS.job(job.id), JSON.stringify(job));
    pipeline.zadd(KEYS.queue, PRIORITY_SCORE[job.priority], job.id);
    await pipeline.exec();
  }

  // ดึงรายการ job ทั้งหมดจาก Redis (กรองตามสถานะถ้ามี)
  async list(status?: string, limit = 100): Promise<Job[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [next, batch] = await this.redis
        .getClient()
        .scan(cursor, 'MATCH', 'queuely:job:*', 'COUNT', 200);
      cursor = next;
      keys.push(...batch);
    } while (cursor !== '0');

    if (!keys.length) return [];

    const pipeline = this.redis.getClient().pipeline();
    keys.forEach((k) => pipeline.get(k));
    const results = await pipeline.exec();

    return (results ?? [])
      .map(([, val]) => (val ? (JSON.parse(val as string) as Job) : null))
      .filter((j): j is Job => j !== null && (!status || j.status === status))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // ยกเลิก job ที่กำลังรออยู่ในคิว
  async cancel(id: string): Promise<boolean> {
    const job = await this.findById(id);
    if (!job || job.status !== 'pending') return false;

    job.status = 'failed';
    job.lastError = 'Cancelled by user';

    const pipeline = this.redis.getClient().pipeline();
    pipeline.zrem(KEYS.queue, id);
    pipeline.set(KEYS.job(id), JSON.stringify(job));
    await pipeline.exec();
    return true;
  }

  // นับจำนวน job ในคิวแยกตามระดับความสำคัญ
  async getQueueDepth(): Promise<Record<JobPriority, number>> {
    const items = await this.redis
      .getClient()
      .zrange(KEYS.queue, 0, -1, 'WITHSCORES');
    const depth: Record<JobPriority, number> = {
      low: 0,
      normal: 0,
      high: 0,
      critical: 0,
    };

    for (let i = 1; i < items.length; i += 2) {
      const score = parseInt(items[i]);
      const priority = Object.entries(PRIORITY_SCORE).find(
        ([, v]) => v === score,
      )?.[0] as JobPriority;
      if (priority) depth[priority]++;
    }
    return depth;
  }
}
