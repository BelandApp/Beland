import { IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
