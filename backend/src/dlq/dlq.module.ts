import { Module } from '@nestjs/common';
import { DlqController } from './dlq.controller';
import { DlqService } from './dlq.service';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  controllers: [DlqController],
  providers: [DlqService],
  exports: [DlqService],
})
export class DlqModule {}
