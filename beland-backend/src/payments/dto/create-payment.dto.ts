// src/payments/dto/create-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de la orden asociada al pago' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ description: 'ID del usuario que realiza el pago' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'Monto pagado por el usuario' })
  @IsNumber()
  amount_paid: number;

  @ApiProperty({
    description: 'Tipo de pago',
    enum: ['FULL', 'SPLIT', 'EQUAL_SPLIT'],
  })
  @IsEnum(['FULL', 'SPLIT', 'EQUAL_SPLIT'])
  payment_type_id: string;

  @ApiProperty({
    description: 'Hash de la transacción (en caso de blockchain)',
    required: false,
  })
  @IsOptional()
  @IsString()
  transaction_hash?: string;
}
