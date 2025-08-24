// src/auth/dto/auth0-exchange-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para recibir el token de acceso de Auth0 del frontend
 * y solicitar un token JWT local del backend.
 */
export class Auth0ExchangeTokenDto {
  @ApiProperty({
    description:
      'El token de acceso JWT emitido por Auth0 después de un inicio de sesión/registro exitoso.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de Auth0 no puede estar vacío.' })
  auth0Token: string;
}
