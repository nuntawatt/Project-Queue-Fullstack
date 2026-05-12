import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@ApiTags('Jobs')
@Controller('jobs')
@ApiSecurity('x-api-key')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'สร้าง job ใหม่และใส่เข้า queue' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() dto: CreateJobDto, @Req() req: Request) {
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    return this.jobsService.create(dto, Array.isArray(ip) ? ip[0] : ip);
  }

  @Get()
  @ApiOperation({ summary: 'ดู job ทั้งหมด' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'running', 'completed', 'failed', 'dead'],
  })
  @ApiResponse({ status: 200, description: 'Get all jobs successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findAll(@Query('status') status?: string) {
    return this.jobsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดู job ตาม ID' })
  @ApiResponse({ status: 200, description: 'Get job by ID successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ยกเลิก pending job' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  cancel(@Param('id') id: string) {
    return this.jobsService.cancel(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'retry failed job' })
  @ApiResponse({ status: 200, description: 'Job retried successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  retry(@Param('id') id: string) {
    return this.jobsService.retry(id);
  }
}
