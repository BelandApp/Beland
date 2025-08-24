import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, MaxLength, IsOptional } from 'class-validator';

export class CreatePresetAmountDto {
  @ApiProperty({
    description: 'Nombre del monto preestablecido',
    example: 'Recarga estándar',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, { message: 'El nombre no puede superar 50 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Monto en dinero',
    example: 1500.75,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número con hasta 2 decimales' })
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  amount: number;

  @ApiProperty({
    description: 'Mensaje opcional asociado al monto',
    example: 'Monto recomendado para pagos rápidos',
    required: false,
  })
  @IsOptional()
  @MaxLength(255, { message: 'El mensaje no puede superar 255 caracteres' })
  message?: string;
}
