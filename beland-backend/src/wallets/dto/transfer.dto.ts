import { IsNumber, IsUUID } from 'class-validator';

export class TransferDto {
  @IsUUID() toUserId: string;
  @IsNumber() amountBecoin: number;
}