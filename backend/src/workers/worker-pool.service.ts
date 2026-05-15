import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueEngine } from '../core/queue.engine';
import { WorkerService } from './worker.service';

@Injectable()
export class WorkerPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerPoolService.name);
  private readonly concurrency: number;
  private readonly pollIntervalMs: number;
  private isShuttingDown = false;
  private workers: Promise<void>[] = [];

  constructor(
    private readonly queue: QueueEngine,
    private readonly worker: WorkerService,
    private readonly config: ConfigService,
  ) {
    this.concurrency = this.config.get<number>('worker.concurrency') ?? 5;
    this.pollIntervalMs =
      this.config.get<number>('worker.pollIntervalMs') ?? 500;
  }

  onModuleInit() {
    this.logger.log(
      `Starting worker pool with concurrency=${this.concurrency}`,
    );
    // สร้าง Worker ตามจำนวน Concurrency ที่กำหนด
    for (let i = 0; i < this.concurrency; i++) {
      this.workers.push(this.startWorker(`worker-${i + 1}`));
    }
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down worker pool...');
    this.isShuttingDown = true;
    await Promise.all(this.workers);
    this.logger.log('Worker pool shut down successfully');
  }

  private async startWorker(workerId: string) {
    // ลูปดึงงานไปเรื่อยๆ จนกว่าแอปจะปิด (Graceful Shutdown)
    while (!this.isShuttingDown) {
      try {
        // ดึงงานที่ความสำคัญสูงสุดออกจากคิว
        const job = await this.queue.dequeue();
        if (job) {
          // หากมีงาน ให้ส่งต่อให้ WorkerService ประมวลผล
          await this.worker.process(job, workerId);
        } else {
          // หากไม่มีงาน ให้พักรอชั่วคราว (Polling Interval) เพื่อลดการกิน CPU
          await new Promise((resolve) =>
            setTimeout(resolve, this.pollIntervalMs),
          );
        }
      } catch (error) {
        this.logger.error(`Worker ${workerId} encountered an error:`, error);
        await new Promise((resolve) =>
          setTimeout(resolve, this.pollIntervalMs),
        );
      }
    }
  }

  getStatus() {
    return {
      concurrency: this.concurrency,
      pollIntervalMs: this.pollIntervalMs,
      activeWorkers: this.workers.length,
    };
  }
}
