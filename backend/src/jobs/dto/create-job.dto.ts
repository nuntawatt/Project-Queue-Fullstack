import {
  IsString,
  IsIn,
  IsOptional,
  IsInt,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as shared from '../../common/types/job.types';

export class CreateJobDto {
  @ApiProperty({ example: 'send_email' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal',
  })
  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'critical'])
  priority?: shared.JobPriority = 'normal';

  @ApiProperty({ example: { to: 'user@example.com' } })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional({ default: 3, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  maxRetries?: number = 3;
}
