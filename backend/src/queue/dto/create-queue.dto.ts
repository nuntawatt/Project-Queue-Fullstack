import { IsNotEmpty, IsString } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

export class CreateQueueDto {
  @IsNotEmpty()
  @IsString()
  // @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  // @ApiProperty()
  description: string;
}
