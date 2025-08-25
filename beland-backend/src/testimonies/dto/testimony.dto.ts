// src/testimonies/dto/testimony.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsDate,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from 'src/users/dto/user.dto'; // Asume que tienes un UserDto para mostrar la info del autor

export class TestimonyDto {
  @ApiProperty({ description: 'ID único del testimonio.', format: 'uuid' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Contenido del testimonio.' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Calificación del testimonio (ej. 1-5).',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Estado de aprobación del testimonio.' })
  @IsBoolean()
  is_approved: boolean;

  @ApiProperty({
    description: 'ID del usuario que escribió el testimonio.',
    format: 'uuid',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Información del usuario que escribió el testimonio.',
    type: () => UserDto,
  })
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ description: 'Fecha y hora de creación del testimonio.' })
  @IsDate()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del testimonio.',
  })
  @IsDate()
  @Type(() => Date)
  updated_at: Date;

  @ApiPropertyOptional({
    description: 'Fecha y hora de eliminación lógica del testimonio.',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deleted_at?: Date;
}
