import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWithdrawAccountTypeDto {
  @ApiProperty({
    description: 'Código único del tipo de cuenta',
    example: 'BANK',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  @IsString({ message: 'El código debe ser un string' })
  @MaxLength(50, { message: 'El código no puede superar 50 caracteres' })
  code: string;

  @ApiProperty({
    description: 'Nombre descriptivo del tipo de cuenta',
    example: 'Cuenta Bancaria',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser un string' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  name: string;
}
