import { IsNumber, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RechargeDto {
  @ApiProperty({ example: 50.0, description: 'Amount in USD to recharge' })
  @IsNumber()
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
}
