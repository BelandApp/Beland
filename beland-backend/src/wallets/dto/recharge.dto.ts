import { IsNumber, IsString, IsUUID } from 'class-validator';

export class RechargeDto {
  @IsNumber() amountUsd: number;
  @IsUUID() wallet_id: string;
  @IsString() state: 'PENDING' | 'COMPLETED' | 'FAILED';
  @IsString() referenceCode: string; 
}