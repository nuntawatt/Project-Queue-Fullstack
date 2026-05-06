import { PartialType } from '@nestjs/swagger';
import { CreateDlqDto } from './create-dlq.dto';

export class UpdateDlqDto extends PartialType(CreateDlqDto) {}
