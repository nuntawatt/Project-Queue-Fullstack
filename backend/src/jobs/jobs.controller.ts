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
import { ApiTags, ApiOperation, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@ApiTags('Jobs')
@ApiSecurity('x-api-key')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'สร้าง job ใหม่และใส่เข้า queue' })
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
  findAll(@Query('status') status?: string) {
    return this.jobsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดู job ตาม ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ยกเลิก pending job' })
  cancel(@Param('id') id: string) {
    return this.jobsService.cancel(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'retry failed job' })
  retry(@Param('id') id: string) {
    return this.jobsService.retry(id);
  }
}
