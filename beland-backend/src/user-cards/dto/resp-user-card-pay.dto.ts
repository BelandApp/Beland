import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CardResponseDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del titular de la tarjeta' })
  @IsString()
  @IsNotEmpty()
  cardHolder: string;

  @ApiProperty({ example: 'tok_abc123456', description: 'Token de la tarjeta generado por el proveedor' })
  @IsString()
  @IsNotEmpty()
  cardToken: string;

  @ApiProperty({ example: '1234567890', description: 'Número de documento del titular' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ example: '593999999999', description: 'Número de teléfono con código de país' })
  @IsString()
  @Matches(/^\d+$/, { message: 'phoneNumber debe contener solo números' })
  phoneNumber: string;

  @ApiProperty({ example: 'aloy@mail.com', description: 'Correo electrónico del titular' })
  @IsEmail()
  email: string;
}
