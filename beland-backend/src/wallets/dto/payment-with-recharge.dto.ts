import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentWithRechargeDto {
  @ApiProperty({ example: 50.0, description: 'Amount in USD to recharge' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amountUsd: number;

  @ApiProperty({
    example: 'REF123456789',
    description: 'Reference code for tracking',
  })
  @IsString()
  referenceCode: string;

  @ApiProperty({
    example: 'PAYPHONE-TransactionID',
    description: 'Identificador entregado por Payphone para seguimientos',
  })
  @IsNumber()
  payphone_transactionId: number;

  @ApiProperty({
    example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a',
    description: 'codigo interno para seguimientos',
  })
  @IsUUID()
  clientTransactionId: string;

  @ApiProperty({
    example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a',
    description: 'Wallet destino donde se acreditaran los Becoin',
  })
  @IsUUID()
  wallet_id: string;

  @ApiPropertyOptional({
    example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a',
    description: 'UUID del monto creado para que el usuario pague',
  })
  @IsOptional()
  @IsUUID()
  amount_payment_id?: string;

  @ApiPropertyOptional({
    example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a',
    description: 'UUID recurso que el usuario compro en recursos Beland',
  })
  @IsOptional()
  @IsUUID()
  user_resource_id?: string;
}