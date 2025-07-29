// src/prize-redemptions/dto/create-prize-redemption.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum } from 'class-validator';

export class CreatePrizeRedemptionDto {
  @ApiProperty({ description: 'ID del usuario que canjea el premio' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'ID del premio canjeado' })
  @IsUUID()
  prize_id: string;

  @ApiProperty({
    description: 'Estado del canje',
    enum: ['PENDING', 'DELIVERED'],
    default: 'PENDING',
  })
  @IsEnum(['PENDING', 'DELIVERED'])
  status: 'PENDING' | 'DELIVERED';
}
