import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { JobsModule } from '../jobs/jobs.module';
import { DlqModule } from '../dlq/dlq.module';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [JobsModule, DlqModule, WorkersModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
