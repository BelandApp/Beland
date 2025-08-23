import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateAmountToPaymentDto {
  @ApiProperty({
    description: 'Monto a pagar',
    example: 1500.75,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número con hasta 2 decimales' })
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  amount: number;

  @ApiProperty({
    description: 'Mensaje a mostrar con el pago',
    example: "¡Gracias por traer tus residuos! Descuento merecido",
  })
  @IsString()
  message: string;
}
