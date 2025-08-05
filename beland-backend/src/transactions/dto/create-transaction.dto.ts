import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  /** Wallet origen de la transacción */
  @IsUUID()
  wallet_id: string;

  /** Tipo de transacción (FK a transaction_types) */
  @IsUUID()
  type_id: string;

  /** Importe en Becoin */
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  /** Saldo resultante tras la operación */
  @IsNumber({ maxDecimalPlaces: 2 })
  post_balance: number;

  /** Wallet relacionada, para transferencias (opcional) */
  @IsOptional()
  @IsUUID()
  related_wallet_id?: string;

  /** QR, código de transacción o nota (opcional) */
  @IsOptional()
  @IsString()
  reference?: string;
}
