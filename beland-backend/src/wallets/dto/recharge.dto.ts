import { IsNumber, IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class RechargeDto {
  @ApiProperty({ example: 50.0, description: 'Amount in USD to recharge' })
  @IsNumber()
  amountUsd: number;

  @ApiProperty({ example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a', description: 'Wallet UUID' })
  @IsUUID()
  wallet_id: string;

  @ApiProperty({ example: 'REF123456789', description: 'Reference code for tracking' })
  @IsString()
  referenceCode: string;

  @Column('uuid')
  recarge_method:string; // generar tabla y relacion- En principio el unico metodo sera tarjeta.

  @ApiPropertyOptional({ example: 'REF123456789', description: 'Reference code for tracking' })
  @IsString()
  @IsOptional()
  clientTransactionId?: string;

  @ApiPropertyOptional({ example: 50.0, description: 'Amount in USD to recharge' })
  @IsNumber()
  @IsOptional()
  transactionId?: number;

}
