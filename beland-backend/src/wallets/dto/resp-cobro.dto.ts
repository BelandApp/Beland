import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResourceResp {
  @ApiProperty({
    description: 'ID del recurso',
    example: 'res-12345',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del recurso',
    example: 'Botella de plástico',
  })
  resource_name: string;

  @ApiProperty({
    description: 'Descripción del recurso',
    example: 'Botella PET reciclada de 1.5L',
  })
  resource_desc: string;

  @ApiProperty({
    description: 'Cantidad disponible del recurso',
    example: 50,
  })
  resource_quanity: number;

  @ApiProperty({
    description: 'URL de la imagen del recurso',
    example: 'https://example.com/botella.jpg',
  })
  resource_image_url: string;

  @ApiProperty({
    description: 'Descuento aplicado al recurso (%)',
    example: 10,
  })
  resource_discount: number;
}

export class RespCobroDto {
  @ApiPropertyOptional({
    description: 'ID de la wallet de destino',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  wallet_id?: string;

  @ApiPropertyOptional({
    description: 'ID del monto a pagar para posterior eliminación',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  amount_to_payment_id?: string;

  @ApiPropertyOptional({
    description: 'Cantidad a transferir',
    example: 150.75,
  })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Mensaje para el usuario que paga',
    example: '¡Gracias por reciclar con nosotros!',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Lista de recursos asociados al cobro',
    type: [ResourceResp],
  })
  resource?: ResourceResp[];
}
