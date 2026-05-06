import { PartialType } from '@nestjs/swagger';
import { CreateQueueDto } from './create-queue.dto';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateQueueDto extends PartialType(CreateQueueDto) {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description: string;
}
