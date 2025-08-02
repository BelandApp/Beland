import { IsNumber, IsUUID } from 'class-validator';

export class RechargeDto {
  @IsNumber() amountUsd: number;
  @IsUUID() paymentMethodId: string;
}