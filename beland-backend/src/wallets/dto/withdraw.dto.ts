import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: 'Cantidad de Becoin a retirar',
    example: 1000,
  })
  @IsNumber()
  amountBecoin: number;

  @ApiProperty({
    description: 'UUID de la cuenta para destino del retiro',
    example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a',
  })
  @IsUUID()
  withdraw_account_id: string; 
}

export class WithdrawResponseDto {
  
  @ApiProperty({
    description: 'UUID de la cuenta para destino del retiro',
    example: '8f03a1de-b71c-4a5a-a9ff-0d9a3a3c5b2a',
  })
  @IsUUID()
  user_withdraw_id: string; 

  @ApiPropertyOptional({
    description: 'Observacion hacerca de la falla',
    example: 'Su banco rechazo la transferencia',
  })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({
    description: 'Referencia a la transaccion bancaria fallida',
    example: '#hjdldir3454df45',
  })
  @IsString()
  @IsOptional()
  reference?: string;

}
