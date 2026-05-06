import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { DlqService } from './dlq.service';

@ApiTags('Dead Letter Queue')
@ApiSecurity('x-api-key')
@Controller('dlq')
export class DlqController {
  constructor(private readonly dlq: DlqService) {}

  @Get()
  @ApiOperation({ summary: 'ดู job ทั้งหมดใน DLQ' })
  findAll() {
    return this.dlq.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดู dead job ตาม ID' })
  findOne(@Param('id') id: string) {
    return this.dlq.findOne(id);
  }

  @Post(':id/replay')
  @ApiOperation({ summary: 'ส่ง dead job กลับเข้า queue' })
  replay(@Param('id') id: string) {
    return this.dlq.replay(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบ dead job ถาวร' })
  remove(@Param('id') id: string) {
    return this.dlq.remove(id);
  }
}
