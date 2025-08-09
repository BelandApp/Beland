import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionStateDto {
  @ApiProperty({
    description: 'Código único del estado (ejemplo: PENDING, COMPLETED, FAILED)',
    minLength: 2,
    maxLength: 100,
    example: 'PENDING',
  })
  @IsString()
  @Length(2, 100)
  code: string;

  @ApiProperty({
    description: 'Nombre legible para mostrar en la UI',
    minLength: 2,
    maxLength: 100,
    example: 'Pendiente',
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional para la interfaz de usuario',
    example: 'La transacción está pendiente de procesamiento',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
