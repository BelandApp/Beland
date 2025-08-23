import { IsArray, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface resourceResp {
    id: string;
    resource_name: string;
    resource_desc: string;
    resource_quanity: number;
    resource_image_url: string;
    resource_discount:number;
}

export class RespCobroDto {
  @ApiProperty({
    description: 'ID de la wallet de destino',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  @IsUUID()
  Wallet_id?: string;

  @ApiProperty({
    description: 'ID del monto a pagar para posterior eliminacion',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  @IsUUID()
  amount_to_payment_id?: string;

  @ApiProperty({
    description: 'Cantidad a transferir',
    example: 150.75,
  })
  @IsNumber()
  amount?: number;

  @ApiProperty({
    description: 'Mesaje para el usuario que paga',
    example: '¡Gracias por reciclar con nosotros!',
  })
  @IsUUID()
  message?: string;

  @IsArray()
  resource?: resourceResp[]

}
