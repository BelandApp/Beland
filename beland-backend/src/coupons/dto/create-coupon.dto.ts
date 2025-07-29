// src/coupons/dto/create-coupon.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @ApiProperty({ description: 'Código del cupón (texto o QR)' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Tipo de cupón',
    enum: ['DISCOUNT', 'BONUS_COINS'],
  })
  @IsEnum(['DISCOUNT', 'BONUS_COINS'])
  type: 'DISCOUNT' | 'BONUS_COINS';

  @ApiProperty({ description: 'Valor del cupón (descuento o monedas)' })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Fecha de expiración del cupón',
    type: 'string',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  expires_at: Date;

  @ApiProperty({
    description: 'ID del usuario que lo redimió',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  redeemed_by_user_id?: string;
}
