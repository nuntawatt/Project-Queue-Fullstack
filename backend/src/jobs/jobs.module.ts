import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { QueueEngine } from '../core/queue.engine';
import { RateLimiterEngine } from '../core/rate-limiter.engine';
import { EventBusModule } from '../gateways/event-bus.module';

@Module({
  imports: [EventBusModule],
  controllers: [JobsController],
  providers: [JobsService, QueueEngine, RateLimiterEngine],
  exports: [QueueEngine],
})
export class JobsModule {}
