// src/wallets/dto/create-wallet.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    description: 'Dirección de la billetera (opcional)',
    example: '0x123...',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Alias de la billetera (opcional)',
    example: 'mi.billetera.personal',
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({
    description: 'Clave privada encriptada (si aplica)',
    example: 'encryptedKey123',
  })
  @IsOptional()
  @IsString()
  private_key_encrypted?: string;

  @ApiProperty({
    description: 'ID del usuario propietario de esta billetera',
    example: 'uuid-v4',
  })
  @IsUUID()
  userId: string;
}
