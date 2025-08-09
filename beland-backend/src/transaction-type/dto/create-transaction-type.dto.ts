import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionTypeDto {
  @ApiProperty({
    description: 'Código único del tipo (ejemplo: RECHARGE, WITHDRAW, TRANSFER)',
    minLength: 2,
    maxLength: 100,
    example: 'RECHARGE',
  })
  @IsString()
  @Length(2, 100)
  code: string;

  @ApiProperty({
    description: 'Nombre legible para mostrar en la UI',
    minLength: 2,
    maxLength: 100,
    example: 'Recarga',
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional para la interfaz de usuario',
    example: 'Ingreso de fondos a la wallet mediante tarjeta',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
