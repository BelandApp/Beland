import { IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
