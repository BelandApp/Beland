import { IsNumber, IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum RechargeState {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class RechargeDto {
  @ApiProperty({ example: 50.0, description: 'Amount in USD to recharge' })
  @IsNumber()
  amountUsd: number;

  @ApiProperty({ example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a', description: 'Wallet UUID' })
  @IsUUID()
  wallet_id: string;

  @ApiProperty({ enum: RechargeState, description: 'State of the recharge transaction' })
  @IsEnum(RechargeState)
  status: RechargeState;

  @ApiProperty({ example: 'REF123456789', description: 'Reference code for tracking' })
  @IsString()
  referenceCode: string;
}
