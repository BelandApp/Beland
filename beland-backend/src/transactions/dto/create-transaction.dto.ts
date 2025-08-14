import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Wallet origen de la transacción',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsUUID()
  wallet_id: string;

  @ApiProperty({
    description: 'Tipo de transacción (FK a transaction_types)',
    example: 'd9f1e8c0-1234-5678-abcd-9876543210fe',
  })
  @IsUUID()
  type_id: string;

  @ApiProperty({
    description: 'Importe en Becoin (máximo 2 decimales)',
    example: 150.75,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiPropertyOptional({
    description: 'Id de la Transaccion generada por payphone (solo en recargas)',
    example: 'e4f5g6h7-i8j9-0123-klmn-456789abcdef',
  })
  @IsOptional()
  @IsUUID()
  payohone_transactionId?: string;

  @ApiPropertyOptional({
    description: 'Wallet relacionada para transferencias (opcional)',
    example: 'e4f5g6h7-i8j9-0123-klmn-456789abcdef',
  })
  @IsOptional()
  @IsUUID()
  related_wallet_id?: string;

  @ApiPropertyOptional({
    description: 'Código QR, código de transacción o nota (opcional)',
    example: 'TXN-20250807-0001',
  })
  @IsOptional()
  @IsString()
  reference?: string;
}
