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

  async getSummary() {
    const [jobs, queueDepth, dlqCount] = await Promise.all([
      this.queue.list(),
      this.queue.getQueueDepth(),
      this.dlq.count(),
    ]);

    const byStatus = jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    }, {});

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
