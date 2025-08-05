import { IsString, IsOptional, Length } from 'class-validator';

export class CreateTransactionTypeDto {
  /** Código único del tipo: RECHARGE, WITHDRAW, TRANSFER, PURCHASE, RECYCLE, DONATION */
  @IsString()
  @Length(2, 100)
  code: string;
  
  /** Nombre legible: Recarga, Retiro, Transferencia, etc. */
  @IsString()
  @Length(2, 100)
  name: string;

  /** Descripción opcional para la UI */
  @IsOptional()
  @IsString()
  description?: string;
}
