import { IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({
    description: 'ID de la wallet de destino',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  @IsUUID()
  toWalletId: string;

  @ApiProperty({
    description: 'Cantidad de becoins a transferir',
    example: 150.75,
  })
  @IsNumber()
  amountBecoin: number;
}
