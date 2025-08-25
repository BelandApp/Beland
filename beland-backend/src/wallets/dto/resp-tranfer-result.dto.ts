import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RespTransferResult {
  @ApiProperty({
    description: 'ID de la billetera afectada',
    example: '8f3e88b2-1c7c-4dbe-93a5-b3df67fa9f21',
  })
  walletId: string;

  @ApiProperty({
    description: 'Nuevo saldo de la billetera después de la operación',
    example: 1234.56,
  })
  newBalance: number;

  @ApiProperty({
    description: 'Mensaje de confirmación o información de la operación',
    example: 'Se acreditó tu pago',
  })
  message: string;

  @ApiPropertyOptional({
    description:
      'ID del registro amount-to-payment eliminado (solo si corresponde)',
    example: 'amount-uuid',
  })
  amountPaymentIdDeleted?: string;

  @ApiProperty({
    description:
      'Indica si el pago fue acreditado correctamente (true) o no (false)',
    example: true,
  })
  success: boolean;
}
