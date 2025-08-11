import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateUserCardDto {

  @ApiProperty({ example: 'asdfas fsfs as dasdasd a', description: 'UUID del usuario propietario' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ example: 'uusuario@exmple.com', description: 'email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '01168443976', description: 'Telefono del usuario incluye el 0 inicial' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '34777654', description: 'Numero de Documento de Identidad' })
  @IsString()
  documentId: string;

  @ApiProperty({ example: 'Juan Carlos Brito', description: 'Nombre completo del titular de la tarjeta' })
  @IsString()
  optionalParameter4: string; // Tiene que ser encriptado y devuelto en un parametro cardHolder

  @ApiProperty({ example: 'Mastercard Produbanco/Promerica', description: 'Marca de la tarjeta' })
  @IsString()
  cardBrand: string;

  @ApiProperty({ example: 'Credit', description: 'Credit o Debit' })
  @IsString()
  cardType: 'Credit' | 'Debit';

  @ApiProperty({ example: 3456, description: 'Ultimos cuatro digitos de la tarjeta' })
  @IsNumber()
  lastDigits: number; 

  @ApiProperty({ example: 'sdgsdfsdfsdfsdfsd', description: 'Token de la tarjeta proporcionado por Payphone' })
  @IsString()
  ctoken: string;
}
