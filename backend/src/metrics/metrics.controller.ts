import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@ApiSecurity('x-api-key')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'ดู system metrics ทั้งหมด' })
  getSummary() {
    return this.metrics.getSummary();
  }
}
