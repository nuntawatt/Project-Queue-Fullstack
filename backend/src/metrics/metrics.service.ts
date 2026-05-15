import { Injectable } from '@nestjs/common';
import { QueueEngine } from '../core/queue.engine';
import { DlqService } from '../dlq/dlq.service';
import { WorkerPoolService } from '../workers/worker-pool.service';
import { WorkerService } from '../workers/worker.service';

@Injectable()
export class MetricsService {
  constructor(
    private readonly queue: QueueEngine,
    private readonly dlq: DlqService,
    private readonly pool: WorkerPoolService,
    private readonly worker: WorkerService,
  ) {}

  /**
   * ดึงข้อมูลภาพรวมของระบบเพื่อไปแสดงผลบนหน้า Dashboard (Metric Strip)
   */
  async getSummary() {
    // 1. ดึงข้อมูลจากระบบย่อยต่างๆ พร้อมกันเพื่อความรวดเร็ว
    const [jobs, queueDepth, dlqCount] = await Promise.all([
      this.queue.list(),
      this.queue.getQueueDepth(),
      this.dlq.count(),
    ]);

    // 2. สรุปข้อมูลจำนวน Job แยกตามสถานะ
    const byStatus = jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    }, {});

    // 3. คำนวณระยะเวลาเฉลี่ยที่ใช้ในการประมวลผล Job ที่สำเร็จแล้ว
    const completed = jobs.filter(
      (j) => j.status === 'completed' && j.startedAt && j.completedAt,
    );
    const avgDurationMs = completed.length
      ? Math.round(
          completed.reduce((s, j) => s + (j.completedAt! - j.startedAt!), 0) /
            completed.length,
        )
      : 0;

    return {
      jobs: { total: jobs.length, byStatus, avgDurationMs },
      queue: {
        depth: queueDepth,
        total: Object.values(queueDepth).reduce(
          (a: number, b: number) => a + b,
          0,
        ),
      },
      dlq: { count: dlqCount },
      workers: this.pool.getStatus(),
      circuits: this.worker.getCircuitStatus(),
    };
  }
}
