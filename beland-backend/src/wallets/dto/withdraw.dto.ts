import { IsNumber, IsString } from 'class-validator';

export class WithdrawDto {
  @IsNumber() amountBecoin: number;
  @IsString() bankAccount: string; // o un DTO con más campos (CBU, banco, titular…)
}