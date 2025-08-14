import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGroupTypeDto {
  @ApiProperty({
    example: 'Juntada con amigos',
    description: 'Nombre del tipo de grupo',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
