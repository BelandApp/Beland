import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: 'Cantidad de Becoin a retirar',
    example: 100.50,
  })
  @IsNumber()
  amountBecoin: number;

  @ApiProperty({
    description: 'Datos de la cuenta bancaria para el retiro CBU',
    example: '0001234567890123456789',
  })
  @IsString()
  bankAccount: string; 
}
