import { IsNumber, IsUUID } from 'class-validator';

export class TransferDto {
  @IsUUID() toWalletId: string;
  @IsNumber() amountBecoin: number;
}