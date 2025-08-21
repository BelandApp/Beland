import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateWithdrawAccountDto {
  @ApiProperty({
    description: 'Nombre del propietario de la cuenta',
    example: 'Juan Pérez',
  })
  @IsNotEmpty({ message: 'El nombre del propietario es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  owner_name: string;

  @ApiProperty({
    description: 'ID del tipo de cuenta (BANK / WALLET)',
    example: 'uuid-del-tipo-de-cuenta',
  })
  @IsNotEmpty({ message: 'El tipo de cuenta es obligatorio' })
  @IsUUID('4', { message: 'Debe ser un UUID válido' })
  withdraw_account_type_id: string;

  @ApiProperty({
    description: 'CBU de la cuenta bancaria (solo si es tipo BANK)',
    example: '00000031000987654321',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El CBU debe ser un texto' })
  @MaxLength(22, { message: 'El CBU no puede superar 22 caracteres' })
  cbu?: string;

  @ApiProperty({
    description: 'Alias de la cuenta bancaria (solo si es tipo BANK)',
    example: 'juan.banco.mp',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El alias debe ser un texto' })
  @MaxLength(50, { message: 'El alias no puede superar 50 caracteres' })
  alias?: string;

  @ApiProperty({
    description: 'Proveedor de billetera virtual (solo si es tipo WALLET)',
    example: 'MercadoPago',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser un texto' })
  @MaxLength(50, { message: 'El proveedor no puede superar 50 caracteres' })
  provider?: string;

  @ApiProperty({
    description: 'Número de teléfono de la billetera virtual (solo si es tipo WALLET)',
    example: '+5491122334455',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MaxLength(20, { message: 'El teléfono no puede superar 20 caracteres' })
  phone?: string;

}
