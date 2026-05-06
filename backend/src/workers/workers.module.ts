import { Module } from '@nestjs/common';
import { WorkerPoolService } from './worker-pool.service';
import { WorkerService } from './worker.service';
import { JobsModule } from '../jobs/jobs.module';
import { DlqModule } from '../dlq/dlq.module';
import { EventBusModule } from '../gateways/event-bus.module';

@Module({
  imports: [JobsModule, DlqModule, EventBusModule],
  providers: [WorkerPoolService, WorkerService],
  exports: [WorkerPoolService, WorkerService],
})
export class WorkersModule {}
