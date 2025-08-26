// src/testimonies/dto/create-testimony.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateTestimonyDto {
  @ApiProperty({
    description: 'Contenido del testimonio.',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'El contenido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El contenido del testimonio no puede estar vacío.' })
  // Puedes ajustar MinLength y MaxLength según tus requisitos
  content: string;

  @ApiPropertyOptional({
    description: 'Calificación del testimonio (ej. 1-5 estrellas).',
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'La calificación debe ser un número entero.' })
  @Min(1, { message: 'La calificación mínima es 1.' })
  @Max(5, { message: 'La calificación máxima es 5.' })
  rating?: number;
}
