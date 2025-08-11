import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreatePaymentTypeDto {
  @ApiProperty({ example: 'FULL', description: 'Código único del tipo de pago FULL | SPLIT' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Pago completo de la orden', description: 'Descripción del tipo de pago' })
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: true, description: 'Indica si el tipo de pago está activo', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
